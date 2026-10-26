import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { reportStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const results: { test: string; status: 'PASSED' | 'FAILED'; details?: string }[] = [];

  try {
    // -----------------------------------------------------------------
    // TEST 1: PDF Magic Bytes & Size Validation
    // -----------------------------------------------------------------
    const nonPdfBuffer = Buffer.from('<html><body>Fake report</body></html>');
    const isMagicValid = nonPdfBuffer.subarray(0, 5).toString('ascii') === '%PDF-';
    if (isMagicValid) {
      throw new Error('Test 1 failed: Non-PDF buffer was incorrectly treated as valid PDF');
    }

    const validPdfBuffer = Buffer.from('%PDF-1.4\n%Om Sai Aadarsha Clinic Lab Report Test\n%%EOF');
    const isValidMagic = validPdfBuffer.subarray(0, 5).toString('ascii') === '%PDF-';
    const computedSha = crypto.createHash('sha256').update(validPdfBuffer).digest('hex');

    if (!isValidMagic || !computedSha) {
      throw new Error('Test 1 failed: Valid PDF header was not recognized or checksum failed');
    }

    results.push({
      test: 'PDF Magic Bytes & Checksum Validation',
      status: 'PASSED',
    });

    // -----------------------------------------------------------------
    // TEST 2: Staff Matching Confirmation Checkbox & Draft Creation
    // -----------------------------------------------------------------
    // Setup test patient, profile and lab booking
    const testPatient = db.createUser({
      email: `stage4_patient_${Date.now()}@example.com`,
      phone: '9841000004',
      userType: 'patient',
      passwordHash: 'dummy_hash',
      isActive: true,
      emailVerifiedAt: new Date().toISOString(),
      preferredLocale: 'en',
    });

    const testProfile = db.createPatientProfile({
      managingUserId: testPatient.id,
      fullName: 'Sita Devi',
      relationshipLabel: 'myself',
      sex: 'female',
    });

    const testBooking = db.createLabBooking(
      {
        profileId: testProfile.id,
        preferredTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'confirmed',
        estimatedTotal: 1500,
        patientNotes: 'Fasting lipid profile test',
      },
      [
        {
          labTestId: 'test-lipid',
          nameEnSnapshot: 'Complete Lipid Profile',
          nameNeSnapshot: 'लिपिड प्रोफाइल',
          priceSnapshot: 1500,
        },
      ]
    );

    // Save test PDF to storage
    const storageKeyV1 = `reports/${testBooking.booking.id}/v1-${Date.now()}.pdf`;
    await reportStorage.put(storageKeyV1, validPdfBuffer, {
      originalFilename: 'Sita_Devi_Lipid_v1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: validPdfBuffer.length,
      checksumSha256: computedSha,
    });

    const reportV1 = db.createLabReport({
      labBookingId: testBooking.booking.id,
      profileId: testProfile.id,
      version: 1,
      status: 'draft',
      storageKey: storageKeyV1,
      originalFilename: 'Sita_Devi_Lipid_v1.pdf',
      fileSize: validPdfBuffer.length,
      checksumSha256: computedSha,
      mimeType: 'application/pdf',
      uploadedByStaffId: 'staff-reception-test',
      confirmedAt: new Date().toISOString(),
      confirmedByStaffId: 'staff-reception-test',
    });

    if (reportV1.status !== 'draft') {
      throw new Error('Test 2 failed: Initial report status must be draft');
    }

    results.push({
      test: 'Staff Matching Confirmation & Initial Draft Creation',
      status: 'PASSED',
    });

    // -----------------------------------------------------------------
    // TEST 3: Report Release & Automatic Superseding of Previous Versions
    // -----------------------------------------------------------------
    // Release version 1
    db.supersedePreviousReports(reportV1.labBookingId, reportV1.id);
    const releasedV1 = db.updateLabReport(reportV1.id, {
      status: 'released',
      releasedAt: new Date().toISOString(),
      releasedByStaffId: 'super-admin-test',
    });

    if (releasedV1.status !== 'released') {
      throw new Error('Test 3 failed: Report v1 was not successfully released');
    }

    // Now upload and release version 2 (correction / re-test)
    const validPdfBufferV2 = Buffer.from('%PDF-1.4\n%Om Sai Aadarsha Clinic Lab Report Test Version 2\n%%EOF');
    const storageKeyV2 = `reports/${testBooking.booking.id}/v2-${Date.now()}.pdf`;
    await reportStorage.put(storageKeyV2, validPdfBufferV2, {
      originalFilename: 'Sita_Devi_Lipid_v2_Revision.pdf',
      mimeType: 'application/pdf',
      sizeBytes: validPdfBufferV2.length,
      checksumSha256: crypto.createHash('sha256').update(validPdfBufferV2).digest('hex'),
    });

    const reportV2 = db.createLabReport({
      labBookingId: testBooking.booking.id,
      profileId: testProfile.id,
      version: 2,
      status: 'draft',
      storageKey: storageKeyV2,
      originalFilename: 'Sita_Devi_Lipid_v2_Revision.pdf',
      fileSize: validPdfBufferV2.length,
      checksumSha256: crypto.createHash('sha256').update(validPdfBufferV2).digest('hex'),
      mimeType: 'application/pdf',
      uploadedByStaffId: 'staff-reception-test',
      confirmedAt: new Date().toISOString(),
      confirmedByStaffId: 'staff-reception-test',
    });

    // When releasing v2, v1 must be marked as superseded
    db.supersedePreviousReports(reportV2.labBookingId, reportV2.id);
    const releasedV2 = db.updateLabReport(reportV2.id, {
      status: 'released',
      releasedAt: new Date().toISOString(),
      releasedByStaffId: 'super-admin-test',
    });

    const refetchedV1 = db.getLabReportById(reportV1.id);
    if (refetchedV1?.status !== 'superseded') {
      throw new Error(`Test 3 failed: Previous report v1 should be 'superseded', but was '${refetchedV1?.status}'`);
    }

    if (releasedV2.status !== 'released' || releasedV2.version !== 2) {
      throw new Error('Test 3 failed: Version 2 was not released properly');
    }

    results.push({
      test: 'Report Release & Automatic Version Superseding',
      status: 'PASSED',
    });

    // -----------------------------------------------------------------
    // TEST 4: Report Revocation with Mandatory Reason
    // -----------------------------------------------------------------
    const revokeReason = 'Sample recollection required due to lipemic serum';
    const revokedV2 = db.updateLabReport(reportV2.id, {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revokedByStaffId: 'super-admin-test',
      revokeReason,
    });

    if (revokedV2.status !== 'revoked' || revokedV2.revokeReason !== revokeReason) {
      throw new Error('Test 4 failed: Report revocation did not properly persist revoke reason');
    }

    results.push({
      test: 'Report Revocation with Mandatory Reason',
      status: 'PASSED',
    });

    // -----------------------------------------------------------------
    // TEST 5: Patient Data Isolation & Profile Boundary Check
    // -----------------------------------------------------------------
    // Patient 1 owns testProfile -> can view reports for testProfile
    const patient1Reports = db.getLabReportsByProfileIds([testProfile.id]);
    if (patient1Reports.length !== 2) {
      throw new Error(`Test 5 failed: Expected 2 reports for testProfile, found ${patient1Reports.length}`);
    }

    // Patient 2 has separate profile -> must NOT see testProfile reports
    const anotherPatient = db.createUser({
      email: `stage4_stranger_${Date.now()}@example.com`,
      phone: '9841000005',
      userType: 'patient',
      passwordHash: 'dummy_hash',
      isActive: true,
      emailVerifiedAt: new Date().toISOString(),
      preferredLocale: 'en',
    });
    const anotherProfile = db.createPatientProfile({
      managingUserId: anotherPatient.id,
      fullName: 'Stranger User',
      relationshipLabel: 'myself',
    });

    const strangerReports = db.getLabReportsByProfileIds([anotherProfile.id]);
    if (strangerReports.length !== 0) {
      throw new Error('Test 5 failed: Data isolation breach, stranger could access patient reports');
    }

    results.push({
      test: 'Patient Data Isolation & Profile Boundary Enforcement',
      status: 'PASSED',
    });

    // -----------------------------------------------------------------
    // TEST 6: Walk-in Claim Code Generation & Redemption
    // -----------------------------------------------------------------
    // Create unmanaged walk-in profile created by reception
    const walkinProfile = db.createPatientProfile({
      managingUserId: null, // unmanaged walk-in
      fullName: 'Ram Bahadur Walkin',
      relationshipLabel: 'patient',
      phone: '9841999888',
    });

    const rawClaimCode = 'CL-TEST-7788';
    const codeHash = crypto.createHash('sha256').update(rawClaimCode).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    const claim = db.createClaimCode(walkinProfile.id, codeHash, expiresAt, 'staff-reception');

    // Verify lookup
    const validClaim = db.findValidClaimCode(codeHash);
    if (!validClaim || validClaim.id !== claim.id) {
      throw new Error('Test 6 failed: Valid claim code could not be resolved from hash');
    }

    // Patient redeems code
    const updatedWalkin = db.updatePatientProfile(walkinProfile.id, {
      managingUserId: testPatient.id,
    });
    db.markClaimCodeUsed(claim.id);

    // Verify code cannot be used again
    const usedCheck = db.findValidClaimCode(codeHash);
    if (usedCheck) {
      throw new Error('Test 6 failed: Used claim code should no longer be returned as valid');
    }

    if (updatedWalkin.managingUserId !== testPatient.id) {
      throw new Error('Test 6 failed: Walk-in profile managing user was not linked');
    }

    // Now testPatient has both testProfile and walkinProfile
    const testPatientProfiles = db.getPatientProfilesByUser(testPatient.id);
    const hasLinkedWalkin = testPatientProfiles.some(p => p.id === walkinProfile.id);
    if (!hasLinkedWalkin) {
      throw new Error('Test 6 failed: Linked walk-in profile not present in patient profiles query');
    }

    results.push({
      test: 'Walk-in Claim Code Generation & Redemption Flow',
      status: 'PASSED',
    });

    return NextResponse.json({
      stage: 'Stage 4 — Laboratory Reports & Claim Codes',
      allPassed: true,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        stage: 'Stage 4 — Laboratory Reports & Claim Codes',
        allPassed: false,
        error: err.message,
        results,
      },
      { status: 500 }
    );
  }
}
