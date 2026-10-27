import { db } from '../lib/db';
import { hashPassword } from '../lib/auth/password';
import { runDevelopmentSeed } from '../lib/db/seed';

console.log('Running development seed...');
runDevelopmentSeed();

// Also ensure mithleshkumar527@gmail.com has known password PatientPass123!
const mithlesh = db.getUserByEmail('mithleshkumar527@gmail.com');
if (mithlesh) {
  db.updateUser(mithlesh.id, {
    passwordHash: hashPassword('PatientPass123!'),
    emailVerifiedAt: new Date().toISOString(),
    isActive: true,
  });
  console.log('User mithleshkumar527@gmail.com reset to PatientPass123!');
}

// Clear any rate limits so no one is locked out
const data = (db as any).data;
if (data.rateLimits) {
  for (const k of Object.keys(data.rateLimits)) {
    delete data.rateLimits[k];
  }
  (db as any).save();
}

console.log('Seed and reset complete.');
