from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.security import get_current_user
from backend.schemas.rag import RAGRequest
from backend.database import get_db
from backend.models.chat_history import ChatHistory

from retrieve import retrieve_documents
from generate import generate_answer, GroqGenerationError

from backend.services.external_search_service import (
    search_external_knowledge,
    generate_external_answer
)


router = APIRouter(
    prefix="/api/rag",
    tags=["RAG"]
)


PDF_SCORE_THRESHOLD = 0.55


@router.post("/query")
def rag_query(
    request: RAGRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    question = request.question.strip()

    # --------------------------------
    # STEP 1: Search PDF knowledge
    # --------------------------------

    results = retrieve_documents(
        question
    )

    strong_pdf_results = [
        result
        for result in results
        if result.get("score", 0)
        >= PDF_SCORE_THRESHOLD
    ]

    # --------------------------------
    # STEP 2: Use PDF RAG if relevant
    # --------------------------------

    if strong_pdf_results:

        try:
            answer = generate_answer(
                question,
                strong_pdf_results
            )
        except GroqGenerationError as e:
            raise HTTPException(
                status_code=502,
                detail=str(e)
            )

        # Save PDF conversation
        history = ChatHistory(
            user_id=current_user.id,
            question=question,
            answer=answer,
            source_type="pdf"
        )

        db.add(history)
        db.commit()

        sources = []

        for result in strong_pdf_results:

            sources.append({
                "type": "pdf",
                "source": result.get("source"),
                "page": result.get("page"),
                "score": result.get("score")
            })

        return {
            "status": "success",
            "source_type": "pdf",
            "question": question,
            "answer": answer,
            "sources": sources,
            "user": {
                "id": current_user.id,
                "name": current_user.name
            }
        }

    # --------------------------------
    # STEP 3: PDF not sufficient
    # Search external knowledge
    # --------------------------------

    try:
        external_results = search_external_knowledge(
            question
        )

        external_answer = generate_external_answer(
            question,
            external_results
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )

    # --------------------------------
    # STEP 4: External answer available
    # --------------------------------

    if external_answer:

        # Save external conversation
        history = ChatHistory(
            user_id=current_user.id,
            question=question,
            answer=external_answer,
            source_type="external"
        )

        db.add(history)
        db.commit()

        sources = []

        for result in external_results:

            sources.append({
                "type": "web",
                "title": result.get("title"),
                "url": result.get("url")
            })

        return {
            "status": "success",
            "source_type": "external",
            "question": question,
            "answer": external_answer,
            "sources": sources,
            "user": {
                "id": current_user.id,
                "name": current_user.name
            }
        }

    # --------------------------------
    # STEP 5: Nothing found
    # --------------------------------

    fallback_answer = (
        "I could not find this information "
        "in the provided documents."
    )

    # Save fallback conversation
    history = ChatHistory(
        user_id=current_user.id,
        question=question,
        answer=fallback_answer,
        source_type="none"
    )

    db.add(history)
    db.commit()

    return {
        "status": "success",
        "source_type": "none",
        "question": question,
        "answer": fallback_answer,
        "sources": [],
        "user": {
            "id": current_user.id,
            "name": current_user.name
        }
    }