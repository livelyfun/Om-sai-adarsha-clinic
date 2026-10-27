const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const file = path.join(__dirname, '..', 'data/clinic_dev.json');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const now = new Date().toISOString();
const uid = () => crypto.randomUUID();

const doctorsByName = new Map(d.doctors.map((doc) => [doc.nameEn, doc]));
const doctor = doctorsByName.get('Dr. Anand Sharma') || d.doctors.find((doc) => doc.isActive);

const categoryByName = new Map(d.labCategories.map((cat) => [cat.nameEn, cat]));
const ensureCategory = (nameEn, nameNe, order) => {
  if (categoryByName.has(nameEn)) return categoryByName.get(nameEn);
  const cat = { id: uid(), slug: nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), nameEn, nameNe, displayOrder: order };
  d.labCategories.push(cat);
  categoryByName.set(nameEn, cat);
  return cat;
};

const biochem = ensureCategory('Biochemistry Panel', 'बायोकेमिस्ट्री प्यानल', 1);
const hematology = ensureCategory('Hematology', 'हेमाटोलोजी', 2);
const thyroid = ensureCategory('Thyroid & Hormones', 'थाइराइड तथा हर्मोन', 3);
const diabetes = ensureCategory('Diabetes Screening', 'डायबिटिज स्क्रिनिङ', 4);

const serviceSlugs = new Set(d.medicalServices.map((s) => s.slug));
if (!serviceSlugs.has('general-opd-consultation')) {
  d.medicalServices.push({
    id: uid(),
    slug: 'general-opd-consultation',
    nameEn: 'General OPD Consultation',
    nameNe: 'सामान्य ओपीडी परामर्श',
    descriptionEn: 'A general outpatient consultation for everyday health concerns, prescriptions and referrals.',
    descriptionNe: 'दैनिक स्वास्थ्य समस्या, औषधि सिफारिस तथा रेफरलका लागि सामान्य ओपीडी परामर्श।',
    fee: 500,
    bookingMode: 'request',
    isActive: true,
    isFeatured: true,
    createdAt: now,
  });
}
if (!serviceSlugs.has('diabetes-hypertension-follow-up')) {
  d.medicalServices.push({
    id: uid(),
    slug: 'diabetes-hypertension-follow-up',
    nameEn: 'Diabetes & Blood Pressure Follow-up',
    nameNe: 'डायबिटिज तथा रक्तचाप फलोअप',
    descriptionEn: 'Routine follow-up for diabetes and hypertension, including vitals review and medication advice.',
    descriptionNe: 'डायबिटिज र उच्च रक्तचापको नियमित फलोअप, भाइटल्स समीक्षा र औषधि सल्लाह।',
    fee: 800,
    bookingMode: 'request',
    isActive: true,
    isFeatured: true,
    createdAt: now,
  });
}

const testSlugs = new Set(d.labTests.map((t) => t.slug));
const addTest = (test) => {
  if (testSlugs.has(test.slug)) return;
  d.labTests.push({
    ...test,
    id: uid(),
    isActive: true,
    isFeatured: true,
    createdAt: now,
  });
  testSlugs.add(test.slug);
};

addTest({
  categoryId: hematology.id,
  slug: 'complete-blood-count-cbc',
  nameEn: 'Complete Blood Count (CBC)',
  nameNe: 'पूर्ण रक्त गणना (सीबीसी)',
  descriptionEn: 'Screens red cells, white cells, haemoglobin and platelets — a routine baseline investigation.',
  descriptionNe: 'रक्तकोष, श्वेतकोष, हिमोग्लोबिन र प्लेटलेट जाँच्ने आधारभूत परीक्षण।',
  prepInstructionsEn: 'No fasting required.',
  prepInstructionsNe: 'खाली पेट आवश्यक छैन।',
  sampleTypeEn: 'Whole Blood',
  sampleTypeNe: 'पूर्ण रक्त',
  price: 450,
  isHomeCollectionAvailable: true,
});

addTest({
  categoryId: thyroid.id,
  slug: 'thyroid-profile-t3-t4-tsh',
  nameEn: 'Thyroid Profile (T3, T4, TSH)',
  nameNe: 'थाइराइड प्रोफाइल (टी३, टी४, टीएसएच)',
  descriptionEn: 'Assesses thyroid function for fatigue, weight change and other related symptoms.',
  descriptionNe: 'थकान, तौल परिवर्तन तथा सम्बन्धित लक्षणका लागि थाइराइड कार्यक्षमता जाँच।',
  prepInstructionsEn: 'Morning sample preferred. No fasting required.',
  prepInstructionsNe: 'बिहानको नमुना उपयुक्त। खाली पेट आवश्यक छैन।',
  sampleTypeEn: 'Serum Blood',
  sampleTypeNe: 'सीरम रक्त',
  price: 1200,
  isHomeCollectionAvailable: true,
});

addTest({
  categoryId: diabetes.id,
  slug: 'hba1c-glycated-hemoglobin',
  nameEn: 'HbA1c (Glycated Haemoglobin)',
  nameNe: 'एचबीए१सी (ग्लाइकेटेड हिमोग्लोबिन)',
  descriptionEn: 'Reflects average blood sugar over the last three months for diabetes monitoring.',
  descriptionNe: 'पछिल्लो तीन महिनाको औसत रक्त सुगर देखाउने डायबिटिज निगरानी परीक्षण।',
  prepInstructionsEn: 'No fasting required.',
  prepInstructionsNe: 'खाली पेट आवश्यक छैन।',
  sampleTypeEn: 'Whole Blood',
  sampleTypeNe: 'पूर्ण रक्त',
  price: 900,
  isHomeCollectionAvailable: true,
});

addTest({
  categoryId: biochem.id,
  slug: 'kidney-function-test-kft',
  nameEn: 'Kidney Function Test (KFT)',
  nameNe: 'मृगौला कार्य परीक्षण (केएफटी)',
  descriptionEn: 'Measures urea, creatinine and electrolytes to review kidney function.',
  descriptionNe: 'मृगौलाको कार्यक्षमता हेर्न युरिया, क्रिएटिनिन तथा इलेक्ट्रोलाइट मापन।',
  prepInstructionsEn: '8 hours fasting recommended.',
  prepInstructionsNe: '८ घण्टा खाली पेट रहन सिफारिस गरिन्छ।',
  sampleTypeEn: 'Serum Blood',
  sampleTypeNe: 'सीरम रक्त',
  price: 1100,
  isHomeCollectionAvailable: true,
});

const articleSlugs = new Set(d.articles.map((a) => a.slug));
const addArticle = (article) => {
  if (articleSlugs.has(article.slug)) return;
  d.articles.push({
    id: uid(),
    titleNe: '',
    excerptNe: '',
    contentNe: '',
    reviewedByDoctorId: doctor ? doctor.id : null,
    reviewedByDoctorName: doctor ? doctor.nameEn : null,
    reviewedAt: now,
    status: 'published',
    createdAt: now,
    updatedAt: now,
    ...article,
  });
  articleSlugs.add(article.slug);
};

addArticle({
  slug: 'when-to-see-a-doctor-for-fever',
  titleEn: 'When Should You See a Doctor for a Fever?',
  titleNe: 'ज्वरो आउँदा कहिले चिकित्सकलाई भेट्ने?',
  excerptEn: 'Most fevers settle on their own — but some signs mean you should seek clinical advice promptly.',
  excerptNe: 'धेरैजसो ज्वरो आफैं ठीक हुन्छ — तर केही लक्षण देखिए तुरुन्त चिकित्सकीय सल्लाह लिनुपर्छ।',
  contentEn:
    'A fever is a common response to infection. Rest, fluids and monitoring are usually enough for mild cases. Seek medical advice if the fever lasts more than three days, is very high, or is accompanied by breathing difficulty, severe headache, confusion, a rash, or persistent vomiting. Young children, older adults and people with chronic conditions should be reviewed earlier.',
  contentNe:
    'ज्वरो संक्रमणको सामान्य प्रतिक्रिया हो। हल्का अवस्थामा आराम, पर्याप्त तरल र निगरानी पर्याप्त हुन्छ। ज्वरो तीन दिनभन्दा बढी रहेमा, धेरै उच्च भएमा, वा सास फेर्न कठिनाई, कडा टाउको दुखाई, अलमल, छालामा दाग वा लगातार वान्ता भएमा चिकित्सकीय सल्लाह लिनुहोस्।',
  category: 'Preventive Care',
});

addArticle({
  slug: 'understanding-your-cbc-report',
  titleEn: 'Understanding Your Complete Blood Count (CBC)',
  titleNe: 'तपाईंको सीबीसी रिपोर्ट कसरी पढ्ने?',
  excerptEn: 'Haemoglobin, white cells and platelets each tell a different part of your health story.',
  excerptNe: 'हिमोग्लोबिन, श्वेतकोष र प्लेटलेटले तपाईंको स्वास्थ्यको फरक-फरक पक्ष देखाउँछन्।',
  contentEn:
    'A CBC measures the main components of blood. Haemoglobin carries oxygen, white blood cells support immunity, and platelets help clotting. Results are interpreted against age, sex and symptoms — a single value outside the reference range is not automatically a diagnosis. Always review your report with a clinician, especially if you feel unwell.',
  contentNe:
    'सीबीसीले रक्तका मुख्य अंगहरू मापन गर्छ। हिमोग्लोबिनले अक्सिजन बोक्छ, श्वेतकोषले रोग प्रतिरोधात्मक क्षमतामा सहयोग गर्छ र प्लेटलेटले रक्त जम्न मद्दत गर्छ। नतिजालाई उमेर, लिङ्ग र लक्षणअनुसार व्याख्या गरिन्छ — सामान्य दायराभन्दा बाहिरको एक मान मात्र निदान होइन।',
  category: 'Lab Diagnostics',
});

fs.writeFileSync(file, JSON.stringify(d, null, 2) + '\n');
console.log('services:', d.medicalServices.filter((s) => s.isActive).length);
console.log('lab tests:', d.labTests.filter((t) => t.isActive).length);
console.log('categories:', d.labCategories.length);
console.log('published articles:', d.articles.filter((a) => a.status === 'published').length);
