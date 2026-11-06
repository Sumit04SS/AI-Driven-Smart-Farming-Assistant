import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquareText,
  Send,
  BookOpen,
  FileText,
  ExternalLink,
  History,
  Trash2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Leaf,
  Volume2,
  Pause,
  Play,
  Square,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ragService } from '../services/ragService';
import { multilingualService } from '../services/multilingualService';
import { preprocessMarkdown, markdownComponents } from '../utils/answerFormatting';

import { ChatHistoryItem, RAGResponse } from '../types/rag';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AlertBanner } from '../components/common/AlertBanner';

// Rotating farmer-friendly status messages for the loading state
const LOADING_MESSAGES = [
  'Searching agricultural knowledge base…',
  'Reviewing FAO soil management manuals…',
  'Cross-referencing ICAR crop guidelines…',
  'Preparing your farming guidance…',
  'Synthesising expert agronomic advice…',
  'Checking plant nutrition references…',
];

const useRotatingMessages = (active: boolean, intervalMs = 2500) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, intervalMs]);

  return LOADING_MESSAGES[index];
};

export const AdvisorPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<RAGResponse | null>(null);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');
  type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  const [audioState, setAudioState] = useState<AudioPlaybackState>('idle');
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAudioState('idle');
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    if (!currentResponse || !currentResponse.answer) return;

    if (audioState === 'playing') {
      if (audioRef.current) {
        audioRef.current.pause();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setAudioState('paused');
      return;
    }

    if (audioState === 'paused') {
      if (audioRef.current) {
        audioRef.current.play();
        setAudioState('playing');
        return;
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
        setAudioState('playing');
        return;
      }
    }

    stopAllAudio();
    setAudioError(null);
    setAudioState('loading');

    try {
      const blob = await multilingualService.getTTSAudioBlob(
        currentResponse.answer,
        'en'
      );

      if (!blob || blob.size < 100 || (blob.type && blob.type.includes('json'))) {
        throw new Error('Server returned invalid MP3 audio content.');
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setAudioState('idle');
      };

      audio.onerror = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const cleanText = currentResponse.answer
            .replace(/#+\s*/g, '')
            .replace(/[*_~`|]/g, ' ')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/\s+/g, ' ')
            .trim();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'en-US';
          utterance.onstart = () => setAudioState('playing');
          utterance.onend = () => setAudioState('idle');
          utterance.onerror = () => {
            setAudioState('error');
            setAudioError('Browser speech playback failed.');
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setAudioState('error');
          setAudioError('Audio playback failed.');
        }
      };

      await audio.play();
      setAudioState('playing');
    } catch (err: any) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = currentResponse.answer
          .replace(/#+\s*/g, '')
          .replace(/[*_~`|]/g, ' ')
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          .replace(/\s+/g, ' ')
          .trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.onstart = () => setAudioState('playing');
        utterance.onend = () => setAudioState('idle');
        utterance.onerror = () => {
          setAudioState('error');
          setAudioError('Audio playback failed.');
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setAudioState('error');
        setAudioError(err.message || 'Could not play answer audio. Please try again.');
      }
    }
  };

  const handleStopAudio = () => {
    stopAllAudio();
  };

  const loadingMessage = useRotatingMessages(loading);

  const samplePrompts = [
    'What are the recommended nutrient management practices for wheat?',
    'How should irrigation be managed for rice to conserve soil nutrients?',
    'What are the primary causes of soil salinity in irrigated areas?',
    'How can organic matter be integrated into tropical dryland farming?',
  ];

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await ragService.getHistory();
      if (res.history) {
        setHistory(res.history);
      }
    } catch (err: any) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAsk = async (qText?: string) => {
    const query = (qText || question).trim();
    if (!query || loading) return;

    stopAllAudio();
    setLastQuery(query);
    setError(null);
    setLoading(true);
    setCurrentResponse(null);

    try {
      const res = await ragService.askQuestion(query);
      setCurrentResponse(res);
      setQuestion('');
      fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve agricultural guidance.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleAsk(lastQuery);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!window.confirm('Delete this advisory conversation from history?')) return;
    try {
      await ragService.deleteHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (
        currentResponse?.question &&
        history.find((h) => h.id === id)?.question === currentResponse.question
      ) {
        setCurrentResponse(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete history item.');
    }
  };

  const handleSelectHistoryItem = (item: ChatHistoryItem) => {
    stopAllAudio();
    setCurrentResponse({
      status: 'success',
      source_type: item.source_type as any,
      question: item.question,
      answer: item.answer,
      sources: [],
      user: { id: 0, name: '' },
    });
    setShowHistorySidebar(false);
  };

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="emerald" size="sm">
              Pinecone Vector Search (agri-advisory)
            </Badge>
            <Badge variant="slate" size="sm">
              Groq AI — Agricultural Expert
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Multilingual AI Agronomic Advisor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ground-truth agricultural recommendations extracted directly from peer-reviewed FAO and
            ICAR manuals.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistorySidebar(!showHistorySidebar)}
          icon={<History className="w-4 h-4" />}
        >
          {showHistorySidebar ? 'Hide History' : `History (${history.length})`}
        </Button>
      </div>

      {/* Error with Retry */}
      {error && (
        <div className="space-y-3">
          <AlertBanner
            type="error"
            title="Guidance Unavailable"
            message={error}
            onClose={() => setError(null)}
          />
          {lastQuery && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                disabled={loading}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Advisory Consultation Area */}
        <div className={`${showHistorySidebar ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
          {/* Question Input Box */}
          <Card className="shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a verified agronomy question (e.g., 'What are the fertilizer recommendations for transplanted rice?')"
                  className="w-full text-sm rounded-xl border border-slate-300 p-3.5 pr-12 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all resize-none placeholder-slate-400"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="absolute bottom-3 right-3 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs shadow-emerald-700/20"
                  title="Send (Ctrl+Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Sample Prompts */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Suggested Agricultural Inquiries:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAsk(prompt)}
                      disabled={loading}
                      className="text-xs text-slate-600 bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/80 px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer disabled:opacity-50"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </Card>

          {/* Loading State — Farmer-Friendly */}
          {loading && (
            <Card className="py-10">
              <div className="flex flex-col items-center gap-4 text-center">
                {/* Animated leaf icon */}
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-40" />
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200">
                    <Leaf className="w-7 h-7 text-emerald-600" />
                  </div>
                </div>

                {/* Rotating status message — respects prefers-reduced-motion via CSS */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 transition-all duration-500">
                    {loadingMessage}
                  </p>
                  <p className="text-xs text-slate-400">
                    Scanning FAO and ICAR agricultural manuals for verified guidance…
                  </p>
                </div>

                {/* Subtle progress bar */}
                <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-emerald-500 rounded-full origin-left animate-[shimmer_1.5s_ease-in-out_infinite]" />
                </div>
              </div>
            </Card>
          )}

          {/* Response Display */}
          {!loading && currentResponse && (
            <Card
              title="Verified Agronomic Guidance"
              icon={<BookOpen className="w-5 h-5" />}
              action={
                <Badge
                  variant={
                    currentResponse.source_type === 'pdf'
                      ? 'emerald'
                      : currentResponse.source_type === 'external'
                      ? 'blue'
                      : 'slate'
                  }
                  size="md"
                >
                  {currentResponse.source_type === 'pdf'
                    ? 'FAO Knowledge Base'
                    : currentResponse.source_type === 'external'
                    ? 'External Web Verified'
                    : 'Unverified'}
                </Badge>
              }
            >
              <div className="space-y-6">
                {/* Question Callout */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-slate-800">
                    "{currentResponse.question}"
                  </p>
                </div>

                {/* Audio Playback Controls */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={audioState === 'playing' ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={handlePlayAudio}
                        loading={audioState === 'loading'}
                        icon={
                          audioState === 'loading' ? null : audioState === 'playing' ? (
                            <Pause className="w-4 h-4 text-emerald-700" />
                          ) : audioState === 'paused' ? (
                            <Play className="w-4 h-4 text-white" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-white" />
                          )
                        }
                      >
                        {audioState === 'loading'
                          ? 'Preparing Audio...'
                          : audioState === 'playing'
                          ? 'Pause Audio'
                          : audioState === 'paused'
                          ? 'Resume Audio'
                          : 'Listen to Answer'}
                      </Button>

                      {(audioState === 'playing' || audioState === 'paused') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStopAudio}
                          icon={<Square className="w-3.5 h-3.5 text-rose-600" />}
                        >
                          Stop Audio
                        </Button>
                      )}
                    </div>
                  </div>

                  {audioError && (
                    <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        {audioError}
                      </span>
                      <button
                        type="button"
                        onClick={handlePlayAudio}
                        className="font-bold underline text-rose-700 hover:text-rose-900 cursor-pointer ml-2"
                      >
                        Retry Playback
                      </button>
                    </div>
                  )}

                  {audioState === 'playing' && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-3 bg-emerald-600 rounded-full animate-bounce" />
                        <span className="w-1.5 h-4 bg-emerald-600 rounded-full animate-bounce delay-75" />
                        <span className="w-1.5 h-2 bg-emerald-600 rounded-full animate-bounce delay-150" />
                      </span>
                      <span>Speaking answer in English...</span>
                    </div>
                  )}
                </div>

                {/* Synthesized Answer — Rendered as Clean Formatted Markdown with Tables & Math */}
                <div className="text-slate-700 leading-relaxed bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-2xs">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={markdownComponents}
                  >
                    {preprocessMarkdown(currentResponse.answer)}
                  </ReactMarkdown>
                </div>


                {/* Sources & Citations */}
                {currentResponse.sources && currentResponse.sources.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Document Citations &amp; Relevance Scores
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentResponse.sources.map((src, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1.5"
                        >
                          {src.type === 'pdf' ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span
                                  className="font-semibold text-slate-900 truncate max-w-[200px]"
                                  title={src.source}
                                >
                                  {src.source}
                                </span>
                                {src.score !== undefined && (
                                  <Badge variant="emerald" size="sm">
                                    {(src.score * 100).toFixed(1)}% match
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Page Reference: {src.page}
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900 truncate">
                                  {src.title}
                                </span>
                                <Badge variant="blue" size="sm">
                                  Web Source
                                </Badge>
                              </div>
                              {src.url && (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 truncate"
                                >
                                  {src.url} <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !currentResponse && !error && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
              <MessageSquareText className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <h3 className="font-semibold text-slate-700 text-sm">Ask your first question above</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Our RAG system searches through official FAO documents (Soil Management, Plant
                Nutrition, Irrigation Manuals) to give exact page-cited answers.
              </p>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        {showHistorySidebar && (
          <div className="space-y-4">
            <Card
              title="Recent Inquiries"
              subtitle={`${history.length} saved conversations`}
              icon={<History className="w-5 h-5" />}
            >
              {historyLoading ? (
                <p className="text-xs text-slate-400 text-center py-4">Loading past sessions…</p>
              ) : history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No previous questions recorded.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50 hover:bg-emerald-50/30 transition-all text-xs space-y-1.5 group cursor-pointer"
                      onClick={() => handleSelectHistoryItem(item)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-slate-800 line-clamp-2">{item.question}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHistory(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                        <Badge
                          variant={item.source_type === 'pdf' ? 'emerald' : 'slate'}
                          size="sm"
                        >
                          {item.source_type}
                        </Badge>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
