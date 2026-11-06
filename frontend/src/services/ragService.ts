import api from './api';
import { ChatHistoryResponse, RAGRequest, RAGResponse } from '../types/rag';

export const ragService = {
  async askQuestion(question: string): Promise<RAGResponse> {
    const res = await api.post<RAGResponse>('/rag/query', { question } as RAGRequest);
    return res.data;
  },

  async getHistory(): Promise<ChatHistoryResponse> {
    const res = await api.get<ChatHistoryResponse>('/history');
    return res.data;
  },

  async deleteHistory(historyId: number): Promise<{ status: string; message: string }> {
    const res = await api.delete<{ status: string; message: string }>(`/history/${historyId}`);
    return res.data;
  },
};
