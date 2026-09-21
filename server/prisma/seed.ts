import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing existing database tables...');
  await prisma.auditLog.deleteMany();
  await prisma.aIPatientReport.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.patientTimeline.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.elderlyMonitoring.deleteMany();
  await prisma.wellnessEntry.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.reportFile.deleteMany();
  await prisma.report.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.symptom.deleteMany();
  await prisma.vital.deleteMany();
  await prisma.medicalHistory.deleteMany();
  await prisma.doctorPatientAssignment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Seeding core user accounts (Indian Healthcare Context)...');
  const salt = await bcrypt.genSalt(10);
  const patientPasswordHash = await bcrypt.hash('patient123', salt);
  const doctorPasswordHash = await bcrypt.hash('doctor123', salt);
  const specialistPasswordHash = await bcrypt.hash('specialist123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  // 1. Patient User: Arjun Kumar, 62, Male, B+
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@caresync.ai',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      firstName: 'Arjun',
      lastName: 'Kumar',
      phone: '+91 98401 23456',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
  });

  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      dob: new Date('1964-03-15'), // 62 years old
      gender: 'Male',
      bloodGroup: 'B+',
      emergencyContact: 'Meena Kumar (Daughter / Caregiver) - +91 98404 56789',
      address: '42 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017',
      heightCm: 172.0,
      weightKg: 74.5,
      allergies: 'Penicillin, Sulfa drugs',
      riskLevel: 'MODERATE',
    },
  });

  // Second demo patient for multi-patient lists: Lakshmi Narayanan, 58, Female, O+
  const patientUser2 = await prisma.user.create({
    data: {
      email: 'lakshmi.narayanan@caresync.ai',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      firstName: 'Lakshmi',
      lastName: 'Narayanan',
      phone: '+91 98402 88990',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      userId: patientUser2.id,
      dob: new Date('1968-08-22'),
      gender: 'Female',
      bloodGroup: 'O+',
      emergencyContact: 'R. Narayanan (Spouse) - +91 98402 11223',
      address: '18 Gandhi Mandapam Road, Adyar, Chennai, Tamil Nadu 600020',
      heightCm: 160.0,
      weightKg: 65.0,
      allergies: 'Ciprofloxacin',
      riskLevel: 'LOW',
    },
  });

  // 2. Doctor User: Dr. Priya Sharma — General Medicine
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@caresync.ai',
      passwordHash: doctorPasswordHash,
      role: 'DOCTOR',
      firstName: 'Dr. Priya',
      lastName: 'Sharma',
      phone: '+91 98402 34567',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      specialization: 'General Medicine',
      licenseNumber: 'TN-MC-44821',
      department: 'General Medicine',
      roomNumber: 'OPD Block 2, Room 104',
      availability: 'AVAILABLE',
    },
  });

  // 3. Specialist User: Dr. Karthik Raj — Cardiology
  const specialistUser = await prisma.user.create({
    data: {
      email: 'specialist@caresync.ai',
      passwordHash: specialistPasswordHash,
      role: 'DOCTOR',
      firstName: 'Dr. Karthik',
      lastName: 'Raj',
      phone: '+91 98403 45678',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    },
  });

  const specialist = await prisma.doctor.create({
    data: {
      userId: specialistUser.id,
      specialization: 'Cardiology',
      licenseNumber: 'TN-CARD-90112',
      department: 'Cardiology',
      roomNumber: 'Cardiac Tower, Suite 302',
      availability: 'AVAILABLE',
    },
  });

  // 4. Admin User: Suresh Iyer
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@caresync.ai',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      firstName: 'Suresh',
      lastName: 'Iyer',
      phone: '+91 98405 67890',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  // Assign Doctors to Patients
  await prisma.doctorPatientAssignment.createMany({
    data: [
      { doctorId: doctor.id, patientId: patient.id, notes: 'Primary Physician for General Medical Management and Routine Surveillance' },
      { doctorId: specialist.id, patientId: patient.id, notes: 'Cardiology Referral for Hypertension & Cardiac Risk Assessment' },
      { doctorId: doctor.id, patientId: patient2.id, notes: 'Managing seasonal allergies and routine wellness' },
    ],
  });

  console.log('🩺 Seeding clinical vitals & history for Arjun Kumar...');
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  // Vitals for Arjun Kumar (62 y/o Male, B+)
  await prisma.vital.createMany({
    data: [
      {
        patientId: patient.id,
        recordedAt: daysAgo(7),
        heartRate: 78,
        systolicBp: 134,
        diastolicBp: 86,
        temperature: 98.6,
        spO2: 97,
        respiratoryRate: 17,
        recordedBy: 'CareSync VitalSync Band',
      },
      {
        patientId: patient.id,
        recordedAt: daysAgo(5),
        heartRate: 76,
        systolicBp: 132,
        diastolicBp: 85,
        temperature: 98.4,
        spO2: 98,
        respiratoryRate: 16,
        recordedBy: 'CareSync VitalSync Band',
      },
      {
        patientId: patient.id,
        recordedAt: daysAgo(3),
        heartRate: 82,
        systolicBp: 138,
        diastolicBp: 88,
        temperature: 99.1,
        spO2: 96,
        respiratoryRate: 18,
        recordedBy: 'CareSync VitalSync Band',
      },
      {
        patientId: patient.id,
        recordedAt: daysAgo(1),
        heartRate: 84,
        systolicBp: 140,
        diastolicBp: 90,
        temperature: 99.4,
        spO2: 96,
        respiratoryRate: 19,
        recordedBy: 'Nurse Station - OPD Block 2',
      },
      {
        patientId: patient.id,
        recordedAt: daysAgo(0),
        heartRate: 80,
        systolicBp: 136,
        diastolicBp: 88,
        temperature: 98.7,
        spO2: 97,
        respiratoryRate: 17,
        recordedBy: 'CareSync Multispeciality Hospital Triage',
      },
    ],
  });

  // Medical History for Arjun Kumar
  await prisma.medicalHistory.createMany({
    data: [
      {
        patientId: patient.id,
        condition: 'Type 2 Diabetes Mellitus',
        diagnosisDate: new Date('2018-05-10'),
        status: 'CHRONIC',
        notes: 'Managed on Metformin 500mg BD. HbA1c periodically monitored.',
        treatedBy: 'Dr. Priya Sharma',
      },
      {
        patientId: patient.id,
        condition: 'Essential Hypertension (Stage 1)',
        diagnosisDate: new Date('2020-11-14'),
        status: 'ACTIVE',
        notes: 'Telmisartan 40mg once daily in morning. Low sodium diet prescribed.',
        treatedBy: 'Dr. Priya Sharma',
      },
      {
        patientId: patient.id,
        condition: 'Laparoscopic Cholecystectomy',
        diagnosisDate: new Date('2015-02-18'),
        status: 'RESOLVED',
        notes: 'Uncomplicated gall bladder removal at CareSync Hospital.',
        treatedBy: 'Dr. R. Sundaram, MS, MCh',
      },
    ],
  });

  // Symptoms
  await prisma.symptom.createMany({
    data: [
      {
        patientId: patient.id,
        recordedAt: daysAgo(2),
        symptomName: 'Fatigue & Mild Exertional Shortness of Breath',
        severity: 'MODERATE',
        duration: '4 days',
        notes: 'Patient feels tired by late afternoon, mild breathlessness while climbing stairs.',
      },
      {
        patientId: patient.id,
        recordedAt: daysAgo(1),
        symptomName: 'Occasional Morning Dizziness',
        severity: 'MILD',
        duration: '2 days',
        notes: 'Resolves within 10 minutes after sitting down and hydrating.',
      },
    ],
  });

  // Appointments
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(10, 30, 0, 0);

  const nextWeek = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  nextWeek.setHours(14, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: tomorrow,
        timeSlot: '10:30 AM',
        status: 'SCHEDULED',
        type: 'IN_PERSON',
        reason: 'Review of CBC blood panel, BP control and fatigue evaluation',
      },
      {
        patientId: patient.id,
        doctorId: specialist.id,
        appointmentDate: nextWeek,
        timeSlot: '02:00 PM',
        status: 'SCHEDULED',
        type: 'IN_PERSON',
        reason: 'Cardiology Specialist Consultation & ECG/Echo evaluation',
      },
    ],
  });

  console.log('🏥 Seeding Smart Hospital Queue with requested demo tokens...');
  // Hospital: CareSync Multispeciality Hospital, Chennai
  // Department: General Medicine
  // Current Token: A121
  // Patient Token: A127 (Position 6, Estimated Wait: 18 minutes)
  await prisma.queueEntry.createMany({
    data: [
      {
        patientId: patient2.id,
        doctorId: doctor.id,
        department: 'General Medicine',
        tokenNumber: 'A121',
        estimatedWaitTime: 0,
        status: 'IN_CONSULTATION',
        priority: 'NORMAL',
      },
      {
        patientId: patient2.id,
        doctorId: doctor.id,
        department: 'General Medicine',
        tokenNumber: 'A122',
        estimatedWaitTime: 3,
        status: 'WAITING',
        priority: 'NORMAL',
      },
      {
        patientId: patient2.id,
        doctorId: doctor.id,
        department: 'General Medicine',
        tokenNumber: 'A123',
        estimatedWaitTime: 6,
        status: 'WAITING',
        priority: 'HIGH_PRIORITY',
      },
      {
        patientId: patient2.id,
        doctorId: doctor.id,
        department: 'General Medicine',
        tokenNumber: 'A124',
        estimatedWaitTime: 9,
        status: 'WAITING',
        priority: 'NORMAL',
      },
      {
        patientId: patient2.id,
        doctorId: doctor.id,
        department: 'General Medicine',
        tokenNumber: 'A125',
        estimatedWaitTime: 12,
        status: 'WAITING',
        priority: 'NORMAL',
      },
      {
        patientId: patient2.id,
        doctorId: doctor.id,
        department: 'General Medicine',
        tokenNumber: 'A126',
        estimatedWaitTime: 15,
        status: 'WAITING',
        priority: 'NORMAL',
      },
      {
        patientId: patient.id, // Arjun Kumar
        doctorId: doctor.id,
        department: 'General Medicine',
        tokenNumber: 'A127',
        estimatedWaitTime: 18,
        status: 'WAITING',
        priority: 'NORMAL',
      },
    ],
  });

  console.log('📁 Seeding Medical Reports with Complete Blood Count (CBC) & AI extraction...');
  // Complete Blood Count (CBC) for Arjun Kumar
  const cbcExtractedData = {
    reportType: 'CBC',
    date: daysAgo(1).toISOString().split('T')[0],
    importantValues: [
      { parameter: 'Hemoglobin (Hb)', value: '13.8', unit: 'g/dL', referenceRange: '13.5 - 17.5', status: 'NORMAL' },
      { parameter: 'Red Blood Cell (RBC)', value: '4.65', unit: 'million/uL', referenceRange: '4.5 - 5.9', status: 'NORMAL' },
      { parameter: 'Packed Cell Volume (PCV)', value: '42.1', unit: '%', referenceRange: '40.0 - 50.0', status: 'NORMAL' },
      { parameter: 'Total Leukocyte Count (WBC)', value: '11,200', unit: '/uL', referenceRange: '4,000 - 10,500', status: 'ABNORMAL_HIGH' },
      { parameter: 'Platelet Count', value: '240,000', unit: '/uL', referenceRange: '150,000 - 450,000', status: 'NORMAL' },
      { parameter: 'Neutrophils', value: '74', unit: '%', referenceRange: '40 - 70', status: 'ABNORMAL_HIGH' },
      { parameter: 'Lymphocytes', value: '20', unit: '%', referenceRange: '20 - 40', status: 'NORMAL' },
      { parameter: 'Monocytes', value: '4', unit: '%', referenceRange: '2 - 8', status: 'NORMAL' },
      { parameter: 'Eosinophils', value: '2', unit: '%', referenceRange: '1 - 6', status: 'NORMAL' },
      { parameter: 'Basophils', value: '0', unit: '%', referenceRange: '0 - 1', status: 'NORMAL' },
      { parameter: 'ESR (Erythrocyte Sedimentation Rate)', value: '18', unit: 'mm/1st hr', referenceRange: '0 - 15', status: 'ABNORMAL_HIGH' },
    ],
    abnormalValues: [
      { parameter: 'Total WBC Count', value: '11,200 /uL', note: 'Mild leukocytosis, possible low-grade inflammatory or infectious response.' },
      { parameter: 'Neutrophil Percentage', value: '74%', note: 'Slight relative neutrophilia.' },
      { parameter: 'ESR', value: '18 mm/hr', note: 'Borderline elevated inflammatory marker.' },
    ],
    normalValues: [
      'Hemoglobin (13.8 g/dL) within physiological male adult baseline',
      'Platelet count (240,000 /uL) completely adequate',
      'Red blood cell morphology normal',
      'Lymphocyte count (20%) within target limits',
    ],
    explanation: 'Overall, red blood cell and platelet lineages are healthy with no signs of anemia or thrombocytopenia. The total white blood cell count (11,200 /uL) and neutrophils (74%) are mildly elevated, which can occur with mild seasonal viral or upper airway inflammation.',
    questionsForDoctor: [
      'Does the mild WBC elevation correlate with my recent throat/sinus symptoms?',
      'Should I repeat the complete blood count in 2 to 3 weeks?',
      'Is any antibiotic or supportive anti-inflammatory therapy indicated?',
    ],
    disclaimer: 'AI-generated informational summary. This does not replace professional medical diagnosis or treatment.',
  };

  const report1 = await prisma.report.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      reportType: 'CBC',
      title: 'Complete Blood Count (CBC) with Differential',
      description: 'Full automated hemogram and differential leukocyte analysis from CareSync Central Lab.',
      fileName: 'CBC_Arjun_Kumar_Sep2026.pdf',
      filePath: '/uploads/reports/CBC_Arjun_Kumar_Sep2026.pdf',
      fileType: 'pdf',
      uploadDate: daysAgo(1),
      createdBy: doctorUser.id,
      status: 'COMPLETED',
      aiSummary: 'RBC (4.65 M/uL) and Platelets (240k /uL) are normal. Mildly elevated WBC (11,200 /uL) with 74% Neutrophils suggesting mild reactive response. Hemoglobin normal at 13.8 g/dL.',
      extractedText: `CARESYNC MULTISPECIALITY HOSPITAL, CHENNAI\nDEPARTMENT OF PATHOLOGY\nPatient: Arjun Kumar | Age: 62 Y | Sex: Male | Ref By: Dr. Priya Sharma\nDate: ${daysAgo(1).toLocaleDateString('en-IN')}\n\nCOMPLETE BLOOD COUNT:\nHemoglobin: 13.8 g/dL (13.5-17.5)\nRBC: 4.65 M/uL (4.5-5.9)\nPCV: 42.1 % (40-50)\nWBC Total: 11,200 /uL [HIGH] (4,000-10,500)\nPlatelets: 240,000 /uL (150,000-450,000)\nNeutrophils: 74 % [HIGH] (40-70)\nLymphocytes: 20 % (20-40)\nMonocytes: 4 % (2-8)\nEosinophils: 2 % (1-6)\nESR: 18 mm/hr [HIGH] (0-15)\nImpression: Mild leukocytosis with relative neutrophilia. No atypical cells seen.`,
      extractedData: JSON.stringify(cbcExtractedData),
      visibility: 'NORMAL',
      sharedWithDoctor: true,
      sharedWithPatient: true,
      files: {
        create: {
          fileUrl: '/uploads/reports/CBC_Arjun_Kumar_Sep2026.pdf',
          fileSize: 312000,
          mimeType: 'application/pdf',
        },
      },
    },
  });

  // Lipid Profile & Blood Sugar
  const lipidExtractedData = {
    reportType: 'Lipid Profile',
    date: daysAgo(15).toISOString().split('T')[0],
    importantValues: [
      { parameter: 'Total Cholesterol', value: '188', unit: 'mg/dL', referenceRange: '< 200', status: 'NORMAL' },
      { parameter: 'Triglycerides', value: '162', unit: 'mg/dL', referenceRange: '< 150', status: 'ABNORMAL_HIGH' },
      { parameter: 'HDL Cholesterol', value: '44', unit: 'mg/dL', referenceRange: '> 40', status: 'NORMAL' },
      { parameter: 'LDL Cholesterol', value: '112', unit: 'mg/dL', referenceRange: '< 100', status: 'ABNORMAL_HIGH' },
      { parameter: 'Fasting Blood Glucose', value: '118', unit: 'mg/dL', referenceRange: '70 - 100', status: 'ABNORMAL_HIGH' },
      { parameter: 'HbA1c', value: '6.8', unit: '%', referenceRange: '< 5.7', status: 'ABNORMAL_HIGH' },
    ],
    abnormalValues: [
      { parameter: 'Fasting Blood Sugar', value: '118 mg/dL', note: 'Mildly elevated fasting hyperglycemia.' },
      { parameter: 'HbA1c', value: '6.8%', note: 'Consistent with managed Type 2 Diabetes.' },
      { parameter: 'Triglycerides & LDL', value: '162 & 112 mg/dL', note: 'Borderline high lipid parameters.' },
    ],
    normalValues: [
      'Total cholesterol is within satisfactory range (188 mg/dL)',
      'HDL cholesterol above male protective cutoff of 40 mg/dL',
    ],
    explanation: 'Fasting sugar and HbA1c reflect fair diabetic control under Metformin. LDL is slightly above the recommended target of <100 for patients with cardiovascular risk factors.',
    questionsForDoctor: [
      'Should we adjust Metformin dosage or consider adding an evening medication?',
      'Do I need to start a low-dose statin for LDL management?',
    ],
    disclaimer: 'AI-generated informational summary. This does not replace professional medical diagnosis or treatment.',
  };

  await prisma.report.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      reportType: 'Lipid Profile',
      title: 'Fasting Lipid Profile & Glycemic Panel (HbA1c)',
      description: 'Routine quarterly metabolic evaluation for diabetic and cardiovascular monitoring.',
      fileName: 'Lipid_HbA1c_Arjun_Kumar.pdf',
      filePath: '/uploads/reports/Lipid_HbA1c_Arjun_Kumar.pdf',
      fileType: 'pdf',
      uploadDate: daysAgo(15),
      createdBy: doctorUser.id,
      status: 'COMPLETED',
      aiSummary: 'HbA1c at 6.8% showing stable glycemic control. Triglycerides (162 mg/dL) and LDL (112 mg/dL) are borderline elevated.',
      extractedText: `CareSync Multispeciality Hospital, Chennai - Biochemistry Lab\nPatient: Arjun Kumar, 62M\nFasting Blood Glucose: 118 mg/dL (70-99)\nHbA1c: 6.8 % (Diabetic target: <7.0%)\nTotal Cholesterol: 188 mg/dL (<200)\nTriglycerides: 162 mg/dL [HIGH] (<150)\nHDL: 44 mg/dL (>40)\nLDL: 112 mg/dL [HIGH] (<100)\nVLDL: 32 mg/dL (<30)`,
      extractedData: JSON.stringify(lipidExtractedData),
      visibility: 'NORMAL',
      sharedWithDoctor: true,
      sharedWithPatient: true,
      files: {
        create: {
          fileUrl: '/uploads/reports/Lipid_HbA1c_Arjun_Kumar.pdf',
          fileSize: 245000,
          mimeType: 'application/pdf',
        },
      },
    },
  });

  // 12-Lead ECG Report
  await prisma.report.create({
    data: {
      patientId: patient.id,
      doctorId: specialist.id,
      reportType: 'ECG',
      title: '12-Lead Resting Electrocardiogram',
      description: 'Cardiology evaluation following mild exertional fatigue.',
      fileName: 'ECG_Arjun_Kumar_Aug2026.pdf',
      filePath: '/uploads/reports/ECG_Arjun_Kumar_Aug2026.pdf',
      fileType: 'pdf',
      uploadDate: daysAgo(25),
      createdBy: specialistUser.id,
      status: 'COMPLETED',
      aiSummary: 'Sinus rhythm at 78 bpm. Normal axis. No pathological Q waves or acute ST-T deviations. Borderline left ventricular voltage criteria noted.',
      extractedText: 'Rate: 78 bpm. PR: 160 ms. QRS: 90 ms. QT/QTc: 390/420 ms. Normal Sinus Rhythm. Mild LV voltage elevation compatible with essential hypertension.',
      extractedData: JSON.stringify({
        reportType: 'ECG',
        date: daysAgo(25).toISOString().split('T')[0],
        importantValues: [
          { parameter: 'Heart Rate', value: '78', unit: 'bpm', referenceRange: '60 - 100', status: 'NORMAL' },
          { parameter: 'Rhythm', value: 'Normal Sinus', unit: '', referenceRange: 'Sinus', status: 'NORMAL' },
          { parameter: 'PR Interval', value: '160', unit: 'ms', referenceRange: '120 - 200', status: 'NORMAL' },
          { parameter: 'QRS Duration', value: '90', unit: 'ms', referenceRange: '< 120', status: 'NORMAL' },
        ],
        abnormalValues: [],
        normalValues: ['Normal sinus rate', 'Intact atrioventricular conduction', 'No acute ischemic changes'],
        explanation: 'The ECG confirms normal cardiac electrical conduction with no acute ischemia or infarction.',
        questionsForDoctor: ['Is an Echocardiogram recommended to evaluate heart muscle thickness given hypertension history?'],
        disclaimer: 'AI-generated informational summary. This does not replace professional medical diagnosis or treatment.',
      }),
      visibility: 'NORMAL',
      sharedWithDoctor: true,
      sharedWithPatient: true,
      files: {
        create: {
          fileUrl: '/uploads/reports/ECG_Arjun_Kumar_Aug2026.pdf',
          fileSize: 180000,
          mimeType: 'application/pdf',
        },
      },
    },
  });

  // Prescription
  await prisma.report.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      reportType: 'Prescription',
      title: 'Current Prescriptions — Diabetes & Hypertension Regimen',
      description: 'Prescription formulated by Dr. Priya Sharma at CareSync Multispeciality Hospital.',
      fileName: 'Prescription_DrPriyaSharma_Sep2026.pdf',
      filePath: '/uploads/reports/Prescription_DrPriyaSharma_Sep2026.pdf',
      fileType: 'pdf',
      uploadDate: daysAgo(2),
      createdBy: doctorUser.id,
      status: 'COMPLETED',
      aiSummary: 'Active medications: Metformin 500mg BD after meals; Telmisartan 40mg OD in morning; Multivitamin B-Complex OD.',
      extractedText: 'Rx:\n1. Tab. Metformin 500mg - 1 tab twice daily after breakfast and dinner.\n2. Tab. Telmisartan 40mg - 1 tab once daily after breakfast.\n3. Cap. Becosules (B-Complex + Vit C) - 1 cap daily for 30 days.\nDr. Priya Sharma, MBBS, MD (Gen Med), Reg: TN-MC-44821',
      extractedData: JSON.stringify({
        reportType: 'Prescription',
        date: daysAgo(2).toISOString().split('T')[0],
        importantValues: [
          { parameter: 'Metformin', value: '500 mg BD', unit: 'Oral', referenceRange: 'Standard', status: 'NORMAL' },
          { parameter: 'Telmisartan', value: '40 mg OD', unit: 'Oral', referenceRange: 'Standard', status: 'NORMAL' },
        ],
        abnormalValues: [],
        normalValues: ['Standard antihypertensive and glycemic dosages for 62-year-old male'],
        explanation: 'Dual regimen targeting blood glucose control and systolic blood pressure maintenance.',
        questionsForDoctor: ['Should Metformin be taken strictly after meals to reduce gastrointestinal upset?'],
        disclaimer: 'AI-generated informational summary. This does not replace professional medical diagnosis or treatment.',
      }),
      visibility: 'NORMAL',
      sharedWithDoctor: true,
      sharedWithPatient: true,
      files: {
        create: {
          fileUrl: '/uploads/reports/Prescription_DrPriyaSharma_Sep2026.pdf',
          fileSize: 120000,
          mimeType: 'application/pdf',
        },
      },
    },
  });

  console.log('👴 Seeding Elderly Care realistic telemetry for Arjun Kumar (Caregiver: Meena Kumar)...');
  await prisma.elderlyMonitoring.create({
    data: {
      patientId: patient.id,
      fallDetected: false,
      mobilityScore: 84, // 0-100
      medicationTaken: true,
      lastCheckIn: daysAgo(0),
      caregiverAlertSent: false,
      notes: 'Morning walk completed (3,400 steps). Hydration on track at 1.8L. Caregiver Meena Kumar visited at 08:30 AM.',
    },
  });

  console.log('🧘 Seeding Mental Wellness Daily Journal entries...');
  for (let i = 6; i >= 0; i--) {
    await prisma.wellnessEntry.create({
      data: {
        patientId: patient.id,
        date: daysAgo(i),
        moodScore: 7 + (i % 2 === 0 ? 1 : 0),
        sleepHours: 6.8 + (i * 0.1),
        stressLevel: i === 2 ? 'MODERATE' : 'LOW',
        waterIntakeLiters: 2.1 + (i * 0.05),
        activityMinutes: 35 + (i * 5),
        notes: i === 0
          ? 'Walked in Semmozhi Poonga park. Slept soundly for 7.2 hours. Feeling relaxed and positive.'
          : 'Normal day with family. Did light yoga and breathing exercises.',
      },
    });
  }

  console.log('⚠️ Seeding Alerts and Notifications...');
  // Alerts
  await prisma.alert.createMany({
    data: [
      {
        patientId: patient.id,
        severity: 'MEDIUM',
        title: 'Mild WBC & Neutrophil Elevation',
        message: 'Recent Complete Blood Count (CBC) showed total WBC at 11,200 /uL (Reference: 4,000-10,500).',
        status: 'ACTIVE',
      },
      {
        patientId: patient.id,
        severity: 'LOW',
        title: 'Systolic BP Alert',
        message: 'Home sensor recorded BP 140/90 mmHg yesterday afternoon. Recommended rest and recheck.',
        status: 'ACKNOWLEDGED',
      },
    ],
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: patientUser.id,
        title: 'Doctor Received CBC Report',
        message: 'Dr. Priya Sharma received your CBC report.',
        type: 'REPORT',
        isRead: false,
        linkUrl: '/patient/reports',
      },
      {
        userId: patientUser.id,
        title: 'AI Clinical Summary Ready',
        message: 'Your AI report is ready.',
        type: 'SYSTEM',
        isRead: false,
        linkUrl: '/patient/reports',
      },
      {
        userId: patientUser.id,
        title: 'Report Reviewed',
        message: 'Dr. Priya Sharma reviewed your report.',
        type: 'REPORT',
        isRead: true,
        linkUrl: '/patient/reports',
      },
      {
        userId: patientUser.id,
        title: 'Case Transfer Update',
        message: 'Your case was transferred to Cardiology (Dr. Karthik Raj).',
        type: 'TRANSFER',
        isRead: false,
        linkUrl: '/patient/transfers',
      },
      {
        userId: patientUser.id,
        title: 'Caregiver Update',
        message: 'Caregiver Meena Kumar was notified.',
        type: 'REMINDER',
        isRead: true,
        linkUrl: '/patient/elderly',
      },
      {
        userId: doctorUser.id,
        title: 'New CBC Report Uploaded',
        message: 'Arjun Kumar shared a Complete Blood Count (CBC) report for review.',
        type: 'REPORT',
        isRead: false,
        linkUrl: '/doctor/reports',
      },
      {
        userId: doctorUser.id,
        title: 'Referral Request Pending',
        message: 'Specialist consultation referral prepared for Dr. Karthik Raj (Cardiology).',
        type: 'TRANSFER',
        isRead: false,
        linkUrl: '/doctor/transfers',
      },
    ],
  });

  console.log('🔄 Seeding Transfers and Patient Timeline...');
  // Transfer: Patient -> Doctor, Doctor -> Specialist
  await prisma.transfer.createMany({
    data: [
      {
        patientId: patient.id,
        senderRole: 'PATIENT',
        senderId: patientUser.id,
        senderName: 'Arjun Kumar',
        receiverRole: 'DOCTOR',
        receiverId: doctor.id,
        receiverName: 'Dr. Priya Sharma',
        reason: 'Sharing latest CBC blood report and 7-day vital telemetry for review prior to OPD visit.',
        sharedItems: JSON.stringify(['Complete Blood Count (CBC)', '7-Day BP & SpO2 Telemetry', 'Active Symptoms']),
        status: 'COMPLETED',
        notes: 'Reports synchronized with Dr. Priya Sharma OPD chart.',
      },
      {
        patientId: patient.id,
        senderRole: 'DOCTOR',
        senderId: doctor.id,
        senderName: 'Dr. Priya Sharma',
        receiverRole: 'SPECIALIST',
        receiverId: specialist.id,
        receiverName: 'Dr. Karthik Raj (Cardiology)',
        reason: 'Referral for cardiac evaluation: Exertional fatigue, Stage 1 hypertension, and ECG voltage review.',
        sharedItems: JSON.stringify(['12-Lead ECG', 'Lipid Profile', 'Blood Sugar (HbA1c)', 'Clinical Consultation Summary']),
        status: 'PENDING',
        notes: 'Referred to Cardiology Suite 302 for comprehensive 2D Echo.',
      },
    ],
  });

  // Timeline
  await prisma.patientTimeline.createMany({
    data: [
      {
        patientId: patient.id,
        eventDate: daysAgo(1),
        eventType: 'LAB_TEST',
        title: 'CBC Blood Panel Uploaded',
        description: 'Automated CBC analyzed with AI interpretation at CareSync Multispeciality Hospital.',
        icon: 'FileText',
      },
      {
        patientId: patient.id,
        eventDate: daysAgo(1),
        eventType: 'TRANSFER',
        title: 'Report Shared with Dr. Priya Sharma',
        description: 'Arjun Kumar shared CBC and recent vitals directly with General Medicine OPD.',
        icon: 'Share2',
      },
      {
        patientId: patient.id,
        eventDate: daysAgo(2),
        eventType: 'PRESCRIPTION',
        title: 'Metformin & Telmisartan Regimen Verified',
        description: 'Dr. Priya Sharma renewed monthly prescription with dietary guidelines.',
        icon: 'Pill',
      },
      {
        patientId: patient.id,
        eventDate: daysAgo(15),
        eventType: 'LAB_TEST',
        title: 'Lipid Profile & HbA1c Completed',
        description: 'HbA1c verified at 6.8% showing satisfactory glycemic management.',
        icon: 'Activity',
      },
      {
        patientId: patient.id,
        eventDate: daysAgo(25),
        eventType: 'DIAGNOSIS',
        title: '12-Lead ECG Evaluation',
        description: 'Resting ECG evaluated by Dr. Karthik Raj at Cardiology Department.',
        icon: 'Heart',
      },
    ],
  });

  console.log('📋 Seeding Consolidated AI Patient Report (19 Sections)...');
  await prisma.aIPatientReport.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      status: 'FINALIZED',
      reportTitle: 'CareSync AI Comprehensive Clinical Health Summary',
      chiefComplaint: 'Fatigue and mild exertional breathlessness over past 4 days.',
      symptoms: JSON.stringify([
        { symptom: 'Fatigue & Exertional Shortness of Breath', severity: 'MODERATE', duration: '4 days' },
        { symptom: 'Occasional Morning Dizziness', severity: 'MILD', duration: '2 days' },
      ]),
      patientInfo: JSON.stringify({
        name: 'Arjun Kumar',
        age: 62,
        gender: 'Male',
        bloodGroup: 'B+',
        uhid: 'CSH-MAA-2026-8941',
        hospital: 'CareSync Multispeciality Hospital, Chennai, Tamil Nadu',
        phone: '+91 98401 23456',
        emergencyContact: 'Meena Kumar (Daughter) - +91 98404 56789',
        address: '42 Anna Salai, T. Nagar, Chennai 600017',
      }),
      medicalHistory: JSON.stringify([
        'Type 2 Diabetes Mellitus (Diagnosed 2018, Managed on Metformin 500mg BD)',
        'Essential Hypertension Stage 1 (Diagnosed 2020, on Telmisartan 40mg OD)',
        'Laparoscopic Cholecystectomy (2015, CareSync Multispeciality Hospital, Uncomplicated)',
      ]),
      allergies: 'Penicillin, Sulfa drugs',
      medications: JSON.stringify([
        'Metformin HCl 500mg - 1 tab twice daily after meals',
        'Telmisartan 40mg - 1 tab once daily morning after breakfast',
        'Becosules B-Complex Capsule - 1 capsule daily after lunch',
      ]),
      familyHistory: 'Father had history of coronary artery disease; Mother had Type 2 diabetes.',
      lifestyle: 'Non-smoker, occasional morning walker (3,000 - 4,000 steps daily), vegetarian Indian diet, tea 2 cups daily.',
      vitals: JSON.stringify({
        bloodPressure: '136/88 mmHg',
        heartRate: '80 bpm',
        temperature: '98.7 °F',
        spO2: '97%',
        respiratoryRate: '17 breaths/min',
        bmi: '25.2 kg/m²',
      }),
      uploadedReports: JSON.stringify([
        'Complete Blood Count (CBC) - Sep 2026',
        'Lipid Profile & HbA1c Panel - Sep 2026',
        '12-Lead Electrocardiogram (ECG) - Aug 2026',
        'Prescription Record - Sep 2026',
      ]),
      aiSummaries: 'Blood count shows mild leukocytosis (11,200 /uL) with 74% neutrophils. HbA1c is stable at 6.8%. ECG indicates normal sinus rhythm with mild voltage elevation consistent with hypertension.',
      riskScreening: 'Moderate Cardiovascular Risk score based on age (62), hypertension, and diabetes. Glycemic control is satisfactory.',
      mentalWellness: 'Daily wellness tracking shows stable mood (7.5/10), low stress, and 7.1 hours average restorative sleep.',
      elderlyCare: 'Mobility score 84/100, zero falls reported, 100% medication adherence. Caregiver Meena Kumar actively involved.',
      timeline: 'Sep 2026: CBC & Vitals upload -> Review by Dr. Priya Sharma -> Cardiology referral generated.',
      aiOverallSummary: 'Patient Arjun Kumar (62M) exhibits well-maintained diabetic and blood pressure indices with transient mild reactive leukocytosis on recent CBC. Cardiovascular surveillance recommended via Cardiology follow-up.',
      questionsForDoctor: JSON.stringify([
        'Could the mild WBC elevation be related to seasonal throat irritation?',
        'Is an echocardiogram advised for routine cardiovascular baseline?',
        'Should we continue the current Metformin and Telmisartan dosages without alteration?',
      ]),
      doctorNotes: 'Patient clinically stable today. Lungs clear to auscultation bilaterally. S1/S2 heard normal, no murmurs. Advised warm saline gargles and hydration. Metformin & Telmisartan continued. Referred to Dr. Karthik Raj for routine cardiac echo clearance.',
      finalClinicalReview: 'Reviewed and finalized by Dr. Priya Sharma, MD. Patient advised routine OPD follow-up in 4 weeks or earlier if symptoms change.',
      reviewedBy: 'Dr. Priya Sharma',
      reviewedAt: daysAgo(0),
      finalizedBy: 'Dr. Priya Sharma',
      finalizedAt: daysAgo(0),
    },
  });

  console.log('📜 Seeding Compliance Audit Log...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: patientUser.id,
        userName: 'Arjun Kumar',
        userRole: 'PATIENT',
        action: 'UPLOAD',
        entityType: 'REPORT',
        entityId: report1.id,
        details: 'Uploaded Complete Blood Count (CBC) PDF from CareSync Central Lab.',
      },
      {
        userId: patientUser.id,
        userName: 'Arjun Kumar',
        userRole: 'PATIENT',
        action: 'VIEW',
        entityType: 'REPORT',
        entityId: report1.id,
        details: 'Viewed AI clinical summary and reference ranges for CBC.',
      },
      {
        userId: patientUser.id,
        userName: 'Arjun Kumar',
        userRole: 'PATIENT',
        action: 'SHARE',
        entityType: 'REPORT',
        entityId: report1.id,
        details: 'Shared CBC report with Dr. Priya Sharma (General Medicine).',
      },
      {
        userId: doctorUser.id,
        userName: 'Dr. Priya Sharma',
        userRole: 'DOCTOR',
        action: 'REVIEW',
        entityType: 'REPORT',
        entityId: report1.id,
        details: 'Dr. Priya Sharma reviewed CBC report and acknowledged WBC 11,200 /uL.',
      },
      {
        userId: doctorUser.id,
        userName: 'Dr. Priya Sharma',
        userRole: 'DOCTOR',
        action: 'TRANSFER',
        entityType: 'TRANSFER',
        details: 'Initiated referral transfer to Dr. Karthik Raj (Cardiology Specialist).',
      },
      {
        userId: doctorUser.id,
        userName: 'Dr. Priya Sharma',
        userRole: 'DOCTOR',
        action: 'FINALIZE',
        entityType: 'AI_REPORT',
        details: 'Finalized consolidated 19-section AI Patient Clinical Report for Arjun Kumar.',
      },
    ],
  });

  // Demo AI Conversation
  const aiConvo = await prisma.aIConversation.create({
    data: {
      userId: patientUser.id,
      title: 'Questions about CBC, Blood Pressure & Fatigue',
    },
  });

  await prisma.aIMessage.createMany({
    data: [
      {
        conversationId: aiConvo.id,
        sender: 'USER',
        content: 'Hi CareSync, can you explain what my CBC total WBC count of 11,200 means?',
      },
      {
        conversationId: aiConvo.id,
        sender: 'ASSISTANT',
        content: `Hello Arjun Kumar! A Total White Blood Cell (WBC) count of 11,200 /uL is slightly above the standard reference range (4,000–10,500 /uL). White blood cells are part of your body's immune defense, and a mild increase can be a normal reactive response to minor seasonal throat or sinus irritation, stress, or low-grade inflammation. 

Your Hemoglobin (13.8 g/dL) and Platelet counts (240,000 /uL) are both completely normal. Dr. Priya Sharma has received your CBC report and will review it during your consultation at CareSync Multispeciality Hospital.

*AI-generated informational summary. This does not replace professional medical diagnosis or treatment.*`,
      },
    ],
  });

  console.log('✅ CareSync AI Indian Demo Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
