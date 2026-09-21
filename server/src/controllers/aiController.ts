import { Request, Response } from 'express';
import {
  sendMessage,
  saveConversation,
  getConversations,
  generateIntakeSummary,
  getAssessmentQuestions,
} from '../services/aiService.js';

/**
 * POST /api/ai/chat
 * Main chat endpoint — sends a message and gets an AI response
 */
export async function aiChat(req: Request, res: Response) {
  try {
    const { message, conversationHistory = [], language = 'en' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userId = (req as any).user?.id;
    const response = await sendMessage(message.trim(), conversationHistory, language, userId);
    return res.json(response);
  } catch (err) {
    console.error('AI Chat error:', err);
    return res.status(500).json({ error: 'Failed to process AI request' });
  }
}

/**
 * POST /api/ai/save-conversation
 * Save a conversation to the database
 */
export async function aiSaveConversation(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { title, messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const convoId = await saveConversation(userId, title, messages);
    return res.json({ success: true, conversationId: convoId });
  } catch (err) {
    console.error('Save conversation error:', err);
    return res.status(500).json({ error: 'Failed to save conversation' });
  }
}

/**
 * GET /api/ai/conversations
 * Get conversation history for the logged-in user
 */
export async function aiGetConversations(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const conversations = await getConversations(userId);
    return res.json(conversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

/**
 * POST /api/ai/assessment/submit
 * Submit health assessment answers and generate intake summary
 */
export async function aiSubmitAssessment(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers object is required' });
    }

    const result = await generateIntakeSummary(answers, undefined, userId);
    return res.json(result);
  } catch (err) {
    console.error('Assessment submit error:', err);
    return res.status(500).json({ error: 'Failed to submit assessment' });
  }
}

/**
 * GET /api/ai/assessment/questions
 * Get health assessment questions in specified language
 */
export async function aiGetAssessmentQuestions(req: Request, res: Response) {
  try {
    const language = (req.query.language as string) || 'en';
    const questions = getAssessmentQuestions(language);
    return res.json(questions);
  } catch (err) {
    console.error('Get assessment questions error:', err);
    return res.status(500).json({ error: 'Failed to get questions' });
  }
}
