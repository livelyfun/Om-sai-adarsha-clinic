import React from 'react';
import Link from 'next/link';
import { getAuthContext } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
  Calendar,
  Users,
  FlaskConical,
  FileCheck,
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default async function CmsDashboardPage() {
  const auth = await getAuthContext();

  // Strict server authorization check (Section 9)
  if (!auth.user) {
    redirect('/sai-clinic-management/login');
  }

  // Patients trying to reach CMS receive Access Denied (Section 6 & 9)
  if (!auth.isStaff) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md bg-slate-900 border border-red-800 p-8 rounded-2xl text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-white">403 — Access Denied</h2>
          <p className="text-xs text-slate-400">
            You do not have staff credentials to access the Clinic Management System.
          </p>
          <Link
            href="/en/portal/dashboard"
            className="inline-block mt-4 text-xs font-semibold text-teal-400 hover:underline"
          >
            ← Return to Patient Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const staff = auth.user;
  const isSuperAdmin = auth.isSuperAdmin;

  // Compute live operational counts
  const allAppointments = (db as any).data.appointments as any[];
  const allLabBookings = (db as any).data.labBookings as any[];
  const allReports = (db as any).data.labReports as any[];
  const allPatients = (db as any).data.patientProfiles as any[];
  const recentAudit = db.getAuditLogs(5);

  const pendingAppointments = allAppointments.filter(a => a.status === 'pending').length;
  const pendingLabs = allLabBookings.filter(l => l.status === 'pending').length;
  const draftReports = allReports.filter(r => r.status === 'draft').length;
  const rescheduleWaiting = allAppointments.filter(a => a.status === 'reschedule_proposed').length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Clinic Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-teal-400 font-semibold">{staff.email}</span> ({isSuperAdmin ? 'Super Administrator' : 'Reception Staff'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sai-clinic-management/bookings"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>Manage Bookings</span>
          </Link>
          <Link
            href="/sai-clinic-management/reports"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-semibold text-white transition-colors"
          >
            <FlaskConical className="h-4 w-4 text-teal-400" />
            <span>Lab Reports</span>
          </Link>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Doctor Requests</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{pendingAppointments}</div>
          <p className="text-[11px] text-slate-500">Awaiting front desk review & confirmation</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Lab Requests</span>
            <FlaskConical className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-3xl font-bold text-white">{pendingLabs}</div>
          <p className="text-[11px] text-slate-500">Diagnostic investigation requests</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Waiting on Patient</span>
            <AlertTriangle className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white">{rescheduleWaiting}</div>
          <p className="text-[11px] text-slate-500">Reschedule proposals sent to patients</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Draft Lab Reports</span>
            <FileCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{draftReports}</div>
          <p className="text-[11px] text-slate-500">Uploaded PDFs awaiting authorized release</p>
        </div>
      </div>

      {/* Main Content Split: Quick Ops & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions & Operations Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Front Desk Quick Operations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/sai-clinic-management/patients"
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors flex items-start gap-3"
              >
                <div className="p-2.5 rounded-lg bg-teal-900/40 text-teal-400 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Patient Registry</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search patient records, issue walk-in claim codes, or manage profiles.
                  </p>
                </div>
              </Link>

              <Link
                href="/sai-clinic-management/bookings"
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors flex items-start gap-3"
              >
                <div className="p-2.5 rounded-lg bg-emerald-900/40 text-emerald-400 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Bookings Queue</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review incoming requests, detect doctor conflicts, propose alternative slots.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Catalogues & Clinical Content
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <Link
                href="/sai-clinic-management/doctors"
                className="p-3.5 rounded-xl border border-slate-800 hover:border-teal-700 bg-slate-950/40 flex items-center justify-between"
              >
                <span className="font-semibold text-slate-200">Doctor Roster & Schedules</span>
                <ArrowRight className="h-3.5 w-3.5 text-teal-400" />
              </Link>
              <Link
                href="/sai-clinic-management/services"
                className="p-3.5 rounded-xl border border-slate-800 hover:border-teal-700 bg-slate-950/40 flex items-center justify-between"
              >
                <span className="font-semibold text-slate-200">Medical Services</span>
                <ArrowRight className="h-3.5 w-3.5 text-teal-400" />
              </Link>
              <Link
                href="/sai-clinic-management/lab-catalogue"
                className="p-3.5 rounded-xl border border-slate-800 hover:border-teal-700 bg-slate-950/40 flex items-center justify-between"
              >
                <span className="font-semibold text-slate-200">Lab Tests Catalogue</span>
                <ArrowRight className="h-3.5 w-3.5 text-teal-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Security & Audit Stream */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <Shield className="h-4 w-4 text-teal-400" />
              <span>Recent Security Events</span>
            </div>
            {isSuperAdmin && (
              <Link href="/sai-clinic-management/audit" className="text-xs text-teal-400 hover:underline">
                View All
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {recentAudit.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No audit records yet.</p>
            ) : (
              recentAudit.map((log) => (
                <div key={log.id} className="text-xs p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-teal-400 font-semibold">{log.action}</span>
                    <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 truncate">
                    Actor: {log.actorEmail || log.actorType}
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Type: {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
