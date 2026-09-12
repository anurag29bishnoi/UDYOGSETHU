import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Application } from '../types';
import { StatusBadge, SLABadge } from '../components/common/StatusBadge';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  TrendingDown,
  Layers,
  XCircle,
  X
} from 'lucide-react';

export const SeniorOfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [escalations, setEscalations] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Reassignment Modal State
  const [targetApp, setTargetApp] = useState<Application | null>(null);
  const [newOfficerName, setNewOfficerName] = useState('Dr. Anjali Patil (Fast-Track Desk)');
  const [reassignRemarks, setReassignRemarks] = useState('');
  const [reassigning, setReassigning] = useState(false);

  const fetchEscalations = async () => {
    try {
      const data = await api.get<Application[]>('/officer/escalations');
      setEscalations(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetApp) return;

    setReassigning(true);
    try {
      await api.post('/officer/reassign', {
        applicationId: targetApp.id,
        newOfficerId: 'fast-track-officer-id',
        remarks: reassignRemarks || `Prioritized and reassigned by ${user?.name} (Appellate Authority) for immediate 48-hour resolution.`
      });

      alert(`Application ${targetApp.applicationNumber} reassigned successfully!`);
      setTargetApp(null);
      await fetchEscalations();
    } catch (err: any) {
      alert(err.message || 'Reassignment failed');
    } finally {
      setReassigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">
        <Clock className="w-5 h-5 animate-spin mr-2 text-amber-600" />
        <span>Loading supervisory escalation monitor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-xs">
      {/* Senior Officer Header */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">
              State Supervisory &amp; Statutory SLA Escalation Desk
            </h1>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded uppercase">
              Appellate Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisory Officer: <strong>{user?.name}</strong> ({user?.designation || 'Joint CEO, MIDC'}) &bull; Maharashtra Right to Public Services Act (RTSA 2015)
          </p>
        </div>

        <Link
          to="/officer/analytics"
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs shadow-xs transition flex items-center"
        >
          <TrendingDown className="w-4 h-4 mr-1.5" />
          View Bottleneck Analytics
        </Link>
      </div>

      {/* Escalation Alert Summary Banner */}
      <div className="p-4 bg-red-50 border border-red-300 rounded shadow-2xs flex items-start space-x-3 text-red-950">
        <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-xs">
            {escalations.filter(a => a.slaStatus === 'BREACHED').length} Application(s) Breached Statutory RTSA Timelines
          </div>
          <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
            Statutory deadlines have lapsed without final determination. The system has automatically escalated these files to your supervisory desk for binding administrative intervention, expedited disposal, or reassignment.
          </p>
        </div>
      </div>

      {/* Escalated Applications Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Escalated &amp; At-Risk Applications ({escalations.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Requires Senior Officer intervention or reassignment
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
            Priority Docket
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Application &amp; Clearance</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Enterprise &amp; Outlay</th>
                <th className="px-4 py-3">SLA Status</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3 text-right">Supervisory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {escalations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No active statutory breaches. All department queues operating within RTSA deadlines.
                  </td>
                </tr>
              ) : (
                escalations.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="font-mono text-blue-700 text-xs">{app.applicationNumber}</div>
                      <div className="text-[11px] text-slate-800 font-normal">{app.approval.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      {app.department.name}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{app.project?.company?.name || 'ABC Industries'}</div>
                      <div className="text-[10px] text-slate-500">
                        {app.project?.sector} &bull; ₹{app.project?.totalInvestment} Cr
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <SLABadge
                        slaStatus={app.slaStatus}
                        remainingDays={app.slaInfo?.remainingDays}
                        statutoryDays={app.approval.statutoryDaysSLA}
                      />
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Statutory Target: {app.approval.statutoryDaysSLA}d
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setTargetApp(app)}
                        className="px-2.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded text-[11px] shadow-xs transition"
                      >
                        Reassign
                      </button>
                      <Link
                        to={`/applications/${app.id}`}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] transition inline-block"
                      >
                        Inspect Dossier
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassignment Modal */}
      {targetApp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Reassign Escalated Application
                </h3>
                <p className="text-[11px] text-slate-500">
                  {targetApp.applicationNumber} &bull; {targetApp.approval.name}
                </p>
              </div>
              <button onClick={() => setTargetApp(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReassign} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reassign To Officer / Fast-Track Desk *
                </label>
                <select
                  value={newOfficerName}
                  onChange={e => setNewOfficerName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                >
                  <option value="Dr. Anjali Patil (Fast-Track Desk)">Dr. Anjali Patil (Senior Field Officer)</option>
                  <option value="Eng. Ramesh Gaikwad (Safety Desk)">Eng. Ramesh Gaikwad (Deputy Director)</option>
                  <option value="Special Fast-Track Single Window Squad">Special Fast-Track Single Window Squad</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supervisory Instructions &amp; Binding Timeline *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reassignRemarks}
                  onChange={e => setReassignRemarks(e.target.value)}
                  placeholder="Enter binding directive: e.g. 'Dispose within 48 hours under supervisory oversight'..."
                  className="w-full border border-slate-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetApp(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded shadow-xs"
                >
                  {reassigning ? 'Reassigning...' : 'Issue Binding Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
