from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import time

from backend.core.security import get_current_user
from backend.database import get_db
from backend.models.chat_history import ChatHistory
from backend.models.user import User

from backend.schemas.multilingual import (
    MultilingualQueryRequest,
    MultilingualQueryResponse,
    TTSRequest,
    STTResponse
)
from backend.services.multilingual_service import (
    SUPPORTED_LANGUAGES,
    get_supported_languages,
    translate_to_english,
    translate_from_english,
    transcribe_audio_bytes,
    generate_tts_audio_stream
)
from retrieve import retrieve_documents
from generate import generate_answer, GroqGenerationError

router = APIRouter(
    prefix="/api/multilingual",
    tags=["Multilingual Assistant"]
)

PDF_SCORE_THRESHOLD = 0.50


@router.get("/languages")
def list_supported_languages():
    """Returns list of supported Indian languages, native names, and sample questions."""
    return {
        "status": "success",
        "languages": get_supported_languages()
    }


@router.post("/query", response_model=MultilingualQueryResponse)
def multilingual_query(
    request: MultilingualQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    End-to-end Multilingual Agricultural Query:
    1. Translates Indian-language question to English.
    2. Retrieves verified agricultural documents from Pinecone.
    3. Generates grounded agronomic guidance.
    4. Translates guidance into the farmer's selected language.
    5. Stores conversation history.
    """
    raw_question = request.question.strip()
    lang_code = request.language.lower().strip()

    if lang_code not in SUPPORTED_LANGUAGES:
        lang_code = "mr"  # Default fallback to Marathi

    lang_info = SUPPORTED_LANGUAGES[lang_code]
    lang_name = lang_info["name"]

    print(f"\n==========================================")
    print(f"MULTILINGUAL QUERY RECEIVED")
    print(f"Selected language: {lang_name}")
    print(f"Language code: {lang_code}")
    print(f"Question: {raw_question}")
    print(f"==========================================")

    t_total_start = time.time()

    # ----------------------------------------------------
    # Step 1: Translate Question to English if necessary
    # ----------------------------------------------------
    english_question = raw_question
    t_q_start = time.time()
    if lang_code != "en":
        english_question = translate_to_english(raw_question, lang_code)
        print(f"English question: {english_question}")
    t_q_trans = time.time() - t_q_start

    # ----------------------------------------------------
    # Step 2: Retrieve Relevant Agricultural Documents
    # ----------------------------------------------------
    t_retrieval_start = time.time()
    try:
        results = retrieve_documents(english_question)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search agricultural knowledge base: {str(e)}"
        )
    t_retrieval = time.time() - t_retrieval_start
    print(f"Retrieval: {t_retrieval:.2f} seconds")

    strong_results = [
        r for r in results
        if r.get("score", 0) >= PDF_SCORE_THRESHOLD
    ]

    candidate_docs = strong_results if strong_results else (results[:2] if results else [])

    retrieved_char_len = sum(len(r.get("text", "")) for r in candidate_docs)
    print(f"Retrieved context length: {retrieved_char_len} characters ({len(candidate_docs)} chunks)")

    # ----------------------------------------------------
    # Step 3: Generate Grounded Agronomic Guidance
    # ----------------------------------------------------
    t_gen_start = time.time()
    try:
        english_answer = generate_answer(english_question, candidate_docs)
    except GroqGenerationError as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI agronomy reasoning engine failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error in agricultural advisor: {str(e)}"
        )
    t_generation = time.time() - t_gen_start
    print(f"Groq generation: {t_generation:.2f} seconds")

    # ----------------------------------------------------
    # Step 4: Translate Answer Back to Farmer's Language
    # ----------------------------------------------------
    t_trans_start = time.time()
    final_answer = english_answer
    if lang_code != "en":
        try:
            final_answer = translate_from_english(english_answer, lang_code)
        except RuntimeError as trans_err:
            raise HTTPException(
                status_code=502,
                detail=f"TRANSLATION_FAILED: {str(trans_err)}"
            )
    t_translation = time.time() - t_trans_start
    print(f"Translation: {t_translation:.2f} seconds")

    t_total = time.time() - t_total_start
    print(f"Total: {t_total:.2f} seconds")
    print(f"==========================================\n")

    # ----------------------------------------------------
    # Step 5: Save Chat History
    # ----------------------------------------------------
    try:
        history_entry = ChatHistory(
            user_id=current_user.id,
            question=f"[{lang_name}] {raw_question}",
            answer=final_answer,
            source_type=f"multilingual_{lang_code}"
        )
        db.add(history_entry)
        db.commit()
    except Exception as db_err:
        print(f"Warning: Failed to log multilingual chat history: {db_err}")

    # Build sources response
    formatted_sources = []
    for doc in candidate_docs:
        formatted_sources.append({
            "type": "pdf",
            "source": doc.get("source"),
            "page": doc.get("page"),
            "score": doc.get("score")
        })

    return {
        "status": "success",
        "question": raw_question,
        "language": lang_code,
        "language_name": lang_name,
        "english_question": english_question if lang_code != "en" else None,
        "answer": final_answer,
        "english_answer": english_answer if lang_code != "en" else None,
        "source_type": "pdf" if candidate_docs else "none",
        "sources": formatted_sources,
        "user": {
            "id": current_user.id,
            "name": current_user.name
        }
    }


@router.post("/transcribe", response_model=STTResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = Form(default="mr"),
    current_user: User = Depends(get_current_user)
):
    """
    Speech-to-Text endpoint using Groq Whisper Large-v3.
    Accepts audio recordings from farmer's microphone and returns transcribed text.
    """
    try:
        audio_content = await file.read()
        if not audio_content or len(audio_content) < 100:
            raise HTTPException(
                status_code=400,
                detail="Empty or unreadable audio recording provided."
            )

        transcript = transcribe_audio_bytes(
            audio_bytes=audio_content,
            filename=file.filename or "recording.webm",
            language=language
        )

        return {
            "status": "success",
            "transcript": transcript,
            "language": language or "mr"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Speech recognition service error: {str(e)}"
        )


@router.post("/tts")
def text_to_speech(
    request: TTSRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Text-to-Speech audio streaming endpoint.
    Converts translated agricultural advice into high-quality MP3 voice.
    """
    try:
        audio_stream = generate_tts_audio_stream(
            text=request.text,
            language=request.language
        )
        audio_bytes = audio_stream.getvalue()

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename=agri_speech_{request.language}.mp3",
                "Content-Length": str(len(audio_bytes)),
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-cache"
            }
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Voice synthesis service error: {str(e)}"
        )
