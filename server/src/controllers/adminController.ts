import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../database/index.js';

export async function getAdminDashboard(req: AuthRequest, res: Response) {
  try {
    const totalPatients = await prisma.patient.count();
    const totalDoctors = await prisma.doctor.count();
    const totalAppointments = await prisma.appointment.count();
    const totalReports = await prisma.report.count();
    const activeQueueCount = await prisma.queueEntry.count({
      where: { status: { in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] } },
    });

    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const departments = [
      { name: 'Cardiology', activeDoctors: 4, waitingPatients: 6, status: 'Optimal' },
      { name: 'Neurology', activeDoctors: 3, waitingPatients: 4, status: 'Optimal' },
      { name: 'Orthopedics', activeDoctors: 5, waitingPatients: 9, status: 'Busy' },
      { name: 'Pediatrics', activeDoctors: 4, waitingPatients: 3, status: 'Optimal' },
      { name: 'Emergency Triage', activeDoctors: 8, waitingPatients: 2, status: 'Standby' },
    ];

    const systemHealth = {
      apiUptime: '99.98%',
      databaseStatus: 'Healthy (SQLite Encrypted Demo)',
      storageUsed: '1.24 GB / 50 GB',
      activeConnections: 42,
    };

    return res.json({
      metrics: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalReports,
        activeQueueCount,
      },
      departments,
      recentAppointments,
      systemHealth,
    });
  } catch (error) {
    console.error('getAdminDashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin dashboard.' });
  }
}

export async function getAllPatients(req: AuthRequest, res: Response) {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: true,
        vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
        appointments: { orderBy: { appointmentDate: 'desc' }, take: 1 },
      },
    });

    return res.json({ patients });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch patients.' });
  }
}

export async function getAllDoctors(req: AuthRequest, res: Response) {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: true,
        _count: {
          select: {
            assignedPatients: true,
            appointments: true,
          },
        },
      },
    });

    return res.json({ doctors });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch doctors.' });
  }
}

export async function getSystemActivity(req: AuthRequest, res: Response) {
  try {
    const activities = [
      {
        id: 'act-1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        eventType: 'USER_LOGIN',
        description: 'Doctor Dr. Marcus Vance logged in from workstation WS-04',
        severity: 'INFO',
        ipAddress: '192.168.1.104',
      },
      {
        id: 'act-2',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        eventType: 'REPORT_UPLOAD',
        description: 'New Blood Test report uploaded for patient Sarah Jenkins',
        severity: 'INFO',
        ipAddress: '192.168.1.52',
      },
      {
        id: 'act-3',
        timestamp: new Date(Date.now() - 42 * 60 * 1000),
        eventType: 'QUEUE_UPDATE',
        description: 'Queue Token B-12 called into Suite 302',
        severity: 'INFO',
        ipAddress: '192.168.1.104',
      },
      {
        id: 'act-4',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        eventType: 'VITAL_ALERT',
        description: 'Moderate BP elevation flagged for patient Robert Chen',
        severity: 'WARNING',
        ipAddress: 'SYSTEM_DAEMON',
      },
      {
        id: 'act-5',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        eventType: 'BACKUP_SYNC',
        description: 'Encrypted database snapshot successfully verified',
        severity: 'SUCCESS',
        ipAddress: '127.0.0.1',
      },
    ];

    return res.json({ activities });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch system activity logs.' });
  }
}
