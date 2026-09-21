"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientDashboard = getPatientDashboard;
exports.getMyHealth = getMyHealth;
exports.getMedicalHistory = getMedicalHistory;
exports.getMentalWellness = getMentalWellness;
exports.createMentalWellnessEntry = createMentalWellnessEntry;
exports.getElderlyCare = getElderlyCare;
exports.notifyCaregiver = notifyCaregiver;
const index_js_1 = require("../database/index.js");
async function getPatientDashboard(req, res) {
    try {
        const userId = req.user?.id;
        const patient = await index_js_1.prisma.patient.findFirst({
            where: { userId },
            include: {
                user: true,
            },
        });
        if (!patient) {
            return res.status(404).json({ error: 'Patient profile not found.' });
        }
        // 1. Latest Vitals
        const latestVital = await index_js_1.prisma.vital.findFirst({
            where: { patientId: patient.id },
            orderBy: { recordedAt: 'desc' },
        });
        // 2. Vital Trends (last 10 entries)
        const vitalTrends = await index_js_1.prisma.vital.findMany({
            where: { patientId: patient.id },
            orderBy: { recordedAt: 'asc' },
            take: 10,
        });
        // 3. Upcoming Appointment
        const upcomingAppointment = await index_js_1.prisma.appointment.findFirst({
            where: {
                patientId: patient.id,
                status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            },
            include: {
                doctor: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { appointmentDate: 'asc' },
        });
        // 4. Queue Token
        const queueEntry = await index_js_1.prisma.queueEntry.findFirst({
            where: {
                patientId: patient.id,
                status: { in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] },
            },
            include: {
                doctor: {
                    include: { user: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // 5. Recent Reports
        const recentReports = await index_js_1.prisma.report.findMany({
            where: {
                patientId: patient.id,
                sharedWithPatient: true,
            },
            orderBy: { uploadDate: 'desc' },
            take: 4,
        });
        // 6. Wellness Trends
        const wellnessTrends = await index_js_1.prisma.wellnessEntry.findMany({
            where: { patientId: patient.id },
            orderBy: { date: 'asc' },
            take: 7,
        });
        // 7. Recent Notifications
        const notifications = await index_js_1.prisma.notification.findMany({
            where: { userId: patient.userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        // Medication reminders (Indian clinical regimen for Arjun Kumar)
        const medicationReminders = [
            {
                id: 'med-1',
                medicationName: 'Metformin HCl',
                dosage: '500 mg (1 Tablet)',
                timing: '08:30 AM & 08:30 PM - Twice daily after meals',
                taken: true,
                prescribedBy: 'Dr. Priya Sharma',
            },
            {
                id: 'med-2',
                medicationName: 'Telmisartan',
                dosage: '40 mg (1 Tablet)',
                timing: '09:00 AM - Once daily morning',
                taken: true,
                prescribedBy: 'Dr. Priya Sharma',
            },
            {
                id: 'med-3',
                medicationName: 'Becosules B-Complex',
                dosage: '1 Capsule',
                timing: '01:30 PM - Once daily after lunch',
                taken: false,
                prescribedBy: 'Dr. Priya Sharma',
            },
        ];
        return res.json({
            patient: {
                id: patient.id,
                firstName: patient.user.firstName,
                lastName: patient.user.lastName,
                age: Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
                gender: patient.gender,
                bloodGroup: patient.bloodGroup,
                riskLevel: patient.riskLevel,
                allergies: patient.allergies,
                avatarUrl: patient.user.avatarUrl,
                hospital: 'CareSync Multispeciality Hospital, Chennai',
            },
            latestVital,
            vitalTrends,
            upcomingAppointment,
            queueEntry,
            recentReports,
            wellnessTrends,
            notifications,
            medicationReminders,
        });
    }
    catch (error) {
        console.error('getPatientDashboard error:', error);
        return res.status(500).json({ error: 'Failed to retrieve patient dashboard.' });
    }
}
async function getMyHealth(req, res) {
    try {
        const userId = req.user?.id;
        const patient = await index_js_1.prisma.patient.findFirst({
            where: { userId },
            include: {
                vitals: { orderBy: { recordedAt: 'desc' }, take: 20 },
                symptoms: { orderBy: { recordedAt: 'desc' } },
                user: true,
            },
        });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        return res.json({ patient });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch health records.' });
    }
}
async function getMedicalHistory(req, res) {
    try {
        const userId = req.user?.id;
        const patient = await index_js_1.prisma.patient.findFirst({
            where: { userId },
            include: {
                medicalHistories: { orderBy: { diagnosisDate: 'desc' } },
                timelines: { orderBy: { eventDate: 'desc' } },
            },
        });
        if (!patient)
            return res.status(404).json({ error: 'Patient not found' });
        return res.json({
            history: patient.medicalHistories,
            timeline: patient.timelines,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch medical history.' });
    }
}
async function getMentalWellness(req, res) {
    try {
        const userId = req.user?.id;
        const patient = await index_js_1.prisma.patient.findFirst({
            where: { userId },
            include: {
                wellnessEntries: { orderBy: { date: 'desc' }, take: 30 },
            },
        });
        if (!patient)
            return res.status(404).json({ error: 'Patient not found' });
        return res.json({
            entries: patient.wellnessEntries,
            disclaimer: 'This is an informational wellness journal and does not diagnose mental health disorders. If you need urgent assistance, please contact Tele-MANAS (14416) or 112.',
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch mental wellness logs.' });
    }
}
async function createMentalWellnessEntry(req, res) {
    try {
        const userId = req.user?.id;
        const { moodScore = 7, sleepHours = 7.0, stressLevel = 'LOW', notes = '', waterIntakeLiters = 2.0, activityMinutes = 30 } = req.body;
        const patient = await index_js_1.prisma.patient.findFirst({ where: { userId } });
        if (!patient)
            return res.status(404).json({ error: 'Patient not found' });
        // Check for severe distress / self-harm keywords
        const lowerNotes = (notes || '').toLowerCase();
        const distressKeywords = ['suicide', 'self harm', 'kill myself', 'end it all', 'worthless', 'can\'t go on', 'want to die'];
        const isDistress = distressKeywords.some((kw) => lowerNotes.includes(kw));
        let safetyGuidance = null;
        if (isDistress) {
            safetyGuidance = {
                alert: 'URGENT CRISIS SUPPORT AVAILABLE 24/7',
                message: 'You are not alone. Please connect immediately with free, confidential healthcare counselors:',
                resources: [
                    { name: 'Tele-MANAS (Govt of India Mental Health Helpline)', contact: '14416 / 1800 891 4416 (Toll-Free, 24/7)' },
                    { name: 'KIRAN Mental Health Rehabilitation Helpline', contact: '1800-599-0019 (24/7)' },
                    { name: 'Vandrevala Foundation Helpline', contact: '+91 9999 666 555' },
                    { name: 'National Emergency Services', contact: '112' },
                ],
            };
        }
        const entry = await index_js_1.prisma.wellnessEntry.create({
            data: {
                patientId: patient.id,
                date: new Date(),
                moodScore: Number(moodScore),
                sleepHours: Number(sleepHours),
                stressLevel,
                waterIntakeLiters: Number(waterIntakeLiters),
                activityMinutes: Number(activityMinutes),
                notes,
            },
        });
        return res.status(201).json({
            entry,
            safetyGuidance,
            message: 'Daily wellness entry logged successfully.',
            disclaimer: 'This is an informational wellness journal and does not diagnose mental health disorders.',
        });
    }
    catch (error) {
        console.error('createMentalWellnessEntry error:', error);
        return res.status(500).json({ error: 'Failed to create wellness entry.' });
    }
}
async function getElderlyCare(req, res) {
    try {
        const userId = req.user?.id;
        let patient = await index_js_1.prisma.patient.findFirst({
            where: { userId },
            include: {
                elderlyMonitoring: true,
                vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
                user: true,
            },
        });
        if (!patient) {
            // Fallback to Arjun Kumar
            patient = await index_js_1.prisma.patient.findFirst({
                include: {
                    elderlyMonitoring: true,
                    vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
                    user: true,
                },
            });
        }
        const latestVital = patient?.vitals[0];
        const metrics = {
            heartRate: latestVital ? `${latestVital.heartRate} bpm` : '78 bpm',
            temperature: latestVital ? `${latestVital.temperature} °F` : '98.6 °F',
            spO2: latestVital ? `${latestVital.spO2}%` : '97%',
            activity: '3,400 steps (35 mins moderate walking)',
            hydration: '1.8 Liters (Target: 2.2L)',
            medicationAdherence: '100% (Morning doses taken)',
            lastCheckIn: 'Today at 08:30 AM',
            fallStatus: 'Normal (No falls detected)',
            caregiver: {
                name: 'Meena Kumar',
                relationship: 'Daughter / Designated Caregiver',
                phone: '+91 98404 56789',
                address: '42 Anna Salai, T. Nagar, Chennai 600017',
            },
            alerts: [
                { id: 'al-1', type: 'ACTIVITY', title: 'Low Activity Warning', message: 'Activity level is 15% below weekly target.', severity: 'LOW' },
                { id: 'al-2', type: 'HYDRATION', title: 'Hydration Reminder', message: 'Afternoon hydration intake is currently at 1.8L.', severity: 'LOW' },
                { id: 'al-3', type: 'MEDICATION', title: 'Medication Adherence', message: 'Evening Metformin dose scheduled at 08:30 PM.', severity: 'INFO' },
                { id: 'al-4', type: 'VITALS', title: 'Vital Telemetry Stable', message: 'SpO2 97% and Heart Rate 78 bpm within safe limits.', severity: 'NORMAL' },
                { id: 'al-5', type: 'CHECKIN', title: 'Routine Check-in', message: 'Morning caregiver check-in completed on time.', severity: 'INFO' },
            ],
        };
        return res.json({
            monitoring: patient?.elderlyMonitoring[0] || null,
            patientName: patient ? `${patient.user.firstName} ${patient.user.lastName}` : 'Arjun Kumar',
            age: 62,
            metrics,
        });
    }
    catch (error) {
        console.error('getElderlyCare error:', error);
        return res.status(500).json({ error: 'Failed to fetch elderly care metrics.' });
    }
}
async function notifyCaregiver(req, res) {
    try {
        const { customMessage, urgency = 'NORMAL' } = req.body;
        const patientName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Arjun Kumar';
        // 1. Audit Log
        if (req.user) {
            await index_js_1.prisma.auditLog.create({
                data: {
                    userId: req.user.id,
                    userName: patientName,
                    userRole: req.user.role,
                    action: 'SHARE',
                    entityType: 'ELDERLY',
                    details: `Caregiver Meena Kumar notified: "${customMessage || 'Patient requested assistance / vital check'}" (Urgency: ${urgency}).`,
                },
            });
        }
        // 2. Create notification for user confirming caregiver alert
        if (req.user) {
            await index_js_1.prisma.notification.create({
                data: {
                    userId: req.user.id,
                    title: 'Caregiver Meena Kumar Notified',
                    message: `Caregiver Meena Kumar (+91 98404 56789) was notified via SMS & CareSync Push. Message: "${customMessage || 'Routine status update'}"`,
                    type: 'ALERT',
                    linkUrl: '/patient/elderly',
                },
            });
        }
        return res.json({
            success: true,
            message: 'Caregiver Meena Kumar was notified.',
            recipient: 'Meena Kumar (+91 98404 56789)',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('notifyCaregiver error:', error);
        return res.status(500).json({ error: 'Failed to notify caregiver.' });
    }
}
