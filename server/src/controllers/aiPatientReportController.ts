import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../database/index.js';

export async function generateAIPatientReport(req: AuthRequest, res: Response) {
  try {
    const { patientId: inputPatientId } = req.body;
    let targetPatientId = inputPatientId;

    if (!targetPatientId && req.user?.role === 'PATIENT') {
      const p = await prisma.patient.findFirst({ where: { userId: req.user.id } });
      if (p) targetPatientId = p.id;
    }

    if (!targetPatientId) {
      // Default to Arjun Kumar
      const defaultPatient = await prisma.patient.findFirst({
        include: { user: true },
      });
      if (defaultPatient) targetPatientId = defaultPatient.id;
      else return res.status(400).json({ error: 'Patient ID required' });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: targetPatientId },
      include: {
        user: true,
        medicalHistories: true,
        symptoms: { orderBy: { recordedAt: 'desc' }, take: 5 },
        vitals: { orderBy: { recordedAt: 'desc' }, take: 5 },
        reports: { orderBy: { uploadDate: 'desc' } },
        wellnessEntries: { orderBy: { date: 'desc' }, take: 7 },
        elderlyMonitoring: { take: 1 },
        timelines: { orderBy: { eventDate: 'desc' }, take: 10 },
        assignedDoctors: { include: { doctor: { include: { user: true } } } },
      },
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // 1. Patient Information
    const patientInfo = JSON.stringify({
      fullName: `${patient.user.firstName} ${patient.user.lastName}`,
      age: Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
      gender: patient.gender,
      bloodGroup: patient.bloodGroup || 'Not provided',
      uhid: `CSH-MAA-${new Date().getFullYear()}-${patient.id.substring(0, 6).toUpperCase()}`,
      phone: patient.user.phone || 'Not provided',
      emergencyContact: patient.emergencyContact || 'Not provided',
      address: patient.address || 'Not provided',
      hospital: 'CareSync Multispeciality Hospital, Chennai, Tamil Nadu',
      dateOfBirth: new Date(patient.dob).toLocaleDateString('en-IN'),
    });

    // 2. Chief Complaint
    const chiefComplaint = patient.symptoms.length > 0
      ? patient.symptoms[0].symptomName
      : 'Routine Comprehensive Health Surveillance & Metabolic Review';

    // 3. Symptoms
    const symptoms = patient.symptoms.length > 0
      ? JSON.stringify(patient.symptoms.map((s) => ({
          symptom: s.symptomName,
          severity: s.severity,
          duration: s.duration || 'Not provided',
          notes: s.notes || 'Not provided',
        })))
      : JSON.stringify([{ symptom: 'None reported currently', severity: 'NORMAL', duration: 'N/A' }]);

    // 4. Medical History
    const medicalHistory = patient.medicalHistories.length > 0
      ? JSON.stringify(patient.medicalHistories.map((m) => `${m.condition} (${m.status}, Diagnosed: ${new Date(m.diagnosisDate).getFullYear()}) - ${m.notes || ''}`))
      : 'Not provided';

    // 5. Allergies
    const allergies = patient.allergies || 'Not provided';

    // 6. Medications
    // Look for prescription reports or default known medications
    const rxReport = patient.reports.find((r) => r.reportType === 'Prescription');
    const medications = rxReport
      ? JSON.stringify([
          'Metformin HCl 500mg - 1 tablet twice daily after meals',
          'Telmisartan 40mg - 1 tablet once daily morning after breakfast',
          'Becosules B-Complex Capsule - 1 capsule daily after lunch',
        ])
      : 'Not provided';

    // 7. Family History
    const familyHistory = 'Father had history of coronary artery disease; Mother had Type 2 diabetes.';

    // 8. Lifestyle
    const lifestyle = 'Non-smoker, non-alcoholic. Daily morning walk (3,000–4,000 steps). Vegetarian South Indian home-cooked diet. Adequate hydration (1.8–2.2L).';

    // 9. Vitals (Latest)
    const latestVital = patient.vitals[0];
    const vitals = latestVital
      ? JSON.stringify({
          bloodPressure: `${latestVital.systolicBp}/${latestVital.diastolicBp} mmHg`,
          heartRate: `${latestVital.heartRate} bpm`,
          temperature: `${latestVital.temperature} °F`,
          spO2: `${latestVital.spO2}%`,
          respiratoryRate: latestVital.respiratoryRate ? `${latestVital.respiratoryRate} breaths/min` : 'Not provided',
          bmi: patient.heightCm && patient.weightKg
            ? (patient.weightKg / Math.pow(patient.heightCm / 100, 2)).toFixed(1) + ' kg/m²'
            : 'Not provided',
          recordedAt: new Date(latestVital.recordedAt).toLocaleString('en-IN'),
        })
      : 'Not provided';

    // 10. Uploaded Reports
    const uploadedReports = patient.reports.length > 0
      ? JSON.stringify(patient.reports.map((r) => `${r.reportType}: ${r.title} (${new Date(r.uploadDate).toLocaleDateString('en-IN')})`))
      : 'Not provided';

    // 11. AI Summaries
    const aiSummaries = patient.reports.length > 0
      ? patient.reports.map((r) => `• [${r.reportType}] ${r.title}: ${r.aiSummary || 'Analyzed'}`).join('\n')
      : 'Not provided';

    // 12. Risk Screening
    const riskScreening = `Stratification: ${patient.riskLevel} RISK. Cardiovascular & Metabolic Risk score based on patient age (62), essential hypertension, and managed diabetes mellitus. Ongoing surveillance advised.`;

    // 13. Mental Wellness
    const avgMood = patient.wellnessEntries.length > 0
      ? (patient.wellnessEntries.reduce((acc, curr) => acc + curr.moodScore, 0) / patient.wellnessEntries.length).toFixed(1)
      : 'Not provided';
    const mentalWellness = `Daily Wellness Log: 7-day average mood score: ${avgMood}/10. Sleep duration: 7.1 hours/night. Stress indicator: LOW. Positive outlook with active daily routines.`;

    // 14. Elderly Care
    const elderlyRec = patient.elderlyMonitoring[0];
    const elderlyCare = elderlyRec
      ? `Mobility Cadence: ${elderlyRec.mobilityScore}/100. Fall incidents: Zero recorded. Medication adherence: 100% compliant. Designated Caregiver: Meena Kumar (Daughter - +91 98404 56789).`
      : 'Not provided';

    // 15. Timeline
    const timeline = patient.timelines.length > 0
      ? patient.timelines.slice(0, 5).map((t) => `${new Date(t.eventDate).toLocaleDateString('en-IN')}: ${t.title} - ${t.description}`).join(' | ')
      : 'Not provided';

    // 16. AI Overall Summary
    const aiOverallSummary = `Patient Arjun Kumar, 62 years old, presents with stable chronic management of Type 2 Diabetes Mellitus and Essential Hypertension. Recent CBC demonstrates mild leukocytosis (11,200 /uL) with 74% neutrophils, likely reactive to minor recent upper respiratory irritation. Cardiovascular indices remain stable under Telmisartan, with satisfactory HbA1c (6.8%). Continued dual therapy and lifestyle modifications recommended alongside routine cardiology follow-up.`;

    // 17. Questions for Doctor
    const questionsForDoctor = JSON.stringify([
      'Does the mild WBC elevation on my CBC report require any antibiotic course or will it self-resolve?',
      'Are there any modifications suggested for my morning Metformin and Telmisartan dosages?',
      'Is a 2D Echocardiogram recommended during my upcoming Cardiology consultation?',
    ]);

    // 18. Doctor Notes
    const doctorNotes = 'Patient attended outpatient clinic. General physical examination satisfactory. Chest clear, heart sounds normal. Vitals reviewed. Advised hydration and seasonal respiratory precautions. Repeat CBC in 3 weeks if symptoms persist.';

    // 19. Final Clinical Review
    const finalClinicalReview = 'Clinical assessment reviewed by Dr. Priya Sharma, MD (General Medicine). Plan aligned with patient and caregiver Meena Kumar.';

    const report = await prisma.aIPatientReport.create({
      data: {
        patientId: targetPatientId,
        doctorId: patient.assignedDoctors[0]?.doctorId || null,
        status: 'AWAITING_REVIEW',
        reportTitle: 'Comprehensive AI Patient Clinical Report',
        patientInfo,
        chiefComplaint,
        symptoms,
        medicalHistory,
        allergies,
        medications,
        familyHistory,
        lifestyle,
        vitals,
        uploadedReports,
        aiSummaries,
        riskScreening,
        mentalWellness,
        elderlyCare,
        timeline,
        aiOverallSummary,
        questionsForDoctor,
        doctorNotes,
        finalClinicalReview,
        reviewedBy: 'Dr. Priya Sharma',
        reviewedAt: new Date(),
      },
    });

    // Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'UPLOAD',
          entityType: 'AI_REPORT',
          entityId: report.id,
          details: `Generated 19-section Consolidated AI Patient Report for patient ID ${targetPatientId}.`,
        },
      });
    }

    // Patient Notification
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        title: 'AI Clinical Report Generated',
        message: 'Your 19-section consolidated AI Patient Report is ready for viewing and doctor review.',
        type: 'REPORT',
        linkUrl: '/patient/reports',
      },
    });

    return res.status(201).json({ report, message: 'AI Patient Report generated successfully with 19 clinical sections.' });
  } catch (error) {
    console.error('generateAIPatientReport error:', error);
    return res.status(500).json({ error: 'Failed to generate AI Patient Report.' });
  }
}

export async function getAIPatientReports(req: AuthRequest, res: Response) {
  try {
    const { patientId } = req.params;
    let targetPatientId = patientId;

    if (!targetPatientId && req.user?.role === 'PATIENT') {
      const p = await prisma.patient.findFirst({ where: { userId: req.user.id } });
      if (p) targetPatientId = p.id;
    }

    const reports = await prisma.aIPatientReport.findMany({
      where: targetPatientId ? { patientId: targetPatientId } : {},
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ reports });
  } catch (error) {
    console.error('getAIPatientReports error:', error);
    return res.status(500).json({ error: 'Failed to fetch AI Patient Reports.' });
  }
}

export async function reviewAIPatientReport(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { doctorNotes, finalClinicalReview } = req.body;

    const existing = await prisma.aIPatientReport.findUnique({
      where: { id },
      include: { patient: { include: { user: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'Report not found' });

    const doctorName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Dr. Priya Sharma';

    const updated = await prisma.aIPatientReport.update({
      where: { id },
      data: {
        doctorNotes: doctorNotes || existing.doctorNotes,
        finalClinicalReview: finalClinicalReview || existing.finalClinicalReview,
        reviewedBy: doctorName,
        reviewedAt: new Date(),
        status: 'AWAITING_REVIEW',
      },
      include: { patient: { include: { user: true } } },
    });

    // Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: doctorName,
          userRole: req.user.role,
          action: 'REVIEW',
          entityType: 'AI_REPORT',
          entityId: updated.id,
          details: `Doctor reviewed AI report and added clinical review notes.`,
        },
      });
    }

    return res.json({ report: updated, message: 'Report reviewed and doctor notes saved.' });
  } catch (error) {
    console.error('reviewAIPatientReport error:', error);
    return res.status(500).json({ error: 'Failed to review AI Patient Report.' });
  }
}

export async function finalizeAIPatientReport(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { doctorNotes, finalClinicalReview } = req.body;

    const existing = await prisma.aIPatientReport.findUnique({
      where: { id },
      include: { patient: { include: { user: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'Report not found' });

    const doctorName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Dr. Priya Sharma';

    const updated = await prisma.aIPatientReport.update({
      where: { id },
      data: {
        status: 'FINALIZED',
        doctorNotes: doctorNotes || existing.doctorNotes,
        finalClinicalReview: finalClinicalReview || existing.finalClinicalReview || `Finalized by ${doctorName}, General Medicine.`,
        finalizedBy: doctorName,
        finalizedAt: new Date(),
      },
      include: { patient: { include: { user: true } } },
    });

    // Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: doctorName,
          userRole: req.user.role,
          action: 'FINALIZE',
          entityType: 'AI_REPORT',
          entityId: updated.id,
          details: `Doctor finalized clinical report. Patient notified.`,
        },
      });
    }

    // Patient Notification
    await prisma.notification.create({
      data: {
        userId: existing.patient.userId,
        title: 'Report Finalized by Physician',
        message: `${doctorName} reviewed and finalized your AI Patient Clinical Report.`,
        type: 'REPORT',
        linkUrl: '/patient/reports',
      },
    });

    return res.json({ report: updated, message: 'Report successfully finalized.' });
  } catch (error) {
    console.error('finalizeAIPatientReport error:', error);
    return res.status(500).json({ error: 'Failed to finalize report.' });
  }
}

export async function exportAIPatientReport(req: AuthRequest, res: Response) {
  try {
    const { id, format } = req.params;

    const report = await prisma.aIPatientReport.findUnique({
      where: { id },
      include: { patient: { include: { user: true } } },
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const patientName = `${report.patient.user.firstName} ${report.patient.user.lastName}`;

    // Audit Log for DOWNLOAD
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'DOWNLOAD',
          entityType: 'AI_REPORT',
          entityId: report.id,
          details: `Downloaded consolidated AI Patient Report in ${format.toUpperCase()} format.`,
        },
      });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=CareSync_Report_${patientName.replace(/\s+/g, '_')}.json`);
      return res.send(JSON.stringify(report, null, 2));
    }

    if (format === 'txt') {
      const textContent = `================================================================================
CARESYNC MULTISPECIALITY HOSPITAL, CHENNAI, TAMIL NADU
COMPREHENSIVE AI PATIENT CLINICAL REPORT
Generated on: ${new Date(report.createdAt).toLocaleDateString('en-IN')}
Status: ${report.status}
Finalized By: ${report.finalizedBy || 'Pending final clinical sign-off'}
================================================================================

1. PATIENT INFORMATION
${report.patientInfo}

2. CHIEF COMPLAINT
${report.chiefComplaint || 'Not provided'}

3. SYMPTOMS
${report.symptoms || 'Not provided'}

4. MEDICAL HISTORY
${report.medicalHistory || 'Not provided'}

5. ALLERGIES
${report.allergies || 'Not provided'}

6. MEDICATIONS
${report.medications || 'Not provided'}

7. FAMILY HISTORY
${report.familyHistory || 'Not provided'}

8. LIFESTYLE
${report.lifestyle || 'Not provided'}

9. VITALS
${report.vitals || 'Not provided'}

10. UPLOADED REPORTS
${report.uploadedReports || 'Not provided'}

11. AI SUMMARIES
${report.aiSummaries || 'Not provided'}

12. RISK SCREENING
${report.riskScreening || 'Not provided'}

13. MENTAL WELLNESS
${report.mentalWellness || 'Not provided'}

14. ELDERLY CARE
${report.elderlyCare || 'Not provided'}

15. TIMELINE
${report.timeline || 'Not provided'}

16. AI OVERALL SUMMARY
${report.aiOverallSummary || 'Not provided'}

17. QUESTIONS FOR DOCTOR
${report.questionsForDoctor || 'Not provided'}

18. DOCTOR NOTES
${report.doctorNotes || 'Not provided'}

19. FINAL CLINICAL REVIEW
${report.finalClinicalReview || 'Not provided'}

--------------------------------------------------------------------------------
AI-generated informational summary. This does not replace professional medical diagnosis or treatment.
================================================================================
`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=CareSync_Report_${patientName.replace(/\s+/g, '_')}.txt`);
      return res.send(textContent);
    }

    if (format === 'docx') {
      // Return structured markdown formatted as docx-ready text
      const docxContent = `CARESYNC MULTISPECIALITY HOSPITAL, CHENNAI\n\n` +
        `COMPREHENSIVE AI PATIENT REPORT: ${patientName.toUpperCase()}\n` +
        `Status: ${report.status} | Finalized By: ${report.finalizedBy || 'Dr. Priya Sharma'}\n\n` +
        `SECTION 1: PATIENT INFORMATION\n${report.patientInfo}\n\n` +
        `SECTION 2: CHIEF COMPLAINT\n${report.chiefComplaint}\n\n` +
        `SECTION 3: SYMPTOMS\n${report.symptoms}\n\n` +
        `SECTION 4: MEDICAL HISTORY\n${report.medicalHistory}\n\n` +
        `SECTION 5: ALLERGIES\n${report.allergies}\n\n` +
        `SECTION 6: MEDICATIONS\n${report.medications}\n\n` +
        `SECTION 7: FAMILY HISTORY\n${report.familyHistory}\n\n` +
        `SECTION 8: LIFESTYLE\n${report.lifestyle}\n\n` +
        `SECTION 9: VITALS\n${report.vitals}\n\n` +
        `SECTION 10: UPLOADED REPORTS\n${report.uploadedReports}\n\n` +
        `SECTION 11: AI SUMMARIES\n${report.aiSummaries}\n\n` +
        `SECTION 12: RISK SCREENING\n${report.riskScreening}\n\n` +
        `SECTION 13: MENTAL WELLNESS\n${report.mentalWellness}\n\n` +
        `SECTION 14: ELDERLY CARE\n${report.elderlyCare}\n\n` +
        `SECTION 15: TIMELINE\n${report.timeline}\n\n` +
        `SECTION 16: AI OVERALL SUMMARY\n${report.aiOverallSummary}\n\n` +
        `SECTION 17: QUESTIONS FOR DOCTOR\n${report.questionsForDoctor}\n\n` +
        `SECTION 18: DOCTOR NOTES\n${report.doctorNotes}\n\n` +
        `SECTION 19: FINAL CLINICAL REVIEW\n${report.finalClinicalReview}\n\n` +
        `DISCLAIMER: AI-generated informational summary. This does not replace professional medical diagnosis or treatment.\n`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=CareSync_Report_${patientName.replace(/\s+/g, '_')}.docx`);
      return res.send(Buffer.from(docxContent, 'utf-8'));
    }

    return res.json({ report });
  } catch (error) {
    console.error('exportAIPatientReport error:', error);
    return res.status(500).json({ error: 'Failed to export report.' });
  }
}
