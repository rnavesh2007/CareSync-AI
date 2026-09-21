export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  patientId?: string;
  doctorId?: string;
}

export const REPORT_TYPES = [
  'CBC',
  'Blood Test',
  'Blood Sugar',
  'HbA1c',
  'Lipid Profile',
  'Liver Function',
  'Kidney Function',
  'Urine Test',
  'X-Ray',
  'CT',
  'MRI',
  'Ultrasound',
  'ECG',
  'Prescription',
  'Discharge Summary',
  'Vaccination',
  'Radiology',
  'Pathology',
  'Doctor Consultation',
  'Other',
] as const;

export type ReportType = typeof REPORT_TYPES[number];

export interface Vital {
  id: string;
  patientId: string;
  recordedAt: string;
  heartRate: number;
  systolicBp: number;
  diastolicBp: number;
  temperature: number;
  spO2: number;
  respiratoryRate?: number;
  recordedBy?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type: 'IN_PERSON' | 'VIDEO_CONSULT' | 'FOLLOW_UP';
  reason?: string;
  doctor?: {
    id: string;
    specialization: string;
    department: string;
    roomNumber?: string;
    user: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  };
  patient?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  };
}

export interface QueueEntry {
  id: string;
  patientId: string;
  doctorId?: string;
  department: string;
  tokenNumber: string;
  estimatedWaitTime: number;
  status: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'NO_SHOW' | 'SKIPPED' | 'CANCELLED';
  priority: 'NORMAL' | 'HIGH_PRIORITY' | 'URGENT' | 'EMERGENCY';
  createdAt: string;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  doctor?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface ReportImportantValue {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'ABNORMAL_HIGH' | 'ABNORMAL_LOW';
}

export interface ReportExtractedData {
  reportType: string;
  date: string;
  importantValues: ReportImportantValue[];
  abnormalValues: { parameter: string; value: string; note: string }[];
  normalValues: string[];
  explanation: string;
  questionsForDoctor: string[];
  disclaimer: string;
  extractedText?: string;
}

export interface Report {
  id: string;
  patientId: string;
  doctorId?: string;
  reportType: ReportType;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadDate: string;
  createdBy: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'VERIFIED';
  aiSummary?: string;
  extractedText?: string;
  extractedData?: string; // JSON parsed as ReportExtractedData
  visibility: string;
  sharedWithDoctor: boolean;
  sharedWithPatient: boolean;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  doctor?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface WellnessEntry {
  id: string;
  patientId: string;
  date: string;
  moodScore: number;
  sleepHours: number;
  stressLevel: 'LOW' | 'MODERATE' | 'HIGH';
  waterIntakeLiters: number;
  activityMinutes: number;
  notes?: string;
}

export interface ElderlyMonitoring {
  id: string;
  patientId: string;
  fallDetected: boolean;
  mobilityScore: number;
  medicationTaken: boolean;
  lastCheckIn: string;
  caregiverAlertSent: boolean;
  notes?: string;
}

export interface AlertItem {
  id: string;
  patientId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface PatientTimelineItem {
  id: string;
  patientId: string;
  eventDate: string;
  eventType: string;
  title: string;
  description: string;
  icon?: string;
}

export interface Transfer {
  id: string;
  patientId: string;
  senderRole: string;
  senderId?: string;
  senderName: string;
  receiverRole: string;
  receiverId?: string;
  receiverName: string;
  reason: string;
  sharedItems: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVIEWED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface AIPatientReport {
  id: string;
  patientId: string;
  doctorId?: string;
  status: 'DRAFT' | 'AWAITING_REVIEW' | 'FINALIZED';
  reportTitle: string;
  patientInfo?: string;
  chiefComplaint?: string;
  symptoms?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  familyHistory?: string;
  lifestyle?: string;
  vitals?: string;
  uploadedReports?: string;
  aiSummaries?: string;
  riskScreening?: string;
  mentalWellness?: string;
  elderlyCare?: string;
  timeline?: string;
  aiOverallSummary?: string;
  questionsForDoctor?: string;
  doctorNotes?: string;
  finalClinicalReview?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  finalizedBy?: string;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  doctor?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: 'UPLOAD' | 'VIEW' | 'DOWNLOAD' | 'SHARE' | 'TRANSFER' | 'MODIFY' | 'REVIEW' | 'FINALIZE';
  entityType: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}
