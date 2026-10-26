'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  Filter,
  Eye,
  X,
  AlertCircle,
  Stethoscope,
  Globe,
} from 'lucide-react';
import { HealthArticle, Doctor } from '@/lib/db/types';

export default function CmsArticlesPage() {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HealthArticle | null>(null);

  // Form State
  const [titleEn, setTitleEn] = useState('');
  const [titleNe, setTitleNe] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Preventive Care');
  const [excerptEn, setExcerptEn] = useState('');
  const [excerptNe, setExcerptNe] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentNe, setContentNe] = useState('');
  const [reviewedByDoctorId, setReviewedByDoctorId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setDoctors(data.doctors || []);
        setCanManage(data.canManage ?? true);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingArticle(null);
    setTitleEn('');
    setTitleNe('');
    setSlug('');
    setCategory('Preventive Care');
    setExcerptEn('');
    setExcerptNe('');
    setContentEn('');
    setContentNe('');
    setReviewedByDoctorId('');
    setStatus('draft');
    setFormError('');
    setShowModal(true);
  }

  function openEditModal(a: HealthArticle) {
    setEditingArticle(a);
    setTitleEn(a.titleEn);
    setTitleNe(a.titleNe);
    setSlug(a.slug);
    setCategory(a.category);
    setExcerptEn(a.excerptEn);
    setExcerptNe(a.excerptNe);
    setContentEn(a.contentEn);
    setContentNe(a.contentNe);
    setReviewedByDoctorId(a.reviewedByDoctorId || '');
    setStatus(a.status);
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!titleEn.trim() || !slug.trim()) {
      setFormError('English Title and Slug are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        titleEn: titleEn.trim(),
        titleNe: titleNe.trim(),
        slug: slug.trim(),
        category,
        excerptEn: excerptEn.trim(),
        excerptNe: excerptNe.trim(),
        contentEn: contentEn.trim(),
        contentNe: contentNe.trim(),
        reviewedByDoctorId: reviewedByDoctorId || null,
        status,
      };

      const url = editingArticle
        ? `/api/cms/articles/${editingArticle.id}`
        : '/api/cms/articles';
      const method = editingArticle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save article');
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving article');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to permanently delete this health article?')) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  }

  const filteredArticles = articles.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      a.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-teal-400" />
            <span>Health Articles & Educational Content</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Bilingual health education with mandatory clinical reviewer attribution and publication controls.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Article</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, category, slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-teal-500"
          >
            <option value="all">All Articles ({articles.length})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300">No articles found</p>
            <p className="text-xs text-slate-500 mt-1">
              Create educational guides on preventive care, seasonal health, and diagnostic prep.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Title (English)</th>
                  <th className="py-3 px-4 font-semibold">Nepali Translation</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Clinical Reviewer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Updated</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredArticles.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{a.titleEn}</div>
                      <div className="text-[10px] text-slate-400 font-mono">/{a.slug}</div>
                    </td>
                    <td className="py-3 px-4">
                      {a.titleNe ? (
                        <span className="text-emerald-400 font-medium">{a.titleNe}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20">
                          Pending Translation
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {a.category}
                    </td>
                    <td className="py-3 px-4">
                      {a.reviewedByDoctorName ? (
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
                          <span>{a.reviewedByDoctorName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {a.status === 'published' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Published
                        </span>
                      )}
                      {a.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          Draft
                        </span>
                      )}
                      {a.status === 'archived' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          <Archive className="h-3 w-3" />
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(a.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(a)}
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-teal-400" />
                <span>{editingArticle ? 'Edit Health Article' : 'Create New Health Article'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    English Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={e => {
                      setTitleEn(e.target.value);
                      if (!editingArticle) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50));
                      }
                    }}
                    placeholder="e.g. Managing Diabetes: Daily Nutrition Guide"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nepali Title (नेपाली शीर्षक)
                  </label>
                  <input
                    type="text"
                    value={titleNe}
                    onChange={e => setTitleNe(e.target.value)}
                    placeholder="e.g. मधुमेह नियन्त्रण: दैनिक पोषण निर्देशिका"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    URL Slug <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                    placeholder="e.g. managing-diabetes-guide"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="Preventive Care">Preventive Care</option>
                    <option value="Chronic Disease">Chronic Disease</option>
                    <option value="Maternal & Child Health">Maternal & Child Health</option>
                    <option value="Laboratory Preparation">Laboratory Preparation</option>
                    <option value="Seasonal Health">Seasonal Health</option>
                  </select>
                </div>
              </div>

              {/* Reviewer & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
                    <span>Clinical Reviewer (Doctor)</span>
                  </label>
                  <select
                    value={reviewedByDoctorId}
                    onChange={e => setReviewedByDoctorId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="">-- No clinical reviewer assigned --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nameEn} ({d.specialtyEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Excerpts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Short Excerpt (English)
                  </label>
                  <textarea
                    rows={2}
                    value={excerptEn}
                    onChange={e => setExcerptEn(e.target.value)}
                    placeholder="Brief 1-2 sentence preview for search and index cards..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Short Excerpt (Nepali)
                  </label>
                  <textarea
                    rows={2}
                    value={excerptNe}
                    onChange={e => setExcerptNe(e.target.value)}
                    placeholder="नेपाली सारांश..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Article Body (English)
                </label>
                <textarea
                  rows={6}
                  value={contentEn}
                  onChange={e => setContentEn(e.target.value)}
                  placeholder="Detailed clinical education body..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Article Body (Nepali)
                </label>
                <textarea
                  rows={4}
                  value={contentNe}
                  onChange={e => setContentNe(e.target.value)}
                  placeholder="नेपाली विवरण..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Saving...' : (editingArticle ? 'Save Changes' : 'Create Article')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
