"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEALTH_ASSESSMENT_QUESTIONS = void 0;
exports.sendMessage = sendMessage;
exports.generateIntakeSummary = generateIntakeSummary;
exports.saveConversation = saveConversation;
exports.getConversations = getConversations;
exports.getAssessmentQuestions = getAssessmentQuestions;
const index_js_1 = require("../database/index.js");
// ---- Environment config for future external AI API ----
const AI_PROVIDER = process.env.AI_PROVIDER || 'local'; // 'local' | 'openai' | 'gemini' | 'anthropic'
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || '';
// ---- Standard disclaimers ----
const MEDICAL_DISCLAIMER = 'I can provide general health information and help organize your medical information, but I cannot provide a medical diagnosis. Please consult a qualified healthcare professional for diagnosis and treatment.';
const EMERGENCY_WARNING = '⚠️ IMPORTANT: Based on what you describe, this could require urgent medical attention. Please contact emergency services (911) or visit the nearest emergency department immediately. Do not delay seeking professional care.';
// ---- Multilingual disclaimer and emergency translations ----
const DISCLAIMERS = {
    en: MEDICAL_DISCLAIMER,
    ta: 'நான் பொதுவான சுகாதார தகவல்களை வழங்க முடியும் மற்றும் உங்கள் மருத்துவ தகவல்களை ஒழுங்கமைக்க உதவ முடியும், ஆனால் மருத்துவ நோயறிதலை வழங்க முடியாது. நோயறிதல் மற்றும் சிகிச்சைக்கு தகுதியான சுகாதார நிபுணரை அணுகவும்.',
    hi: 'मैं सामान्य स्वास्थ्य जानकारी प्रदान कर सकता हूँ और आपकी चिकित्सा जानकारी व्यवस्थित करने में मदद कर सकता हूँ, लेकिन मैं चिकित्सा निदान प्रदान नहीं कर सकता। निदान और उपचार के लिए कृपया एक योग्य स्वास्थ्य पेशेवर से परामर्श करें।',
    te: 'నేను సాధారణ ఆరోగ్య సమాచారాన్ని అందించగలను మరియు మీ వైద్య సమాచారాన్ని నిర్వహించడంలో సహాయపడగలను, కానీ వైద్య నిర్ధారణ అందించలేను. నిర్ధారణ మరియు చికిత్స కోసం దయచేసి అర్హత కలిగిన ఆరోగ్య నిపుణుడిని సంప్రదించండి.',
    kn: 'ನಾನು ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಬಹುದು ಮತ್ತು ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿಯನ್ನು ಸಂಘಟಿಸಲು ಸಹಾಯ ಮಾಡಬಹುದು, ಆದರೆ ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವನ್ನು ಒದಗಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ರೋಗನಿರ್ಣಯ ಮತ್ತು ಚಿಕಿತ್ಸೆಗಾಗಿ ದಯವಿಟ್ಟು ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    ml: 'എനിക്ക് പൊതുവായ ആരോഗ്യ വിവരങ്ങൾ നൽകാനും നിങ്ങളുടെ മെഡിക്കൽ വിവരങ്ങൾ ക്രമീകരിക്കാനും സഹായിക്കാനാകും, പക്ഷേ ഒരു മെഡിക്കൽ ഡയഗ്നോസിസ് നൽകാൻ കഴിയില്ല. രോഗനിർണയത്തിനും ചികിത്സയ്ക്കും യോഗ്യതയുള്ള ഒരു ആരോഗ്യ പ്രൊഫഷണലിനെ സമീപിക്കുക.',
    bn: 'আমি সাধারণ স্বাস্থ্য তথ্য সরবরাহ করতে পারি এবং আপনার চিকিৎসা তথ্য সংগঠিত করতে সাহায্য করতে পারি, তবে আমি চিকিৎসা রোগ নির্ণয় দিতে পারি না। রোগ নির্ণয় এবং চিকিৎসার জন্য দয়া করে একজন যোগ্য স্বাস্থ্য পেশাদারের সাথে পরামর্শ করুন।',
};
// ---- Emergency symptom detection ----
const EMERGENCY_KEYWORDS = [
    'chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'cannot breathe',
    'difficulty breathing', 'severe bleeding', 'unconscious', 'seizure', 'suicidal',
    'suicide', 'overdose', 'poisoning', 'choking', 'anaphylaxis', 'severe allergic',
    'paralysis', 'sudden weakness one side', 'crushing chest', 'coughing blood',
    'vomiting blood', 'head injury', 'severe burn', 'drowning',
];
function isEmergency(text) {
    const lower = text.toLowerCase();
    return EMERGENCY_KEYWORDS.some((k) => lower.includes(k));
}
const MEDICAL_KNOWLEDGE = [
    // ---- VITALS & MEASUREMENTS ----
    {
        patterns: [
            'blood pressure', 'bp', 'hypertension', 'high blood pressure', 'low blood pressure', 'hypotension',
            'இரத்த அழுத்தம்', 'ரத்த அழுத்தம்', 'பிபி', 'ரத்தக் கொதிப்பு',
            'रक्तचाप', 'हाई बीपी', 'ब्लड प्रेशर', 'बीपी', 'उच्च रक्तचाप',
            'రక్తపోటు', 'ರಕ್ತದೊತ್ತಡ', 'രക്തസമ്മർദ്ദം', 'রক্তচাপ'
        ],
        category: 'Vitals',
        response: `**Blood Pressure (BP)** measures the force of blood against arterial walls and is expressed as two numbers:

• **Systolic (top number):** Pressure when the heart beats and pumps blood out. Normal: <120 mmHg.
• **Diastolic (bottom number):** Pressure when the heart rests between beats. Normal: <80 mmHg.

**Classification:**
| Category | Systolic | Diastolic |
|---|---|---|
| Normal | <120 | <80 |
| Elevated | 120–129 | <80 |
| Stage 1 Hypertension | 130–139 | 80–89 |
| Stage 2 Hypertension | ≥140 | ≥90 |
| Hypertensive Crisis | >180 | >120 |

**High blood pressure (Hypertension)** often has no obvious symptoms but significantly increases risk of heart disease, stroke, and kidney damage. It is called the "silent killer."

**Low blood pressure (Hypotension)** — systolic below 90 — can cause dizziness, fainting, and fatigue. It can be concerning if it drops suddenly.

**Management tips:**
• Reduce sodium intake (<2,300 mg/day ideally)
• Exercise regularly (150 min/week moderate activity)
• Maintain a healthy weight
• Limit alcohol and quit smoking
• Manage stress through relaxation techniques
• Take prescribed medications as directed`,
        translations: {
            ta: `**இரத்த அழுத்தம் (Blood Pressure):**
இரத்த அழுத்தம் என்பது உங்கள் இரத்த நாளங்கள் வழியாக இரத்தம் பாயும் போது அவற்றின் சுவர்கள் மீது ஏற்படும் அழுத்தமாகும். இது இரண்டு எண்களால் அளவிடப்படுகிறது:

• **சிஸ்டாலிக் (மேல் எண்):** இதயம் துடிக்கும் போது ஏற்படும் அழுத்தம். இயல்பான அளவு: 120 mmHg-க்கு கீழ்.
• **டயஸ்டாலிக் (கீழ் எண்):** இதயத் துடிப்புகளுக்கு இடையே இதயம் ஓய்வெடுக்கும் போது ஏற்படும் அழுத்தம். இயல்பான அளவு: 80 mmHg-க்கு கீழ்.

**இயல்பான அளவுகள்:**
• இயல்பானது: 120/80 mmHg-க்கு கீழ்
• உயர்ந்த அழுத்தம்: 120–129 / 80 mmHg
• நிலை 1 உயர் இரத்த அழுத்தம்: 130–139 / 80–89 mmHg
• நிலை 2 உயர் இரத்த அழுத்தம்: 140/90 mmHg அல்லது அதற்கு மேல்

**பராமரிப்பு ஆலோசனைகள்:**
• உணவில் உப்பின் அளவைக் குறைக்கவும்.
• தினமும் 30 நிமிடங்கள் நடைப்பயிற்சி அல்லது உடற்பயிற்சி செய்யவும்.
• மன அழுத்தத்தைக் குறைத்து நல்ல தூக்கம் பெறவும்.
• மருத்துவர் பரிந்துரைத்த மருந்துகளைத் தவறாமல் உட்கொள்ளவும்.`,
            hi: `**रक्तचाप (Blood Pressure):**
रक्तचाप वह दबाव है जो आपके रक्त वाहिकाओं की दीवारों पर पड़ता है जब हृदय रक्त पंप करता है। इसे दो संख्याओं में मापा जाता है:

• **सिस्टोलिक (ऊपरी संख्या):** जब हृदय धड़कता है और रक्त पंप करता है। सामान्य: 120 mmHg से कम।
• **डायस्टोलिक (निचली संख्या):** धड़कनों के बीच जब हृदय आराम करता है। सामान्य: 80 mmHg से कम।

**रक्तचाप की श्रेणियां:**
• सामान्य: <120/<80 mmHg
• ऊंचा रक्तचाप: 120–129/<80 mmHg
• स्टेज 1 हाइपरटेंशन: 130–139/80–89 mmHg
• स्टेज 2 हाइपरटेंशन: ≥140/≥90 mmHg

**नियंत्रण के उपाय:**
• नमक का सेवन कम करें।
• नियमित रूप से 30 मिनट टहलें या व्यायाम करें।
• तनाव कम करें और पर्याप्त नींद लें।
• डॉक्टर द्वारा बताई गई दवाइयां समय पर लें।`,
        },
        followUps: [
            'How can I lower my blood pressure naturally?',
            'What are the symptoms of hypertension?',
            'How often should I check my blood pressure?',
        ],
    },
    {
        patterns: ['heart rate', 'pulse', 'bpm', 'resting heart rate', 'tachycardia', 'bradycardia', 'heart beat'],
        category: 'Vitals',
        response: `**Heart Rate (Pulse)** is the number of times your heart beats per minute (bpm).

**Normal Resting Heart Rate:**
• Adults: 60–100 bpm
• Well-trained athletes: 40–60 bpm
• Children (6-15): 70–100 bpm

**Key Terms:**
• **Tachycardia:** Heart rate >100 bpm at rest — can be caused by fever, anxiety, caffeine, dehydration, anemia, or heart conditions
• **Bradycardia:** Heart rate <60 bpm at rest — common in athletes but can indicate heart conduction problems

**Factors Affecting Heart Rate:**
• Physical activity and fitness level
• Emotional state (stress, anxiety, excitement)
• Body temperature and fever
• Medications (beta-blockers lower it; stimulants raise it)
• Caffeine, nicotine, and alcohol
• Body position (standing vs lying)

**When to Seek Medical Attention:**
• Persistent resting heart rate >120 bpm without exertion
• Heart rate <40 bpm with dizziness or fainting
• Irregular or skipping heartbeats
• Accompanied by chest pain, shortness of breath, or fainting`,
        followUps: [
            'What causes a high resting heart rate?',
            'How can I lower my heart rate naturally?',
            'Is an irregular heartbeat dangerous?',
        ],
    },
    {
        patterns: ['spo2', 'oxygen saturation', 'blood oxygen', 'pulse oximeter', 'oxygen level', 'o2 saturation'],
        category: 'Vitals',
        response: `**SpO2 (Peripheral Oxygen Saturation)** measures the percentage of hemoglobin in your blood that is carrying oxygen.

**Normal Ranges:**
• **95–100%:** Normal, healthy oxygen saturation
• **90–94%:** Below normal — may indicate respiratory issues; consult your doctor
• **Below 90%:** Clinically significant hypoxemia — seek immediate medical attention

**How It's Measured:**
A pulse oximeter clips onto your fingertip and uses light sensors to estimate blood oxygen levels. Factors that can affect accuracy include:
• Dark nail polish or artificial nails
• Cold hands or poor circulation
• Motion or shivering
• Carbon monoxide exposure (can give falsely normal readings)

**Common Causes of Low SpO2:**
• Asthma or COPD exacerbation
• Pneumonia or lung infections
• Sleep apnea
• High altitude
• Heart failure
• COVID-19 pneumonitis

**When to Seek Emergency Care:**
SpO2 consistently below 92% at rest, especially with shortness of breath, blue-tinged lips or fingertips, confusion, or rapid breathing.`,
        followUps: [
            'How do I use a pulse oximeter correctly?',
            'What causes low oxygen levels?',
            'Can anxiety affect SpO2 readings?',
        ],
    },
    {
        patterns: ['temperature', 'fever', 'body temperature', 'high temperature', 'low grade fever', 'hypothermia'],
        category: 'Vitals',
        response: `**Body Temperature** reflects the balance between heat produced and lost by the body.

**Normal Body Temperature:**
• Oral: 97.8°F – 99.1°F (36.5°C – 37.3°C)
• The "classic" 98.6°F (37°C) is an average; normal varies by individual

**Fever Grades:**
| Grade | Temperature |
|---|---|
| Low-grade fever | 99.1°F – 100.4°F (37.3°C – 38°C) |
| Moderate fever | 100.4°F – 102.2°F (38°C – 39°C) |
| High fever | 102.2°F – 104°F (39°C – 40°C) |
| Very high / Dangerous | Above 104°F (40°C) |

**Fever is a SYMPTOM, not a disease.** It's your body's immune response helping fight infection.

**Common Causes:** Viral/bacterial infections, inflammatory conditions, heat exhaustion, medications, and immunizations.

**Management:**
• Stay well hydrated (water, electrolyte solutions, clear broths)
• Rest and allow your body to recover
• Acetaminophen (Tylenol) or Ibuprofen for discomfort (follow dosing guidelines)
• Light clothing and comfortable room temperature
• Lukewarm (NOT cold) sponge bath if needed

**Seek Medical Care If:**
• Fever above 103°F (39.4°C) in adults
• Fever lasting more than 3 days
• Fever with severe headache, stiff neck, rash, persistent vomiting
• Any fever in infants under 3 months old`,
        followUps: [
            'When should I go to the hospital for a fever?',
            'What is the difference between viral and bacterial fever?',
            'Can stress cause a fever?',
        ],
    },
    // ---- LAB TESTS ----
    {
        patterns: [
            'cbc', 'complete blood count', 'blood count', 'hemoglobin', 'wbc', 'white blood cell', 'red blood cell', 'rbc', 'platelet',
            'சிபிசி', 'இரத்த பரிசோதனை', 'ஹீமோகுளோபின்', 'இரத்த சிவப்பணு', 'வெள்ளையணு', 'பிளேட்லெட்',
            'सीबीसी', 'रक्त परीक्षण', 'खून की जांच', 'हीमोग्लोबिन', 'श्वेत रक्त कण', 'प्लेटलेट्स',
            'కంప్లీట్ బ్లడ్ కౌంట్', 'రక్త పరీక్ష', 'കംപ്ലീറ്റ് ബ്ലഡ് കൗണ്ട്', 'রক্ত পরীক্ষা'
        ],
        category: 'Lab Tests',
        response: `**Complete Blood Count (CBC)** is one of the most common and informative blood tests. It evaluates the cells circulating in your blood:

**1. Red Blood Cells (RBCs) / Hemoglobin / Hematocrit:**
• Carry oxygen from lungs to tissues
• **Hemoglobin** (Hb): Normal — Men: 13.5–17.5 g/dL, Women: 12.0–16.0 g/dL
• Low Hb = **Anemia** (fatigue, weakness, shortness of breath)
• High Hb = possible dehydration, lung disease, or polycythemia

**2. White Blood Cells (WBCs):**
• Immune system fighters against infection
• Normal: 4,500–11,000 cells/μL
• High WBC (**Leukocytosis**): infection, inflammation, stress response, leukemia
• Low WBC (**Leukopenia**): bone marrow problems, autoimmune conditions, some medications

**3. Platelets:**
• Essential for blood clotting and wound repair
• Normal: 150,000–400,000/μL
• Low platelets (**Thrombocytopenia**): risk of easy bruising/bleeding
• High platelets (**Thrombocytosis**): risk of abnormal clotting

**4. Key Indices:**
• **MCV** (Mean Corpuscular Volume): size of red blood cells — helps classify anemia type
• **MCH/MCHC**: hemoglobin concentration per cell

**Why It's Ordered:**
Routine health screening, monitoring chronic conditions, evaluating fatigue or infection symptoms, pre-surgical assessment.`,
        translations: {
            ta: `**சிபிசி (Complete Blood Count - CBC) சோதனை:**
சிபிசி என்பது உங்கள் இரத்தத்தில் உள்ள பல்வேறு செல்களை விரிவாக மதிப்பிடும் ஒரு முக்கியமான ஆய்வகப் பரிசோதனையாகும்:

1. **இரத்த சிவப்பணுக்கள் (RBC) & ஹீமோகுளோபின் (Hb):**
   • நுரையீரலில் இருந்து உடலின் பிற பகுதிகளுக்கு ஆக்சிஜனை எடுத்துச் செல்கிறது.
   • இயல்பான அளவு: ஆண்களுக்கு 13.5–17.5 g/dL, பெண்களுக்கு 12.0–16.0 g/dL.
   • குறைவான அளவு: ரத்த சோகை (அனீமியா), சோர்வு, மூச்சுத்திணறல் ஏற்படலாம்.

2. **இரத்த வெள்ளையணுக்கள் (WBC):**
   • நோய்த்தொற்றுகளுக்கு எதிராக போராடும் நோயெதிர்ப்பு செல்கள்.
   • இயல்பான அளவு: 4,500–11,000 செல்கள்/μL.
   • அதிக அளவு: உடலில் தொற்று அல்லது வீக்கம் இருப்பதைக் குறிக்கிறது.

3. **பிளேட்லெட்டுகள் (Platelets):**
   • காயம் ஏற்படும் போது இரத்தம் உறைவதற்கு உதவுகிறது.
   • இயல்பான அளவு: 1,50,000–4,00,000 /μL.`,
            hi: `**सीबीसी (Complete Blood Count - CBC) टेस्ट:**
सीबीसी एक अत्यंत सामान्य और महत्वपूर्ण रक्त जांच है जो आपके रक्त में मौजूद विभिन्न कोशिकाओं का मूल्यांकन करती है:

1. **लाल रक्त कोशिकाएं (RBC) और हीमोग्लोबिन (Hb):**
   • शरीर के अंगों तक ऑक्सीजन पहुंचाने का कार्य करती हैं।
   • सामान्य स्तर: पुरुषों में 13.5–17.5 g/dL, महिलाओं में 12.0–16.0 g/dL।
   • कम होने पर एनीमिया (थकान, कमजोरी) के लक्षण होते हैं।

2. **श्वेत रक्त कोशिकाएं (WBC):**
   • संक्रमण और बीमारियों से शरीर की रक्षा करती हैं।
   • सामान्य स्तर: 4,500–11,000 कोशिकाएं/μL।
   • संक्रमण होने पर इनकी संख्या बढ़ सकती है।

3. **प्लेटलेट्स (Platelets):**
   • रक्त का थक्का बनाने और रक्तस्राव रोकने के लिए आवश्यक हैं।
   • सामान्य स्तर: 1,50,000–4,00,000 /μL।`,
        },
        followUps: [
            'What does low hemoglobin mean?',
            'How do I prepare for a CBC test?',
            'What causes high white blood cell count?',
        ],
    },
    {
        patterns: ['blood test', 'blood work', 'lab test', 'lab report', 'blood panel', 'metabolic panel', 'cmp', 'bmp', 'lipid panel', 'cholesterol', 'triglycerides', 'hdl', 'ldl'],
        category: 'Lab Tests',
        response: `**Common Blood Tests and Their Purposes:**

**1. Comprehensive Metabolic Panel (CMP):**
Tests 14 substances including glucose, calcium, sodium, potassium, kidney function (BUN, creatinine), and liver enzymes (ALT, AST). Requires 8-12 hour fasting.

**2. Lipid Panel (Cholesterol Test):**
| Component | Optimal Level |
|---|---|
| Total Cholesterol | <200 mg/dL |
| LDL ("Bad" Cholesterol) | <100 mg/dL |
| HDL ("Good" Cholesterol) | >60 mg/dL (protective) |
| Triglycerides | <150 mg/dL |

High LDL and triglycerides increase cardiovascular risk. High HDL is protective.

**3. Fasting Blood Glucose / HbA1c:**
• Fasting Glucose: Normal <100 mg/dL, Prediabetes 100-125, Diabetes ≥126
• HbA1c: Normal <5.7%, Prediabetes 5.7-6.4%, Diabetes ≥6.5%
• HbA1c reflects average blood sugar over 2-3 months

**4. Thyroid Function (TSH, T3, T4):**
Evaluates thyroid gland activity — underactive (hypothyroid) or overactive (hyperthyroid).

**Preparation Tips:**
• Fast 8-12 hours if instructed (water is OK)
• Inform your provider about all medications and supplements
• Avoid strenuous exercise 24 hours before
• Stay hydrated — easier blood draw`,
        followUps: [
            'What does high cholesterol mean for my health?',
            'How do I prepare for a fasting blood test?',
            'What does high blood sugar indicate?',
        ],
    },
    {
        patterns: ['urine test', 'urinalysis', 'urine analysis', 'urine sample'],
        category: 'Lab Tests',
        response: `**Urinalysis (Urine Test)** analyzes the physical, chemical, and microscopic properties of urine. It helps evaluate kidney function, detect urinary infections, and screen for metabolic disorders.

**What It Checks:**
• **Color & Clarity:** Pale yellow is normal; dark/cloudy may indicate dehydration or infection
• **pH:** Normal 4.5–8.0; indicates acid-base balance
• **Protein:** Normally absent; presence may indicate kidney disease
• **Glucose:** Normally absent; presence suggests diabetes
• **Ketones:** Indicate fat metabolism; elevated in uncontrolled diabetes or fasting
• **Blood:** May indicate infection, kidney stones, or bladder conditions
• **Bacteria/WBC:** Suggest urinary tract infection (UTI)
• **Specific Gravity:** Measures concentration; indicates hydration status

**Common Reasons for Testing:**
• Routine health checkup
• Symptoms of UTI (burning, frequency, urgency)
• Monitoring diabetes or kidney disease
• Pregnancy screening
• Pre-operative assessment

**Collection Tips:**
• Clean-catch midstream sample is standard
• First morning sample is typically most concentrated
• Avoid contamination by following instructions carefully`,
        followUps: [
            'What do proteins in urine indicate?',
            'How is a urine culture different from urinalysis?',
            'What causes blood in urine?',
        ],
    },
    // ---- COMMON SYMPTOMS ----
    {
        patterns: ['fever and cough', 'cough and fever', 'cold and fever', 'flu', 'influenza', 'viral infection', 'cold symptoms'],
        category: 'Symptoms',
        response: `**Fever with Cough** is one of the most common symptom combinations and usually indicates a respiratory infection.

**Possible Causes:**
• **Common Cold (Viral):** Low-grade fever, runny nose, sneezing, mild cough — usually resolves in 7-10 days
• **Influenza (Flu):** Higher fever (100-104°F), body aches, fatigue, dry cough — more severe than a cold
• **COVID-19:** Fever, cough, fatigue, loss of taste/smell — varies widely; test if suspected
• **Bronchitis:** Persistent cough (may produce mucus), chest discomfort, low fever
• **Pneumonia:** High fever, productive cough, chest pain with breathing, shortness of breath — needs medical evaluation
• **Sinusitis:** Facial pressure, nasal congestion, post-nasal drip, low fever

**Home Care for Mild Cases:**
• Rest and ensure adequate sleep
• Drink plenty of fluids (water, warm soups, herbal teas, electrolytes)
• Honey with warm water for cough relief (adults and children >1 year)
• Over-the-counter fever reducers (acetaminophen/ibuprofen as directed)
• Gargle with warm salt water for sore throat
• Use a humidifier to ease congestion
• Cover coughs and wash hands frequently to prevent spread

**See a Doctor If:**
• Fever above 103°F or lasting more than 3 days
• Difficulty breathing or shortness of breath
• Chest pain or severe cough producing bloody or unusual mucus
• Symptoms worsen after initial improvement
• You have chronic conditions (diabetes, heart/lung disease, weakened immunity)`,
        followUps: [
            'How can I tell if it is viral or bacterial?',
            'When should I take antibiotics for a cough?',
            'How can I boost my immune system?',
        ],
    },
    {
        patterns: ['headache', 'head pain', 'migraine', 'tension headache'],
        category: 'Symptoms',
        response: `**Headaches** are among the most common health complaints. Understanding the type helps with management.

**Types of Headaches:**

**1. Tension Headache (most common):**
• Dull, aching pressure around the forehead or back of the head
• Often related to stress, poor posture, eye strain, or dehydration
• Usually responds to OTC pain relievers, hydration, and rest

**2. Migraine:**
• Intense, throbbing pain — usually on one side
• May include nausea, light/sound sensitivity, visual disturbances (aura)
• Can last 4–72 hours
• Triggers: stress, certain foods, hormonal changes, weather, sleep disruption

**3. Cluster Headache:**
• Severe, sharp pain around one eye
• Occurs in clusters/cycles — can last weeks
• Requires medical management

**4. Sinus Headache:**
• Pain/pressure in forehead, cheeks, or around the eyes
• Often with nasal congestion or discharge
• Related to sinus infection or allergies

**General Management:**
• Stay well hydrated
• Get regular, adequate sleep
• Manage stress with relaxation techniques
• Take breaks from screens (20-20-20 rule)
• OTC pain relief: Acetaminophen or Ibuprofen for occasional use

**Seek Immediate Medical Care If:**
• Sudden, severe headache ("worst headache of my life" — thunderclap headache)
• Headache with fever, stiff neck, confusion, seizures, or vision changes
• Headache after a head injury
• Progressive headaches that get worse over days/weeks`,
        followUps: [
            'What triggers migraines?',
            'Can dehydration cause headaches?',
            'When should I see a doctor for headaches?',
        ],
    },
    // ---- MEDICAL IMAGING ----
    {
        patterns: ['x-ray', 'xray', 'radiograph', 'chest x-ray', 'x ray'],
        category: 'Imaging',
        response: `**X-Ray (Radiography)** uses controlled ionizing radiation to create images of internal body structures.

**Common Uses:**
• **Chest X-Ray:** Evaluates lungs, heart size, rib fractures, pneumonia, and fluid accumulation
• **Bone X-Ray:** Detects fractures, dislocations, arthritis, bone tumors
• **Dental X-Ray:** Cavities, impacted teeth, jaw alignment
• **Abdominal X-Ray:** Intestinal obstruction, kidney stones, swallowed objects

**Preparation:**
• Usually no special preparation needed
• Remove jewelry or metal objects from the area being imaged
• Wear a lead apron to protect other body parts
• Inform your technologist if you are or might be pregnant

**Safety:**
• Modern X-rays use very low radiation doses
• A single chest X-ray exposes you to about 0.1 mSv — equivalent to ~10 days of natural background radiation
• Benefits of diagnosis typically far outweigh the minimal risk

**Results:**
• Images are reviewed by a radiologist
• Results are typically available within 24-48 hours
• Your doctor will explain findings and recommended next steps`,
        followUps: [
            'Is X-ray radiation dangerous?',
            'What is the difference between X-ray and CT scan?',
            'How often is it safe to have X-rays?',
        ],
    },
    {
        patterns: ['ecg', 'ekg', 'electrocardiogram', 'heart test', 'cardiac test'],
        category: 'Cardiac',
        response: `**ECG/EKG (Electrocardiogram)** is a non-invasive test that records the electrical activity of your heart.

**What It Detects:**
• Heart rhythm (regular vs irregular — arrhythmias)
• Heart rate
• Evidence of a current or past heart attack
• Heart chamber enlargement
• Effects of medications and electrolyte imbalances
• Conduction abnormalities (how electrical signals travel through the heart)

**Key Components of an ECG:**
• **P wave:** Atrial depolarization (contraction of upper chambers)
• **QRS complex:** Ventricular depolarization (contraction of lower chambers)
• **T wave:** Ventricular repolarization (recovery phase)
• **PR interval:** Time from atrial to ventricular activation
• **QT interval:** Duration of ventricular electrical cycle

**The Procedure:**
• Takes only 5–10 minutes
• Electrodes (small sticky patches) placed on your chest, arms, and legs
• Completely painless — no electrical shocks are delivered
• Lie still and breathe normally during the recording

**Types:**
• **Resting ECG:** Standard, done while lying down
• **Stress ECG (Exercise/Treadmill Test):** Monitored while exercising
• **Holter Monitor:** Portable device worn for 24–48 hours for continuous monitoring
• **Event Monitor:** Worn for weeks, records only when symptoms occur`,
        followUps: [
            'What does an abnormal ECG mean?',
            'How do I prepare for an ECG?',
            'What is a Holter monitor?',
        ],
    },
    {
        patterns: ['mri', 'magnetic resonance', 'mri scan'],
        category: 'Imaging',
        response: `**MRI (Magnetic Resonance Imaging)** uses powerful magnets and radio waves to create detailed images of organs and tissues — without radiation.

**Best For:**
• Brain and spinal cord conditions (tumors, stroke, multiple sclerosis)
• Joint and musculoskeletal injuries (ligament tears, disc herniation)
• Heart and blood vessel imaging
• Abdominal and pelvic organ evaluation
• Breast imaging (breast MRI)

**Preparation:**
• Remove all metal objects (jewelry, watches, piercings)
• Inform staff about any metal implants (pacemakers, joint replacements, etc.)
• Some MRIs require contrast dye injected through an IV
• You may need to fast for 4-6 hours before certain studies

**During the Scan:**
• You lie inside a large tube-shaped magnet
• The machine makes loud tapping/knocking sounds — earplugs or music provided
• Duration: 30–90 minutes depending on the study
• You must remain very still for clear images
• Claustrophobia concerns? Open MRI or sedation options may be available

**Safety:**
• No ionizing radiation — generally very safe
• Not recommended with certain metal implants or devices
• Contrast dye (Gadolinium) is very safe; rarely causes allergic reactions`,
        followUps: [
            'Is MRI safe during pregnancy?',
            'What is the difference between MRI and CT scan?',
            'Can I have an MRI with metal implants?',
        ],
    },
    {
        patterns: ['ct scan', 'cat scan', 'computed tomography'],
        category: 'Imaging',
        response: `**CT Scan (Computed Tomography)** combines X-ray images taken from different angles with computer processing to create cross-sectional images.

**Common Uses:**
• Detecting and staging cancers/tumors
• Evaluating trauma injuries (head, chest, abdomen)
• Diagnosing blood clots (pulmonary embolism)
• Detecting internal bleeding
• Kidney stones
• Appendicitis and other abdominal emergencies
• Guiding biopsies and surgical planning

**Advantages over X-ray:**
• Much more detailed, showing soft tissues, blood vessels, and bones
• Can create 3D reconstructions
• Fast — takes only seconds to minutes

**Preparation:**
• May require fasting for 4-6 hours
• Some exams use contrast dye (oral or IV) — inform about allergies and kidney function
• Remove metal objects from the scan area

**Radiation Consideration:**
• CT uses significantly more radiation than a standard X-ray
• A chest CT ≈ 7 mSv (vs 0.1 mSv for a chest X-ray)
• Benefits for accurate diagnosis typically outweigh radiation risks
• Doctors follow the ALARA principle (As Low As Reasonably Achievable)`,
        followUps: [
            'How much radiation is in a CT scan?',
            'What is contrast dye and is it safe?',
            'When is CT scan preferred over MRI?',
        ],
    },
    // ---- MEDICATIONS & GENERAL ----
    {
        patterns: ['prepare for blood test', 'before blood test', 'fasting blood test', 'blood draw preparation'],
        category: 'Lab Preparation',
        response: `**How to Prepare for a Blood Test:**

**Fasting Tests (Lipid Panel, Glucose, CMP):**
• Fast for 8–12 hours before the test
• Water is usually OK and encouraged
• Avoid coffee, tea, juice, and alcohol during fasting period
• Take regular medications unless your doctor advises otherwise

**General Preparation:**
• **Hydrate well** — drink plenty of water the day before and morning of. Well-hydrated veins are easier to draw from.
• **Wear a short-sleeved shirt** or loose sleeves for easy arm access
• **Inform the technician** about any blood-drawing difficulties, preferred arm, or history of fainting
• **List all medications and supplements** you're taking — some can affect results

**During the Draw:**
• The procedure takes 1-3 minutes
• A tourniquet is tied above the draw site, the area is cleaned, and a needle is inserted
• Look away if needles make you anxious
• Breathe normally and relax your arm
• If you feel faint, tell the technician immediately — they can adjust your position

**After the Draw:**
• Apply firm pressure to the site for 2-3 minutes
• Avoid heavy lifting with that arm for 1-2 hours
• Eat a snack or light meal after fasting tests
• Results typically take 1-3 business days`,
        followUps: [
            'Can I drink water before a fasting blood test?',
            'What blood tests require fasting?',
            'Why do I feel dizzy during blood draws?',
        ],
    },
    {
        patterns: ['what to ask doctor', 'questions for doctor', 'doctor visit', 'doctor appointment questions', 'ask my doctor'],
        category: 'Patient Guidance',
        response: `**Questions to Ask Your Doctor About Test Results:**

**Understanding Your Results:**
1. "Are my results within normal range? If not, how far off are they?"
2. "What do these specific numbers mean for my overall health?"
3. "Should I be concerned about any of these values?"
4. "Have there been any significant changes from my previous tests?"

**Next Steps:**
5. "Do I need any follow-up tests or monitoring?"
6. "Should I make any lifestyle changes based on these results?"
7. "Do I need to adjust any of my current medications?"
8. "When should I have these tests repeated?"

**General Health Questions:**
9. "Based on my age and health history, what preventive screenings should I have?"
10. "Are there any warning signs I should watch for?"
11. "Is my current medication still the best option for me?"
12. "Are there any interactions between my medications and supplements?"

**Tips for Your Visit:**
• Write down your questions beforehand
• Bring a list of all current medications and supplements
• Note any new symptoms, even if they seem minor
• Don't hesitate to ask for clarification — it's your health
• Ask for printed copies or portal access to your results`,
        followUps: [
            'How do I read my lab report?',
            'What preventive tests should I have annually?',
            'How often should I see my doctor?',
        ],
    },
    {
        patterns: ['diabetes', 'blood sugar', 'glucose', 'insulin', 'diabetic', 'type 2 diabetes', 'type 1 diabetes', 'prediabetes'],
        category: 'Chronic Conditions',
        response: `**Diabetes** is a chronic condition where the body cannot properly regulate blood sugar (glucose) levels.

**Types:**
• **Type 1:** Autoimmune — the immune system attacks insulin-producing cells. Usually diagnosed in youth. Requires insulin therapy.
• **Type 2:** Most common (~90% of cases). The body becomes resistant to insulin or doesn't produce enough. Linked to lifestyle factors.
• **Prediabetes:** Blood sugar higher than normal but not yet diabetic. Reversible with lifestyle changes.
• **Gestational Diabetes:** Occurs during pregnancy; usually resolves after delivery but increases future T2D risk.

**Diagnostic Criteria:**
| Test | Normal | Prediabetes | Diabetes |
|---|---|---|---|
| Fasting Glucose | <100 mg/dL | 100-125 | ≥126 |
| HbA1c | <5.7% | 5.7-6.4% | ≥6.5% |
| 2-hr OGTT | <140 mg/dL | 140-199 | ≥200 |

**Symptoms:** Increased thirst, frequent urination, unexplained weight loss, fatigue, blurred vision, slow-healing wounds.

**Management:**
• Balanced diet (limit refined carbs, increase fiber)
• Regular physical activity (150 min/week)
• Blood sugar monitoring
• Medications (Metformin, SGLT2 inhibitors, GLP-1 agonists, insulin)
• Regular checkups (eyes, kidneys, feet, cardiovascular)`,
        followUps: [
            'What foods should diabetics avoid?',
            'Can prediabetes be reversed?',
            'What are the long-term complications of diabetes?',
        ],
    },
    {
        patterns: ['bmi', 'body mass index', 'weight', 'obesity', 'overweight', 'underweight'],
        category: 'General Health',
        response: `**Body Mass Index (BMI)** is a screening tool that uses height and weight to estimate body fat.

**Formula:** BMI = weight (kg) ÷ height (m)²

**BMI Categories (Adults):**
| BMI | Category |
|---|---|
| <18.5 | Underweight |
| 18.5–24.9 | Normal weight |
| 25.0–29.9 | Overweight |
| 30.0–34.9 | Obesity Class I |
| 35.0–39.9 | Obesity Class II |
| ≥40.0 | Obesity Class III (Severe) |

**Limitations:**
BMI does not distinguish between muscle mass and fat mass. A muscular athlete may have a high BMI but low body fat. Waist circumference and body composition are additional useful measures.

**Healthy Weight Management:**
• Focus on sustainable, balanced nutrition rather than extreme dieting
• 150-300 minutes of moderate exercise per week
• Prioritize sleep (7-9 hours) — poor sleep affects metabolism
• Manage stress — cortisol promotes abdominal fat storage
• Consult a healthcare provider for personalized guidance`,
        followUps: [
            'How do I calculate my BMI?',
            'Is BMI an accurate health measure?',
            'What are health risks of obesity?',
        ],
    },
    {
        patterns: ['vaccination', 'vaccine', 'immunization', 'flu shot', 'covid vaccine', 'booster'],
        category: 'Preventive Care',
        response: `**Vaccinations** are one of the most effective ways to prevent infectious diseases. They train your immune system to recognize and fight specific pathogens.

**How Vaccines Work:**
Vaccines contain weakened, inactivated, or partial versions of a pathogen (or its genetic instructions). Your immune system learns to recognize it and produces antibodies, creating immunity without causing the actual disease.

**Recommended Adult Vaccinations:**
• **Influenza (Flu):** Annually, especially for high-risk groups
• **COVID-19:** Primary series + recommended boosters
• **Tdap/Td:** Tetanus, diphtheria, pertussis — booster every 10 years
• **Shingles (Shingrix):** Adults 50+ (two doses)
• **Pneumococcal:** Adults 65+ or with chronic conditions
• **Hepatitis B:** If not previously vaccinated
• **HPV:** Up to age 45 if not previously vaccinated

**Common Side Effects (Normal Immune Response):**
• Soreness, redness, or swelling at injection site
• Low-grade fever, fatigue, headache, muscle aches
• These typically resolve within 1-3 days

**Vaccine Safety:**
Vaccines undergo rigorous clinical trials and continuous safety monitoring. Serious side effects are extremely rare.`,
        followUps: [
            'What vaccines do adults need?',
            'Are there side effects of the flu vaccine?',
            'How do mRNA vaccines work?',
        ],
    },
    {
        patterns: ['stress', 'anxiety', 'mental health', 'depression', 'burnout', 'overwhelmed', 'panic'],
        category: 'Mental Health',
        response: `**Stress & Mental Health** are integral parts of overall wellbeing.

**Stress vs. Anxiety:**
• **Stress:** A response to external triggers (work deadlines, conflicts, health concerns). Usually resolves when the trigger is removed.
• **Anxiety:** Persistent worry or fear that may not have a clear trigger. Can be a clinical condition requiring professional support.

**Physical Effects of Chronic Stress:**
• Elevated blood pressure and heart rate
• Weakened immune system
• Digestive problems (IBS, acid reflux)
• Sleep disruption
• Muscle tension, headaches
• Hormonal imbalance (elevated cortisol)

**Evidence-Based Stress Management:**
• **Regular Exercise:** 30 minutes most days — releases endorphins
• **Sleep Hygiene:** Consistent schedule, 7-9 hours, dark/cool room
• **Mindfulness & Meditation:** Even 10 minutes daily reduces cortisol
• **Deep Breathing:** 4-7-8 technique (inhale 4s, hold 7s, exhale 8s)
• **Social Connection:** Talking with trusted people
• **Limiting stimulants:** Reduce caffeine and screen time before bed
• **Professional Help:** Therapy (CBT is highly effective), counseling

**When to Seek Professional Help:**
• Persistent sadness or hopelessness lasting more than 2 weeks
• Difficulty functioning in daily life
• Sleep or appetite changes that persist
• Thoughts of self-harm or suicide → Contact crisis helpline immediately`,
        followUps: [
            'How does stress affect physical health?',
            'What are signs of clinical anxiety?',
            'What techniques help reduce stress quickly?',
        ],
    },
    {
        patterns: ['sleep', 'insomnia', 'sleep problems', 'sleep apnea', 'can\'t sleep', 'trouble sleeping'],
        category: 'Wellness',
        response: `**Sleep Health** is vital for physical repair, immune function, memory consolidation, and emotional regulation.

**Recommended Sleep Duration:**
• Adults (18-64): 7–9 hours
• Older adults (65+): 7–8 hours
• Teenagers: 8–10 hours
• Children: 9–12 hours

**Common Sleep Disorders:**
• **Insomnia:** Difficulty falling or staying asleep — affects ~30% of adults
• **Sleep Apnea:** Repeated breathing interruptions during sleep — causes loud snoring, daytime drowsiness, increased cardiovascular risk
• **Restless Legs Syndrome:** Uncomfortable urge to move legs, especially at night

**Sleep Hygiene Best Practices:**
1. Consistent wake time — even on weekends
2. Cool, dark, quiet bedroom (65-68°F / 18-20°C)
3. No screens 30-60 minutes before bed (blue light suppresses melatonin)
4. Avoid caffeine after 2 PM
5. Limit alcohol — it disrupts sleep quality despite causing drowsiness
6. Regular exercise — but not within 2-3 hours of bedtime
7. Relaxation routine: reading, stretching, deep breathing
8. Reserve bed for sleep and intimacy only — no work or TV

**See a Doctor If:**
• Loud snoring with gasping or choking
• Chronic insomnia (>3 nights/week for >3 months)
• Excessive daytime sleepiness affecting safety`,
        followUps: [
            'How does blue light affect sleep?',
            'What natural remedies help with insomnia?',
            'What are the symptoms of sleep apnea?',
        ],
    },
];
// ---- Greeting patterns ----
const GREETING_PATTERNS = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'];
// ---- Health Assessment Questions (for intake mode) ----
exports.HEALTH_ASSESSMENT_QUESTIONS = [
    { key: 'name', question: 'What is your full name?', translations: { ta: 'உங்கள் முழு பெயர் என்ன?', hi: 'आपका पूरा नाम क्या है?', te: 'మీ పూర్తి పేరు ఏమిటి?', kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಏನು?', ml: 'നിങ്ങളുടെ മുഴുവൻ പേര് എന്താണ്?', bn: 'আপনার পুরো নাম কি?' } },
    { key: 'age', question: 'What is your age?', translations: { ta: 'உங்கள் வயது என்ன?', hi: 'आपकी उम्र क्या है?', te: 'మీ వయస్సు ఎంత?', kn: 'ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?', ml: 'നിങ്ങളുടെ പ്രായം എത്ര?', bn: 'আপনার বয়স কত?' } },
    { key: 'gender', question: 'What is your gender? (Male/Female/Other)', translations: { ta: 'உங்கள் பாலினம் என்ன? (ஆண்/பெண்/மற்றவை)', hi: 'आपका लिंग क्या है? (पुरुष/महिला/अन्य)', te: 'మీ లింగం ఏమిటి? (పురుషుడు/స్త్రీ/ఇతరం)', kn: 'ನಿಮ್ಮ ಲಿಂಗ ಏನು? (ಪುರುಷ/ಮಹಿಳೆ/ಇತರೆ)', ml: 'നിങ്ങളുടെ ലിംഗം എന്താണ്? (പുരുഷൻ/സ്ത്രീ/മറ്റുള്ളവ)', bn: 'আপনার লিঙ্গ কি? (পুরুষ/মহিলা/অন্যান্য)' } },
    { key: 'mainComplaint', question: 'What is your main health concern or complaint today?', translations: { ta: 'இன்று உங்கள் முக்கிய சுகாதார கவலை என்ன?', hi: 'आज आपकी मुख्य स्वास्थ्य चिंता क्या है?', te: 'ఈ రోజు మీ ప్రధాన ఆరోగ్య సమస్య ఏమిటి?', kn: 'ಇಂದು ನಿಮ್ಮ ಮುಖ್ಯ ಆರೋಗ್ಯ ಕಾಳಜಿ ಏನು?', ml: 'ഇന്ന് നിങ്ങളുടെ പ്രധാന ആരോഗ്യ പ്രശ്നം എന്താണ്?', bn: 'আজ আপনার প্রধান স্বাস্থ্য সমস্যা কি?' } },
    { key: 'symptoms', question: 'Can you describe your symptoms in detail?', translations: { ta: 'உங்கள் அறிகுறிகளை விரிவாக விவரிக்க முடியுமா?', hi: 'क्या आप अपने लक्षणों का विस्तार से वर्णन कर सकते हैं?', te: 'మీ లక్షణాలను వివరంగా వివరించగలరా?', kn: 'ನಿಮ್ಮ ರೋಗ ಲಕ್ಷಣಗಳನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಬಹುದೇ?', ml: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിശദമായി വിവരിക്കാമോ?', bn: 'আপনি কি আপনার লক্ষণগুলি বিস্তারিত বর্ণনা করতে পারেন?' } },
    { key: 'duration', question: 'How long have you been experiencing these symptoms?', translations: { ta: 'இந்த அறிகுறிகள் எவ்வளவு நாட்களாக இருக்கின்றன?', hi: 'आप कितने समय से इन लक्षणों का अनुभव कर रहे हैं?', te: 'ఈ లక్షణాలు ఎంత కాలంగా ఉన్నాయి?', kn: 'ಈ ಲಕ್ಷಣಗಳು ಎಷ್ಟು ಸಮಯದಿಂದ ಇವೆ?', ml: 'ഈ ലക്ഷണങ്ങൾ എത്ര കാലമായി അനുഭവിക്കുന്നു?', bn: 'আপনি কতদিন ধরে এই লক্ষণগুলি অনুভব করছেন?' } },
    { key: 'severity', question: 'On a scale of 1-10, how severe are your symptoms? (1 = mild, 10 = extreme)', translations: { ta: '1-10 அளவில், அறிகுறிகள் எவ்வளவு கடுமையானவை?', hi: '1-10 के पैमाने पर, आपके लक्षण कितने गंभीर हैं?', te: '1-10 స్కేల్‌లో, మీ లక్షణాలు ఎంత తీవ్రంగా ఉన్నాయి?', kn: '1-10 ಪ್ರಮಾಣದಲ್ಲಿ, ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಎಷ್ಟು ತೀವ್ರ?', ml: '1-10 സ്കെയിലിൽ, ലക്ഷണങ്ങൾ എത്ര കഠിനമാണ്?', bn: '1-10 স্কেলে, আপনার লক্ষণগুলি কতটা গুরুতর?' } },
    { key: 'existingConditions', question: 'Do you have any existing medical conditions? (e.g., diabetes, hypertension, asthma)', translations: { ta: 'ஏற்கனவே ஏதேனும் நோய்கள் உள்ளனவா? (நீரிழிவு, உயர் இரத்த அழுத்தம், ஆஸ்துமா)', hi: 'क्या आपको कोई मौजूदा चिकित्सा स्थिति है? (मधुमेह, उच्च रक्तचाप, अस्थमा)', te: 'మీకు ఇప్పటికే ఏవైనా వైద్య పరిస్థితులు ఉన్నాయా?', kn: 'ನಿಮಗೆ ಯಾವುದೇ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ವೈದ್ಯಕೀಯ ಸ್ಥಿತಿಗಳಿವೆಯೇ?', ml: 'നിങ്ങൾക്ക് നിലവിലുള്ള ഏതെങ്കിലും രോഗാവസ്ഥകൾ ഉണ്ടോ?', bn: 'আপনার কি কোনো বিদ্যমান চিকিৎসা অবস্থা আছে?' } },
    { key: 'allergies', question: 'Do you have any known allergies? (medications, food, environmental)', translations: { ta: 'ஏதேனும் ஒவ்வாமை உள்ளதா? (மருந்துகள், உணவு)', hi: 'क्या आपको कोई ज्ञात एलर्जी है? (दवाइयाँ, भोजन)', te: 'మీకు తెలిసిన అలర్జీలు ఉన్నాయా?', kn: 'ನಿಮಗೆ ಯಾವುದೇ ತಿಳಿದಿರುವ ಅಲರ್ಜಿಗಳಿವೆಯೇ?', ml: 'നിങ്ങൾക്ക് അറിയപ്പെടുന്ന അലർജികൾ ഉണ്ടോ?', bn: 'আপনার কি কোনো জানা অ্যালার্জি আছে?' } },
    { key: 'currentMedication', question: 'What medications are you currently taking? (Include supplements)', translations: { ta: 'தற்போது என்ன மருந்துகள் எடுத்துக்கொள்கிறீர்கள்?', hi: 'आप वर्तमान में कौन सी दवाइयाँ ले रहे हैं?', te: 'మీరు ప్రస్తుతం ఏ మందులు తీసుకుంటున్నారు?', kn: 'ನೀವು ಪ್ರಸ್ತುತ ಯಾವ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ?', ml: 'നിങ്ങൾ ഇപ്പോൾ ഏത് മരുന്നുകൾ കഴിക്കുന്നു?', bn: 'আপনি বর্তমানে কি ওষুধ খাচ্ছেন?' } },
    { key: 'previousSurgeries', question: 'Have you had any previous surgeries or hospitalizations?', translations: { ta: 'முன்பு ஏதேனும் அறுவை சிகிச்சை அல்லது மருத்துவமனை அனுபவம் உள்ளதா?', hi: 'क्या आपकी पहले कोई सर्जरी या अस्पताल में भर्ती हुआ है?', te: 'మీకు గతంలో శస్త్రచికిత్సలు జరిగాయా?', kn: 'ನಿಮಗೆ ಹಿಂದೆ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗಳು ಆಗಿವೆಯೇ?', ml: 'നിങ്ങൾക്ക് മുമ്പ് ശസ്ത്രക്രിയകൾ നടന്നിട്ടുണ്ടോ?', bn: 'আপনার আগে কোনো সার্জারি বা হাসপাতালে ভর্তি হয়েছে?' } },
    { key: 'familyHistory', question: 'Is there any family history of major illnesses? (heart disease, cancer, diabetes, etc.)', translations: { ta: 'குடும்ப நோய் வரலாறு ஏதேனும் உள்ளதா? (இதய நோய், புற்றுநோய், நீரிழிவு)', hi: 'क्या परिवार में किसी को कोई गंभीर बीमारी है? (हृदय रोग, कैंसर, मधुमेह)', te: 'కుటుంబంలో ఏమైనా తీవ్రమైన వ్యాధి చరిత్ర ఉందా?', kn: 'ಕುಟುಂಬದಲ್ಲಿ ಯಾವುದಾದರೂ ಗಂಭೀರ ರೋಗ ಇತಿಹಾಸ ಇದೆಯೇ?', ml: 'കുടുംബത്തിൽ ഗുരുതരമായ രോഗ ചരിത്രം ഉണ്ടോ?', bn: 'পরিবারে কোনো গুরুতর রোগের ইতিহাস আছে?' } },
    { key: 'lifestyle', question: 'Tell me about your lifestyle: Do you exercise regularly? Do you smoke or drink alcohol?', translations: { ta: 'உங்கள் வாழ்க்கை முறை பற்றி சொல்லுங்கள்: உடற்பயிற்சி செய்கிறீர்களா? புகைப்பிடிக்கிறீர்களா?', hi: 'अपनी जीवनशैली के बारे में बताएं: क्या आप नियमित व्यायाम करते हैं? क्या आप धूम्रपान या शराब पीते हैं?', te: 'మీ జీవనశైలి గురించి చెప్పండి: మీరు క్రమం తప్పకుండా వ్యాయామం చేస్తారా?', kn: 'ನಿಮ್ಮ ಜೀವನಶೈಲಿ ಬಗ್ಗೆ ಹೇಳಿ: ನೀವು ನಿಯಮಿತವಾಗಿ ವ್ಯಾಯಾಮ ಮಾಡುತ್ತೀರಾ?', ml: 'നിങ്ങളുടെ ജീവിതശൈലിയെ കുറിച്ച് പറയൂ: നിങ്ങൾ പതിവായി വ്യായാമം ചെയ്യുന്നുണ്ടോ?', bn: 'আপনার জীবনধারা সম্পর্কে বলুন: আপনি কি নিয়মিত ব্যায়াম করেন?' } },
    { key: 'sleep', question: 'How many hours of sleep do you typically get? Do you have any sleep difficulties?', translations: { ta: 'பொதுவாக எத்தனை மணி நேரம் தூங்குகிறீர்கள்? தூக்கத்தில் ஏதேனும் சிக்கல்கள் உள்ளனவா?', hi: 'आप आमतौर पर कितने घंटे सोते हैं? क्या आपको नींद में कोई कठिनाई है?', te: 'మీరు సాధారణంగా ఎన్ని గంటలు నిద్రపోతారు?', kn: 'ನೀವು ಸಾಮಾನ್ಯವಾಗಿ ಎಷ್ಟು ಗಂಟೆ ನಿದ್ದೆ ಮಾಡುತ್ತೀರಿ?', ml: 'നിങ്ങൾ സാധാരണയായി എത്ര മണിക്കൂർ ഉറങ്ങുന്നു?', bn: 'আপনি সাধারণত কত ঘণ্টা ঘুমান?' } },
    { key: 'stress', question: 'How would you describe your current stress level? (Low/Moderate/High)', translations: { ta: 'உங்கள் தற்போதைய மன அழுத்த நிலை என்ன? (குறைவு/மிதமான/அதிகம்)', hi: 'आपका वर्तमान तनाव स्तर कैसा है? (कम/मध्यम/उच्च)', te: 'మీ ప్రస్తుత ఒత్తిడి స్థాయి ఎలా ఉంది?', kn: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಒತ್ತಡ ಮಟ್ಟ ಹೇಗಿದೆ?', ml: 'നിങ്ങളുടെ നിലവിലെ സമ്മർദ്ദ നില എങ്ങനെയാണ്?', bn: 'আপনার বর্তমান মানসিক চাপের মাত্রা কেমন?' } },
    { key: 'emergencyContact', question: 'Who is your emergency contact? (Name and phone number)', translations: { ta: 'உங்கள் அவசர தொடர்பு யார்? (பெயர் மற்றும் தொலைபேசி)', hi: 'आपका आपातकालीन संपर्क कौन है? (नाम और फोन)', te: 'మీ అత్యవసర సంప్రదింపు ఎవరు? (పేరు మరియు ఫోన్)', kn: 'ನಿಮ್ಮ ತುರ್ತು ಸಂಪರ್ಕ ಯಾರು? (ಹೆಸರು ಮತ್ತು ಫೋನ್)', ml: 'നിങ്ങളുടെ അടിയന്തര ബന്ധം ആരാണ്? (പേരും ഫോണും)', bn: 'আপনার জরুরি যোগাযোগ কে? (নাম ও ফোন)' } },
];
// ============================================================
// CORE AI FUNCTIONS
// ============================================================
function findBestMatch(userMessage) {
    const lower = userMessage.toLowerCase().trim();
    // Score each entry based on pattern matching
    let bestEntry = null;
    let bestScore = 0;
    for (const entry of MEDICAL_KNOWLEDGE) {
        let score = 0;
        for (const pattern of entry.patterns) {
            if (lower.includes(pattern.toLowerCase())) {
                // Longer pattern match = higher score (more specific)
                score += pattern.length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
        }
    }
    return bestScore > 0 ? bestEntry : null;
}
function isGreeting(text) {
    const lower = text.toLowerCase().trim();
    return GREETING_PATTERNS.some((g) => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + ',') || lower.startsWith(g + '!'));
}
function generateGreeting(language) {
    const greetings = {
        en: "Hello! I'm your CareSync AI Health Assistant. I can help you understand medical terms, lab results, symptoms, and general health information. I can also help you complete a health assessment form.\n\nHow can I assist you today? You can ask me questions like:\n• \"What does high blood pressure mean?\"\n• \"What is a CBC test?\"\n• \"How should I prepare for a blood test?\"\n\nOr start a guided **Health Assessment** to create your patient intake summary.",
        ta: "வணக்கம்! நான் உங்கள் CareSync AI சுகாதார உதவியாளர். மருத்துவ விதிமுறைகள், ஆய்வக முடிவுகள், அறிகுறிகள் மற்றும் பொது சுகாதார தகவல்களை புரிந்துகொள்ள நான் உதவ முடியும்.\n\nஇன்று நான் எவ்வாறு உங்களுக்கு உதவ முடியும்?",
        hi: "नमस्ते! मैं आपका CareSync AI स्वास्थ्य सहायक हूँ। मैं चिकित्सा शब्दों, प्रयोगशाला परिणामों, लक्षणों और सामान्य स्वास्थ्य जानकारी को समझने में आपकी मदद कर सकता हूँ।\n\nआज मैं आपकी कैसे सहायता कर सकता हूँ?",
        te: "నమస్కారం! నేను మీ CareSync AI ఆరోగ్య సహాయకుడిని. వైద్య పదాలు, ల్యాబ్ ఫలితాలు, లక్షణాలు మరియు సాధారణ ఆరోగ్య సమాచారాన్ని అర్థం చేసుకోవడంలో నేను సహాయపడగలను.\n\nఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?",
        kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ CareSync AI ಆರೋಗ್ಯ ಸಹಾಯಕ. ವೈದ್ಯಕೀಯ ಪದಗಳು, ಲ್ಯಾಬ್ ಫಲಿತಾಂಶಗಳು, ರೋಗ ಲಕ್ಷಣಗಳು ಮತ್ತು ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.\n\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
        ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ CareSync AI ആരോഗ്യ സഹായിയാണ്. മെഡിക്കൽ ടേമുകൾ, ലാബ് ഫലങ്ങൾ, ലക്ഷണങ്ങൾ, പൊതുവായ ആരോഗ്യ വിവരങ്ങൾ എന്നിവ മനസ്സിലാക്കാൻ എനിക്ക് സഹായിക്കാനാകും.\n\nഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?",
        bn: "নমস্কার! আমি আপনার CareSync AI স্বাস্থ্য সহায়ক। চিকিৎসা পরিভাষা, ল্যাব রিপোর্ট, লক্ষণ এবং সাধারণ স্বাস্থ্য তথ্য বুঝতে আমি সাহায্য করতে পারি।\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    };
    return greetings[language] || greetings.en;
}
/**
 * Main message handler — the heart of the AI service
 */
async function sendMessage(userMessage, conversationHistory = [], language = 'en', userId) {
    const disclaimer = DISCLAIMERS[language] || DISCLAIMERS.en;
    // 1. Check for emergency keywords
    if (isEmergency(userMessage)) {
        return {
            content: EMERGENCY_WARNING + '\n\n' + disclaimer,
            confidence: 1.0,
            category: 'Emergency',
            disclaimer: true,
            isEmergency: true,
            suggestedFollowUps: ['What should I do while waiting for help?', 'What are the signs of a heart attack?'],
            language,
        };
    }
    // 2. Check for greetings
    if (isGreeting(userMessage)) {
        return {
            content: generateGreeting(language),
            confidence: 1.0,
            category: 'Greeting',
            disclaimer: false,
            isEmergency: false,
            suggestedFollowUps: [
                'Summarize my latest report',
                'Show my health history',
                'What reports did I share?',
                'Prepare questions for my doctor',
                'What is a CBC?',
                'What does SpO2 mean?',
            ],
            language,
        };
    }
    // 3. Personalized Patient Data Queries
    const lowerMsg = userMessage.toLowerCase();
    // (a) "Summarize my latest report"
    if (lowerMsg.includes('summarize') && (lowerMsg.includes('report') || lowerMsg.includes('test')) || lowerMsg.includes('latest report') || lowerMsg.includes('my report')) {
        try {
            const patient = await index_js_1.prisma.patient.findFirst({
                where: userId ? { userId } : undefined,
                include: {
                    reports: { orderBy: { uploadDate: 'desc' }, take: 1 },
                    user: true,
                },
            });
            if (patient && patient.reports.length > 0) {
                const rep = patient.reports[0];
                let analysisData = null;
                try {
                    if (rep.extractedData)
                        analysisData = JSON.parse(rep.extractedData);
                }
                catch { }
                const summaryText = `Here is the AI clinical summary for your latest report (**${rep.title}**):\n\n` +
                    `• **Report Type:** ${rep.reportType}\n` +
                    `• **Document Date:** ${new Date(rep.uploadDate).toLocaleDateString('en-IN')}\n` +
                    `• **AI Summary:** ${rep.aiSummary || 'Analyzed and archived.'}\n\n` +
                    `**Key Findings & Parameters:**\n` +
                    (analysisData?.importantValues ? analysisData.importantValues.slice(0, 5).map((v) => `• **${v.parameter}:** ${v.value} ${v.unit} (Ref: ${v.referenceRange}) — *${v.status}*`).join('\n') : `• Documentation recorded: ${rep.title}`) +
                    `\n\n**Abnormal / Notable Values:**\n` +
                    (analysisData?.abnormalValues && analysisData.abnormalValues.length > 0
                        ? analysisData.abnormalValues.map((ab) => `⚠️ **${ab.parameter}:** ${ab.value} — ${ab.note}`).join('\n')
                        : '• All analyzed parameters appear within standard physiological limits.') +
                    `\n\n**Next Steps:** Dr. Priya Sharma has access to this report in your CareSync chart.`;
                return {
                    content: summaryText + '\n\n---\n*' + disclaimer + '*',
                    confidence: 0.98,
                    category: 'Medical Reports',
                    disclaimer: true,
                    isEmergency: false,
                    suggestedFollowUps: [
                        'Prepare questions for my doctor',
                        'What reports did I share?',
                        'What is a CBC?',
                    ],
                    language,
                };
            }
        }
        catch (e) {
            console.error('Error fetching latest report for chat:', e);
        }
    }
    // (b) "Show my health history"
    if (lowerMsg.includes('health history') || lowerMsg.includes('medical history') || lowerMsg.includes('my history') || lowerMsg.includes('past conditions')) {
        try {
            const patient = await index_js_1.prisma.patient.findFirst({
                where: userId ? { userId } : undefined,
                include: {
                    medicalHistories: { orderBy: { diagnosisDate: 'desc' } },
                    user: true,
                },
            });
            if (patient && patient.medicalHistories.length > 0) {
                const historyList = patient.medicalHistories.map((h, i) => `${i + 1}. **${h.condition}**\n   • Status: ${h.status} | Diagnosed: ${new Date(h.diagnosisDate).getFullYear()}\n   • Notes: ${h.notes || 'Routine follow-up'}\n   • Treated by: ${h.treatedBy || 'CareSync Physician'}`).join('\n\n');
                const content = `Here is your recorded medical history on file at **CareSync Multispeciality Hospital, Chennai**:\n\n` +
                    historyList +
                    `\n\n• **Recorded Allergies:** ${patient.allergies || 'None recorded'}\n` +
                    `• **Blood Group:** ${patient.bloodGroup || 'B+'}\n` +
                    `• **Primary Physician:** Dr. Priya Sharma (General Medicine)`;
                return {
                    content: content + '\n\n---\n*' + disclaimer + '*',
                    confidence: 0.98,
                    category: 'Health History',
                    disclaimer: true,
                    isEmergency: false,
                    suggestedFollowUps: [
                        'Summarize my latest report',
                        'Prepare questions for my doctor',
                        'What reports did I share?',
                    ],
                    language,
                };
            }
        }
        catch (e) {
            console.error('Error fetching health history for chat:', e);
        }
    }
    // (c) "What reports did I share?"
    if (lowerMsg.includes('what reports') || lowerMsg.includes('reports did i share') || lowerMsg.includes('shared reports') || lowerMsg.includes('reports shared')) {
        try {
            const patient = await index_js_1.prisma.patient.findFirst({
                where: userId ? { userId } : undefined,
                include: {
                    reports: { where: { sharedWithDoctor: true } },
                    transfers: { orderBy: { createdAt: 'desc' } },
                },
            });
            if (patient) {
                const sharedReportsList = patient.reports.map((r, i) => `${i + 1}. **${r.title}** (${r.reportType}) — Shared with Dr. Priya Sharma on ${new Date(r.uploadDate).toLocaleDateString('en-IN')}`).join('\n');
                const content = `Here are the medical records and reports shared with your clinical team at **CareSync Multispeciality Hospital**:\n\n` +
                    (sharedReportsList || 'No external reports currently shared.') +
                    `\n\n**Recent Clinical Referrals & Transfers:**\n` +
                    (patient.transfers.length > 0
                        ? patient.transfers.map((t) => `• **${t.senderRole} → ${t.receiverRole} (${t.receiverName}):** ${t.reason} [Status: *${t.status}*]`).join('\n')
                        : '• All records synchronized with primary EMR chart.') +
                    `\n\nYour clinical team has immediate, secure access to these records for your upcoming consultation.`;
                return {
                    content: content + '\n\n---\n*' + disclaimer + '*',
                    confidence: 0.98,
                    category: 'Shared Records',
                    disclaimer: true,
                    isEmergency: false,
                    suggestedFollowUps: [
                        'Summarize my latest report',
                        'Prepare questions for my doctor',
                        'Show my health history',
                    ],
                    language,
                };
            }
        }
        catch (e) {
            console.error('Error fetching shared reports for chat:', e);
        }
    }
    // (d) "Prepare questions for my doctor"
    if (lowerMsg.includes('prepare questions') || lowerMsg.includes('questions for my doctor') || lowerMsg.includes('questions for doctor') || lowerMsg.includes('what should i ask my doctor')) {
        const questions = `Based on your recent **Complete Blood Count (CBC)**, active vital readings, and clinical history at CareSync Multispeciality Hospital, here are customized questions to ask **Dr. Priya Sharma**:\n\n` +
            `1. **Regarding Complete Blood Count:**\n` +
            `   *"My latest CBC report showed a total WBC count of 11,200 /uL and 74% neutrophils. Could this be related to my recent fatigue or mild throat congestion, and should we recheck in 2 to 3 weeks?"*\n\n` +
            `2. **Regarding Blood Pressure & Diabetic Therapy:**\n` +
            `   *"My home BP telemetry is running around 136/88 mmHg and recent HbA1c is 6.8%. Are my current dosages of Telmisartan 40mg and Metformin 500mg BD still optimal, or do we need timing adjustments?"*\n\n` +
            `3. **Regarding Cardiology Specialist Consultation:**\n` +
            `   *"Given my upcoming consultation with Dr. Karthik Raj in Cardiology, is a resting 2D Echocardiogram or Treadmill Stress Test advised?"*\n\n` +
            `4. **Regarding Lifestyle & Daily Energy:**\n` +
            `   *"Are there specific dietary guidelines or hydration goals to help reduce my late afternoon tiredness?"*`;
        return {
            content: questions + '\n\n---\n*' + disclaimer + '*',
            confidence: 0.96,
            category: 'Doctor Preparation',
            disclaimer: true,
            isEmergency: false,
            suggestedFollowUps: [
                'Summarize my latest report',
                'Show my health history',
                'What does SpO2 mean?',
            ],
            language,
        };
    }
    // 3. Try to match against knowledge base
    const match = findBestMatch(userMessage);
    if (match) {
        const rawContent = (language !== 'en' && match.translations && match.translations[language])
            ? match.translations[language]
            : match.response;
        const response = rawContent + '\n\n---\n*' + disclaimer + '*';
        return {
            content: response,
            confidence: 0.94,
            category: match.category,
            disclaimer: true,
            isEmergency: false,
            suggestedFollowUps: match.followUps,
            language,
        };
    }
    // 4. Fallback: provide a helpful generic response
    let fallback = `Thank you for your question. While I don't have a specific pre-loaded answer for "${userMessage.substring(0, 80)}${userMessage.length > 80 ? '...' : ''}", here are some suggestions:

**What I can help with:**
• Explaining medical terms and lab test values (CBC, CMP, Lipid Panel, HbA1c)
• Understanding vital signs (blood pressure, heart rate, SpO2, temperature)
• General information about common symptoms and conditions
• Preparing for medical tests and doctor visits
• Completing a structured Health Assessment form

**Try asking:**
• "What is blood pressure?" or "What does a CBC test show?"
• "I have fever and cough" or "What does SpO2 mean?"
• "What should I ask my doctor about my test results?"
• "Start Health Assessment" for a guided intake questionnaire

---
*${disclaimer}*`;
    if (language === 'ta') {
        fallback = `உங்கள் கேள்விக்கு நன்றி. CareSync AI மூலம் பின்வரும் தகவல்களை நீங்கள் அறியலாம்:

• இரத்த அழுத்தம், இதயத் துடிப்பு, SpO2 பற்றிய விளக்கம்
• சிபிசி (CBC) மற்றும் ஆய்வகப் பரிசோதனை முடிவுகள்
• காய்ச்சல், நீரிழிவு மற்றும் பொதுவான அறிகுறிகள்
• மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்

**நீங்கள் கேட்கக்கூடிய சில கேள்விகள்:**
• "இரத்த அழுத்தம் என்றால் என்ன?"
• "சிபிசி டெஸ்ட் என்றால் என்ன?"
• "காய்ச்சல் வந்தால் என்ன செய்ய வேண்டும்?"

---
*${disclaimer}*`;
    }
    else if (language === 'hi') {
        fallback = `आपके प्रश्न के लिए धन्यवाद। CareSync AI के माध्यम से आप निम्नलिखित जानकारियां प्राप्त कर सकते हैं:

• रक्तचाप, हृदय गति, SpO2 का विवरण
• सीबीसी (CBC) और लैब टेस्ट रिपोर्ट
• बुखार, मधुमेह और सामान्य स्वास्थ्य लक्षण
• डॉक्टर से परामर्श के लिए आवश्यक प्रश्न

**सुझाए गए प्रश्न:**
• "रक्तचाप क्या है?"
• "सीबीसी टेस्ट क्या है?"
• "बुखार होने पर क्या करें?"

---
*${disclaimer}*`;
    }
    return {
        content: fallback,
        confidence: 0.5,
        category: 'General',
        disclaimer: true,
        isEmergency: false,
        suggestedFollowUps: [
            'What is blood pressure?',
            'What does a CBC report show?',
            'How do I prepare for a blood test?',
            'Start Health Assessment',
        ],
        language,
    };
}
/**
 * Generate a structured patient intake summary from assessment answers
 */
async function generateIntakeSummary(answers, patientId, userId) {
    const sections = [
        `# PATIENT INTAKE SUMMARY`,
        `**Generated by CareSync AI** — ${new Date().toLocaleString()}\n`,
        `---`,
        `## Demographics`,
        `- **Name:** ${answers.name || 'Not provided'}`,
        `- **Age:** ${answers.age || 'Not provided'}`,
        `- **Gender:** ${answers.gender || 'Not provided'}`,
        ``,
        `## Primary Complaint`,
        `- **Main Concern:** ${answers.mainComplaint || 'Not provided'}`,
        `- **Symptoms:** ${answers.symptoms || 'Not provided'}`,
        `- **Duration:** ${answers.duration || 'Not provided'}`,
        `- **Severity (1-10):** ${answers.severity || 'Not provided'}`,
        ``,
        `## Medical Background`,
        `- **Existing Conditions:** ${answers.existingConditions || 'None reported'}`,
        `- **Known Allergies:** ${answers.allergies || 'NKDA (No Known Drug Allergies)'}`,
        `- **Current Medications:** ${answers.currentMedication || 'None reported'}`,
        `- **Previous Surgeries/Hospitalizations:** ${answers.previousSurgeries || 'None reported'}`,
        `- **Family History:** ${answers.familyHistory || 'Non-contributory'}`,
        ``,
        `## Lifestyle & Wellness`,
        `- **Lifestyle/Exercise:** ${answers.lifestyle || 'Not assessed'}`,
        `- **Sleep:** ${answers.sleep || 'Not assessed'}`,
        `- **Stress Level:** ${answers.stress || 'Not assessed'}`,
        ``,
        `## Emergency Contact`,
        `- ${answers.emergencyContact || 'Not provided'}`,
        ``,
        `---`,
        `*This summary was generated by CareSync AI Health Assistant for clinical intake purposes. It should be reviewed and verified by a qualified healthcare professional before being incorporated into the patient's medical record.*`,
    ];
    const summary = sections.join('\n');
    // Save to database if patient context is available
    let savedToDb = false;
    if (userId) {
        try {
            // Save as AI conversation with all answers
            const convo = await index_js_1.prisma.aIConversation.create({
                data: {
                    userId,
                    title: `Health Assessment — ${answers.name || 'Patient'} — ${new Date().toLocaleDateString()}`,
                    messages: {
                        create: [
                            {
                                sender: 'SYSTEM',
                                content: summary,
                                metadata: JSON.stringify(answers),
                            },
                        ],
                    },
                },
            });
            // Also create a notification
            await index_js_1.prisma.notification.create({
                data: {
                    userId,
                    title: 'Health Assessment Completed',
                    message: `Your health intake assessment has been recorded and saved to your clinical profile.`,
                    type: 'SYSTEM',
                    linkUrl: '/patient/assistant',
                },
            });
            savedToDb = true;
        }
        catch (err) {
            console.error('Error saving intake to DB:', err);
        }
    }
    return { summary, savedToDb };
}
/**
 * Save a conversation to the database
 */
async function saveConversation(userId, title, messages) {
    try {
        const convo = await index_js_1.prisma.aIConversation.create({
            data: {
                userId,
                title: title || `Conversation — ${new Date().toLocaleDateString()}`,
                messages: {
                    create: messages.map((m) => ({
                        sender: m.role === 'user' ? 'USER' : m.role === 'assistant' ? 'ASSISTANT' : 'SYSTEM',
                        content: m.content,
                        timestamp: m.timestamp,
                    })),
                },
            },
        });
        return convo.id;
    }
    catch (err) {
        console.error('Error saving conversation:', err);
        throw err;
    }
}
/**
 * Get conversation history for a user
 */
async function getConversations(userId) {
    return index_js_1.prisma.aIConversation.findMany({
        where: { userId },
        include: {
            messages: { orderBy: { timestamp: 'asc' } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
    });
}
/**
 * Get the health assessment questions for a given language
 */
function getAssessmentQuestions(language = 'en') {
    return exports.HEALTH_ASSESSMENT_QUESTIONS.map((q) => ({
        key: q.key,
        question: language === 'en' ? q.question : (q.translations[language] || q.question),
    }));
}
