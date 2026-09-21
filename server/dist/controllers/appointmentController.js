"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointments = getAppointments;
exports.createAppointment = createAppointment;
exports.updateAppointmentStatus = updateAppointmentStatus;
const index_js_1 = require("../database/index.js");
async function getAppointments(req, res) {
    try {
        const user = req.user;
        const where = {};
        if (user?.role === 'PATIENT') {
            const patient = await index_js_1.prisma.patient.findFirst({ where: { userId: user.id } });
            if (!patient)
                return res.status(404).json({ error: 'Patient not found' });
            where.patientId = patient.id;
        }
        else if (user?.role === 'DOCTOR') {
            const doctor = await index_js_1.prisma.doctor.findFirst({ where: { userId: user.id } });
            if (!doctor)
                return res.status(404).json({ error: 'Doctor not found' });
            where.doctorId = doctor.id;
        }
        const appointments = await index_js_1.prisma.appointment.findMany({
            where,
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
            },
            orderBy: { appointmentDate: 'asc' },
        });
        return res.json({ appointments });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve appointments.' });
    }
}
async function createAppointment(req, res) {
    try {
        const { patientId, doctorId, appointmentDate, timeSlot, type, reason } = req.body;
        let targetPatientId = patientId;
        if (!targetPatientId && req.user?.role === 'PATIENT') {
            const p = await index_js_1.prisma.patient.findFirst({ where: { userId: req.user.id } });
            targetPatientId = p?.id;
        }
        if (!targetPatientId || !doctorId || !appointmentDate || !timeSlot) {
            return res.status(400).json({ error: 'patientId, doctorId, appointmentDate, and timeSlot are required.' });
        }
        const appointment = await index_js_1.prisma.appointment.create({
            data: {
                patientId: targetPatientId,
                doctorId,
                appointmentDate: new Date(appointmentDate),
                timeSlot,
                type: type || 'IN_PERSON',
                reason,
                status: 'SCHEDULED',
            },
            include: {
                doctor: { include: { user: true } },
                patient: { include: { user: true } },
            },
        });
        // Create Notification for user
        const patientUser = await index_js_1.prisma.patient.findUnique({
            where: { id: targetPatientId },
            select: { userId: true },
        });
        if (patientUser) {
            await index_js_1.prisma.notification.create({
                data: {
                    userId: patientUser.userId,
                    title: 'Appointment Confirmed',
                    message: `Appointment scheduled with Dr. ${appointment.doctor.user.lastName} on ${appointment.timeSlot}`,
                    type: 'APPOINTMENT',
                    linkUrl: '/patient/appointments',
                },
            });
        }
        return res.status(201).json({ appointment });
    }
    catch (error) {
        console.error('createAppointment error:', error);
        return res.status(500).json({ error: 'Failed to create appointment.' });
    }
}
async function updateAppointmentStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const appointment = await index_js_1.prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                doctor: { include: { user: true } },
                patient: { include: { user: true } },
            },
        });
        return res.json({ appointment });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update appointment.' });
    }
}
