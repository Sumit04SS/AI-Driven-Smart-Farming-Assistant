from pydantic import BaseModel, Field
from typing import List, Optional, Any


class LanguageItem(BaseModel):
    code: str
    name: str
    native_name: str
    tts_code: str
    sample_questions: List[str]


class MultilingualQueryRequest(BaseModel):
    question: str = Field(..., min_length=2, description="Farmer question in preferred language")
    language: str = Field(default="mr", description="Language code (e.g. mr, hi, te, ta, kn, gu, bn, pa, en)")


class MultilingualSource(BaseModel):
    type: str
    source: Optional[str] = None
    page: Optional[Any] = None
    score: Optional[float] = None
    title: Optional[str] = None
    url: Optional[str] = None


class MultilingualQueryResponse(BaseModel):
    status: str
    question: str
    language: str
    language_name: str
    english_question: Optional[str] = None
    answer: str
    english_answer: Optional[str] = None
    source_type: str
    sources: List[MultilingualSource]
    user: Optional[dict] = None


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to synthesize")
    language: str = Field(default="mr", description="Language code for speech synthesis")


class STTResponse(BaseModel):
    status: str
    transcript: str
    language: str
    confidence: Optional[float] = None
