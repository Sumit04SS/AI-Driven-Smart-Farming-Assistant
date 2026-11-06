import api from './api';
import {
  LanguageOption,
  MultilingualQueryRequest,
  MultilingualQueryResponse,
  STTResponse
} from '../types/multilingual';

export const multilingualService = {
  async getSupportedLanguages(): Promise<{ status: string; languages: LanguageOption[] }> {
    const res = await api.get<{ status: string; languages: LanguageOption[] }>('/multilingual/languages');
    return res.data;
  },

  async askQuestion(question: string, language: string): Promise<MultilingualQueryResponse> {
    const res = await api.post<MultilingualQueryResponse>('/multilingual/query', {
      question,
      language
    } as MultilingualQueryRequest);
    return res.data;
  },

  async transcribeAudio(audioBlob: Blob, language: string): Promise<STTResponse> {
    const formData = new FormData();
    const filename = audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a') 
      ? 'recording.m4a' 
      : 'recording.webm';
    formData.append('file', audioBlob, filename);
    formData.append('language', language);

    const res = await api.post<STTResponse>('/multilingual/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
    return res.data;
  },

  async getTTSAudioBlob(text: string, language: string): Promise<Blob> {
    const res = await api.post('/multilingual/tts', { text, language }, {
      responseType: 'blob',
      timeout: 90000,
    });

    const blob = res.data as Blob;
    if (blob && blob.type && blob.type.includes('application/json')) {
      const jsonText = await blob.text();
      let errorMsg = 'Failed to generate audio stream.';
      try {
        const parsed = JSON.parse(jsonText);
        errorMsg = parsed.detail || parsed.message || errorMsg;
      } catch (e) {
        // ignore parse error
      }
      throw new Error(errorMsg);
    }

    return blob;
  }
};

