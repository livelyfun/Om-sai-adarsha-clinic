'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Trash2,
  Plus,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { ClinicClosure } from '@/lib/db/types';

export default function CmsSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [closures, setClosures] = useState<ClinicClosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New closure form
  const [newClosure, setNewClosure] = useState({
    startDate: '',
    endDate: '',
    reasonEn: '',
    reasonNe: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
      if (data.closures) setClosures(data.closures);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setSaveMessage('Clinic settings updated successfully.');
      setSettings(data.settings);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddClosure(e: React.FormEvent) {
    e.preventDefault();
    if (!newClosure.startDate || !newClosure.endDate) return;

    try {
      const res = await fetch('/api/cms/closures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClosure),
      });
      if (res.ok) {
        setNewClosure({ startDate: '', endDate: '', reasonEn: '', reasonNe: '' });
        await fetchSettings();
      }
    } catch (err) {
      console.error('Error adding closure:', err);
    }
  }

  async function handleDeleteClosure(id: string) {
    try {
      await fetch('/api/cms/closures', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchSettings();
    } catch (err) {
      console.error('Error deleting closure:', err);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
          Clinic Configuration
        </span>
        <h1 className="text-2xl font-bold text-white font-serif mt-0.5">
          Clinic Settings & Operational Rules
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure clinic identity, verified public contact details, booking lead times, cutoffs, and scheduled closures.
        </p>
      </div>

      {saveMessage && (
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-xs text-slate-500 py-12 text-center">Loading settings...</div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Section 1: Clinic Identity */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              1. Clinic Identity & Approved Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clinic Name (English)
                </label>
                <input
                  type="text"
                  value={settings.clinic_name || ''}
                  onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-400 mb-1">
                  क्लिनिकको नाम (नेपाली)
                </label>
                <input
                  type="text"
                  value={settings.clinic_name_ne || ''}
                  onChange={(e) => setSettings({ ...settings, clinic_name_ne: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verified Contact Phone
                </label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="e.g. +977-21-XXXXXX"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Public Contact Email
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="reception@omsaiclinic.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={settings.map_url || ''}
                  onChange={(e) => setSettings({ ...settings, map_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tagline (English)
                </label>
                <input
                  type="text"
                  value={settings.tagline_en || ''}
                  onChange={(e) => setSettings({ ...settings, tagline_en: e.target.value })}
                  placeholder="Compassionate Care, Reliable Diagnostics & Expert Consultations"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-400 mb-1">
                  ट्यागलाइन (नेपाली)
                </label>
                <input
                  type="text"
                  value={settings.tagline_ne || ''}
                  onChange={(e) => setSettings({ ...settings, tagline_ne: e.target.value })}
                  placeholder="सहृदयी स्वास्थ्य सेवा, गुणस्तरीय ल्याब तथा विशेषज्ञ परामर्श"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-blue-400 mb-1">
                  Official Facebook Page URL
                </label>
                <input
                  type="url"
                  value={settings.facebook_url || ''}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Appears in footer and contact cards</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Emergency Phone / Ambulance
                </label>
                <input
                  type="text"
                  value={settings.emergency_phone || ''}
                  onChange={(e) => setSettings({ ...settings, emergency_phone: e.target.value })}
                  placeholder="e.g. +977-98XXXXXXXX"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  WhatsApp Inquiry Number
                </label>
                <input
                  type="text"
                  value={settings.whatsapp_number || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  placeholder="e.g. 98XXXXXXXX"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Opening Hours Display (English)
                </label>
                <input
                  type="text"
                  value={settings.opening_hours_en || ''}
                  onChange={(e) => setSettings({ ...settings, opening_hours_en: e.target.value })}
                  placeholder="Sunday – Friday: 07:00 AM – 08:00 PM (Saturday Closed)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-400 mb-1">
                  खुल्ने समय विवरण (नेपाली)
                </label>
                <input
                  type="text"
                  value={settings.opening_hours_ne || ''}
                  onChange={(e) => setSettings({ ...settings, opening_hours_ne: e.target.value })}
                  placeholder="आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०८:०० (शनिबार बन्द)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Physical Address (English)
                </label>
                <input
                  type="text"
                  value={settings.address_en || ''}
                  onChange={(e) => setSettings({ ...settings, address_en: e.target.value })}
                  placeholder="Main Road, Janakpur / Biratnagar, Nepal"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-400 mb-1">
                  ठेगाना (नेपाली)
                </label>
                <input
                  type="text"
                  value={settings.address_ne || ''}
                  onChange={(e) => setSettings({ ...settings, address_ne: e.target.value })}
                  placeholder="मेन रोड, जनकपुर / विराटनगर, नेपाल"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-sans"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Booking Windows & Lead Times */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              2. Booking Window & Lead Time Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Min Lead Time (Hours)
                </label>
                <input
                  type="number"
                  value={settings.min_lead_time_hours ?? 2}
                  onChange={(e) => setSettings({ ...settings, min_lead_time_hours: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Minimum hours before requested slot</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Max Advance Days
                </label>
                <input
                  type="number"
                  value={settings.max_advance_booking_days ?? 30}
                  onChange={(e) => setSettings({ ...settings, max_advance_booking_days: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Maximum booking window ahead</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cancellation Cutoff (Hours)
                </label>
                <input
                  type="number"
                  value={settings.cancellation_cutoff_hours ?? 4}
                  onChange={(e) => setSettings({ ...settings, cancellation_cutoff_hours: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Hours before start time to cancel</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Open Requests Cap
                </label>
                <input
                  type="number"
                  value={settings.max_open_requests_per_patient ?? 5}
                  onChange={(e) => setSettings({ ...settings, max_open_requests_per_patient: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Max active requests per patient</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Week Start Day
                </label>
                <select
                  value={settings.week_start_day ?? 0}
                  onChange={(e) => setSettings({ ...settings, week_start_day: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value={0}>Sunday (Standard in Nepal)</option>
                  <option value={1}>Monday</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Weekly Holiday (Clinic Closed)
                </label>
                <select
                  value={settings.weekly_holiday_day ?? 6}
                  onChange={(e) => setSettings({ ...settings, weekly_holiday_day: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value={6}>Saturday (Standard National Holiday in Nepal)</option>
                  <option value={0}>Sunday</option>
                  <option value={-1}>None (Open 7 Days)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-6 py-2.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Section 3: Scheduled Clinic Closures */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
          3. Scheduled Clinic Closures & Public Holidays
        </h3>
        <p className="text-xs text-slate-400">
          Appointments cannot be requested or confirmed on closed dates.
        </p>

        {/* Existing Closures List */}
        <div className="space-y-2">
          {closures.length === 0 ? (
            <p className="text-xs text-slate-500 py-2 italic">No upcoming clinic closures configured.</p>
          ) : (
            closures.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white">
                    {c.startDate} to {c.endDate}
                  </span>
                  {c.reasonEn && <span className="text-slate-400 ml-2">({c.reasonEn})</span>}
                  {c.reasonNe && <span className="text-teal-400 ml-1">[{c.reasonNe}]</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteClosure(c.id)}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Closure Sub-form */}
        <form onSubmit={handleAddClosure} className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={newClosure.startDate}
              onChange={(e) => setNewClosure({ ...newClosure, startDate: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-300 mb-1">End Date *</label>
            <input
              type="date"
              required
              value={newClosure.endDate}
              onChange={(e) => setNewClosure({ ...newClosure, endDate: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Reason (English)</label>
            <input
              type="text"
              value={newClosure.reasonEn}
              onChange={(e) => setNewClosure({ ...newClosure, reasonEn: e.target.value })}
              placeholder="Dashain Festival"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-teal-400 mb-1">कारण (नेपाली)</label>
            <input
              type="text"
              value={newClosure.reasonNe}
              onChange={(e) => setNewClosure({ ...newClosure, reasonNe: e.target.value })}
              placeholder="दशैं बिदा"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-sans"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 text-xs font-semibold text-slate-200"
            >
              + Add Closure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
