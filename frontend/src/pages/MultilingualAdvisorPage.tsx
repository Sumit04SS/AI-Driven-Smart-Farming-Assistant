import React, { useState, useEffect, useRef } from 'react';
import {
  Languages,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle,
  RotateCcw,
  Globe2,
  Headphones,
  Keyboard,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { multilingualService } from '../services/multilingualService';
import { LanguageOption, MultilingualQueryResponse } from '../types/multilingual';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AlertBanner } from '../components/common/AlertBanner';
import { preprocessMarkdown, markdownComponents } from '../utils/answerFormatting';

// Default initial language list
const FALLBACK_LANGUAGES: LanguageOption[] = [
  {
    code: 'mr',
    name: 'Marathi',
    native_name: 'मराठी',
    tts_code: 'mr',
    sample_questions: [
      'माझ्या गव्हाच्या पिकाला किती पाणी द्यावे?',
      'भात पिकासाठी खत व्यवस्थापन कसे करावे?',
      'काळ्या मातीत कपाशीची लागवड कशी करावी?',
      'टोमॅटो पिकातील कीड नियंत्रण कसे करावे?',
    ],
  },
  {
    code: 'hi',
    name: 'Hindi',
    native_name: 'हिन्दी',
    tts_code: 'hi',
    sample_questions: [
      'गेहूं की फसल में पहली सिंचाई कब करनी चाहिए?',
      'धान में नाइट्रोजन और फास्फोरस का प्रयोग कैसे करें?',
      'सरसों में एफिड (माहू) कीट का नियंत्रण कैसे करें?',
      'जैविक खाद बनाने की सही विधि क्या है?',
    ],
  },
  {
    code: 'te',
    name: 'Telugu',
    native_name: 'తెలుగు',
    tts_code: 'te',
    sample_questions: [
      'వరి పంటకు నీటి యాజమాన్యం ఎలా చేయాలి?',
      'పత్తి పంటలో చీడపీడల నివారణ చర్యలు ఏమిటి?',
      'మిరప తోటలో ఎరువుల వాడకం ఎలా ఉండాలి?',
      'నేల సారవంతాన్ని ఎలా పెంచుకోవాలి?',
    ],
  },
  {
    code: 'ta',
    name: 'Tamil',
    native_name: 'தமிழ்',
    tts_code: 'ta',
    sample_questions: [
      'நெல் பயிரில் உர நிர்வாகம் எவ்வாறு செய்ய வேண்டும்?',
      'வாழை சாகுபடியில் நீர் பாசன முறைகள் என்ன?',
      'மண்ணின் வளத்தை பெருக்க இயற்கை முறைகள் என்ன?',
      'பருத்தி பயிரில் பூச்சி தாக்குதலை தடுப்பது எப்படி?',
    ],
  },
  {
    code: 'kn',
    name: 'Kannada',
    native_name: 'ಕನ್ನಡ',
    tts_code: 'kn',
    sample_questions: [
      'ಭತ್ತದ ಬೆಳೆಗೆ ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ ಹೇಗೆ ಮಾಡಬೇಕು?',
      'ರಾಗಿ ಬೆಳೆಯಲ್ಲಿ ನೀರಿನ ನಿರ್ವಹಣೆ ಹೇಗೆ?',
      'ಕಬ್ಬಿನ ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು ಸಲಹೆಗಳು?',
      'ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸುವ ವಿಧಾನಗಳು ಯಾವುವು?',
    ],
  },
  {
    code: 'gu',
    name: 'Gujarati',
    native_name: 'ગુજરાતી',
    tts_code: 'gu',
    sample_questions: [
      'ઘઉંના પાકમાં પિયત વ્યવસ્થાપન કેવી રીતે કરવું?',
      'કપાસમાં જીવાત નિયંત્રણ માટેના ઉપાયો શું છે?',
      'મગફળીમાં ખાતર વ્યવસ્થાપન કેવી રીતે કરવું?',
      'જમીનની ફળદ્રુપતા કેવી રીતે વધારવી?',
    ],
  },
  {
    code: 'bn',
    name: 'Bengali',
    native_name: 'বাংলা',
    tts_code: 'bn',
    sample_questions: [
      'ধান চাষে সার প্রয়োগের সঠিক নিয়ম কি?',
      'আলু চাষে সেচ ব্যবস্থাপনা কিভাবে করবেন?',
      'সরিষা ফসলে রোগ পোকা দমন করবেন কিভাবে?',
      'জৈব পদ্ধতিতে মাটির উর্বরতা বৃদ্ধি করবেন কিভাবে?',
    ],
  },
  {
    code: 'pa',
    name: 'Punjabi',
    native_name: 'ਪੰਜਾਬੀ',
    tts_code: 'pa',
    sample_questions: [
      'ਕਣਕ ਦੀ ਫ਼ਸਲ ਨੂੰ ਪਹਿਲਾ ਪਾਣੀ ਕਦੋਂ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?',
      'ਝੋਨੇ ਵਿੱਚ ਖਾਦ ਦਾ ਸਹੀ ਪ੍ਰਬੰਧਨ ਕਿਵੇਂ ਕਰੀਏ?',
      'ਨਰਮੇ ਵਿੱਚ ਗੁਲਾਬੀ ਸੁੰਡੀ ਦੀ ਰੋਕਥਾਮ ਕਿਵੇਂ ਕਰੀਏ?',
      'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਸੁਧਾਰਨ ਦੇ ਦੇਸੀ ਤਰੀਕੇ ਕੀ ਹਨ?',
    ],
  },
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    tts_code: 'en',
    sample_questions: [
      'How should irrigation be managed for rice to conserve soil nutrients?',
      'What are the recommended fertilizer practices for wheat?',
      'How to manage pest infestation in cotton crops organically?',
      'What are the primary practices to improve soil organic matter?',
    ],
  },
];

type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export const MultilingualAdvisorPage: React.FC = () => {
  const [languages, setLanguages] = useState<LanguageOption[]>(FALLBACK_LANGUAGES);
  const [selectedLang, setSelectedLang] = useState<string>('mr');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [question, setQuestion] = useState<string>('');

  // Voice Recording STT state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [voiceTranscriptConfirmed, setVoiceTranscriptConfirmed] = useState<boolean>(false);

  // Query processing state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('Understanding your question...');
  const [currentResponse, setCurrentResponse] = useState<MultilingualQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showEnglishOriginal, setShowEnglishOriginal] = useState<boolean>(false);

  // Audio Playback State Management
  const [audioState, setAudioState] = useState<AudioPlaybackState>('idle');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<'server' | 'browser' | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  // Fetch languages on mount
  useEffect(() => {
    const fetchLangs = async () => {
      try {
        const res = await multilingualService.getSupportedLanguages();
        if (res.languages && res.languages.length > 0) {
          setLanguages(res.languages);
        }
      } catch (err) {
        console.warn('Using fallback language list:', err);
      }
    };
    fetchLangs();
  }, []);

  // Cleanup audio objects on unmount or question reset
  const stopAllAudio = () => {
    // 1. Stop backend HTML Audio object
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // 2. Stop browser native SpeechSynthesis
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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Rotating progress message while querying
  useEffect(() => {
    if (!loading) return;

    const currentLangObj = languages.find((l) => l.code === selectedLang);
    const langName = currentLangObj?.native_name || currentLangObj?.name || 'your language';

    const stages = [
      'Understanding your question...',
      'Translating inquiry for agricultural database...',
      'Searching verified FAO & ICAR manuals in Pinecone...',
      'Synthesizing expert agronomic recommendations...',
      `Preparing your detailed answer in ${langName}...`,
    ];

    let step = 0;
    setLoadingStage(stages[0]);

    const interval = setInterval(() => {
      step = (step + 1) % stages.length;
      setLoadingStage(stages[step]);
    }, 2800);

    return () => clearInterval(interval);
  }, [loading, selectedLang, languages]);

  const activeLangDetails = languages.find((l) => l.code === selectedLang) || languages[0];

  // ==========================================
  // VOICE RECORDING LOGIC (Preserved STT)
  // ==========================================
  const startRecording = async () => {
    setError(null);
    setVoiceTranscriptConfirmed(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        await handleAudioTranscription(audioBlob);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setError(
        'Could not access your microphone. Please allow microphone permission in browser settings, or use text typing.'
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAudioTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const res = await multilingualService.transcribeAudio(audioBlob, selectedLang);
      if (res.transcript && res.transcript.trim()) {
        setQuestion(res.transcript.trim());
        setVoiceTranscriptConfirmed(true);
      } else {
        setError('No speech was detected in the audio. Please try speaking clearly.');
      }
    } catch (err: any) {
      setError(err.message || 'Speech recognition failed. Please try speaking again or type your question.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // ==========================================
  // QUERY SUBMISSION (Guarded against duplicate calls)
  // ==========================================
  const handleSubmit = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || loading || isSubmittingRef.current) return;

    stopAllAudio();
    isSubmittingRef.current = true;

    setError(null);
    setAudioError(null);
    setLoading(true);
    setCurrentResponse(null);

    try {
      const res = await multilingualService.askQuestion(q, selectedLang);
      setCurrentResponse(res);
      setVoiceTranscriptConfirmed(false);
    } catch (err: any) {
      const rawMsg = err.message || 'Failed to generate agricultural advice. Please try again.';
      if (rawMsg.includes('TRANSLATION_FAILED')) {
        setError(rawMsg.replace(/.*TRANSLATION_FAILED:\s*/, '').trim());
      } else {
        setError(rawMsg);
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // ==========================================
  // RELIABLE TEXT-TO-SPEECH AUDIO PLAYBACK (TTS)
  // ==========================================

  // Fallback: Browser Native SpeechSynthesis
  const playBrowserSpeechSynthesis = (textToSpeak: string, langCode: string) => {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis is not supported in this browser.');
    }

    window.speechSynthesis.cancel(); // cancel existing

    const cleanText = textToSpeak
      .replace(/#+\s*/g, '')
      .replace(/[*_~`|]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Map language code to BCP-47 tag
    const bcp47Map: Record<string, string> = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      gu: 'gu-IN',
      bn: 'bn-IN',
      pa: 'pa-IN',
      en: 'en-US',
    };
    utterance.lang = bcp47Map[langCode] || 'hi-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setAudioState('playing');
      setAudioSource('browser');
    };

    utterance.onend = () => {
      setAudioState('idle');
    };

    utterance.onerror = (e) => {
      console.error('Browser SpeechSynthesis Error:', e);
      setAudioState('error');
      setAudioError('Browser speech playback error occurred.');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAudio = async () => {
    if (!currentResponse || !currentResponse.answer) return;

    // 1. If currently playing -> Pause
    if (audioState === 'playing') {
      if (audioSource === 'server' && audioRef.current) {
        audioRef.current.pause();
      } else if (audioSource === 'browser' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setAudioState('paused');
      return;
    }

    // 2. If currently paused -> Resume
    if (audioState === 'paused') {
      if (audioSource === 'server' && audioRef.current) {
        audioRef.current.play();
        setAudioState('playing');
        return;
      } else if (audioSource === 'browser' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
        setAudioState('playing');
        return;
      }
    }

    // 3. Stop any existing playing instances before creating new stream
    stopAllAudio();
    setAudioError(null);
    setAudioState('loading');

    try {
      // Fetch TTS Audio Blob from Backend
      const blob = await multilingualService.getTTSAudioBlob(
        currentResponse.answer,
        currentResponse.language
      );

      // Validate blob type
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

      audio.onerror = (e) => {
        console.warn('Backend audio element error, trying browser SpeechSynthesis fallback...', e);
        try {
          playBrowserSpeechSynthesis(currentResponse.answer, currentResponse.language);
        } catch (err: any) {
          setAudioState('error');
          setAudioError(err.message || 'Audio playback failed.');
        }
      };

      await audio.play();
      setAudioState('playing');
      setAudioSource('server');
    } catch (err: any) {
      console.warn('Backend TTS stream error, executing client SpeechSynthesis fallback:', err);
      try {
        playBrowserSpeechSynthesis(currentResponse.answer, currentResponse.language);
      } catch (fallbackErr: any) {
        setAudioState('error');
        setAudioError(err.message || 'Could not play answer audio. Please try again.');
      }
    }
  };

  const handleStopAudio = () => {
    stopAllAudio();
  };

  const handleCopyAnswer = async () => {
    if (!currentResponse?.answer) return;
    try {
      await navigator.clipboard.writeText(currentResponse.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleReset = () => {
    stopAllAudio();
    setCurrentResponse(null);
    setQuestion('');
    setError(null);
    setAudioError(null);
    setVoiceTranscriptConfirmed(false);
  };

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-7xl 2xl:max-w-full mx-auto">
      {/* Hero Header Banner */}

      <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <Badge variant="emerald" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            <Globe2 className="w-3.5 h-3.5 mr-1" />
            9 Indian Languages Supported
          </Badge>
          <Badge variant="blue" size="sm" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            <Mic className="w-3.5 h-3.5 mr-1" />
            Voice STT &amp; Audio TTS Playback
          </Badge>
          <Badge variant="slate" size="sm" className="bg-slate-700/60 text-slate-300 border-slate-600">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Verified FAO &amp; ICAR Knowledge
          </Badge>
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Multilingual AI Assistant
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 mt-1 font-medium max-w-2xl">
            Ask farming questions in your preferred Indian language using voice or text, and listen to spoken answers.
          </p>
        </div>
      </div>

      {/* Language Selector Card */}
      <Card className="shadow-xs border-emerald-100/80 bg-white">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-emerald-600" />
              <span>Select Your Language / भाषा निवडा:</span>
            </label>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {activeLangDetails.native_name} ({activeLangDetails.name})
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {languages.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang.code);
                    stopAllAudio();
                  }}
                  disabled={loading || isRecording}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20 scale-[1.03] font-bold'
                      : 'bg-slate-50/70 text-slate-700 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/50'
                  } disabled:opacity-50`}
                >
                  <span className="font-bold text-sm sm:text-base tracking-wide">{lang.native_name}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {lang.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <AlertBanner
          type="error"
          title="Notice"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Question Composer Section */}
      <Card className="shadow-xs border-slate-200/80">
        <div className="space-y-5">
          {/* Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'text'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                Type Question ({activeLangDetails.native_name})
              </button>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'voice'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Speak Question (व्हॉइस इनपुट)
              </button>
            </div>
            
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline-block">
              Language: <strong className="text-emerald-700">{activeLangDetails.name}</strong>
            </span>
          </div>

          {/* Mode A: Voice Microphone Recorder */}
          {inputMode === 'voice' && (
            <div className="p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100 text-center space-y-4">
              {!isRecording && !isTranscribing && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={loading}
                    className="w-20 h-20 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 transition-all cursor-pointer group"
                    title="Click to start speaking"
                  >
                    <Mic className="w-9 h-9 group-hover:scale-110 transition-transform" />
                  </button>
                  <p className="text-sm font-semibold text-slate-800">
                    Click the microphone and speak in {activeLangDetails.native_name} ({activeLangDetails.name})
                  </p>
                  <p className="text-xs text-slate-500">
                    Your speech is recognized accurately using Groq Whisper AI.
                  </p>
                </div>
              )}

              {/* Active Recording State */}
              {isRecording && (
                <div className="space-y-4 py-2">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="relative w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                      title="Click to stop recording"
                    >
                      <MicOff className="w-8 h-8" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-rose-600 flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                      Listening in {activeLangDetails.native_name}... ({recordingSeconds}s)
                    </p>
                    <p className="text-xs text-slate-500">Click the red button when you are done speaking.</p>
                  </div>
                </div>
              )}

              {/* Transcribing Audio State */}
              {isTranscribing && (
                <div className="py-6 space-y-3">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-800">
                    Transcribing your voice in {activeLangDetails.name}...
                  </p>
                </div>
              )}

              {/* Voice Confirmation Banner */}
              {voiceTranscriptConfirmed && question && !isRecording && !isTranscribing && (
                <div className="p-4 bg-white border border-emerald-200 rounded-2xl text-left space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recognized Voice Question:
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">Edit text below if needed</span>
                  </div>
                  <textarea
                    rows={2}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full text-sm sm:text-base rounded-xl border border-slate-300 p-3 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startRecording}
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Re-record
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmit()}
                      loading={loading}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Get Farming Advice
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode B: Text Typing Input */}
          {inputMode === 'text' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Type your agricultural question in ${activeLangDetails.native_name} (${activeLangDetails.name}) or English...`}
                  className="w-full text-sm sm:text-base rounded-2xl border border-slate-300 p-4 pr-14 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all resize-none placeholder-slate-400"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading || !question.trim()}
                  className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs shadow-emerald-700/20"
                  title="Get Farming Advice"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Press <strong>Ctrl + Enter</strong> to submit</span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSubmit()}
                  disabled={loading || !question.trim()}
                  loading={loading}
                  icon={<Send className="w-4 h-4" />}
                >
                  Get Farming Advice ({activeLangDetails.native_name})
                </Button>
              </div>
            </div>
          )}

          {/* Sample Prompts */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Suggested Agricultural Inquiries ({activeLangDetails.native_name}):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeLangDetails.sample_questions.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuestion(prompt);
                    handleSubmit(prompt);
                  }}
                  disabled={loading || isRecording}
                  className="text-xs text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-slate-200/80 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Loading Progress State */}
      {loading && (
        <Card className="py-12 text-center space-y-4 border-emerald-100 bg-white">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-40" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300">
              <Globe2 className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-bold text-slate-800 transition-all duration-300">
              {loadingStage}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Scanning official FAO/ICAR agricultural documents and translating with high agronomic fidelity...
            </p>
          </div>
          <div className="w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto">
            <div className="h-full w-full bg-emerald-500 rounded-full origin-left animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </Card>
      )}

      {/* Answer Presentation Section */}
      {!loading && currentResponse && (
        <Card
          title={`Agricultural Guidance (${currentResponse.language_name})`}
          icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
          action={
            <Badge variant="emerald" size="md">
              {currentResponse.source_type === 'pdf' ? 'FAO/ICAR Verified Knowledge' : 'General Guidance'}
            </Badge>
          }
        >
          <div className="space-y-6">
            {/* Question Callout */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Your Question ({currentResponse.language_name}):
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    "{currentResponse.question}"
                  </p>
                  {currentResponse.english_question && showEnglishOriginal && (
                    <p className="text-xs text-slate-500 mt-1.5 italic border-t border-emerald-200/50 pt-1">
                      English translation: "{currentResponse.english_question}"
                    </p>
                  )}
                </div>
              </div>

              {currentResponse.english_question && (
                <button
                  type="button"
                  onClick={() => setShowEnglishOriginal(!showEnglishOriginal)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
                >
                  {showEnglishOriginal ? 'Hide English' : 'View English'}
                </button>
              )}
            </div>

            {/* Audio Playback Controls & Quick Actions */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Listen / Pause / Resume Button */}
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
                      : `Listen in ${currentResponse.language_name}`}
                  </Button>

                  {/* Stop Audio Button */}
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

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAnswer}
                    icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? 'Copied!' : 'Copy Answer'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReset}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Ask Another Question
                  </Button>
                </div>
              </div>

              {/* Audio Playback Error banner with Retry option */}
              {audioError && (
                <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
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

              {/* Active Audio Playback Equalizer Indicator */}
              {audioState === 'playing' && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-3 bg-emerald-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-4 bg-emerald-600 rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-2 bg-emerald-600 rounded-full animate-bounce delay-150" />
                  </span>
                  <span>
                    Speaking answer in <strong>{currentResponse.language_name}</strong> ({audioSource === 'server' ? 'High Fidelity MP3' : 'Native Voice'})
                  </span>
                </div>
              )}
            </div>

            {/* Formatted Answer Body with KaTeX Math Formula & Responsive Tables */}
            <div className="text-slate-800 leading-relaxed bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
              >
                {preprocessMarkdown(currentResponse.answer)}
              </ReactMarkdown>
            </div>

            {/* Document Citations and Ground Truth References */}
            {currentResponse.sources && currentResponse.sources.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Document References (प्रमाणित संदर्भ)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentResponse.sources.map((src, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate max-w-[220px]" title={src.source}>
                          {src.source}
                        </span>
                        {src.score !== undefined && (
                          <Badge variant="emerald" size="sm">
                            {(src.score * 100).toFixed(1)}% match
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Page Reference: <strong>{src.page}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Initial Clean Empty State */}
      {!loading && !currentResponse && (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Headphones className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Ask in Your Native Language (तुमच्या मातृभाषेत विचारा)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Select your language above, then speak or type your question. Our AI assistant will retrieve verified agricultural guidelines and answer in your language with audio playback.
          </p>
        </div>
      )}
    </div>
  );
};
