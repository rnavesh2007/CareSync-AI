"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getMe = getMe;
exports.demoSwitch = demoSwitch;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_js_1 = require("../database/index.js");
const auth_js_1 = require("../middleware/auth.js");
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = await index_js_1.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: { patient: true, doctor: true },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            patientId: user.patient?.id,
            doctorId: user.doctor?.id,
        };
        const token = (0, auth_js_1.generateToken)(payload);
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
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error during login.' });
    }
}
async function getMe(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }
        const user = await index_js_1.prisma.user.findUnique({
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
    }
    catch (error) {
        console.error('getMe error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
async function demoSwitch(req, res) {
    try {
        const { role } = req.body;
        let targetEmail = 'patient@caresync.ai';
        if (role === 'DOCTOR')
            targetEmail = 'doctor@caresync.ai';
        if (role === 'ADMIN')
            targetEmail = 'admin@caresync.ai';
        const user = await index_js_1.prisma.user.findUnique({
            where: { email: targetEmail },
            include: { patient: true, doctor: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'Demo user not found. Please run seed.' });
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            patientId: user.patient?.id,
            doctorId: user.doctor?.id,
        };
        const token = (0, auth_js_1.generateToken)(payload);
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
    }
    catch (error) {
        console.error('Demo switch error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
