export interface LanguageOption {
  code: string;
  name: string;
  native_name: string;
  tts_code: string;
  sample_questions: string[];
}

export interface MultilingualSource {
  type: 'pdf' | 'web';
  source?: string;
  page?: number | string;
  score?: number;
  title?: string;
  url?: string;
}

export interface MultilingualQueryRequest {
  question: string;
  language: string;
}

export interface MultilingualQueryResponse {
  status: string;
  question: string;
  language: string;
  language_name: string;
  english_question?: string | null;
  answer: string;
  english_answer?: string | null;
  source_type: 'pdf' | 'external' | 'none';
  sources: MultilingualSource[];
  user?: {
    id: number;
    name: string;
  };
}

export interface STTResponse {
  status: string;
  transcript: string;
  language: string;
  confidence?: number;
}
