'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Filter,
  Search,
  ArrowRight,
  User,
  Shield,
  MessageSquare,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { Appointment, LabBooking, Doctor } from '@/lib/db/types';

export default function CmsBookingsManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labBookings, setLabBookings] = useState<LabBooking[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'appointment' | 'lab'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected for review modal
  const [selectedBooking, setSelectedBooking] = useState<{
    item: Appointment | LabBooking;
    type: 'appointment' | 'lab';
  } | null>(null);

  const [historyEvents, setHistoryEvents] = useState<any[]>([]);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states for decline/reschedule
  const [actionType, setActionType] = useState<'confirm' | 'decline' | 'reschedule' | 'complete' | 'no_show' | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00');
  const [internalNote, setInternalNote] = useState('');

  useEffect(() => {
    loadAllBookings();
  }, []);

  async function loadAllBookings() {
    setLoading(true);
    try {
      const [aptRes, labRes, docRes] = await Promise.all([
        fetch('/api/cms/bookings/appointments'),
        fetch('/api/cms/bookings/labs'),
        fetch('/api/cms/doctors'),
      ]);
      const aptData = await aptRes.json();
      const labData = await labRes.json();
      const docData = await docRes.json();

      if (aptData.appointments) setAppointments(aptData.appointments);
      if (labData.labBookings) setLabBookings(labData.labBookings);
      if (docData.doctors) setDoctors(docData.doctors);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openReviewModal(item: Appointment | LabBooking, type: 'appointment' | 'lab') {
    setSelectedBooking({ item, type });
    setActionError('');
    setActionSuccess('');
    setActionType(null);
    setDeclineReason('');
    setInternalNote('');

    // Fetch status history events
    try {
      const res = await fetch(`/api/cms/bookings/history?id=${item.id}`);
      const data = await res.json();
      setHistoryEvents(data.events || []);
    } catch {
      setHistoryEvents([]);
    }
  }

  async function executeAction() {
    if (!selectedBooking || !actionType) return;
    setIsProcessing(true);
    setActionError('');
    setActionSuccess('');

    try {
      let targetStatus = '';
      let proposedStart: string | undefined = undefined;

      if (actionType === 'confirm') targetStatus = 'confirmed';
      if (actionType === 'decline') targetStatus = 'declined';
      if (actionType === 'reschedule') {
        targetStatus = 'reschedule_proposed';
        const [h, m] = rescheduleTime.split(':').map(Number);
        proposedStart = new Date(`${rescheduleDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`).toISOString();
      }
      if (actionType === 'complete') targetStatus = 'completed';
      if (actionType === 'no_show') targetStatus = 'no_show';

      const res = await fetch('/api/bookings/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: selectedBooking.type,
          bookingId: selectedBooking.item.id,
          targetStatus,
          patientMessage: actionType === 'decline' ? declineReason : (actionType === 'reschedule' ? `Proposed new time: ${rescheduleDate} at ${rescheduleTime}` : undefined),
          internalNote,
          proposedStartTime: proposedStart,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Action failed.');
      }

      setActionSuccess(`Booking ${selectedBooking.item.referenceNo} transitioned to ${targetStatus}.`);
      await loadAllBookings();
      setSelectedBooking({ item: data.booking, type: selectedBooking.type });
      setActionType(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update booking status.');
    } finally {
      setIsProcessing(false);
    }
  }

  // Combined and filtered bookings list
  const combined: { item: Appointment | LabBooking; type: 'appointment' | 'lab' }[] = [
    ...appointments.map(a => ({ item: a, type: 'appointment' as const })),
    ...labBookings.map(l => ({ item: l, type: 'lab' as const })),
  ].sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime());

  const filtered = combined.filter(({ item, type }) => {
    if (typeFilter !== 'all' && type !== typeFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = item.referenceNo.toLowerCase().includes(q);
      const matchName = (item as any).doctorNameSnapshot?.toLowerCase().includes(q) || false;
      return matchRef || matchName;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Reception Desk Operations
          </span>
          <h1 className="text-2xl font-bold text-white font-serif mt-0.5">
            Bookings Queue & Schedule Conflict Review
          </h1>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filtered.length}</strong> of {combined.length} requests
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review (Action Required)</option>
              <option value="reschedule_proposed">Reschedule Proposed</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
            >
              <option value="all">All Types</option>
              <option value="appointment">Doctor / Service</option>
              <option value="lab">Lab Diagnostics</option>
            </select>
          </div>
        </div>

        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference (e.g. OSA-...)"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-1.5 pl-3 pr-8 text-xs text-white"
          />
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="text-xs text-slate-500 py-12 text-center">Loading bookings queue...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400">
          No bookings matching the active filters.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Provider / Details</th>
                  <th className="py-3 px-4">Requested Date/Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(({ item, type }) => {
                  const isAppointment = type === 'appointment';
                  const apt = item as Appointment;
                  const lab = item as LabBooking;
                  const time = isAppointment ? apt.startTime : lab.preferredTime;
                  const isPending = item.status === 'pending';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isPending ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {item.referenceNo}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-400">
                        {type}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {isAppointment ? apt.doctorNameSnapshot : `Diagnostic Lab (${lab.estimatedTotal ? `NPR ${lab.estimatedTotal}` : 'Investigation'})`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {new Date(time).toLocaleDateString()} at {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'confirmed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : item.status === 'pending'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                              : item.status === 'reschedule_proposed'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openReviewModal(item, type)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-[11px] font-semibold text-white border border-slate-700 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Review & Conflict Resolution Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm bg-slate-800 px-3 py-1 rounded-lg text-white">
                  {selectedBooking.item.referenceNo}
                </span>
                <span className="text-xs uppercase font-bold text-teal-400">
                  {selectedBooking.item.status.replace('_', ' ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionError && (
              <div className="rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Booking Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Requested Provider/Test:</span>
                <span className="font-bold text-white mt-0.5 block">
                  {selectedBooking.type === 'appointment'
                    ? (selectedBooking.item as Appointment).doctorNameSnapshot
                    : 'Laboratory Investigation'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Scheduled Time:</span>
                <span className="font-bold text-white mt-0.5 block">
                  {new Date(
                    selectedBooking.type === 'appointment'
                      ? (selectedBooking.item as Appointment).startTime
                      : (selectedBooking.item as LabBooking).preferredTime
                  ).toLocaleString()}
                </span>
              </div>
              {selectedBooking.item.patientNotes && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block">Patient Symptom Note:</span>
                  <p className="text-slate-300 italic mt-0.5">{selectedBooking.item.patientNotes}</p>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Reception Actions
              </span>

              {selectedBooking.item.status === 'pending' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType('confirm')}
                    className="p-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm Request</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('reschedule')}
                    className="p-3 rounded-xl bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Propose New Time</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('decline')}
                    className="p-3 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Decline Request</span>
                  </button>
                </div>
              )}

              {selectedBooking.item.status === 'confirmed' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType('complete')}
                    className="p-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mark Completed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('no_show')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Mark No Show</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('reschedule')}
                    className="p-3 rounded-xl bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Propose Reschedule</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sub-form when an action is selected */}
            {actionType && (
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-950/80 space-y-4 text-xs animate-in fade-in-50">
                <h4 className="font-bold text-white capitalize">Action: {actionType.replace('_', ' ')}</h4>

                {actionType === 'decline' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Decline Reason (Visible to patient) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Doctor called for emergency surgery; please request another date."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white"
                    />
                  </div>
                )}

                {actionType === 'reschedule' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Proposed Date *</label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Proposed Time *</label>
                      <input
                        type="time"
                        required
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Internal Staff Note (Private)
                  </label>
                  <input
                    type="text"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Desk notes for audit history..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="px-3 py-1.5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={executeAction}
                    className="rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2 text-xs font-bold text-white shadow-xs"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Action'}
                  </button>
                </div>
              </div>
            )}

            {/* Audit Status History */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status History Audit Trail
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {historyEvents.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No previous events logged.</p>
                ) : (
                  historyEvents.map((ev) => (
                    <div key={ev.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-0.5">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-teal-400 font-bold">{ev.fromStatus} → {ev.toStatus}</span>
                        <span className="text-slate-500">{new Date(ev.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300">Actor: {ev.actorType} ({ev.actorUserId || 'system'})</p>
                      {ev.patientMessage && <p className="text-slate-400 italic">Msg: &quot;{ev.patientMessage}&quot;</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
