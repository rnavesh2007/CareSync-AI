import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../database/index.js';
import { generateToken } from '../middleware/auth.js';
import { AuthRequest, UserRole } from '../types/index.js';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { patient: true, doctor: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id,
    };

    const token = generateToken(payload);

    return res.json({
      token,
      user: {
        ...payload,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        patient: user.patient,
        doctor: user.doctor,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        patient: true,
        doctor: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      patient: user.patient,
      doctor: user.doctor,
      notifications: user.notifications,
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function demoSwitch(req: Request, res: Response) {
  try {
    const { role } = req.body;
    let targetEmail = 'patient@caresync.ai';
    if (role === 'DOCTOR') targetEmail = 'doctor@caresync.ai';
    if (role === 'ADMIN') targetEmail = 'admin@caresync.ai';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { patient: true, doctor: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Please run seed.' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id,
    };

    const token = generateToken(payload);

    return res.json({
      token,
      user: {
        ...payload,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        patient: user.patient,
        doctor: user.doctor,
      },
    });
  } catch (error) {
    console.error('Demo switch error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
