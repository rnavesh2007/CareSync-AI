"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiChat = aiChat;
exports.aiSaveConversation = aiSaveConversation;
exports.aiGetConversations = aiGetConversations;
exports.aiSubmitAssessment = aiSubmitAssessment;
exports.aiGetAssessmentQuestions = aiGetAssessmentQuestions;
const aiService_js_1 = require("../services/aiService.js");
/**
 * POST /api/ai/chat
 * Main chat endpoint — sends a message and gets an AI response
 */
async function aiChat(req, res) {
    try {
        const { message, conversationHistory = [], language = 'en' } = req.body;
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const userId = req.user?.id;
        const response = await (0, aiService_js_1.sendMessage)(message.trim(), conversationHistory, language, userId);
        return res.json(response);
    }
    catch (err) {
        console.error('AI Chat error:', err);
        return res.status(500).json({ error: 'Failed to process AI request' });
    }
}
/**
 * POST /api/ai/save-conversation
 * Save a conversation to the database
 */
async function aiSaveConversation(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { title, messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }
        const convoId = await (0, aiService_js_1.saveConversation)(userId, title, messages);
        return res.json({ success: true, conversationId: convoId });
    }
    catch (err) {
        console.error('Save conversation error:', err);
        return res.status(500).json({ error: 'Failed to save conversation' });
    }
}
/**
 * GET /api/ai/conversations
 * Get conversation history for the logged-in user
 */
async function aiGetConversations(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const conversations = await (0, aiService_js_1.getConversations)(userId);
        return res.json(conversations);
    }
    catch (err) {
        console.error('Get conversations error:', err);
        return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
}
/**
 * POST /api/ai/assessment/submit
 * Submit health assessment answers and generate intake summary
 */
async function aiSubmitAssessment(req, res) {
    try {
        const userId = req.user?.id;
        const { answers } = req.body;
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Answers object is required' });
        }
        const result = await (0, aiService_js_1.generateIntakeSummary)(answers, undefined, userId);
        return res.json(result);
    }
    catch (err) {
        console.error('Assessment submit error:', err);
        return res.status(500).json({ error: 'Failed to submit assessment' });
    }
}
/**
 * GET /api/ai/assessment/questions
 * Get health assessment questions in specified language
 */
async function aiGetAssessmentQuestions(req, res) {
    try {
        const language = req.query.language || 'en';
        const questions = (0, aiService_js_1.getAssessmentQuestions)(language);
        return res.json(questions);
    }
    catch (err) {
        console.error('Get assessment questions error:', err);
        return res.status(500).json({ error: 'Failed to get questions' });
    }
}
