import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Application, OfficerStats } from '../types';
import { StatusBadge, SLABadge } from '../components/common/StatusBadge';
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Users,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Common Inspection State
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionTargetProject, setInspectionTargetProject] = useState<any>(null);
  const [schedulingInspection, setSchedulingInspection] = useState(false);

  const fetchOfficerData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get<OfficerStats>('/officer/stats'),
        api.get<Application[]>('/applications')
      ]);
      setStats(statsRes);
      setApplications(appsRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const handleOpenCommonInspection = async (projectId: string) => {
    try {
      const opp = await api.get(`/inspections/opportunities/${projectId}`);
      setInspectionTargetProject({ projectId, ...opp });
      setShowInspectionModal(true);
    } catch (e) {
      alert('Could not retrieve inspection opportunities');
    }
  };

  const handleScheduleJointInspection = async () => {
    if (!inspectionTargetProject) return;
    setSchedulingInspection(true);
    try {
      await api.post('/inspections/schedule', {
        projectId: inspectionTargetProject.projectId,
        applicationIds: inspectionTargetProject.qualifyingApplications?.map((a: any) => a.id) || [],
        departmentCodes: inspectionTargetProject.departments || ['MPCB', 'FIRE', 'DISH'],
        scheduledDate: inspectionTargetProject.recommendedDate,
        location: inspectionTargetProject.suggestedLocation
      });

      alert('Common Joint Field Inspection scheduled successfully across MPCB, Fire, and DISH squads!');
      setShowInspectionModal(false);
      await fetchOfficerData();
    } catch (e: any) {
      alert(e.message || 'Failed to schedule joint inspection');
    } finally {
      setSchedulingInspection(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = app.applicationNumber.toLowerCase().includes(q);
      const matchCo = app.project?.company?.name.toLowerCase().includes(q);
      return matchNum || matchCo;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">
        <Clock className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span>Loading department verification queue...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-xs">
      {/* Officer Header */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">
              Department Scrutiny &amp; Desk Review Queue
            </h1>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase">
              {user?.departmentCode || 'MPCB'} Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Officer: <strong>{user?.name}</strong> ({user?.designation || 'Verification Officer'}) &bull; Statutory RTSA 2015 Scrutiny Active
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOfficerData}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs transition"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Docket</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalApplications || 5}</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Pending Review</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">{stats?.pendingReview || 2}</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Queries Raised</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{stats?.queryRaised || 1}</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Inspections</span>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats?.inspectionRequired || 1}</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-red-600">SLA Breached</span>
          <div className="text-2xl font-bold text-red-700 mt-1">{stats?.slaBreached || 1}</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Approved</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats?.approved || 1}</div>
        </div>
      </div>

      {/* Common Inspection Trigger Notice */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs text-amber-950">
              Joint Inspection Synchronization Opportunity Detected
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Plot C-14, Baramati MIDC has concurrent pending inspections for MPCB (CTE), Fire Department (NOC), and DISH (Form 1).
            </p>
          </div>
        </div>

        {applications[0]?.projectId && (
          <button
            onClick={() => handleOpenCommonInspection(applications[0].projectId)}
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded text-xs transition shrink-0"
          >
            Review Common Squad
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by application number or enterprise name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-600 font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="QUERY_RAISED">Clarification Sought</option>
            <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
            <option value="SLA_BREACHED">SLA Breached</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
      </div>

      {/* Applications Queue Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">
            Assigned Scrutiny Applications ({filteredApps.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Sorted by statutory due date
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Application &amp; Clearance</th>
                <th className="px-4 py-3">Enterprise &amp; Sector</th>
                <th className="px-4 py-3">Pre-Scrutiny &amp; Risk</th>
                <th className="px-4 py-3">SLA Timeline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <div className="font-mono text-blue-700 text-xs">{app.applicationNumber}</div>
                    <div className="text-[11px] text-slate-800 font-normal">{app.approval.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{app.project?.company?.name || 'ABC Industries'}</div>
                    <div className="text-[10px] text-slate-500">
                      {app.project?.sector} &bull; ₹{app.project?.totalInvestment} Cr &bull; {app.project?.employeeCount} Workers
                    </div>
                  </td>

                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        Risk: {app.riskScore}/100
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2">
                      {app.preScrutinySummary || 'Mandatory company credentials verified consistent from Document Vault.'}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <SLABadge
                      slaStatus={app.slaStatus}
                      remainingDays={app.slaInfo?.remainingDays}
                      statutoryDays={app.approval.statutoryDaysSLA}
                    />
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Due: {new Date(app.slaDueDate).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/applications/${app.id}`}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded text-xs shadow-xs transition inline-block"
                    >
                      Conduct Scrutiny
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Inspection Coordination Modal */}
      {showInspectionModal && inspectionTargetProject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              Confirm Joint Common Field Inspection
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Synchronizing site inspections eliminates redundant officer visits and accelerates approval velocity.
            </p>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Participating Departments:</span>
                <p className="font-bold text-slate-800">
                  {inspectionTargetProject.departments?.join(' &bull; ') || 'MPCB, Fire, DISH'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Proposed Location:</span>
                <p className="font-bold text-slate-800">{inspectionTargetProject.suggestedLocation}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Scheduled Date &amp; Time Slot:</span>
                <p className="font-bold text-blue-700">
                  {inspectionTargetProject.recommendedDate} (10:30 AM - 01:30 PM)
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInspectionModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={schedulingInspection}
                onClick={handleScheduleJointInspection}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-xs"
              >
                {schedulingInspection ? 'Scheduling...' : 'Confirm Joint Squad Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
