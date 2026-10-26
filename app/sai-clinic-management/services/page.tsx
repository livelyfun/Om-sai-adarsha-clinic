'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Eye,
  EyeOff,
  Save,
  X,
  Languages,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { MedicalService } from '@/lib/db/types';

export default function CmsServicesPage() {
  const [services, setServices] = useState<MedicalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Partial<MedicalService>>({
    slug: '',
    nameEn: '',
    nameNe: '',
    descriptionEn: '',
    descriptionNe: '',
    fee: 0,
    bookingMode: 'request',
    isActive: true,
    isFeatured: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/services');
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateNew() {
    setSelectedService({
      slug: '',
      nameEn: '',
      nameNe: '',
      descriptionEn: '',
      descriptionNe: '',
      fee: 0,
      bookingMode: 'request',
      isActive: true,
      isFeatured: false,
    });
    setIsEditing(true);
    setSaveMessage('');
    setErrorMessage('');
  }

  function handleSelect(s: MedicalService) {
    setSelectedService(s);
    setIsEditing(true);
    setSaveMessage('');
    setErrorMessage('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/cms/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedService),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save service');

      setSaveMessage('Medical service saved successfully.');
      await fetchServices();
      setSelectedService(data.service);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving service');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(s: MedicalService) {
    try {
      const res = await fetch('/api/cms/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, isActive: !s.isActive }),
      });
      if (res.ok) await fetchServices();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Catalogue Management
          </span>
          <h1 className="text-2xl font-bold text-white font-serif mt-0.5">
            Medical Services Catalogue
          </h1>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="text-xs text-slate-500 py-8 text-center">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
              No services created yet. Click <strong>Add New Service</strong> to define outpatient procedures.
            </div>
          ) : (
            services.map((s) => {
              const hasNepali = Boolean(s.nameNe);
              const isSelected = selectedService?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 bg-slate-900 shadow-md'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{s.nameEn}</h4>
                        {s.isActive ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-400 rounded-md border border-emerald-800/40">
                            Active
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 rounded-md">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 capitalize">Mode: {s.bookingMode} booking</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(s);
                      }}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {s.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Fee: NPR {s.fee}</span>
                    <span className={hasNepali ? 'text-emerald-400' : 'text-amber-400'}>
                      {hasNepali ? 'Nepali Added' : 'Missing Nepali'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Service Form */}
        <div className="lg:col-span-7">
          {isEditing ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">
                  {selectedService.id ? 'Edit Medical Service' : 'Create New Medical Service'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedService.slug || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, slug: e.target.value })}
                      placeholder="general-opd-checkup"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fee (NPR)
                    </label>
                    <input
                      type="number"
                      value={selectedService.fee ?? 0}
                      onChange={(e) => setSelectedService({ ...selectedService, fee: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Names Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Service Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedService.nameEn || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, nameEn: e.target.value })}
                      placeholder="General Outpatient Consultation"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-teal-400 mb-1">
                      सेवाको नाम (नेपाली)
                    </label>
                    <input
                      type="text"
                      value={selectedService.nameNe || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, nameNe: e.target.value })}
                      placeholder="सामान्य ओपीडी परामर्श"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden font-sans"
                    />
                  </div>
                </div>

                {/* Description Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Description (English)
                    </label>
                    <textarea
                      rows={3}
                      value={selectedService.descriptionEn || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, descriptionEn: e.target.value })}
                      placeholder="Comprehensive physical examination and triage..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2.5 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-teal-400 mb-1">
                      विवरण (नेपाली)
                    </label>
                    <textarea
                      rows={3}
                      value={selectedService.descriptionNe || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, descriptionNe: e.target.value })}
                      placeholder="सम्पूर्ण स्वास्थ्य परीक्षण तथा प्राथमिक उपचार..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2.5 text-xs text-white focus:border-teal-500 focus:outline-hidden font-sans"
                    />
                  </div>
                </div>

                {/* Booking Mode */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Booking Mode (Section 7)
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                        selectedService.bookingMode === 'request'
                          ? 'border-teal-600 bg-teal-950/40 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bookingMode"
                        value="request"
                        checked={selectedService.bookingMode === 'request'}
                        onChange={() => setSelectedService({ ...selectedService, bookingMode: 'request' })}
                        className="text-teal-600"
                      />
                      <span>Appointment Request (Bookable)</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                        selectedService.bookingMode === 'informational'
                          ? 'border-teal-600 bg-teal-950/40 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bookingMode"
                        value="informational"
                        checked={selectedService.bookingMode === 'informational'}
                        onChange={() => setSelectedService({ ...selectedService, bookingMode: 'informational' })}
                        className="text-teal-600"
                      />
                      <span>Informational Only (No Booking)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-300 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedService.isActive ?? true}
                      onChange={(e) => setSelectedService({ ...selectedService, isActive: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-teal-600"
                    />
                    <span>Active & Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedService.isFeatured ?? false}
                      onChange={(e) => setSelectedService({ ...selectedService, isFeatured: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-teal-600"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Service'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
              Select a service from the left list or click <strong>Add New Service</strong> to configure descriptions, fees, and booking modes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
