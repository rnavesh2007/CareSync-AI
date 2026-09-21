import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { AppLayout } from './layouts/AppLayout.js';
import { LoginPage } from './pages/auth/LoginPage.js';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard.js';
import AIHealthAssistantPage from './pages/patient/AIHealthAssistantPage.js';
import { MyHealthPage } from './pages/patient/MyHealthPage.js';
import { MyReportsPage } from './pages/patient/MyReportsPage.js';
import { MedicalHistoryPage } from './pages/patient/MedicalHistoryPage.js';
import { AppointmentsPage } from './pages/patient/AppointmentsPage.js';
import { HospitalQueuePage } from './pages/patient/HospitalQueuePage.js';
import { MentalWellnessPage } from './pages/patient/MentalWellnessPage.js';
import { ElderlyCarePage } from './pages/patient/ElderlyCarePage.js';
import { NotificationsPage } from './pages/patient/NotificationsPage.js';
import { ProfilePage } from './pages/patient/ProfilePage.js';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard.js';
import { PatientsPage } from './pages/doctor/PatientsPage.js';
import { PatientReportsPage } from './pages/doctor/PatientReportsPage.js';
import { AISummariesPage } from './pages/doctor/AISummariesPage.js';
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointmentsPage.js';
import { DoctorQueuePage } from './pages/doctor/DoctorQueuePage.js';
import { AlertsPage } from './pages/doctor/AlertsPage.js';
import { DoctorReportsPage } from './pages/doctor/DoctorReportsPage.js';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminPatientsPage } from './pages/admin/AdminPatientsPage.js';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage.js';
import { AdminQueuePage } from './pages/admin/AdminQueuePage.js';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.js';
import { SystemActivityPage } from './pages/admin/SystemActivityPage.js';
import { SettingsPage } from './pages/admin/SettingsPage.js';

// Default home redirection based on active role
const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Authenticated Application Layout */}
          <Route element={<AppLayout />}>
            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/assistant" element={<AIHealthAssistantPage />} />
            <Route path="/patient/my-health" element={<MyHealthPage />} />
            <Route path="/patient/reports" element={<MyReportsPage />} />
            <Route path="/patient/history" element={<MedicalHistoryPage />} />
            <Route path="/patient/appointments" element={<AppointmentsPage />} />
            <Route path="/patient/queue" element={<HospitalQueuePage />} />
            <Route path="/patient/wellness" element={<MentalWellnessPage />} />
            <Route path="/patient/elderly" element={<ElderlyCarePage />} />
            <Route path="/patient/notifications" element={<NotificationsPage />} />
            <Route path="/patient/profile" element={<ProfilePage />} />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<PatientsPage />} />
            <Route path="/doctor/patient-reports" element={<PatientReportsPage />} />
            <Route path="/doctor/ai-summaries" element={<AISummariesPage />} />
            <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
            <Route path="/doctor/queue" element={<DoctorQueuePage />} />
            <Route path="/doctor/alerts" element={<AlertsPage />} />
            <Route path="/doctor/reports" element={<DoctorReportsPage />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/patients" element={<AdminPatientsPage />} />
            <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
            <Route path="/admin/queue" element={<AdminQueuePage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/activity" element={<SystemActivityPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
