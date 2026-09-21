import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../database/index.js';

export async function getDoctorDashboard(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const doctor = await prisma.doctor.findFirst({
      where: { userId },
      include: { user: true },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found.' });
    }

    // 1. Daily Appointments
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    // 2. Active Queue
    const queueEntries = await prisma.queueEntry.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: { include: { user: true, vitals: { take: 1, orderBy: { recordedAt: 'desc' } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 3. High Risk / Critical Alerts
    const alerts = await prisma.alert.findMany({
      where: { status: 'ACTIVE' },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Assigned Patients Count
    const assignedPatientsCount = await prisma.doctorPatientAssignment.count({
      where: { doctorId: doctor.id },
    });

    // 5. Pending Reports
    const pendingReportsCount = await prisma.report.count({
      where: {
        doctorId: doctor.id,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    return res.json({
      doctor: {
        id: doctor.id,
        name: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
        specialization: doctor.specialization,
        department: doctor.department,
        roomNumber: doctor.roomNumber,
        availability: doctor.availability,
      },
      metrics: {
        todayAppointmentsCount: appointments.length,
        inQueueCount: queueEntries.filter((q) => q.status === 'WAITING').length,
        criticalAlertsCount: alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length,
        assignedPatientsCount,
        pendingReportsCount,
      },
      appointments,
      queueEntries,
      alerts,
    });
  } catch (error) {
    console.error('getDoctorDashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch doctor dashboard.' });
  }
}

export async function getDoctorPatients(req: AuthRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    const assignments = await prisma.doctorPatientAssignment.findMany({
      where: doctorId ? { doctorId } : {},
      include: {
        patient: {
          include: {
            user: true,
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
            medicalHistories: { take: 2 },
            alerts: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    return res.json({
      patients: assignments.map((a) => ({
        ...a.patient,
        assignmentNotes: a.notes,
        assignedDate: a.assignedDate,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch doctor patients.' });
  }
}

export async function getDoctorAlerts(req: AuthRequest, res: Response) {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        patient: {
          include: {
            user: true,
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ alerts });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
}
