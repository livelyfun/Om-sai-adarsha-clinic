'use client';

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  Eye,
  EyeOff,
  Save,
  X,
  Languages,
  CheckCircle2,
  AlertCircle,
  Home,
} from 'lucide-react';
import { LabTest, LabTestCategory } from '@/lib/db/types';

export default function CmsLabCataloguePage() {
  const [categories, setCategories] = useState<LabTestCategory[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<Partial<LabTest> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameNe, setNewCatNameNe] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, testRes] = await Promise.all([
        fetch('/api/cms/lab-categories'),
        fetch('/api/cms/lab-tests'),
      ]);
      const catData = await catRes.json();
      const testData = await testRes.json();
      if (catData.categories) setCategories(catData.categories);
      if (testData.tests) setTests(testData.tests);
    } catch (err) {
      console.error('Failed to load lab data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateTest() {
    const defaultCatId = categories[0]?.id || '';
    setSelectedTest({
      categoryId: defaultCatId,
      slug: '',
      nameEn: '',
      nameNe: '',
      descriptionEn: '',
      descriptionNe: '',
      prepInstructionsEn: '',
      prepInstructionsNe: '',
      sampleTypeEn: 'Blood',
      sampleTypeNe: 'रगत',
      price: null,
      isHomeCollectionAvailable: false,
      isActive: true,
      isFeatured: false,
    });
    setSaveMessage('');
    setErrorMessage('');
  }

  function handleSelectTest(test: LabTest) {
    setSelectedTest(test);
    setSaveMessage('');
    setErrorMessage('');
  }

  async function handleSaveTest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTest) return;
    setIsSaving(true);
    setSaveMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/cms/lab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTest),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save lab test');

      setSaveMessage('Lab test updated successfully.');
      await loadData();
      setSelectedTest(data.test);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving lab test');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatNameEn) return;
    try {
      const slug = newCatNameEn.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const res = await fetch('/api/cms/lab-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, nameEn: newCatNameEn, nameNe: newCatNameNe }),
      });
      if (res.ok) {
        setNewCatNameEn('');
        setNewCatNameNe('');
        setShowCatModal(false);
        await loadData();
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
  }

  async function handleToggleStatus(test: LabTest) {
    try {
      const res = await fetch('/api/cms/lab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...test, isActive: !test.isActive }),
      });
      if (res.ok) await loadData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  }

  const filteredTests = tests.filter((t) => {
    if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Diagnostic Investigations
          </span>
          <h1 className="text-2xl font-bold text-white font-serif mt-0.5">
            Laboratory Catalogue & Instructions
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCatModal(true)}
            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors"
          >
            + New Category
          </button>
          <button
            type="button"
            onClick={handleCreateTest}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lab Test</span>
          </button>
        </div>
      </div>

      {/* Category Creation Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Add Lab Category</h3>
              <button type="button" onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  placeholder="Hematology & Blood"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-teal-400 mb-1">वर्गको नाम (नेपाली)</label>
                <input
                  type="text"
                  value={newCatNameNe}
                  onChange={(e) => setNewCatNameNe(e.target.value)}
                  placeholder="रक्त परीक्षण (हेमाटोलोजी)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-sans"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-1.5 text-xs font-semibold text-white"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Test List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                selectedCategory === 'all' ? 'bg-teal-600 text-white font-semibold' : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              All Tests ({tests.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  selectedCategory === c.id ? 'bg-teal-600 text-white font-semibold' : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                {c.nameEn}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 py-8 text-center">Loading lab catalogue...</div>
          ) : filteredTests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
              No tests found in this category. Click <strong>Add Lab Test</strong> to register investigations.
            </div>
          ) : (
            filteredTests.map((t) => {
              const hasNepali = Boolean(t.nameNe);
              const isSelected = selectedTest?.id === t.id;
              const cat = categories.find((c) => c.id === t.categoryId);

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTest(t)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 bg-slate-900 shadow-md'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{t.nameEn}</h4>
                        {t.isActive ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-400 rounded-md">
                            Active
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 rounded-md">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{cat?.nameEn || 'General Lab'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(t);
                      }}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {t.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t.price !== null ? `NPR ${t.price}` : 'Price confirmed by clinic'}</span>
                    <span className={hasNepali ? 'text-emerald-400' : 'text-amber-400'}>
                      {hasNepali ? 'Nepali Added' : 'Missing Nepali'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Test Form */}
        <div className="lg:col-span-7">
          {selectedTest ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">
                  {selectedTest.id ? 'Edit Laboratory Investigation' : 'Add New Laboratory Test'}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedTest(null)}
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

              <form onSubmit={handleSaveTest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={selectedTest.categoryId || ''}
                      onChange={(e) => setSelectedTest({ ...selectedTest, categoryId: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.nameEn}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedTest.slug || ''}
                      onChange={(e) => setSelectedTest({ ...selectedTest, slug: e.target.value })}
                      placeholder="cbc-hemogram"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Price (NPR) <span className="text-[10px] text-slate-500">(Leave blank if unconfirmed)</span>
                    </label>
                    <input
                      type="number"
                      value={selectedTest.price === null || selectedTest.price === undefined ? '' : selectedTest.price}
                      onChange={(e) => setSelectedTest({ ...selectedTest, price: e.target.value === '' ? null : Number(e.target.value) })}
                      placeholder="e.g. 600"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Names Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Test Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedTest.nameEn || ''}
                      onChange={(e) => setSelectedTest({ ...selectedTest, nameEn: e.target.value })}
                      placeholder="Complete Blood Count (CBC)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-teal-400 mb-1">
                      परीक्षणको नाम (नेपाली)
                    </label>
                    <input
                      type="text"
                      value={selectedTest.nameNe || ''}
                      onChange={(e) => setSelectedTest({ ...selectedTest, nameNe: e.target.value })}
                      placeholder="कम्प्लिट ब्लड काउन्ट (सीबीसी)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-sans"
                    />
                  </div>
                </div>

                {/* Preparation Instructions Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Preparation Instructions (English)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedTest.prepInstructionsEn || ''}
                      onChange={(e) => setSelectedTest({ ...selectedTest, prepInstructionsEn: e.target.value })}
                      placeholder="Fasting of 8-10 hours required. Plain water allowed..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-teal-400 mb-1">
                      पूर्वतयारी निर्देशन (नेपाली)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedTest.prepInstructionsNe || ''}
                      onChange={(e) => setSelectedTest({ ...selectedTest, prepInstructionsNe: e.target.value })}
                      placeholder="८ देखि १० घण्टा खाली पेट (फास्टिङ) बस्नुपर्ने..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-sans"
                    />
                  </div>
                </div>

                {/* Sample Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Sample Type (English)
                    </label>
                    <input
                      type="text"
                      value={selectedTest.sampleTypeEn || ''}
                      onChange={(e) => setSelectedTest({ ...selectedTest, sampleTypeEn: e.target.value })}
                      placeholder="Venous Blood (EDTA)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-teal-400 mb-1">
                      नमुना संकलन प्रकार (नेपाली)
                    </label>
                    <input
                      type="text"
                      value={selectedTest.sampleTypeNe || ''}
                      onChange={(e) => setSelectedTest({ ...selectedTest, sampleTypeNe: e.target.value })}
                      placeholder="रगत नमुना"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-sans"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTest.isActive ?? true}
                      onChange={(e) => setSelectedTest({ ...selectedTest, isActive: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-teal-600"
                    />
                    <span>Active & Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTest.isHomeCollectionAvailable ?? false}
                      onChange={(e) => setSelectedTest({ ...selectedTest, isHomeCollectionAvailable: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-teal-600"
                    />
                    <span>Home Sample Collection Available</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Lab Test'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
              Select a lab test from the catalogue on the left or click <strong>Add Lab Test</strong> to configure parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
