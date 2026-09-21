import { Router } from 'express';
import multer from 'multer';
import { login, getMe, demoSwitch } from '../controllers/authController.js';
import {
  getPatientDashboard,
  getMyHealth,
  getMedicalHistory,
  getMentalWellness,
  createMentalWellnessEntry,
  getElderlyCare,
  notifyCaregiver,
} from '../controllers/patientController.js';
import {
  getDoctorDashboard,
  getDoctorPatients,
  getDoctorAlerts,
} from '../controllers/doctorController.js';
import {
  getAdminDashboard,
  getAllPatients,
  getAllDoctors,
  getSystemActivity,
} from '../controllers/adminController.js';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  shareReport,
} from '../controllers/reportController.js';
import {
  getQueueList,
  updateQueueStatus,
  generateQueueToken,
  callNextToken,
  skipToken,
  completeToken,
  cancelToken,
  changePriority,
} from '../controllers/queueController.js';
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import {
  aiChat,
  aiSaveConversation,
  aiGetConversations,
  aiSubmitAssessment,
  aiGetAssessmentQuestions,
} from '../controllers/aiController.js';
import {
  getTransfers,
  createTransfer,
  updateTransferStatus,
} from '../controllers/transferController.js';
import {
  generateAIPatientReport,
  getAIPatientReports,
  reviewAIPatientReport,
  finalizeAIPatientReport,
  exportAIPatientReport,
} from '../controllers/aiPatientReportController.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';
import { getAuditLogs } from '../controllers/auditController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// --- Auth Routes ---
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);
router.post('/auth/demo-switch', demoSwitch);

// --- Patient Routes ---
router.get('/patient/dashboard', authMiddleware, getPatientDashboard);
router.get('/patient/my-health', authMiddleware, getMyHealth);
router.get('/patient/history', authMiddleware, getMedicalHistory);
router.get('/patient/wellness', authMiddleware, getMentalWellness);
router.post('/patient/wellness', authMiddleware, createMentalWellnessEntry);
router.get('/patient/elderly', authMiddleware, getElderlyCare);
router.post('/patient/elderly/notify-caregiver', authMiddleware, notifyCaregiver);

// --- Doctor Routes ---
router.get('/doctor/dashboard', authMiddleware, requireRole(['DOCTOR', 'ADMIN']), getDoctorDashboard);
router.get('/doctor/patients', authMiddleware, requireRole(['DOCTOR', 'ADMIN']), getDoctorPatients);
router.get('/doctor/alerts', authMiddleware, requireRole(['DOCTOR', 'ADMIN']), getDoctorAlerts);

// --- Admin Routes ---
router.get('/admin/dashboard', authMiddleware, requireRole(['ADMIN']), getAdminDashboard);
router.get('/admin/patients', authMiddleware, requireRole(['ADMIN']), getAllPatients);
router.get('/admin/doctors', authMiddleware, requireRole(['ADMIN']), getAllDoctors);
router.get('/admin/activity', authMiddleware, requireRole(['ADMIN']), getSystemActivity);

// --- AI Health Assistant Routes ---
router.post('/ai/chat', authMiddleware, aiChat);
router.post('/ai/save-conversation', authMiddleware, aiSaveConversation);
router.get('/ai/conversations', authMiddleware, aiGetConversations);
router.post('/ai/assessment/submit', authMiddleware, aiSubmitAssessment);
router.get('/ai/assessment/questions', authMiddleware, aiGetAssessmentQuestions);

// --- 19-Section Consolidated AI Patient Reports ---
router.post('/ai/patient-report/generate', authMiddleware, generateAIPatientReport);
router.get('/ai/patient-report/:patientId?', authMiddleware, getAIPatientReports);
router.patch('/ai/patient-report/:id/review', authMiddleware, requireRole(['DOCTOR', 'ADMIN']), reviewAIPatientReport);
router.patch('/ai/patient-report/:id/finalize', authMiddleware, requireRole(['DOCTOR', 'ADMIN']), finalizeAIPatientReport);
router.get('/ai/patient-report/:id/export/:format', authMiddleware, exportAIPatientReport);

// --- Reports ---
router.get('/reports', authMiddleware, getReports);
router.get('/reports/:id', authMiddleware, getReportById);
router.post('/reports', authMiddleware, upload.single('file'), createReport);
router.patch('/reports/:id', authMiddleware, updateReport);
router.delete('/reports/:id', authMiddleware, deleteReport);
router.post('/reports/:id/share', authMiddleware, shareReport);

// --- Transfers ---
router.get('/transfers', authMiddleware, getTransfers);
router.post('/transfers', authMiddleware, createTransfer);
router.patch('/transfers/:id/status', authMiddleware, updateTransferStatus);

// --- Notifications ---
router.get('/notifications', authMiddleware, getNotifications);
router.patch('/notifications/:id/read', authMiddleware, markNotificationAsRead);
router.post('/notifications/mark-all-read', authMiddleware, markAllNotificationsAsRead);

// --- Compliance Audit Logs ---
router.get('/audit-logs', authMiddleware, getAuditLogs);

// --- Appointments ---
router.get('/appointments', authMiddleware, getAppointments);
router.post('/appointments', authMiddleware, createAppointment);
router.patch('/appointments/:id/status', authMiddleware, updateAppointmentStatus);

// --- Smart Hospital Queue ---
router.get('/queue', authMiddleware, getQueueList);
router.patch('/queue/:id', authMiddleware, updateQueueStatus);
router.post('/queue/token', authMiddleware, generateQueueToken);
router.post('/queue/call-next', authMiddleware, callNextToken);
router.post('/queue/:id/skip', authMiddleware, skipToken);
router.post('/queue/:id/complete', authMiddleware, completeToken);
router.post('/queue/:id/cancel', authMiddleware, cancelToken);
router.patch('/queue/:id/priority', authMiddleware, changePriority);

export default router;
