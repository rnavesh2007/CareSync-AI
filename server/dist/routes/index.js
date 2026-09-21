"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authController_js_1 = require("../controllers/authController.js");
const patientController_js_1 = require("../controllers/patientController.js");
const doctorController_js_1 = require("../controllers/doctorController.js");
const adminController_js_1 = require("../controllers/adminController.js");
const reportController_js_1 = require("../controllers/reportController.js");
const queueController_js_1 = require("../controllers/queueController.js");
const appointmentController_js_1 = require("../controllers/appointmentController.js");
const aiController_js_1 = require("../controllers/aiController.js");
const transferController_js_1 = require("../controllers/transferController.js");
const aiPatientReportController_js_1 = require("../controllers/aiPatientReportController.js");
const notificationController_js_1 = require("../controllers/notificationController.js");
const auditController_js_1 = require("../controllers/auditController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
// --- Auth Routes ---
router.post('/auth/login', authController_js_1.login);
router.get('/auth/me', auth_js_1.authMiddleware, authController_js_1.getMe);
router.post('/auth/demo-switch', authController_js_1.demoSwitch);
// --- Patient Routes ---
router.get('/patient/dashboard', auth_js_1.authMiddleware, patientController_js_1.getPatientDashboard);
router.get('/patient/my-health', auth_js_1.authMiddleware, patientController_js_1.getMyHealth);
router.get('/patient/history', auth_js_1.authMiddleware, patientController_js_1.getMedicalHistory);
router.get('/patient/wellness', auth_js_1.authMiddleware, patientController_js_1.getMentalWellness);
router.post('/patient/wellness', auth_js_1.authMiddleware, patientController_js_1.createMentalWellnessEntry);
router.get('/patient/elderly', auth_js_1.authMiddleware, patientController_js_1.getElderlyCare);
router.post('/patient/elderly/notify-caregiver', auth_js_1.authMiddleware, patientController_js_1.notifyCaregiver);
// --- Doctor Routes ---
router.get('/doctor/dashboard', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['DOCTOR', 'ADMIN']), doctorController_js_1.getDoctorDashboard);
router.get('/doctor/patients', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['DOCTOR', 'ADMIN']), doctorController_js_1.getDoctorPatients);
router.get('/doctor/alerts', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['DOCTOR', 'ADMIN']), doctorController_js_1.getDoctorAlerts);
// --- Admin Routes ---
router.get('/admin/dashboard', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['ADMIN']), adminController_js_1.getAdminDashboard);
router.get('/admin/patients', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['ADMIN']), adminController_js_1.getAllPatients);
router.get('/admin/doctors', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['ADMIN']), adminController_js_1.getAllDoctors);
router.get('/admin/activity', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['ADMIN']), adminController_js_1.getSystemActivity);
// --- AI Health Assistant Routes ---
router.post('/ai/chat', auth_js_1.authMiddleware, aiController_js_1.aiChat);
router.post('/ai/save-conversation', auth_js_1.authMiddleware, aiController_js_1.aiSaveConversation);
router.get('/ai/conversations', auth_js_1.authMiddleware, aiController_js_1.aiGetConversations);
router.post('/ai/assessment/submit', auth_js_1.authMiddleware, aiController_js_1.aiSubmitAssessment);
router.get('/ai/assessment/questions', auth_js_1.authMiddleware, aiController_js_1.aiGetAssessmentQuestions);
// --- 19-Section Consolidated AI Patient Reports ---
router.post('/ai/patient-report/generate', auth_js_1.authMiddleware, aiPatientReportController_js_1.generateAIPatientReport);
router.get('/ai/patient-report/:patientId?', auth_js_1.authMiddleware, aiPatientReportController_js_1.getAIPatientReports);
router.patch('/ai/patient-report/:id/review', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['DOCTOR', 'ADMIN']), aiPatientReportController_js_1.reviewAIPatientReport);
router.patch('/ai/patient-report/:id/finalize', auth_js_1.authMiddleware, (0, auth_js_1.requireRole)(['DOCTOR', 'ADMIN']), aiPatientReportController_js_1.finalizeAIPatientReport);
router.get('/ai/patient-report/:id/export/:format', auth_js_1.authMiddleware, aiPatientReportController_js_1.exportAIPatientReport);
// --- Reports ---
router.get('/reports', auth_js_1.authMiddleware, reportController_js_1.getReports);
router.get('/reports/:id', auth_js_1.authMiddleware, reportController_js_1.getReportById);
router.post('/reports', auth_js_1.authMiddleware, upload.single('file'), reportController_js_1.createReport);
router.patch('/reports/:id', auth_js_1.authMiddleware, reportController_js_1.updateReport);
router.delete('/reports/:id', auth_js_1.authMiddleware, reportController_js_1.deleteReport);
router.post('/reports/:id/share', auth_js_1.authMiddleware, reportController_js_1.shareReport);
// --- Transfers ---
router.get('/transfers', auth_js_1.authMiddleware, transferController_js_1.getTransfers);
router.post('/transfers', auth_js_1.authMiddleware, transferController_js_1.createTransfer);
router.patch('/transfers/:id/status', auth_js_1.authMiddleware, transferController_js_1.updateTransferStatus);
// --- Notifications ---
router.get('/notifications', auth_js_1.authMiddleware, notificationController_js_1.getNotifications);
router.patch('/notifications/:id/read', auth_js_1.authMiddleware, notificationController_js_1.markNotificationAsRead);
router.post('/notifications/mark-all-read', auth_js_1.authMiddleware, notificationController_js_1.markAllNotificationsAsRead);
// --- Compliance Audit Logs ---
router.get('/audit-logs', auth_js_1.authMiddleware, auditController_js_1.getAuditLogs);
// --- Appointments ---
router.get('/appointments', auth_js_1.authMiddleware, appointmentController_js_1.getAppointments);
router.post('/appointments', auth_js_1.authMiddleware, appointmentController_js_1.createAppointment);
router.patch('/appointments/:id/status', auth_js_1.authMiddleware, appointmentController_js_1.updateAppointmentStatus);
// --- Smart Hospital Queue ---
router.get('/queue', auth_js_1.authMiddleware, queueController_js_1.getQueueList);
router.patch('/queue/:id', auth_js_1.authMiddleware, queueController_js_1.updateQueueStatus);
router.post('/queue/token', auth_js_1.authMiddleware, queueController_js_1.generateQueueToken);
router.post('/queue/call-next', auth_js_1.authMiddleware, queueController_js_1.callNextToken);
router.post('/queue/:id/skip', auth_js_1.authMiddleware, queueController_js_1.skipToken);
router.post('/queue/:id/complete', auth_js_1.authMiddleware, queueController_js_1.completeToken);
router.post('/queue/:id/cancel', auth_js_1.authMiddleware, queueController_js_1.cancelToken);
router.patch('/queue/:id/priority', auth_js_1.authMiddleware, queueController_js_1.changePriority);
exports.default = router;
