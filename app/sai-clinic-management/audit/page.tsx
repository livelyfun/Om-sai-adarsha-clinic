'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '@/lib/db/types';

export default function CmsAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  useEffect(() => {
    let active = true;
    async function fetchLogs() {
      try {
        const res = await fetch('/api/cms/audit');
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setLogs(data.logs || []);
          }
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchLogs();

    return () => {
      active = false;
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch =
      (log.actorEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      (log.entityId || '').toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Shield className="h-6 w-6 text-teal-400" />
          <span>Immutable Audit Log Trail</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographically recorded actions across user logins, booking transitions, report uploads/releases, and administrative updates.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor email, action, entity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">Action:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-teal-500"
          >
            <option value="all">All Actions ({logs.length})</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading immutable audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Shield className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300">No audit log records match filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp (UTC)</th>
                  <th className="py-3 px-4 font-semibold">Actor Type</th>
                  <th className="py-3 px-4 font-semibold">Actor Email / ID</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Entity</th>
                  <th className="py-3 px-4 font-semibold">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                        log.actorType === 'staff'
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                          : log.actorType === 'patient'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {log.actorType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-sans text-xs">
                      {log.actorEmail || log.actorUserId || 'anonymous'}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-bold">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="text-teal-400">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-slate-500 block text-[10px] truncate max-w-[120px]">
                          {log.entityId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-400 max-w-xs truncate" title={JSON.stringify(log.metadataJson)}>
                      {log.metadataJson ? JSON.stringify(log.metadataJson) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
