const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'data/clinic_dev.json');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));

// Keep the first record for each catalogue name, re-pointing any references.
const dedupe = (rows, key) => {
  const seen = new Map();
  const kept = [];
  const remap = new Map();
  for (const row of rows) {
    const k = row[key].trim().toLowerCase();
    if (seen.has(k)) {
      remap.set(row.id, seen.get(k).id);
    } else {
      seen.set(k, row);
      kept.push(row);
    }
  }
  return { kept, remap };
};

const cats = dedupe(d.labCategories, 'nameEn');
d.labCategories = cats.kept.sort((a, b) => a.displayOrder - b.displayOrder);
for (const test of d.labTests) {
  if (cats.remap.has(test.categoryId)) test.categoryId = cats.remap.get(test.categoryId);
}

const services = dedupe(d.medicalServices, 'nameEn');
d.medicalServices = services.kept;
for (const appt of d.appointments) {
  if (appt.serviceId && services.remap.has(appt.serviceId)) appt.serviceId = services.remap.get(appt.serviceId);
}

const tests = dedupe(d.labTests, 'nameEn');
d.labTests = tests.kept;
for (const item of d.labBookingItems) {
  if (tests.remap.has(item.testId)) item.testId = tests.remap.get(item.testId);
}

const articles = dedupe(d.articles, 'titleEn');
d.articles = articles.kept;

fs.writeFileSync(file, JSON.stringify(d, null, 2) + '\n');

console.log('catalogue now:', {
  categories: d.labCategories.length,
  services: d.medicalServices.length,
  labTests: d.labTests.length,
  articles: d.articles.length,
});
