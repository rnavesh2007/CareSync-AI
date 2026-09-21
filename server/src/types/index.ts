import { Request } from 'express';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export const REPORT_TYPES = [
  'Blood Test',
  'Urine Test',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'ECG',
  'Prescription',
  'Discharge Summary',
  'Medical Certificate',
  'Vaccination Record',
  'Lab Report',
  'Radiology Report',
  'Doctor Consultation',
  'Other',
] as const;

export type ReportType = typeof REPORT_TYPES[number];

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  patientId?: string;
  doctorId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}
