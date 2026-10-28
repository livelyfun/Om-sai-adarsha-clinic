const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const file = path.join(__dirname, '..', 'data/clinic_dev.json');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const now = new Date().toISOString();
const uid = () => crypto.randomUUID();

// 1. Update clinicSettings with authentic details from the Facebook page & flyer
d.clinicSettings = {
  ...d.clinicSettings,
  clinic_name: 'Om Sai Aadarsha Clinic',
  clinic_name_ne: 'ॐ साई आदर्श क्लिनिक',
  tagline_en: 'Compassionate Care, Reliable Diagnostics & Expert Consultations',
  tagline_ne: 'सहृदयी स्वास्थ्य सेवा, गुणस्तरीय ल्याब तथा विशेषज्ञ परामर्श',
  min_lead_time_hours: 2,
  max_advance_booking_days: 30,
  cancellation_cutoff_hours: 4,
  max_open_requests_per_patient: 5,
  default_slot_duration_minutes: 20,
  week_start_day: 0, // Sunday
  weekly_holiday_day: 6, // Saturday
  address_en: 'Shahid Marg, In Front of Birendra Sabhagriha, Biratnagar, Nepal',
  address_ne: 'शहिद मार्ग, विरेन्द्र सभागृह अगाडि, विराटनगर, नेपाल',
  phone: '+977-9807358874',
  email: 'omsaiaadarshaclinic@gmail.com',
  emergency_phone: '+977-9810581421',
  whatsapp_number: '+977-9807358874',
  map_url: 'https://maps.google.com/?q=Birendra+Sabhagriha+Biratnagar',
  facebook_url: 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/',
  opening_hours_en: 'Sunday – Friday: 07:00 AM – 07:00 PM (Saturday Closed)',
  opening_hours_ne: 'आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०७:०० (शनिबार बन्द)',
};

// 2. Define the 9 Authentic Doctors from the Facebook Banner
const facebookDoctors = [
  {
    id: 'doc-shaileja-chhetri',
    slug: 'prof-dr-shaileja-chhetri',
    nameEn: 'Prof. Dr. Shaileja Chhetri (Shrestha)',
    nameNe: 'प्रो. डा. शैलेजा क्षेत्री (श्रेष्ठ)',
    photoUrl: '/images/doctors/shaileja-chhetri.jpg',
    qualificationsEn: 'MBBS, MD, DMAS | Prof. of Obstetric & Gynecology, Ex. HOD OBS & Gynae (BPKIHS) | NMC No: 6303',
    qualificationsNe: 'एमबीबीएस, एमडी, डीएमएएस | प्राध्यापक तथा पूर्व विभागीय प्रमुख, प्रसुती तथा स्त्रीरोग विभाग (बीपी प्रतिष्ठान) | एनएमसी नं: ६३०३',
    specialtyEn: 'Obstetrics & Gynecology (Senior Specialist)',
    specialtyNe: 'वरिष्ठ स्त्री तथा प्रसुती रोग विशेषज्ञ',
    bioEn: 'Prof. Dr. Shaileja Chhetri is an eminent Professor of Obstetrics and Gynecology and former Head of Department at BPKIHS Dharan. She provides expert consultations in high-risk pregnancies, maternal care, infertility, and advanced gynecological wellness.',
    bioNe: 'प्रो. डा. शैलेजा क्षेत्री बीपी कोइराला स्वास्थ्य विज्ञान प्रतिष्ठानका पूर्व विभागीय प्रमुख तथा वरिष्ठ प्राध्यापक हुनुहुन्छ। उहाँले महिलाको प्रसुती, उच्च जोखिमयुक्त गर्भावस्था, निःसन्तान परामर्श तथा स्त्रीरोग सम्बन्धी विशेषज्ञ सेवा प्रदान गर्नुहुन्छ।',
    consultationFee: 800,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: true,
    createdAt: now,
  },
  {
    id: 'doc-nikesh-raj-shrestha',
    slug: 'prof-dr-nikesh-raj-shrestha',
    nameEn: 'Prof. Dr. Nikesh Raj Shrestha',
    nameNe: 'प्रो. डा. निकेश राज श्रेष्ठ',
    photoUrl: '/images/doctors/nikesh-raj-shrestha.jpg',
    qualificationsEn: 'MBBS, MD, FESC | Fellow of European Society of Cardiology, Ex. Associate Professor (BPKIHS, Dharan) | NMC No: 3195',
    qualificationsNe: 'एमबीबीएस, एमडी, एफईएससी | फेलो अफ युरोपियन सोसाइटी अफ कार्डियोलोजी, पूर्व सह-प्राध्यापक (बीपीकेआईएचएस, धरान) | एनएमसी नं: ३१९५',
    specialtyEn: 'Interventional Cardiology (Senior Specialist)',
    specialtyNe: 'वरिष्ठ इन्टरभेन्सनल कार्डियोलोजिष्ट',
    bioEn: 'Prof. Dr. Nikesh Raj Shrestha is an internationally recognized Interventional Cardiologist and FESC Fellow specializing in cardiovascular diseases, cardiac catheterization, hypertension management, heart failure therapy, and coronary care.',
    bioNe: 'प्रो. डा. निकेश राज श्रेष्ठ मुटुरोग सम्बन्धी वरिष्ठ इन्टरभेन्सनल कार्डियोलोजिष्ट तथा युरोपियन सोसाइटी अफ कार्डियोलोजीका फेलो हुनुहुन्छ। उहाँ मुटुको समस्या, उच्च रक्तचाप, एन्जियोग्राफी तथा कार्डियाक केयरमा अनुभवी हुनुहुन्छ।',
    consultationFee: 1000,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: true,
    createdAt: now,
  },
  {
    id: 'doc-rajiv-shrestha',
    slug: 'dr-rajiv-shrestha',
    nameEn: 'Dr. Rajiv Shrestha',
    nameNe: 'डा. राजीव श्रेष्ठ',
    photoUrl: '/images/doctors/rajiv-shrestha.jpg',
    qualificationsEn: 'MBBS, MD (Cardiology) | Sr. Consultant Cardiologist (Ex. Gangalal Heart Centre, Norvic Hospital, Neuro Cardio Hospital) | NMC No: 3310',
    qualificationsNe: 'एमबीबीएस, एमडी (मुटुरोग) | वरिष्ठ कन्सल्टेन्ट मुटु रोग विशेषज्ञ (गंगालाल हृदय केन्द्र, नर्भिक हस्पिटल, न्यूरो कार्डियो) | एनएमसी नं: ३३१०',
    specialtyEn: 'Cardiology (Senior Consultant)',
    specialtyNe: 'वरिष्ठ कन्सल्टेन्ट मुटु रोग विशेषज्ञ',
    bioEn: 'Dr. Rajiv Shrestha brings years of clinical leadership from Shahid Gangalal National Heart Centre, Norvic Hospital, and Neuro Cardio Hospital. He provides expert diagnostic evaluations including 2D Echo, ECG, and clinical management of cardiac conditions.',
    bioNe: 'डा. राजीव श्रेष्ठ गंगालाल राष्ट्रिय हृदय केन्द्र, नर्भिक हस्पिटल र न्यूरो कार्डियो हस्पिटलमा सेवा पुर्याइसक्नुभएका अनुभवी वरिष्ठ मुटुरोग विशेषज्ञ हुनुहुन्छ। उहाँले मुटुरोग निदान, इकोकार्डियोग्राफी तथा उपचार सेवा प्रदान गर्नुहुन्छ।',
    consultationFee: 800,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: true,
    createdAt: now,
  },
  {
    id: 'doc-kaushar-ali',
    slug: 'dr-kaushar-ali',
    nameEn: 'Dr. Kaushar Ali',
    nameNe: 'डा. कौशर अली',
    photoUrl: '/images/doctors/kaushar-ali.jpg',
    qualificationsEn: 'MBBS, MD Medicine (Bir Hospital) | Training in NCD (Singapore) | NMC No: 14168',
    qualificationsNe: 'एमबीबीएस, एमडी मेडिसिन (वीर अस्पताल) | एनसिडी विशेष तालिम (सिंगापुर) | एनएमसी नं: १४१६८',
    specialtyEn: 'Internal Medicine (Senior Physician)',
    specialtyNe: 'वरिष्ठ इन्टरनल फिजिसियन',
    bioEn: 'Dr. Kaushar Ali completed his MD in Internal Medicine at Bir Hospital and received specialized NCD (Non-Communicable Diseases) clinical training in Singapore. He manages diabetes, hypertension, metabolic syndrome, and complex medical disorders.',
    bioNe: 'डा. कौशर अली वीर अस्पतालबाट एमडी तथा सिंगापुरबाट नसर्ने रोग (NCD) सम्बन्धी विशेष तालिम प्राप्त वरिष्ठ इन्टरनल फिजिसियन हुनुहुन्छ। उहाँले मधुमेह, रक्तचाप, छाती तथा पेटका समस्याहरूको सफल उपचार गर्नुहुन्छ।',
    consultationFee: 700,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: true,
    createdAt: now,
  },
  {
    id: 'doc-santosh-kumar-yadav',
    slug: 'dr-santosh-kumar-yadav',
    nameEn: 'Dr. Santosh Kumar Yadav',
    nameNe: 'डा. सन्तोष कुमार यादव',
    photoUrl: '/images/doctors/santosh-kumar-yadav.jpg',
    qualificationsEn: 'MBBS, MD, NAMS (Kanti Children Hospital, Maharajgunj, Kathmandu) | NMC No: 13918',
    qualificationsNe: 'एमबीबीएस, एमडी, न्याम्स (कान्ति बाल अस्पताल, महाराजगंज, काठमाण्डौ) | एनएमसी नं: १३९१८',
    specialtyEn: 'Pediatrics & Neonatology (Senior Specialist)',
    specialtyNe: 'वरिष्ठ नवजात शिशु तथा बाल रोग विशेषज्ञ',
    bioEn: 'Dr. Santosh Kumar Yadav is a dedicated pediatrician trained at Kanti Children’s Hospital, Kathmandu. He specializes in newborn intensive care, childhood developmental milestones, infectious illnesses, and immunization schedules.',
    bioNe: 'डा. सन्तोष कुमार यादव कान्ति बाल अस्पतालबाट प्रशिक्षित वरिष्ठ नवजात शिशु तथा बालरोग विशेषज्ञ हुनुहुन्छ। उहाँले शिशुहरूको स्वास्थ्य, वृद्धि-विकास, बाल संक्रमण तथा खोप परामर्श प्रदान गर्नुहुन्छ।',
    consultationFee: 600,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: true,
    createdAt: now,
  },
  {
    id: 'doc-lav-kumar-mandal',
    slug: 'dr-lav-kumar-mandal',
    nameEn: 'Dr. Lav Kumar Mandal',
    nameNe: 'डा. लव कु. मण्डल',
    photoUrl: '/images/doctors/lav-kumar-mandal.jpg',
    qualificationsEn: 'MBBS, MS (BPKIHS) | NMC No: 19546',
    qualificationsNe: 'एमबीबीएस, एमएस (बीपीकेआईएचएस) | एनएमसी नं: १९५४६',
    specialtyEn: 'General & Laparoscopic Surgery (Senior Surgeon)',
    specialtyNe: 'वरिष्ठ जेनेरल तथा ल्याप्रोस्कोपिक सर्जन',
    bioEn: 'Dr. Lav Kumar Mandal is a Senior General and Laparoscopic Surgeon trained at BPKIHS. He specializes in minimally invasive laparoscopic procedures, hernia repair, gallstone management, gastrointestinal surgical consultations, and minor surgical care.',
    bioNe: 'डा. लव कुमार मण्डल बीपीकेआईएचएसबाट दीक्षित वरिष्ठ जेनेरल तथा ल्याप्रोस्कोपिक सर्जन हुनुहुन्छ। उहाँले पेट, पत्थरी, हर्निया तथा सामान्य शल्यक्रिया सम्बन्धी परामर्श तथा सेवा प्रदान गर्नुहुन्छ।',
    consultationFee: 700,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: false,
    createdAt: now,
  },
  {
    id: 'doc-vijay-kumar-mehta',
    slug: 'dr-vijay-kumar-mehta',
    nameEn: 'Dr. Vijay Kumar Mehta',
    nameNe: 'डा. विजय कुमार मेहता',
    photoUrl: '/images/doctors/vijay-kumar-mehta.jpg',
    qualificationsEn: 'MBBS, MS (NAMS) | Fellowship in Joint Replacement | NMC No: 16176',
    qualificationsNe: 'एमबीबीएस, एमएस (न्याम्स) | फेलोसिप इन जोइन्ट रिप्लेसमेन्ट | एनएमसी नं: १६१७६',
    specialtyEn: 'Orthopedics & Joint Replacement (Senior Specialist)',
    specialtyNe: 'हाडजोर्नी तथा नशा रोग विशेषज्ञ',
    bioEn: 'Dr. Vijay Kumar Mehta is an Orthopedic Surgeon with advanced fellowship credentials in joint replacement. He diagnoses and treats arthritis, joint degenerations, spine and nerve pain, sports trauma, and complex fractures.',
    bioNe: 'डा. विजय कुमार मेहता न्याम्सबाट एमएस तथा जोर्नी प्रत्यारोपण (Joint Replacement) मा फेलोसिप प्राप्त हाडजोर्नी तथा नशा रोग विशेषज्ञ हुनुहुन्छ। उहाँले जोर्नी दुखाइ, भाँचिएको हड्डी र नशा सम्बन्धी उपचार गर्नुहुन्छ।',
    consultationFee: 700,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: true,
    createdAt: now,
  },
  {
    id: 'doc-sabita-khadka',
    slug: 'dr-sabita-khadka',
    nameEn: 'Dr. Sabita Khadka',
    nameNe: 'डा. सबिता खड्का',
    photoUrl: '/images/doctors/sabita-khadka.jpg',
    qualificationsEn: 'MBBS, MD (Psychiatry), NAMS | NMC No: 11715',
    qualificationsNe: 'एमबीबीएस, एमडी (मानसरोग), न्याम्स | एनएमसी नं: ११७१५',
    specialtyEn: 'Psychiatry & Mental Health (Senior Specialist)',
    specialtyNe: 'वरिष्ठ मानसिक रोग विशेषज्ञ',
    bioEn: 'Dr. Sabita Khadka is a Senior Psychiatrist specializing in adult and adolescent mental health, offering clinical evaluations and therapy for depressive episodes, anxiety, obsessive-compulsive concerns, insomnia, and psychological wellbeing.',
    bioNe: 'डा. सबिता खड्का न्याम्सबाट एमडी प्राप्त वरिष्ठ मानसिक रोग विशेषज्ञ हुनुहुन्छ। उहाँले डिप्रेसन, एन्जाइटी, अनिद्रा, तनाव व्यवस्थापन तथा मानसिक स्वास्थ्य परामर्श सेवा प्रदान गर्नुहुन्छ।',
    consultationFee: 600,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: false,
    createdAt: now,
  },
  {
    id: 'doc-tapan-pradhan',
    slug: 'dr-tapan-pradhan',
    nameEn: 'Dr. Tapan Pradhan',
    nameNe: 'डा. तपन प्रधान',
    photoUrl: '/images/doctors/tapan-pradhan.jpg',
    qualificationsEn: 'MBBS, MD (Dermatology & Venereology) | NMC No: 11834',
    qualificationsNe: 'एमबीबीएस, एमडी (छाला तथा यौनरोग) | एनएमसी नं: ११८३४',
    specialtyEn: 'Dermatology & Venereology (Senior Specialist)',
    specialtyNe: 'वरिष्ठ यौन तथा छाला रोग विशेषज्ञ',
    bioEn: 'Dr. Tapan Pradhan is a Senior Consultant Dermatologist treating chronic eczema, psoriasis, acne, hair fall, fungal skin infections, and sexually transmitted diseases with evidence-based dermatological care.',
    bioNe: 'डा. तपन प्रधान छाला तथा यौनरोगका वरिष्ठ विशेषज्ञ हुनुहुन्छ। उहाँले दाद, एलर्जी, डण्डीफोर, कपाल तथा नङका समस्या र यौनरोग सम्बन्धी आधुनिक उपचार तथा परामर्श प्रदान गर्नुहुन्छ।',
    consultationFee: 600,
    slotDurationMinutes: 20,
    isActive: true,
    isFeatured: false,
    createdAt: now,
  },
];

// Map old doctor IDs in appointments to one of the new doctor IDs
const defaultDoctorId = facebookDoctors[1].id; // Dr. Nikesh Raj Shrestha
for (const appt of d.appointments) {
  if (appt.doctorId) {
    appt.doctorId = defaultDoctorId;
  }
}

// Replace doctor list
d.doctors = facebookDoctors;

// 3. Generate Consultation Schedules for All 9 Doctors
// Clinic is open Sunday to Friday (0 to 5), closed Saturday (6)
d.doctorSchedules = [];
for (const doc of facebookDoctors) {
  // Morning or afternoon sessions between 08:00 (480) and 18:00 (1080)
  for (let day = 0; day <= 5; day++) {
    d.doctorSchedules.push({
      id: uid(),
      doctorId: doc.id,
      dayOfWeek: day,
      startTimeMinutes: 540, // 09:00 AM
      endTimeMinutes: 1020,  // 05:00 PM
    });
  }
}

// 4. Enrich Medical Services with flyer highlights
const servicesMap = new Map(d.medicalServices.map(s => [s.slug, s]));
const ensureService = (s) => {
  if (!servicesMap.has(s.slug)) {
    const newS = { id: uid(), ...s, isActive: true, createdAt: now };
    d.medicalServices.push(newS);
    servicesMap.set(s.slug, newS);
  }
};

ensureService({
  slug: 'echo-ecg-service',
  nameEn: 'Echocardiography (2D Echo) & ECG',
  nameNe: 'इकोकार्डियोग्राफी (2D Echo) तथा इसिजी सेवा',
  descriptionEn: 'High-resolution cardiac ultrasound and electrical rhythm testing supervised by senior consultant cardiologists.',
  descriptionNe: 'वरिष्ठ मुटुरोग विशेषज्ञद्वारा उच्च गुणस्तरको मुटुको भिडियो एक्सरे (इको) तथा इसिजी परीक्षण।',
  fee: 1500,
  bookingMode: 'request',
  isFeatured: true,
});

ensureService({
  slug: 'digital-xray-usg-service',
  nameEn: 'Digital X-Ray & Ultrasound (USG)',
  nameNe: 'डिजिटल एक्सरे तथा भिडियो एक्सरे सेवा',
  descriptionEn: 'State-of-the-art digital radiography and abdominal/pelvic sonography for rapid diagnostic assessment.',
  descriptionNe: 'पेट, छाती तथा हाडजोर्नीको आधुनिक डिजिटल एक्सरे तथा अल्ट्रासाउन्ड (भिडियो एक्सरे) सुविधा।',
  fee: 1000,
  bookingMode: 'request',
  isFeatured: true,
});

ensureService({
  slug: 'pharmacy-service',
  nameEn: 'In-House Registered Pharmacy',
  nameNe: 'फार्मेसी सेवा सुविधा',
  descriptionEn: 'Comprehensive on-site pharmacy providing authentic prescription medicines, wellness supplies, and patient counseling.',
  descriptionNe: 'प्रमाणित चिकित्सकद्वारा सिफारिस गरिएका गुणस्तरीय औषधि तथा स्वास्थ्य सामग्रीहरूको सुलभ फार्मेसी सेवा।',
  fee: 0,
  bookingMode: 'walk-in',
  isFeatured: true,
});

ensureService({
  slug: 'clinical-pathology-lab',
  nameEn: 'Comprehensive Clinical Pathology & Diagnostics',
  nameNe: 'आधुनिक ल्याब तथा रगत परीक्षण',
  descriptionEn: 'Automated biochemistry, hematology, hormonal and microbiological diagnostic investigations with rapid report delivery.',
  descriptionNe: 'पूर्ण स्वचालित मेसिनहरूद्वारा रगत, पिसाब तथा अन्य जैविक नमुनाहरूको भरपर्दो र द्रुत ल्याब परीक्षण।',
  fee: 500,
  bookingMode: 'request',
  isFeatured: true,
});

// Update articles reviewer
for (const art of d.articles) {
  art.reviewedByDoctorId = facebookDoctors[0].id;
  art.reviewedByDoctorName = facebookDoctors[0].nameEn;
}

fs.writeFileSync(file, JSON.stringify(d, null, 2) + '\n');
console.log('Successfully updated clinic_dev.json with Facebook flyer data:');
console.log('- Clinic Settings:', d.clinicSettings.clinic_name, d.clinicSettings.address_en);
console.log('- Doctors Count:', d.doctors.length);
console.log('- Doctor Schedules Count:', d.doctorSchedules.length);
console.log('- Services Count:', d.medicalServices.length);
