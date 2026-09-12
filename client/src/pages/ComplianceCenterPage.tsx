import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ComplianceItem, RenewalItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  ShieldCheck,
  UploadCloud,
  Check
} from 'lucide-react';

export const ComplianceCenterPage: React.FC = () => {
  const [compliances, setCompliances] = useState<ComplianceItem[]>([]);
  const [renewals, setRenewals] = useState<RenewalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchComplianceData = async () => {
    try {
      const data = await api.get<{ compliances: ComplianceItem[]; renewals: RenewalItem[] }>('/compliance');
      setCompliances(data?.compliances || []);
      setRenewals(data?.renewals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const handleCompleteCompliance = async (id: string) => {
    setCompletingId(id);
    try {
      await api.post(`/compliance/${id}/complete`, {
        remarks: 'Annual statutory return verified and uploaded.'
      });
      await fetchComplianceData();
    } catch (e) {
      alert('Failed to mark complete');
    } finally {
      setCompletingId(null);
    }
  };

  const handleRenewLicense = async (id: string) => {
    try {
      await api.post(`/compliance/renewals/${id}/renew`);
      alert('License renewal application submitted to department!');
      await fetchComplianceData();
    } catch (e) {
      alert('Failed to submit renewal');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">
        <Clock className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span>Loading compliance obligations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Statutory Compliance &amp; License Renewals Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Post-approval periodic statutory filings, environmental statements, and automated 90/60/30/7-day license renewal alerts.
        </p>
      </div>

      {/* 1. License Renewals Tracker Ribbon */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              License &amp; Clearances Renewals Tracker
            </h2>
            <p className="text-[11px] text-slate-500">
              Automated reminders triggered at 90, 60, 30, and 7-day intervals prior to validity expiry.
            </p>
          </div>
          <span className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded">
            {renewals.length} Active Authorizations
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {renewals.map(ren => (
            <div
              key={ren.id}
              className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-xs">{ren.licenseName}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    #{ren.licenseNumber}
                  </span>
                  <StatusBadge status={ren.status} />
                </div>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4">
                  <span>
                    <strong>Expires:</strong> {new Date(ren.expiryDate).toLocaleDateString()}
                  </span>
                  <span>
                    <strong>Project:</strong> {ren.projectName || 'ABC Textiles Facility'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <div
                    className={`font-bold text-xs ${
                      ren.daysRemaining && ren.daysRemaining <= 30
                        ? 'text-red-700'
                        : ren.daysRemaining && ren.daysRemaining <= 60
                        ? 'text-amber-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {ren.daysRemaining} Days Left
                  </div>
                  <div className="text-[10px] text-slate-400">Renewal Window Active</div>
                </div>

                <button
                  onClick={() => handleRenewLicense(ren.id)}
                  disabled={ren.status === 'RENEWAL_SUBMITTED'}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded font-semibold text-xs shadow-xs transition"
                >
                  {ren.status === 'RENEWAL_SUBMITTED' ? 'Renewal Under Review' : 'Initiate Renewal'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Periodic Return Compliance Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Recurring Statutory Filings &amp; Environmental Audits
            </h2>
            <p className="text-[11px] text-slate-500">
              Annual returns, Form V environmental statements, and safety equipment certifications.
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
            {compliances.filter(c => c.status === 'COMPLETED').length} Completed
          </span>
        </div>

        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
            <tr>
              <th className="px-4 py-3">Compliance Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Frequency</th>
              <th className="px-4 py-3">Statutory Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {compliances.map(comp => (
              <tr key={comp.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{comp.name}</span>
                  </div>
                  {comp.documentRequired && (
                    <div className="text-[10px] text-slate-400 pl-6">
                      Doc Required: {comp.documentRequired}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-slate-600 font-medium">
                  {comp.department}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {comp.frequency}
                </td>

                <td className="px-4 py-3 font-bold text-slate-800">
                  {new Date(comp.dueDate).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={comp.status} />
                </td>

                <td className="px-4 py-3 text-right">
                  {comp.status === 'COMPLETED' ? (
                    <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-end">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Filed On {comp.completedDate ? new Date(comp.completedDate).toLocaleDateString() : 'Portal'}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCompleteCompliance(comp.id)}
                      disabled={completingId === comp.id}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-[11px] shadow-xs transition"
                    >
                      {completingId === comp.id ? 'Filing...' : 'File Return (Auto-Sync)'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Monthly Statutory Compliance Calendar View */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Monthly Statutory Calendar</h2>
        <p className="text-[11px] text-slate-500">
          Visual schedule of upcoming submission deadlines and license renewals.
        </p>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] pt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="font-bold text-slate-500 py-1 bg-slate-50 rounded">
              {day}
            </div>
          ))}

          {/* Render representative calendar days */}
          {Array.from({ length: 31 }).map((_, i) => {
            const dayNum = i + 1;
            const hasDue = dayNum === 15 || dayNum === 28;
            const hasInspection = dayNum === 16;

            return (
              <div
                key={dayNum}
                className={`min-h-[55px] p-1.5 rounded border text-left flex flex-col justify-between ${
                  hasInspection
                    ? 'bg-amber-50 border-amber-300 font-bold text-amber-900'
                    : hasDue
                    ? 'bg-blue-50 border-blue-300 font-semibold text-blue-900'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-medium">{dayNum}</span>
                {hasInspection && (
                  <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.5 rounded truncate">
                    Joint Inspection
                  </span>
                )}
                {hasDue && (
                  <span className="text-[9px] bg-blue-200 text-blue-900 px-1 py-0.5 rounded truncate">
                    Return Filing
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
