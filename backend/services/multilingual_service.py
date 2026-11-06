import io
import os
import re
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv
from groq import Groq
from gtts import gTTS
import requests

from retrieve import retrieve_documents
from generate import generate_answer, GroqGenerationError

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing from .env")

groq_client = Groq(api_key=GROQ_API_KEY)

# Supported Indian Languages with Native Names, Script Metadata, and Curated Agricultural Sample Questions
SUPPORTED_LANGUAGES: Dict[str, Dict] = {
    "mr": {
        "name": "Marathi",
        "native_name": "मराठी",
        "script": "Devanagari",
        "script_regex": r'[\u0900-\u097F]',
        "tts_code": "mr",
        "whisper_code": "mr",
        "sample_questions": [
            "माझ्या गव्हाच्या पिकाला किती पाणी द्यावे?",
            "भात पिकासाठी खत व्यवस्थापन कसे करावे?",
            "काळ्या मातीत कपाशीची लागवड कशी करावी?",
            "टोमॅटो पिकातील कीड नियंत्रण कसे करावे?"
        ]
    },
    "hi": {
        "name": "Hindi",
        "native_name": "हिन्दी",
        "script": "Devanagari",
        "script_regex": r'[\u0900-\u097F]',
        "tts_code": "hi",
        "whisper_code": "hi",
        "sample_questions": [
            "गेहूं की फसल में पहली सिंचाई कब करनी चाहिए?",
            "धान में नाइट्रोजन और फास्फोरस का प्रयोग कैसे करें?",
            "सरसों में एफिड (माहू) कीट का नियंत्रण कैसे करें?",
            "जैविक खाद बनाने की सही विधि क्या है?"
        ]
    },
    "te": {
        "name": "Telugu",
        "native_name": "తెలుగు",
        "script": "Telugu",
        "script_regex": r'[\u0C00-\u0C7F]',
        "tts_code": "te",
        "whisper_code": "te",
        "sample_questions": [
            "వరి పంటకు నీటి యాజమాన్యం ఎలా చేయాలి?",
            "పత్తి పంటలో చీడపీడల నివారణ చర్యలు ఏమిటి?",
            "మిరప తోటలో ఎరువుల వాడకం ఎలా ఉండాలి?",
            "నేల సారవంతాన్ని ఎలా పెంచుకోవాలి?"
        ]
    },
    "ta": {
        "name": "Tamil",
        "native_name": "தமிழ்",
        "script": "Tamil",
        "script_regex": r'[\u0B80-\u0BFF]',
        "tts_code": "ta",
        "whisper_code": "ta",
        "sample_questions": [
            "நெல் பயிரில் உர நிர்வாகம் எவ்வாறு செய்ய வேண்டும்?",
            "வாழை சாகுபடியில் நீர் பாசன முறைகள் என்ன?",
            "மண்ணின் வளத்தை பெருக்க இயற்கை முறைகள் என்ன?",
            "பருத்தி பயிரில் பூச்சி தாக்குதலை தடுப்பது எப்படி?"
        ]
    },
    "kn": {
        "name": "Kannada",
        "native_name": "ಕನ್ನಡ",
        "script": "Kannada",
        "script_regex": r'[\u0C80-\u0CFF]',
        "tts_code": "kn",
        "whisper_code": "kn",
        "sample_questions": [
            "ಭತ್ತದ ಬೆಳೆಗೆ ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ ಹೇಗೆ ಮಾಡಬೇಕು?",
            "ರಾಗಿ ಬೆಳೆಯಲ್ಲಿ ನೀರಿನ ನಿರ್ವಹಣೆ ಹೇಗೆ?",
            "ಕಬ್ಬಿನ ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು ಸಲಹೆಗಳು?",
            "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸುವ ವಿಧಾನಗಳು ಯಾವುವು?"
        ]
    },
    "gu": {
        "name": "Gujarati",
        "native_name": "ગુજરાતી",
        "script": "Gujarati",
        "script_regex": r'[\u0A80-\u0AFF]',
        "tts_code": "gu",
        "whisper_code": "gu",
        "sample_questions": [
            "ઘઉંના પાકમાં પિયત વ્યવસ્થાપન કેવી રીતે કરવું?",
            "કપાસમાં જીવાત નિયંત્રણ માટેના ઉપાયો શું છે?",
            "મગફળીમાં ખાતર વ્યવસ્થાપન કેવી રીતે કરવું?",
            "જમીનની ફળદ્રુપતા કેવી રીતે વધારવી?"
        ]
    },
    "bn": {
        "name": "Bengali",
        "native_name": "বাংলা",
        "script": "Bengali",
        "script_regex": r'[\u0980-\u09FF]',
        "tts_code": "bn",
        "whisper_code": "bn",
        "sample_questions": [
            "ধান চাষে সার প্রয়োগের সঠিক নিয়ম কি?",
            "আলু চাষে সেচ ব্যবস্থাপনা কিভাবে করবেন?",
            "সরিষা ফসলে রোগ পোকা দমন করবেন কিভাবে?",
            "জৈব পদ্ধতিতে মাটির উর্বরতা বৃদ্ধি করবেন কিভাবে?"
        ]
    },
    "pa": {
        "name": "Punjabi",
        "native_name": "ਪੰਜਾਬੀ",
        "script": "Gurmukhi",
        "script_regex": r'[\u0A00-\u0A7F]',
        "tts_code": "pa",
        "whisper_code": "pa",
        "sample_questions": [
            "ਕਣਕ ਦੀ ਫ਼ਸਲ ਨੂੰ ਪਹਿਲਾ ਪਾਣੀ ਕਦੋਂ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?",
            "ਝੋਨੇ ਵਿੱਚ ਖਾਦ ਦਾ ਸਹੀ ਪ੍ਰਬੰਧਨ ਕਿਵੇਂ ਕਰੀਏ?",
            "ਨਰਮੇ ਵਿੱਚ ਗੁਲਾਬੀ ਸੁੰਡੀ ਦੀ ਰੋਕਥਾਮ ਕਿਵੇਂ ਕਰੀਏ?",
            "ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਸੁਧਾਰਨ ਦੇ ਦੇਸੀ ਤਰੀਕੇ ਕੀ ਹਨ?"
        ]
    },
    "en": {
        "name": "English",
        "native_name": "English",
        "script": "Latin",
        "script_regex": r'[a-zA-Z]',
        "tts_code": "en",
        "whisper_code": "en",
        "sample_questions": [
            "How should irrigation be managed for rice to conserve soil nutrients?",
            "What are the recommended fertilizer practices for wheat?",
            "How to manage pest infestation in cotton crops organically?",
            "What are the primary practices to improve soil organic matter?"
        ]
    }
}


def get_supported_languages() -> List[Dict]:
    """Returns metadata list of all supported languages and sample inquiries."""
    return [
        {
            "code": code,
            "name": info["name"],
            "native_name": info["native_name"],
            "script": info["script"],
            "tts_code": info["tts_code"],
            "whisper_code": info["whisper_code"],
            "sample_questions": info["sample_questions"]
        }
        for code, info in SUPPORTED_LANGUAGES.items()
    ]


def is_valid_target_translation(text: str, target_lang: str) -> bool:
    """
    Verifies if text contains valid target script content for non-English languages.
    Does NOT reject text due to numbers, units (kg/ha, %, °C), citations, or filenames.
    """
    if target_lang.lower() == "en":
        return True

    lang_info = SUPPORTED_LANGUAGES.get(target_lang, {})
    pattern_str = lang_info.get("script_regex")
    if not pattern_str:
        pattern_str = r'[\u0900-\u0D7F]'  # Fallback broad Indic script range

    target_chars = re.findall(pattern_str, text)
    count = len(target_chars)

    if count >= 15:
        return True

    all_letters = re.findall(r'[\w]', text, re.UNICODE)
    letter_count = len(all_letters)
    if letter_count > 0 and (count / letter_count) >= 0.15:
        return True

    return False


def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translates farmer query from local Indian language to clear English
    for accurate semantic retrieval in Pinecone.
    """
    text = text.strip()
    if not text:
        return ""

    if source_lang.lower() == "en":
        return text

    lang_info = SUPPORTED_LANGUAGES.get(source_lang, {})
    lang_name = lang_info.get("name", "the given Indian language")
    native_name = lang_info.get("native_name", "")

    prompt = f"""You are a precise agricultural translator.
Translate the following farmer inquiry from {lang_name} ({native_name}) into clear, concise English for database search.
Preserve all agricultural terms (crop names, fertilizers, pests, soil types, numbers).
Output ONLY the English translation without quotes or extra explanation.

Input: {text}"""

    models = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"]
    import time
    start_t = time.time()
    for model_name in models:
        try:
            response = groq_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a professional agricultural translator. Return ONLY the English translation."},
                    {"role": "user", "content": prompt}
                ],
                max_completion_tokens=500,
                temperature=0.1,
                timeout=12.0
            )
            translated = response.choices[0].message.content.strip()
            translated = re.sub(r'^["\']|["\']$', '', translated).strip()
            if translated:
                print(f"Question translation to English completed using {model_name} in {time.time() - start_t:.2f}s")
                return translated
        except Exception as e:
            print(f"Translation of question to English using {model_name} failed: {e}")

    return text


def fix_markdown_headings(translated_text: str) -> str:
    """
    Ensures section titles in translated markdown keep their '### ' heading prefix
    so ReactMarkdown renders them as proper styled section titles.
    """
    lines = translated_text.splitlines()
    fixed_lines = []

    heading_keywords = [
        "Direct Recommendation", "Why and How This Practice Works", "Practical Implementation Steps",
        "Important Precautions", "Key Farmer Takeaway",
        "थेट शिफारस", "हे पद्धत का आणि कसे", "व्यावहारिक अंमलबजावणी", "महत्त्वाच्या खबरदारी", "शेतकऱ्यांसाठी महत्त्वाचा",
        "सीधा सुझाव", "यह प्रथा क्यों और कैसे", "व्यावहारिक कार्यान्वयन", "महत्वपूर्ण सावधानियां", "किसान के लिए मुख्य",
        "प्रत्यक्ष शिफारस", "पद्धत का आणि कशी", "सावधगिरी", "मुख्य निष्कर्ष",
        "प्रत्यक्ष सिफारिश", "पद्धति क्यों और कैसे", "सावधानियां", "मुख्य निष्कर्ष"
    ]

    for line in lines:
        stripped = line.strip()
        # If line is bold header like **Direct Recommendation** or **थेट शिफारस**
        bold_match = re.match(r'^\*\*(.*?)\*\*:?$', stripped)
        if bold_match and len(bold_match.group(1)) < 60:
            line = f"### {bold_match.group(1)}"
            fixed_lines.append(line)
            continue

        for kw in heading_keywords:
            if (stripped.startswith(kw) or stripped.lower().startswith(kw.lower())) and not stripped.startswith("#"):
                line = f"### {stripped.lstrip('#').strip()}"
                break
        fixed_lines.append(line)

    return "\n".join(fixed_lines)


def split_markdown_sections(text: str, max_chunk_chars: int = 2500) -> List[str]:
    """
    Splits markdown by headings (###) or paragraph boundaries into coherent sections
    that fit comfortably within LLM translation token limits.
    """
    if len(text) <= max_chunk_chars:
        return [text]

    sections = re.split(r'(?=\n#{2,4}\s)', text)
    chunks = []
    current_chunk = ""

    for sec in sections:
        sec_clean = sec.strip()
        if not sec_clean:
            continue
        if len(current_chunk) + len(sec_clean) < max_chunk_chars:
            current_chunk = (current_chunk + "\n\n" + sec_clean).strip() if current_chunk else sec_clean
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = sec_clean

    if current_chunk:
        chunks.append(current_chunk)

    if not chunks:
        chunks = [text]

    return chunks


def _translate_single_block(
    text_block: str,
    target_lang: str,
    sys_prompt: str,
    models: List[str]
) -> Optional[str]:
    """Helper to translate a block using fast models with timeout guard."""
    import time
    user_prompt = f"Translate the following agricultural advice completely into {SUPPORTED_LANGUAGES.get(target_lang, {}).get('name', target_lang)} ({SUPPORTED_LANGUAGES.get(target_lang, {}).get('native_name', '')}):\n\n{text_block}"

    for model_name in models:
        try:
            t0 = time.time()
            response = groq_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_completion_tokens=2500,
                temperature=0.1,
                timeout=18.0
            )
            choice = response.choices[0]
            translated = choice.message.content.strip() if choice.message.content else ""
            elapsed = time.time() - t0

            if translated and is_valid_target_translation(translated, target_lang):
                print(f"Translation completed using {model_name} in {elapsed:.2f}s (finish_reason={choice.finish_reason})")
                return translated
            else:
                print(f"Translation with {model_name} failed validation (len={len(translated)}).")
        except Exception as e:
            print(f"Translation with {model_name} failed: {e}")

    return None


def translate_from_english(english_answer: str, target_lang: str) -> str:
    """
    Translates English agricultural response into respectful, natural,
    farmer-friendly target language while preserving markdown structure, numbers, and citations.
    Receives ONLY the final English answer (no retrieval context, no repeated Groq calls).
    Translates in ~2-3 seconds using fast Groq models.
    Raises RuntimeError if translation fails or returns untranslated English.
    """
    import time
    from concurrent.futures import ThreadPoolExecutor

    english_answer = english_answer.strip()
    if not english_answer:
        return ""

    if target_lang.lower() == "en":
        return english_answer

    lang_info = SUPPORTED_LANGUAGES.get(target_lang, {})
    lang_name = lang_info.get("name", "Hindi")
    native_name = lang_info.get("native_name", "")
    script_name = lang_info.get("script", "Devanagari")

    print(f"Selected language: {lang_name} ({target_lang})")
    print(f"English answer length: {len(english_answer)} chars")
    print("Translation started")

    sys_prompt = f"""You are a professional agricultural translator.
TARGET LANGUAGE: {lang_name}
TARGET LANGUAGE CODE: {target_lang}
TARGET SCRIPT: {script_name}

CRITICAL MANDATORY RULES:
1. Translate the entire agricultural response completely into {lang_name} ({native_name}) in {script_name} script. Do NOT stop mid-sentence.
2. Return ONLY the translated markdown answer in {lang_name}. Do NOT explain the translation. Do NOT write in English.
3. Do NOT transliterate {lang_name} into Latin characters.
4. Every major section title MUST start with '### ' (e.g. '### {native_name}'). Do NOT omit the '### ' prefix.
5. Preserve all numbers, measurements, chemical doses (kg/ha, %, cm, days), and technical agricultural terms accurately.
6. Preserve markdown structure exactly: headings (###), bold text (**), bullet points, numbered lists, and tables.
7. Do NOT translate source filenames (e.g. soil_management.pdf) or page references (e.g. Page 12).
8. Do NOT shorten, summarize, or omit any section, paragraph, point, table, or guideline. The translation must be complete and faithful from start to end."""

    models = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"]
    start_t = time.time()

    # Primary path: Translate full answer in a single Groq call (no repeated calls, no chunking)
    if len(english_answer) <= 7000:
        translated = _translate_single_block(english_answer, target_lang, sys_prompt, models)
        if translated:
            fixed_translated = fix_markdown_headings(translated)
            print(f"Single-call translation to {lang_name} finished in {time.time() - start_t:.2f}s ({len(fixed_translated)} chars)")
            return fixed_translated

    # Fallback path for unusually large responses (> 6000 chars)
    chunks = split_markdown_sections(english_answer, max_chunk_chars=4000)
    print(f"Translating {len(chunks)} sections into {lang_name} in parallel...")

    with ThreadPoolExecutor(max_workers=min(len(chunks), 2)) as executor:
        futures = [
            executor.submit(_translate_single_block, chunk, target_lang, sys_prompt, models)
            for chunk in chunks
        ]
        translated_chunks = [f.result() for f in futures]

    if any(chunk is None for chunk in translated_chunks):
        raise RuntimeError(
            f"We could not prepare the answer in {lang_name} ({native_name}). Please click 'Get Farming Advice' to retry."
        )

    full_translated = "\n\n".join(translated_chunks)
    fixed_translated = fix_markdown_headings(full_translated)
    print(f"All {len(chunks)} sections translated in {time.time() - start_t:.2f}s! Total chars: {len(fixed_translated)}")
    return fixed_translated



def transcribe_audio_bytes(audio_bytes: bytes, filename: str, language: Optional[str] = None) -> str:
    """
    Transcribes audio bytes using Groq Whisper Large-v3.
    """
    whisper_lang = None
    if language and language in SUPPORTED_LANGUAGES:
        whisper_lang = SUPPORTED_LANGUAGES[language].get("whisper_code")

    try:
        # Groq client accepts tuple of (filename, file_bytes)
        file_tuple = (filename or "recording.webm", audio_bytes)
        
        kwargs = {
            "file": file_tuple,
            "model": "whisper-large-v3",
            "response_format": "json",
            "temperature": 0.0
        }
        if whisper_lang and whisper_lang != "en":
            kwargs["language"] = whisper_lang

        transcription = groq_client.audio.transcriptions.create(**kwargs)
        text = transcription.text.strip()
        return text
    except Exception as e:
        print(f"Speech-to-Text transcription failed: {e}")
        raise RuntimeError(f"Voice transcription failed: {e}")


def clean_text_for_speech(markdown_text: str) -> str:
    """
    Strips LaTeX formulas, markdown symbols, headings, URLs, and asterisks
    so text-to-speech audio sounds natural and clean without speaking raw code or math symbols.
    The output retains the COMPLETE substantive content so the full answer is spoken.
    """
    if not markdown_text:
        return ""

    text = markdown_text

    # 1. Clean LaTeX formulas into natural spoken language
    text = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', r'\1 divided by \2', text)
    text = re.sub(r'\\times', ' times ', text)
    text = re.sub(r'\\approx', ' approximately ', text)
    text = re.sub(r'\\pm', ' plus or minus ', text)
    text = re.sub(r'\\le[q]?', ' less than or equal to ', text)
    text = re.sub(r'\\ge[q]?', ' greater than or equal to ', text)
    text = re.sub(r'\\(text|mathrm|bf|italic)\{([^}]+)\}', r'\2', text)
    text = re.sub(r'\\([a-zA-Z]+)', ' ', text)  # strip remaining latex command words
    text = re.sub(r'[\$\\]', ' ', text)

    # 2. Process table rows into readable spoken sentences
    cleaned_lines = []
    for line in text.splitlines():
        line_str = line.strip()
        # Skip markdown table divider line (|---|---|)
        if re.match(r'^\|?[\s\-:|]+\|?$', line_str):
            continue
        # Table content row (| Header 1 | Header 2 |)
        if line_str.startswith('|') and line_str.endswith('|'):
            cells = [c.strip() for c in line_str.strip('|').split('|') if c.strip()]
            if cells:
                cleaned_lines.append(', '.join(cells) + '.')
        else:
            cleaned_lines.append(line)
    text = '\n'.join(cleaned_lines)

    # 3. Remove markdown links: [text](url) -> text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)

    # 4. Remove headings markers (###)
    text = re.sub(r'#+\s*', '', text)

    # 5. Remove bold/italic/code markers (*, _, ~, `)
    text = re.sub(r'[*_~`]', '', text)

    # 6. Remove horizontal rules (--- or ===)
    text = re.sub(r'[-=]{3,}', '', text)

    # 7. Convert bullet markers at line start to a natural pause
    text = re.sub(r'^\s*[-*•]\s+', '', text, flags=re.MULTILINE)

    # 8. Clean up redundant spaces and empty lines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text).strip()

    return text



def generate_tts_audio_stream(text: str, language: str) -> io.BytesIO:
    """
    Generates an MP3 audio byte stream from text using gTTS (with Sarvam/fallback capability).
    Speaks the COMPLETE text in the selected language.
    """
    clean_text = clean_text_for_speech(text)
    if not clean_text:
        raise ValueError("Cannot synthesize audio for empty text.")

    tts_lang = SUPPORTED_LANGUAGES.get(language, {}).get("tts_code", "hi")

    # If Sarvam AI key is configured and available
    if SARVAM_API_KEY and language in ["hi", "mr", "te", "ta", "kn", "gu", "bn", "pa"]:
        try:
            sarvam_url = "https://api.sarvam.ai/text-to-speech"
            headers = {
                "api-subscription-key": SARVAM_API_KEY,
                "Content-Type": "application/json"
            }
            payload = {
                "inputs": [clean_text[:1000]],
                "target_language_code": f"{language}-IN",
                "speaker": "meera",
                "pitch": 0,
                "pace": 1.0,
                "loudness": 1.5,
                "speech_sample_rate": 22050,
                "enable_preprocessing": True,
                "model": "bulbul:v1"
            }
            resp = requests.post(sarvam_url, json=payload, headers=headers, timeout=15)
            if resp.ok and "audios" in resp.json():
                import base64
                audio_b64 = resp.json()["audios"][0]
                audio_bytes = base64.b64decode(audio_b64)
                buf = io.BytesIO(audio_bytes)
                buf.seek(0)
                return buf
        except Exception as err:
            print(f"Sarvam TTS failed, falling back to gTTS: {err}")

    # Standard robust high-quality gTTS provider (speaks complete text)
    try:
        tts = gTTS(text=clean_text, lang=tts_lang, slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        return buf
    except Exception as e:
        print(f"gTTS standard failed ({e}), trying tld='co.in'...")
        try:
            tts = gTTS(text=clean_text, lang=tts_lang, tld="co.in", slow=False)
            buf = io.BytesIO()
            tts.write_to_fp(buf)
            buf.seek(0)
            return buf
        except Exception as e2:
            print(f"gTTS (co.in) failed ({e2}), attempting english fallback...")
            try:
                tts_fallback = gTTS(text=clean_text, lang="en", slow=False)
                buf = io.BytesIO()
                tts_fallback.write_to_fp(buf)
                buf.seek(0)
                return buf
            except Exception as e3:
                raise RuntimeError(f"Text-to-Speech synthesis failed: {e3}")

