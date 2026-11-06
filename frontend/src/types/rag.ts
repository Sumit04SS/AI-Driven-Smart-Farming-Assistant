export interface RAGSource {
  type: 'pdf' | 'web';
  source?: string;
  page?: number | string;
  score?: number;
  title?: string;
  url?: string;
}

export interface RAGRequest {
  question: string;
}

export interface RAGResponse {
  status: string;
  source_type: 'pdf' | 'external' | 'none';
  question: string;
  answer: string;
  sources: RAGSource[];
  user: {
    id: number;
    name: string;
  };
}

export interface ChatHistoryItem {
  id: number;
  question: string;
  answer: string;
  source_type: string;
  created_at: string;
}

export interface ChatHistoryResponse {
  status: string;
  count: number;
  history: ChatHistoryItem[];
}
