import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../database/index.js';

export async function getQueueList(req: AuthRequest, res: Response) {
  try {
    const { department = 'General Medicine' } = req.query;
    const where: any = {};
    if (department && typeof department === 'string' && department !== 'ALL') {
      where.department = department;
    }

    const queueEntries = await prisma.queueEntry.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
      orderBy: [
        { priority: 'desc' }, // Emergency first, then High Priority, then Normal
        { createdAt: 'asc' },
      ],
    });

    // Identify current in-consultation token
    const inConsultation = queueEntries.find((q) => q.status === 'IN_CONSULTATION');
    const currentToken = inConsultation ? inConsultation.tokenNumber : 'A121';

    // Find patient's token if logged in as patient
    let patientEntry = null;
    let patientPosition = 0;
    if (req.user?.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({ where: { userId: req.user.id } });
      if (patient) {
        patientEntry = queueEntries.find((q) => q.patientId === patient.id && q.status === 'WAITING');
        if (patientEntry) {
          const waitingList = queueEntries.filter((q) => q.status === 'WAITING');
          patientPosition = waitingList.findIndex((q) => q.id === patientEntry!.id) + 1;
        }
      }
    }

    return res.json({
      queueEntries,
      currentToken,
      patientEntry,
      patientPosition: patientPosition || 6,
      estimatedWaitTime: patientPosition ? patientPosition * 3 : 18,
      hospital: 'CareSync Multispeciality Hospital, Chennai',
      department: department || 'General Medicine',
    });
  } catch (error) {
    console.error('getQueueList error:', error);
    return res.status(500).json({ error: 'Failed to fetch queue entries.' });
  }
}

export async function updateQueueStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, priority, estimatedWaitTime } = req.body;

    const entry = await prisma.queueEntry.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(estimatedWaitTime !== undefined && { estimatedWaitTime }),
      },
      include: {
        patient: { include: { user: true } },
      },
    });

    // Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'MODIFY',
          entityType: 'QUEUE',
          entityId: entry.id,
          details: `Updated queue token ${entry.tokenNumber} to status: ${status || 'unchanged'}, priority: ${priority || 'unchanged'}.`,
        },
      });
    }

    return res.json({ entry, message: 'Queue entry updated successfully.' });
  } catch (error) {
    console.error('updateQueueStatus error:', error);
    return res.status(500).json({ error: 'Failed to update queue entry.' });
  }
}

export async function callNextToken(req: AuthRequest, res: Response) {
  try {
    const { department = 'General Medicine' } = req.body;

    // Complete previous in-consultation token
    await prisma.queueEntry.updateMany({
      where: { department, status: 'IN_CONSULTATION' },
      data: { status: 'COMPLETED', estimatedWaitTime: 0 },
    });

    // Find next waiting token
    const nextWaiting = await prisma.queueEntry.findFirst({
      where: { department, status: 'WAITING' },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      include: { patient: { include: { user: true } } },
    });

    if (!nextWaiting) {
      return res.status(404).json({ error: 'No waiting patients in queue.' });
    }

    const called = await prisma.queueEntry.update({
      where: { id: nextWaiting.id },
      data: { status: 'IN_CONSULTATION', estimatedWaitTime: 0 },
      include: { patient: { include: { user: true } } },
    });

    // Notify patient
    await prisma.notification.create({
      data: {
        userId: called.patient.userId,
        title: 'Token Called — OPD Consultation',
        message: `Token #${called.tokenNumber} has been called for ${called.department} consultation. Please proceed to OPD Room 104.`,
        type: 'REMINDER',
        linkUrl: '/patient/queue',
      },
    });

    // Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'MODIFY',
          entityType: 'QUEUE',
          entityId: called.id,
          details: `Called next token #${called.tokenNumber} (${called.patient.user.firstName} ${called.patient.user.lastName}).`,
        },
      });
    }

    return res.json({ called, currentToken: called.tokenNumber, message: `Token ${called.tokenNumber} is now IN CONSULTATION.` });
  } catch (error) {
    console.error('callNextToken error:', error);
    return res.status(500).json({ error: 'Failed to call next token.' });
  }
}

export async function skipToken(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const entry = await prisma.queueEntry.update({
      where: { id },
      data: { status: 'SKIPPED' },
      include: { patient: { include: { user: true } } },
    });

    return res.json({ entry, message: `Token ${entry.tokenNumber} marked as SKIPPED.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to skip token.' });
  }
}

export async function completeToken(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const entry = await prisma.queueEntry.update({
      where: { id },
      data: { status: 'COMPLETED', estimatedWaitTime: 0 },
      include: { patient: { include: { user: true } } },
    });

    return res.json({ entry, message: `Token ${entry.tokenNumber} COMPLETED.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to complete token.' });
  }
}

export async function cancelToken(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const entry = await prisma.queueEntry.update({
      where: { id },
      data: { status: 'CANCELLED', estimatedWaitTime: 0 },
      include: { patient: { include: { user: true } } },
    });

    return res.json({ entry, message: `Token ${entry.tokenNumber} CANCELLED.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel token.' });
  }
}

export async function changePriority(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { priority, overrideReason } = req.body;

    if (!['EMERGENCY', 'HIGH_PRIORITY', 'NORMAL'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be EMERGENCY, HIGH_PRIORITY, or NORMAL' });
    }

    const entry = await prisma.queueEntry.update({
      where: { id },
      data: { priority },
      include: { patient: { include: { user: true } } },
    });

    // Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'MODIFY',
          entityType: 'QUEUE',
          entityId: entry.id,
          details: `Staff overrode queue priority to ${priority}. Reason: ${overrideReason || 'Clinical triage discretion'}`,
        },
      });
    }

    return res.json({ entry, message: `Priority updated to ${priority}.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to change priority.' });
  }
}

export async function generateQueueToken(req: AuthRequest, res: Response) {
  try {
    const { patientId, department = 'General Medicine', doctorId, priority = 'NORMAL' } = req.body;

    let targetPatientId = patientId;
    if (!targetPatientId && req.user?.role === 'PATIENT') {
      const p = await prisma.patient.findFirst({ where: { userId: req.user.id } });
      if (p) targetPatientId = p.id;
    }

    if (!targetPatientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    // Risk screening check for auto-suggesting priority
    const patient = await prisma.patient.findUnique({
      where: { id: targetPatientId },
      include: { user: true },
    });

    let effectivePriority = priority;
    if (patient?.riskLevel === 'CRITICAL' && priority === 'NORMAL') {
      effectivePriority = 'EMERGENCY';
    } else if (patient?.riskLevel === 'HIGH' && priority === 'NORMAL') {
      effectivePriority = 'HIGH_PRIORITY';
    }

    const countToday = await prisma.queueEntry.count();
    const tokenNumber = `A${120 + countToday + 1}`;

    const waitingCount = await prisma.queueEntry.count({
      where: { department, status: 'WAITING' },
    });
    const estimatedWaitTime = (waitingCount + 1) * 3;

    const entry = await prisma.queueEntry.create({
      data: {
        patientId: targetPatientId,
        doctorId: doctorId || null,
        department,
        tokenNumber,
        estimatedWaitTime,
        status: 'WAITING',
        priority: effectivePriority,
      },
      include: {
        patient: { include: { user: true } },
      },
    });

    // Notify patient
    if (patient) {
      await prisma.notification.create({
        data: {
          userId: patient.userId,
          title: 'Queue Token Issued',
          message: `Your token is #${tokenNumber} for ${department}. Est. wait time: ${estimatedWaitTime} minutes.`,
          type: 'REMINDER',
          linkUrl: '/patient/queue',
        },
      });
    }

    return res.status(201).json({ entry, message: `Token ${tokenNumber} issued successfully.` });
  } catch (error) {
    console.error('generateQueueToken error:', error);
    return res.status(500).json({ error: 'Failed to generate queue token.' });
  }
}
