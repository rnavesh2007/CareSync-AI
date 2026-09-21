"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransfers = getTransfers;
exports.createTransfer = createTransfer;
exports.updateTransferStatus = updateTransferStatus;
const index_js_1 = require("../database/index.js");
async function getTransfers(req, res) {
    try {
        const user = req.user;
        const whereClause = {};
        if (user?.role === 'PATIENT') {
            const patient = await index_js_1.prisma.patient.findFirst({ where: { userId: user.id } });
            if (patient) {
                whereClause.patientId = patient.id;
            }
        }
        const transfers = await index_js_1.prisma.transfer.findMany({
            where: whereClause,
            include: {
                patient: { include: { user: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ transfers });
    }
    catch (error) {
        console.error('getTransfers error:', error);
        return res.status(500).json({ error: 'Failed to retrieve transfers.' });
    }
}
async function createTransfer(req, res) {
    try {
        const { patientId: inputPatientId, senderRole = req.user?.role || 'PATIENT', receiverRole, receiverName, reason, sharedItems = [], notes, } = req.body;
        let targetPatientId = inputPatientId;
        if (!targetPatientId && req.user?.role === 'PATIENT') {
            const p = await index_js_1.prisma.patient.findFirst({ where: { userId: req.user.id } });
            if (p)
                targetPatientId = p.id;
        }
        if (!targetPatientId || !receiverRole || !receiverName || !reason) {
            return res.status(400).json({ error: 'patientId, receiverRole, receiverName, and reason are required.' });
        }
        const patient = await index_js_1.prisma.patient.findUnique({
            where: { id: targetPatientId },
            include: { user: true },
        });
        if (!patient)
            return res.status(404).json({ error: 'Patient not found.' });
        const senderName = req.user
            ? `${req.user.firstName} ${req.user.lastName}`
            : 'CareSync User';
        const transfer = await index_js_1.prisma.transfer.create({
            data: {
                patientId: targetPatientId,
                senderRole,
                senderId: req.user?.id,
                senderName,
                receiverRole,
                receiverName,
                reason,
                sharedItems: typeof sharedItems === 'string' ? sharedItems : JSON.stringify(sharedItems),
                status: 'PENDING',
                notes,
            },
            include: {
                patient: { include: { user: true } },
            },
        });
        // Audit Log for TRANSFER
        if (req.user) {
            await index_js_1.prisma.auditLog.create({
                data: {
                    userId: req.user.id,
                    userName: senderName,
                    userRole: req.user.role,
                    action: 'TRANSFER',
                    entityType: 'TRANSFER',
                    entityId: transfer.id,
                    details: `Initiated transfer from ${senderRole} to ${receiverRole} (${receiverName}) for patient ${patient.user.firstName} ${patient.user.lastName}. Reason: ${reason}`,
                },
            });
        }
        // Timeline event
        await index_js_1.prisma.patientTimeline.create({
            data: {
                patientId: targetPatientId,
                eventType: 'TRANSFER',
                title: `Clinical Transfer: ${senderRole} → ${receiverRole}`,
                description: `Records shared with ${receiverName}. Reason: ${reason}`,
                icon: 'ArrowRightLeft',
            },
        });
        // Notifications
        // 1. Notify patient
        await index_js_1.prisma.notification.create({
            data: {
                userId: patient.userId,
                title: 'Clinical Case Transfer Initiated',
                message: `Your case/records were transferred to ${receiverName} (${receiverRole}).`,
                type: 'TRANSFER',
                linkUrl: '/patient/transfers',
            },
        });
        // 2. If sender is doctor or patient, notify appropriate staff/doctor
        if (receiverRole === 'SPECIALIST' || receiverRole === 'DOCTOR') {
            const specialistUser = await index_js_1.prisma.user.findFirst({
                where: {
                    role: 'DOCTOR',
                    firstName: receiverName.includes('Karthik') ? { contains: 'Karthik' } : undefined,
                },
            });
            if (specialistUser) {
                await index_js_1.prisma.notification.create({
                    data: {
                        userId: specialistUser.id,
                        title: `Inbound Referral: ${patient.user.firstName} ${patient.user.lastName}`,
                        message: `Case transferred by ${senderName}. Reason: ${reason}`,
                        type: 'TRANSFER',
                        linkUrl: '/doctor/transfers',
                    },
                });
            }
        }
        return res.status(201).json({ transfer, message: 'Transfer created successfully.' });
    }
    catch (error) {
        console.error('createTransfer error:', error);
        return res.status(500).json({ error: 'Failed to create transfer.' });
    }
}
async function updateTransferStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const existing = await index_js_1.prisma.transfer.findUnique({
            where: { id },
            include: { patient: { include: { user: true } } },
        });
        if (!existing)
            return res.status(404).json({ error: 'Transfer not found.' });
        const updated = await index_js_1.prisma.transfer.update({
            where: { id },
            data: {
                status: status || existing.status,
                notes: notes !== undefined ? notes : existing.notes,
            },
            include: { patient: { include: { user: true } } },
        });
        // Audit Log
        if (req.user) {
            await index_js_1.prisma.auditLog.create({
                data: {
                    userId: req.user.id,
                    userName: `${req.user.firstName} ${req.user.lastName}`,
                    userRole: req.user.role,
                    action: 'REVIEW',
                    entityType: 'TRANSFER',
                    entityId: updated.id,
                    details: `Updated transfer status to ${updated.status}.`,
                },
            });
        }
        // Notify patient
        await index_js_1.prisma.notification.create({
            data: {
                userId: existing.patient.userId,
                title: 'Transfer Status Update',
                message: `${existing.receiverName} updated case transfer status to ${status}.`,
                type: 'TRANSFER',
                linkUrl: '/patient/transfers',
            },
        });
        return res.json({ transfer: updated, message: 'Transfer status updated.' });
    }
    catch (error) {
        console.error('updateTransferStatus error:', error);
        return res.status(500).json({ error: 'Failed to update transfer status.' });
    }
}
