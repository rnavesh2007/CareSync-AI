import api from './api';

// ============================================================
// CareSync AI Client Service
// Frontend abstraction for the AI Health Assistant
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  language?: string;
}

export interface AIResponse {
  content: string;
  confidence: number;
  category: string;
  disclaimer: boolean;
  isEmergency: boolean;
  suggestedFollowUps?: string[];
  language?: string;
}

export interface AssessmentQuestion {
  key: string;
  question: string;
}

export interface IntakeSummary {
  summary: string;
  savedToDb: boolean;
}

/**
 * Send a message to the AI and get a response
 */
export async function sendMessage(
  message: string,
  conversationHistory: ChatMessage[] = [],
  language: string = 'en'
): Promise<AIResponse> {
  const { data } = await api.post('/ai/chat', {
    message,
    conversationHistory: conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      language: m.language,
    })),
    language,
  });
  return data;
}

/**
 * Save a conversation to the database
 */
export async function saveConversation(
  title: string,
  messages: ChatMessage[]
): Promise<{ success: boolean; conversationId: string }> {
  const { data } = await api.post('/ai/save-conversation', {
    title,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
  });
  return data;
}

/**
 * Get saved conversations
 */
export async function getConversations(): Promise<any[]> {
  const { data } = await api.get('/ai/conversations');
  return data;
}

/**
 * Submit health assessment answers
 */
export async function submitAssessment(
  answers: Record<string, string>
): Promise<IntakeSummary> {
  const { data } = await api.post('/ai/assessment/submit', { answers });
  return data;
}

/**
 * Get health assessment questions for a given language
 */
export async function getAssessmentQuestions(
  language: string = 'en'
): Promise<AssessmentQuestion[]> {
  const { data } = await api.get('/ai/assessment/questions', {
    params: { language },
  });
  return data;
}

/**
 * Analyze symptoms (wrapper around sendMessage)
 */
export async function analyzeSymptoms(
  symptoms: string,
  language: string = 'en'
): Promise<AIResponse> {
  return sendMessage(`I have the following symptoms: ${symptoms}`, [], language);
}

/**
 * Answer a medical question (wrapper around sendMessage)
 */
export async function answerMedicalQuestion(
  question: string,
  language: string = 'en'
): Promise<AIResponse> {
  return sendMessage(question, [], language);
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ---- Supported Languages ----
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', speechCode: 'en-IN' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', speechCode: 'bn-IN' },
];
