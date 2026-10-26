'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Plus,
  Edit2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Save,
  X,
  Languages,
} from 'lucide-react';
import { Doctor, DoctorSchedule } from '@/lib/db/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CmsDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Partial<Doctor> | null>(null);
  const [schedules, setSchedules] = useState<{ dayOfWeek: number; startTimeMinutes: number; endTimeMinutes: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule'>('details');
  const [filterTranslation, setFilterTranslation] = useState<'all' | 'complete' | 'missing_ne'>('all');
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/doctors');
      const data = await res.json();
      if (data.doctors) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectDoctor(doc: Doctor) {
    setSelectedDoctor(doc);
    setActiveTab('details');
    setSaveMessage('');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/cms/doctors/${doc.id}/schedules`);
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (err) {
      setSchedules([]);
    }
  }

  function handleCreateNew() {
    setSelectedDoctor({
      slug: '',
      nameEn: '',
      nameNe: '',
      specialtyEn: '',
      specialtyNe: '',
      qualificationsEn: '',
      qualificationsNe: '',
      bioEn: '',
      bioNe: '',
      consultationFee: 500,
      slotDurationMinutes: 20,
      isActive: true,
      isFeatured: false,
    });
    setSchedules([
      { dayOfWeek: 0, startTimeMinutes: 540, endTimeMinutes: 1020 },
      { dayOfWeek: 1, startTimeMinutes: 540, endTimeMinutes: 1020 },
      { dayOfWeek: 2, startTimeMinutes: 540, endTimeMinutes: 1020 },
      { dayOfWeek: 3, startTimeMinutes: 540, endTimeMinutes: 1020 },
      { dayOfWeek: 4, startTimeMinutes: 540, endTimeMinutes: 1020 },
      { dayOfWeek: 5, startTimeMinutes: 540, endTimeMinutes: 1020 },
    ]);
    setActiveTab('details');
    setSaveMessage('');
    setErrorMessage('');
  }

  async function handleSaveDoctor(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDoctor) return;
    setIsSaving(true);
    setSaveMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/cms/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedDoctor),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save doctor');

      const savedDoc = data.doctor;
      // Save schedules if existing or created
      if (savedDoc.id && schedules.length > 0) {
        await fetch(`/api/cms/doctors/${savedDoc.id}/schedules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedules }),
        });
      }

      setSaveMessage('Doctor profile and weekly schedules saved successfully.');
      await fetchDoctors();
      setSelectedDoctor(savedDoc);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving doctor');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(doc: Doctor) {
    try {
      const res = await fetch('/api/cms/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doc, isActive: !doc.isActive }),
      });
      if (res.ok) {
        await fetchDoctors();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  }

  // Filtered doctors by translation
  const filteredDoctors = doctors.filter((d) => {
    const isComplete = Boolean(d.nameNe && d.specialtyNe);
    if (filterTranslation === 'complete') return isComplete;
    if (filterTranslation === 'missing_ne') return !isComplete;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Catalogue Management
          </span>
          <h1 className="text-2xl font-bold text-white font-serif mt-0.5">
            Doctor Profiles & Weekly Schedules
          </h1>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Main Split Layout: Doctor List on Left, Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Doctor Table / Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Filter Translations:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterTranslation('all')}
                className={`px-2.5 py-1 rounded-md ${
                  filterTranslation === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({doctors.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTranslation('missing_ne')}
                className={`px-2.5 py-1 rounded-md ${
                  filterTranslation === 'missing_ne' ? 'bg-amber-950 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Missing Nepali ({doctors.filter(d => !d.nameNe || !d.specialtyNe).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 py-8 text-center">Loading doctor roster...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
              No doctors found. Click <strong>Add New Doctor</strong> to create one.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredDoctors.map((doc) => {
                const hasNepali = Boolean(doc.nameNe && doc.specialtyNe);
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-slate-900 shadow-md'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{doc.nameEn}</h4>
                          {doc.isActive ? (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-400 rounded-md border border-emerald-800/40">
                              Published
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 rounded-md">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-teal-400 mt-0.5">{doc.specialtyEn}</p>
                        {doc.nameNe && <p className="text-xs text-slate-400 font-sans mt-0.5">{doc.nameNe}</p>}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(doc);
                          }}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            doc.isActive
                              ? 'border-emerald-800/60 bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                              : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                          title={doc.isActive ? 'Deactivate Doctor' : 'Publish Doctor'}
                        >
                          {doc.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Fee: NPR {doc.consultationFee}</span>
                      <span className={`flex items-center gap-1 ${hasNepali ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <Languages className="h-3 w-3" />
                        <span>{hasNepali ? 'Bilingual Complete' : 'Missing Nepali'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Doctor Editor Form */}
        <div className="lg:col-span-7">
          {selectedDoctor ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      activeTab === 'details' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Profile & Translation
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      activeTab === 'schedule' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2. Weekly Schedule Windows
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
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

              <form onSubmit={handleSaveDoctor} className="space-y-4">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    {/* Basic Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          URL Slug *
                        </label>
                        <input
                          type="text"
                          required
                          value={selectedDoctor.slug || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, slug: e.target.value })}
                          placeholder="dr-ramesh-shrestha"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Consultation Fee (NPR)
                        </label>
                        <input
                          type="number"
                          value={selectedDoctor.consultationFee ?? 500}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, consultationFee: Number(e.target.value) })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Side-by-Side English & Nepali Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Full Name (English) *
                        </label>
                        <input
                          type="text"
                          required
                          value={selectedDoctor.nameEn || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, nameEn: e.target.value })}
                          placeholder="Dr. Ramesh Shrestha"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-teal-400 mb-1">
                          नाम (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={selectedDoctor.nameNe || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, nameNe: e.target.value })}
                          placeholder="डा. रमेश श्रेष्ठ"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden font-sans"
                        />
                      </div>
                    </div>

                    {/* Specialty Side-by-Side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Specialty (English) *
                        </label>
                        <input
                          type="text"
                          required
                          value={selectedDoctor.specialtyEn || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, specialtyEn: e.target.value })}
                          placeholder="General Physician / Internal Medicine"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-teal-400 mb-1">
                          विशेषज्ञता (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={selectedDoctor.specialtyNe || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, specialtyNe: e.target.value })}
                          placeholder="वरिष्ठ फिजिसियन तथा मुटुरोग विशेषज्ञ"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden font-sans"
                        />
                      </div>
                    </div>

                    {/* Qualifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Qualifications (English)
                        </label>
                        <input
                          type="text"
                          value={selectedDoctor.qualificationsEn || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, qualificationsEn: e.target.value })}
                          placeholder="MBBS, MD (Internal Medicine)"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-teal-400 mb-1">
                          शैक्षिक योग्यता (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={selectedDoctor.qualificationsNe || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, qualificationsNe: e.target.value })}
                          placeholder="एमबिबिएस, एमडी"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden font-sans"
                        />
                      </div>
                    </div>

                    {/* Biography */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Biography (English)
                        </label>
                        <textarea
                          rows={3}
                          value={selectedDoctor.bioEn || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, bioEn: e.target.value })}
                          placeholder="Over 12 years of clinical practice in diagnostic and therapeutic medicine..."
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2.5 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-teal-400 mb-1">
                          परिचय तथा अनुभव (नेपाली)
                        </label>
                        <textarea
                          rows={3}
                          value={selectedDoctor.bioNe || ''}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, bioNe: e.target.value })}
                          placeholder="विभिन्न शिक्षण अस्पतालहरूमा १२ वर्षभन्दा बढीको क्लिनिकल अनुभव..."
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2.5 text-xs text-white focus:border-teal-500 focus:outline-hidden font-sans"
                        />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="pt-2 flex items-center gap-6 text-xs text-slate-300">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDoctor.isActive ?? true}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, isActive: e.target.checked })}
                          className="rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Active & Published on Public Site</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDoctor.isFeatured ?? false}
                          onChange={(e) => setSelectedDoctor({ ...selectedDoctor, isFeatured: e.target.checked })}
                          className="rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Feature on Homepage</span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Configure weekly working windows. Slot booking computation automatically respects these hours and checks for conflicts against confirmed appointments.
                    </p>

                    <div className="space-y-2">
                      {DAYS.map((dayName, dayIndex) => {
                        const existing = schedules.find((s) => s.dayOfWeek === dayIndex);
                        const isWorking = Boolean(existing);

                        return (
                          <div
                            key={dayIndex}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                              isWorking
                                ? 'border-teal-800 bg-teal-950/20 text-white'
                                : 'border-slate-800 bg-slate-950/40 text-slate-500'
                            }`}
                          >
                            <label className="flex items-center gap-3 cursor-pointer w-32">
                              <input
                                type="checkbox"
                                checked={isWorking}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSchedules([...schedules, { dayOfWeek: dayIndex, startTimeMinutes: 540, endTimeMinutes: 1020 }]);
                                  } else {
                                    setSchedules(schedules.filter((s) => s.dayOfWeek !== dayIndex));
                                  }
                                }}
                                className="rounded border-slate-700 text-teal-600"
                              />
                              <span className="font-semibold">{dayName}</span>
                            </label>

                            {isWorking ? (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Hours:</span>
                                <input
                                  type="time"
                                  value={`${String(Math.floor((existing?.startTimeMinutes || 540) / 60)).padStart(2, '0')}:${String((existing?.startTimeMinutes || 540) % 60).padStart(2, '0')}`}
                                  onChange={(e) => {
                                    const [h, m] = e.target.value.split(':').map(Number);
                                    setSchedules(
                                      schedules.map((s) =>
                                        s.dayOfWeek === dayIndex ? { ...s, startTimeMinutes: h * 60 + m } : s
                                      )
                                    );
                                  }}
                                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                                />
                                <span className="text-slate-500">to</span>
                                <input
                                  type="time"
                                  value={`${String(Math.floor((existing?.endTimeMinutes || 1020) / 60)).padStart(2, '0')}:${String((existing?.endTimeMinutes || 1020) % 60).padStart(2, '0')}`}
                                  onChange={(e) => {
                                    const [h, m] = e.target.value.split(':').map(Number);
                                    setSchedules(
                                      schedules.map((s) =>
                                        s.dayOfWeek === dayIndex ? { ...s, endTimeMinutes: h * 60 + m } : s
                                      )
                                    );
                                  }}
                                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                                />
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">Day Off / Closed</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Doctor & Schedules'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
              Select a doctor from the list on the left or click <strong>Add New Doctor</strong> to create and manage their profile and weekly hours.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
