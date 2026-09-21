import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Save,
  Plus,
  Globe,
  Stethoscope,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ClipboardList,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Play,
  Square,
  History,
  X,
  Info,
} from 'lucide-react';
import {
  sendMessage as sendAIMessage,
  saveConversation,
  getConversations,
  submitAssessment,
  getAssessmentQuestions,
  generateMessageId,
  SUPPORTED_LANGUAGES,
  type ChatMessage,
  type AIResponse,
  type AssessmentQuestion,
} from '../../services/aiService';

// ---- Types ----
type Mode = 'chat' | 'assessment';
type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

// ---- Suggested questions for quick access ----
const SUGGESTED_QUESTIONS = [
  { text: 'What is blood pressure?', icon: '🩺' },
  { text: 'What does a CBC report show?', icon: '🔬' },
  { text: 'I have fever and cough', icon: '🤒' },
  { text: 'What does SpO2 mean?', icon: '💓' },
  { text: 'How should I prepare for a blood test?', icon: '🩸' },
  { text: 'What should I ask my doctor about my test results?', icon: '👨‍⚕️' },
];

export default function AIHealthAssistantPage() {
  // ---- State ----
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('chat');
  const [language, setLanguage] = useState('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Assessment state
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [intakeSummary, setIntakeSummary] = useState<string | null>(null);

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechRate, setSpeechRate] = useState<number>(1.2);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const langSelectorRef = useRef<HTMLDivElement>(null);

  // ---- Init ----
  useEffect(() => {
    // Check speech recognition and synthesis support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    synthRef.current = synth;

    const hasRecognition = !!SpeechRecognition;
    const hasSynthesis = !!synth;
    setIsSpeechSupported(hasRecognition || hasSynthesis);

    // Populate available speech synthesis voices
    if (synth) {
      const updateVoices = () => {
        const voices = synth.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      };
      updateVoices();
      synth.onvoiceschanged = updateVoices;
    }

    // Send initial greeting
    const greetingMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: "Hello! I'm your **CareSync AI Health Assistant**. I can help you understand medical terms, lab results, symptoms, and general health information.\n\nHow can I assist you today? Try asking a question or start a **Health Assessment**.",
      timestamp: new Date(),
      language: 'en',
    };
    setMessages([greetingMsg]);
    setSuggestedFollowUps([
      'What is blood pressure?',
      'What does a CBC report show?',
      'How do I prepare for a blood test?',
    ]);
  }, []);

  // ---- Scroll to bottom ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ---- Click outside to close language selector ----
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langSelectorRef.current && !langSelectorRef.current.contains(e.target as Node)) {
        setShowLanguageSelector(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- Send message ----
  const handleSend = useCallback(async (messageText?: string) => {
    const text = (messageText || inputValue).trim();
    if (!text || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setSuggestedFollowUps([]);

    try {
      const response: AIResponse = await sendAIMessage(text, [...messages, userMsg], language);

      const assistantMsgId = generateMessageId();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        language: response.language || language,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setSuggestedFollowUps(response.suggestedFollowUps || []);

      // Auto-speak response if enabled
      if (autoSpeak && !isMuted && synthRef.current) {
        setTimeout(() => {
          speakText(response.content, response.language || language, assistantMsgId);
        }, 150);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        language,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isLoading, messages, language, autoSpeak, isMuted]);

  // ---- Key handler ----
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (mode === 'assessment') {
        handleAssessmentAnswer();
      } else {
        handleSend();
      }
    }
  };

  // ---- Assessment mode ----
  const startAssessment = async () => {
    setMode('assessment');
    setCurrentQuestionIndex(0);
    setAssessmentAnswers({});
    setAssessmentComplete(false);
    setIntakeSummary(null);

    try {
      const questions = await getAssessmentQuestions(language);
      setAssessmentQuestions(questions);

      const systemMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: `🏥 **Health Assessment Started**\n\nI'll ask you a series of questions to create your patient intake summary. Please answer each question as accurately as possible.\n\n**Question 1 of ${questions.length}:**\n${questions[0]?.question || ''}`,
        timestamp: new Date(),
        language,
      };
      setMessages((prev) => [...prev, systemMsg]);
      setSuggestedFollowUps([]);
    } catch (err) {
      console.error('Failed to load assessment questions:', err);
    }
  };

  const handleAssessmentAnswer = async (answerText?: string) => {
    const text = (answerText || inputValue).trim();
    if (!text || isLoading) return;

    const currentQ = assessmentQuestions[currentQuestionIndex];
    if (!currentQ) return;

    // Save answer
    const newAnswers = { ...assessmentAnswers, [currentQ.key]: text };
    setAssessmentAnswers(newAnswers);

    // Add user message
    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      language,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < assessmentQuestions.length) {
      // Next question
      setCurrentQuestionIndex(nextIndex);
      const nextQ = assessmentQuestions[nextIndex];
      const responseMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: `✅ Recorded.\n\n**Question ${nextIndex + 1} of ${assessmentQuestions.length}:**\n${nextQ.question}`,
        timestamp: new Date(),
        language,
      };
      setMessages((prev) => [...prev, responseMsg]);
    } else {
      // Assessment complete — generate summary
      setIsLoading(true);
      try {
        const result = await submitAssessment(newAnswers);
        setAssessmentComplete(true);
        setIntakeSummary(result.summary);
        setMode('chat');

        const summaryMsg: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: `✅ **Health Assessment Complete!**\n\nYour intake summary has been generated${result.savedToDb ? ' and saved to your medical records' : ''}.\n\n---\n\n${result.summary}\n\n---\n\nYou can now continue chatting or start a new conversation.`,
          timestamp: new Date(),
          language,
        };
        setMessages((prev) => [...prev, summaryMsg]);
        setSuggestedFollowUps(['What should I ask my doctor?', 'Start a new conversation']);
      } catch (err) {
        console.error('Failed to submit assessment:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ---- Voice: Voice selection and Speech Synthesis ----
  const getIndianOrLanguageVoice = (speechCode: string): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices() || availableVoices;
    if (!voices || voices.length === 0) return null;

    const targetCode = speechCode.toLowerCase();
    const langPrefix = speechCode.split('-')[0].toLowerCase();

    // 1. Exact match (e.g. ta-in, hi-in, en-in)
    const exact = voices.find(
      (v) => v.lang.toLowerCase() === targetCode || v.lang.toLowerCase().replace('_', '-') === targetCode
    );
    if (exact) return exact;

    // 2. Indian English voice preference
    if (targetCode.startsWith('en')) {
      const indianEn = voices.find(
        (v) =>
          (v.lang.toLowerCase().includes('in') || v.lang.toLowerCase().includes('en')) &&
          (v.name.includes('India') ||
            v.name.includes('Indian') ||
            v.name.includes('Veena') ||
            v.name.includes('Rishi') ||
            v.name.includes('Neerja'))
      );
      if (indianEn) return indianEn;
    }

    // 3. Language prefix match
    const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;

    // 4. Default fallback to standard English voice
    return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
  };

  // ---- Voice: Speech Recognition (STT) ----
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceState('idle');
      return;
    }

    stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      const langDef = SUPPORTED_LANGUAGES.find((l) => l.code === language);
      recognition.lang = langDef?.speechCode || 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setVoiceState('listening');
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          setVoiceState('processing');
          setInputValue(transcript);
          // Automatically process through AI and speak response
          setTimeout(() => {
            if (mode === 'assessment') {
              handleAssessmentAnswer(transcript);
            } else {
              handleSend(transcript);
            }
          }, 300);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e?.error);
        setVoiceState('idle');
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setVoiceState('idle');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
  };

  // ---- Voice: Speech Synthesis (TTS) ----
  const speakText = (text: string, targetLangCode = language, messageId?: string) => {
    if (!synthRef.current || isMuted) return;

    // Strip markdown, asterisks, headers, bullets, and emojis for clean natural speech
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\|.*\|/g, '')
      .replace(/---/g, '')
      .replace(/[•►→⚠️✅🩺🔬🤒💓🩸👨‍⚕️🔇🔊🎤⏹]/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();

    if (!clean) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(clean.substring(0, 800));
    const langDef = SUPPORTED_LANGUAGES.find((l) => l.code === targetLangCode);
    const targetSpeechCode = langDef?.speechCode || 'en-IN';
    utterance.lang = targetSpeechCode;
    utterance.rate = speechRate || 1.2;
    utterance.pitch = 1.0;

    const voice = getIndianOrLanguageVoice(targetSpeechCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setVoiceState('speaking');
      if (messageId) setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setVoiceState('idle');
      setSpeakingMessageId(null);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      setVoiceState('idle');
      setSpeakingMessageId(null);
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setVoiceState('idle');
    setSpeakingMessageId(null);
  };

  // ---- Conversation management ----
  const clearConversation = () => {
    setMessages([]);
    setSuggestedFollowUps([]);
    setMode('chat');
    setAssessmentComplete(false);
    setIntakeSummary(null);
    setCurrentQuestionIndex(0);
    setAssessmentAnswers({});
    setSaveStatus('idle');

    // Re-add greeting
    const greeting: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: "Hello! I'm your **CareSync AI Health Assistant**. How can I help you today?",
      timestamp: new Date(),
      language,
    };
    setMessages([greeting]);
    setSuggestedFollowUps([
      'What is blood pressure?',
      'What does a CBC report show?',
      'How do I prepare for a blood test?',
    ]);
  };

  const handleSaveConversation = async () => {
    if (messages.length < 2) return;
    setSaveStatus('saving');
    try {
      const firstUserMsg = messages.find((m) => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.content.substring(0, 60) : 'AI Chat';
      await saveConversation(title, messages);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveStatus('idle');
    }
  };

  const loadConversationHistory = async () => {
    try {
      const convos = await getConversations();
      setSavedConversations(convos);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadConversation = (convo: any) => {
    const msgs: ChatMessage[] = convo.messages.map((m: any) => ({
      id: m.id,
      role: m.sender === 'USER' ? 'user' : m.sender === 'ASSISTANT' ? 'assistant' : 'system',
      content: m.content,
      timestamp: new Date(m.timestamp),
    }));
    setMessages(msgs);
    setShowHistory(false);
    setMode('chat');
  };

  // ---- Render markdown-like content ----
  const renderContent = (content: string) => {
    // Convert markdown to HTML-like elements
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Headers
      if (processed.startsWith('# ')) {
        return <h3 key={i} className="text-lg font-bold text-brand-800 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: processed.substring(2) }} />;
      }
      if (processed.startsWith('## ')) {
        return <h4 key={i} className="text-base font-semibold text-brand-700 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: processed.substring(3) }} />;
      }
      // Table rows
      if (processed.startsWith('|')) {
        const cells = processed.split('|').filter((c) => c.trim());
        if (cells.every((c) => /^[-\s]+$/.test(c))) return null; // separator row
        const isHeader = i > 0 && lines[i + 1]?.startsWith('|---');
        return (
          <div key={i} className={`grid gap-1 text-xs px-1 py-0.5 ${isHeader ? 'font-semibold bg-brand-50 rounded' : ''}`}
            style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
            {cells.map((cell, j) => (
              <span key={j} dangerouslySetInnerHTML={{ __html: cell.trim() }} />
            ))}
          </div>
        );
      }
      // Horizontal rule
      if (processed.trim() === '---') {
        return <hr key={i} className="my-2 border-gray-200" />;
      }
      // Bullet points
      if (processed.startsWith('• ') || processed.startsWith('- ')) {
        return <li key={i} className="ml-4 text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: processed.substring(2) }} />;
      }
      // Numbered list
      const numMatch = processed.match(/^(\d+)\.\s(.*)$/);
      if (numMatch) {
        return <li key={i} className="ml-4 text-sm text-gray-700 leading-relaxed list-decimal" dangerouslySetInnerHTML={{ __html: numMatch[2] }} />;
      }
      // Empty line
      if (processed.trim() === '') return <div key={i} className="h-1" />;
      // Regular text
      return <p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
      {/* ---- Top Bar ---- */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-b border-brand-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">AI Health Assistant</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
              {mode === 'assessment' && (
                <span className="text-brand-600 font-medium">
                  · Assessment Mode ({currentQuestionIndex + 1}/{assessmentQuestions.length})
                </span>
              )}
              {voiceState !== 'idle' && (
                <span className={`font-medium ${voiceState === 'listening' ? 'text-red-500' : voiceState === 'processing' ? 'text-amber-500' : 'text-blue-500'}`}>
                  · {voiceState === 'listening' ? '🎤 Listening...' : voiceState === 'processing' ? '⏳ Processing...' : '🔊 Speaking...'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative" ref={langSelectorRef}>
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg transition-colors border border-brand-200"
            >
              <Globe className="w-3.5 h-3.5" />
              {selectedLang.nativeLabel}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLanguageSelector && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setShowLanguageSelector(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-brand-50 flex items-center justify-between transition-colors ${language === lang.code ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'}`}
                  >
                    <span>{lang.nativeLabel}</span>
                    <span className="text-xs text-gray-400">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto Speak Option */}
          <button
            onClick={() => {
              const next = !autoSpeak;
              setAutoSpeak(next);
              if (!next && voiceState === 'speaking') {
                stopSpeaking();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              autoSpeak
                ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100 shadow-soft-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={autoSpeak ? 'Auto Speak is currently ON' : 'Auto Speak is currently OFF'}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-teal-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>🔊 Auto Speak: {autoSpeak ? 'ON' : 'OFF'}</span>
          </button>

          {/* Speaking Speed Option */}
          <button
            onClick={() => {
              const nextRate = speechRate === 1.2 ? 1.35 : speechRate === 1.35 ? 1.0 : 1.2;
              setSpeechRate(nextRate);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all shadow-2xs"
            title="Speaking speed (Fast: 1.2x, Faster: 1.35x, Normal: 1.0x)"
          >
            <span>⚡ Speed: {speechRate}x</span>
          </button>

          {/* Stop Voice button if speaking */}
          {voiceState === 'speaking' && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 shadow-soft-sm transition-all"
              title="Stop Voice"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-600" />
              <span>🔇 Stop Voice</span>
            </button>
          )}

          {/* History */}
          <button onClick={loadConversationHistory} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Conversation History">
            <History className="w-4 h-4" />
          </button>

          {/* Save */}
          <button
            onClick={handleSaveConversation}
            disabled={messages.length < 2 || saveStatus === 'saving'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
              saveStatus === 'saved'
                ? 'bg-green-100 text-green-700'
                : saveStatus === 'saving'
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Save Conversation"
          >
            {saveStatus === 'saved' ? <CheckCircle className="w-4 h-4" /> : saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">{saveStatus === 'saved' ? 'Saved!' : 'Save'}</span>
          </button>

          {/* New / Clear */}
          <button onClick={clearConversation} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="New Conversation">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* ---- History Drawer ---- */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowHistory(false)} />
          <div className="relative ml-auto w-96 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Conversation History</h2>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {savedConversations.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No saved conversations yet</p>
                </div>
              ) : (
                savedConversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => loadConversation(convo)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-brand-50 rounded-xl border border-gray-100 hover:border-brand-200 transition-all group"
                  >
                    <p className="font-medium text-sm text-gray-800 group-hover:text-brand-700 truncate">{convo.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(convo.updatedAt).toLocaleDateString()} · {convo.messages?.length || 0} messages
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- Messages Area ---- */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role !== 'user' && (
              <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-sm mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-100 rounded-bl-md'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              ) : (
                <div className="space-y-0.5">{renderContent(msg.content)}</div>
              )}
              <div className={`flex items-center gap-2 mt-2 ${msg.role === 'user' ? 'justify-end' : 'justify-between'}`}>
                <span className={`text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5">
                    {voiceState === 'speaking' && speakingMessageId === msg.id ? (
                      <button
                        onClick={stopSpeaking}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors shadow-2xs"
                        title="Stop Voice"
                      >
                        <VolumeX className="w-3 h-3 text-rose-600" />
                        <span>🔇 Stop Voice</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => speakText(msg.content, msg.language || language, msg.id)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-md transition-colors"
                        title="Speak Response"
                      >
                        <Volume2 className="w-3 h-3 text-slate-500" />
                        <span>🔊 Speak Response</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 shrink-0 rounded-lg bg-brand-100 flex items-center justify-center mt-0.5">
                <User className="w-4 h-4 text-brand-600" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ---- Suggested Questions / Follow-ups ---- */}
      {suggestedFollowUps.length > 0 && !isLoading && mode === 'chat' && (
        <div className="px-4 sm:px-6 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedFollowUps.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-full border border-brand-200 hover:border-brand-300 transition-all hover:shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Quick Start (only when few messages) ---- */}
      {messages.length <= 1 && mode === 'chat' && (
        <div className="px-4 sm:px-6 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.text)}
                className="flex items-center gap-2 px-3 py-2.5 text-left text-xs bg-white hover:bg-brand-50 border border-gray-200 hover:border-brand-300 rounded-xl transition-all hover:shadow-md group"
              >
                <span className="text-base">{q.icon}</span>
                <span className="text-gray-600 group-hover:text-brand-700 leading-tight">{q.text}</span>
              </button>
            ))}
          </div>
          <button
            onClick={startAssessment}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-sm font-medium"
          >
            <ClipboardList className="w-4 h-4" />
            Start Health Assessment
          </button>
        </div>
      )}

      {/* ---- Input Area ---- */}
      <div className="px-4 sm:px-6 pb-4 pt-2 bg-white/60 backdrop-blur-sm border-t border-gray-100 shrink-0">
        {/* Voice support fallback message */}
        {!isSpeechSupported && (
          <div className="flex items-center justify-between gap-2 py-2 px-3.5 mb-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Voice support is unavailable in this browser. Please use text mode.</span>
            </div>
          </div>
        )}

        {/* Listening banner */}
        {voiceState === 'listening' && (
          <div className="flex items-center justify-between gap-3 py-2.5 px-4 mb-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium animate-pulse shadow-soft-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <Mic className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>Listening in {selectedLang.nativeLabel} ({selectedLang.speechCode})... Speak your healthcare question</span>
            </div>
            <button
              onClick={stopListening}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>⏹ Stop Listening</span>
            </button>
          </div>
        )}

        {/* Speaking banner */}
        {voiceState === 'speaking' && (
          <div className="flex items-center justify-between gap-3 py-2.5 px-4 mb-2.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium animate-fadeIn shadow-soft-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
              </span>
              <Volume2 className="w-4 h-4 text-teal-600 animate-pulse" />
              <span className="font-semibold text-teal-950">CareSync AI is speaking...</span>
            </div>
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>🔇 Stop Voice</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Assessment mode toggle */}
          {mode === 'chat' && messages.length > 1 && (
            <button
              onClick={startAssessment}
              className="p-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl transition-colors shrink-0 border border-brand-200"
              title="Start Health Assessment"
            >
              <ClipboardList className="w-5 h-5" />
            </button>
          )}

          {/* Voice Input Buttons: Start Speaking / Stop Listening */}
          {isSpeechSupported && (
            voiceState === 'listening' ? (
              <button
                onClick={stopListening}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md text-xs font-semibold shrink-0 animate-pulse transition-all"
                title="Stop Listening"
              >
                <Square className="w-4 h-4 fill-white text-white" />
                <span className="hidden sm:inline">⏹ Stop Listening</span>
              </button>
            ) : (
              <button
                onClick={startListening}
                disabled={voiceState === 'processing'}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 shadow-soft-sm text-xs font-semibold shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                title="Start Speaking"
              >
                <Mic className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">🎤 Start Speaking</span>
              </button>
            )
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'assessment'
                  ? 'Type your answer...'
                  : 'Ask me about health, lab tests, symptoms...'
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => mode === 'assessment' ? handleAssessmentAnswer() : handleSend()}
            disabled={isLoading || !inputValue.trim()}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-r from-brand-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:from-brand-600 hover:to-teal-600'
                : 'bg-gray-100 text-gray-400'
            }`}
            title="Send"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-gray-400">
          <Info className="w-3 h-3" />
          CareSync AI provides general health information only. Always consult a healthcare professional for diagnosis and treatment.
        </div>
      </div>
    </div>
  );
}
