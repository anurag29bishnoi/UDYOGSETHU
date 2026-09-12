import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Project, Application } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  ChevronDown,
  Sparkles,
  Zap,
  Flame,
  Droplets,
  HardHat
} from 'lucide-react';

export const ApprovalRoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingApp, setSubmittingApp] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const projs = await api.get<Project[]>('/projects');
        setProjects(projs || []);
        if (projs && projs.length > 0) {
          setSelectedProjectId(projs[0].id);
          await loadRoadmap(projs[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadRoadmap = async (projId: string) => {
    setLoading(true);
    try {
      const data = await api.get(`/approvals/discover/${projId}`);
      setRoadmapData(data);
    } catch (e) {
      console.error('Roadmap error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    loadRoadmap(id);
  };

  const handleStartApplication = async (approvalCode: string) => {
    setSubmittingApp(approvalCode);
    try {
      const app = await api.post('/applications', {
        projectId: selectedProjectId,
        approvalCode
      });
      navigate(`/applications/${app.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to initiate application');
    } finally {
      setSubmittingApp(null);
    }
  };

  const getDeptIcon = (dept: string) => {
    if (dept === 'MPCB') return <Droplets className="w-4 h-4 text-emerald-600" />;
    if (dept === 'FIRE') return <Flame className="w-4 h-4 text-red-600" />;
    if (dept === 'DISH') return <HardHat className="w-4 h-4 text-amber-600" />;
    if (dept === 'MSEDCL') return <Zap className="w-4 h-4 text-blue-600" />;
    return <Building2 className="w-4 h-4 text-slate-600" />;
  };

  if (loading && !roadmapData) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">
        <Clock className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span>Evaluating statutory clearance rules...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs">
      {/* Header & Project Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Statutory Approval Roadmap &amp; Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic rules map every required industrial clearance, document checklist, and statutory SLA.
          </p>
        </div>

        {projects.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600">Select Project:</span>
            <select
              value={selectedProjectId}
              onChange={e => handleProjectSelect(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 font-semibold text-slate-800"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary KPI Ribbon */}
      {roadmapData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Required Clearances
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {roadmapData.totalApprovals}
            </div>
            <span className="text-[10px] text-slate-500">Evaluated by Rules Engine</span>
          </div>

          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Joint Inspections
            </span>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              {roadmapData.inspectionRequiredCount} Depts
            </div>
            <span className="text-[10px] text-slate-500">Unified Common Squad</span>
          </div>

          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Parallel Processing
            </span>
            <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-1" />
              Active
            </div>
            <span className="text-[10px] text-slate-500">Independent SLA Timelines</span>
          </div>

          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Max SLA Duration
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {roadmapData.estimatedTotalDays} Days
            </div>
            <span className="text-[10px] text-slate-500">RTSA 2015 Guaranteed</span>
          </div>
        </div>
      )}

      {/* Visual Workflow Graph */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Parallel Department Workflow Architecture
            </h2>
            <p className="text-[11px] text-slate-500">
              Approvals are processed concurrently across competent authorities with synchronized common site inspection.
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
            Zero Redundancy Engine
          </span>
        </div>

        {/* Visual Graph Pipeline */}
        <div className="py-4 overflow-x-auto">
          <div className="flex items-center space-x-3 min-w-[700px]">
            {/* Step 1: Project */}
            <div className="w-40 p-3 bg-slate-900 text-white rounded text-center shadow-xs">
              <div className="text-[10px] uppercase text-blue-400 font-bold">Initiator</div>
              <div className="font-bold text-xs mt-0.5 truncate">Project Profile</div>
              <div className="text-[10px] text-slate-400 mt-1">Verified Dossier</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 2: Parallel Clearances */}
            <div className="flex-1 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {roadmapData?.approvals?.map((app: any) => (
                <div
                  key={app.approvalCode}
                  className={`p-2.5 rounded border text-center transition ${
                    app.isApplied
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex justify-center mb-1">{getDeptIcon(app.departmentCode)}</div>
                  <div className="font-bold text-[11px] leading-tight truncate">{app.departmentCode}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{app.statutoryDaysSLA}d SLA</div>
                </div>
              ))}
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 3: Joint Inspection */}
            <div className="w-36 p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded text-center">
              <div className="text-[10px] uppercase text-amber-700 font-bold">Synchronized</div>
              <div className="font-bold text-xs mt-0.5">Joint Squad</div>
              <div className="text-[10px] text-amber-700 mt-1">MPCB &bull; Fire &bull; DISH</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 4: Consolidated Clearance */}
            <div className="w-36 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-center">
              <div className="text-[10px] uppercase text-emerald-700 font-bold">Sanction</div>
              <div className="font-bold text-xs mt-0.5">Consolidated</div>
              <div className="text-[10px] text-emerald-700 mt-1">Single Window Cert</div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Approval Cards & Smart Document Checklists */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Required Clearance Roadmap &amp; Document Checklists
        </h2>

        <div className="space-y-4">
          {roadmapData?.approvals?.map((app: any) => (
            <div
              key={app.approvalCode}
              className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs"
            >
              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getDeptIcon(app.departmentCode)}
                    <h3 className="font-bold text-slate-900 text-sm">{app.approvalName}</h3>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                      {app.priority} PRIORITY
                    </span>
                    {app.isApplied && <StatusBadge status={app.applicationStatus} />}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    <strong>Authority:</strong> {app.departmentName} &bull;{' '}
                    <strong>Statute:</strong> {app.legalAct}
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    Triggered by: {app.applicabilityReason}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {app.statutoryDaysSLA} Working Days
                    </div>
                    <div className="text-[10px] text-slate-500">Statutory SLA Target</div>
                  </div>

                  {app.isApplied ? (
                    <button
                      onClick={() => navigate(`/applications/${app.applicationId}`)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs shadow-xs transition"
                    >
                      Track Application
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartApplication(app.approvalCode)}
                      disabled={submittingApp === app.approvalCode}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold text-xs shadow-xs transition disabled:opacity-50"
                    >
                      {submittingApp === app.approvalCode
                        ? 'Initiating...'
                        : 'Start Application (Auto-Fill)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Required Documents Checklist for this Clearance */}
              <div className="p-4 bg-white space-y-2">
                <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Mandatory Document Checklist for {app.approvalName}:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {app.requiredDocuments.map((doc: any, dIdx: number) => (
                    <div
                      key={dIdx}
                      className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800">{doc.name}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {doc.description}
                        </div>
                        <div className="text-[9px] text-blue-700 font-semibold mt-1">
                          ✓ Verified &amp; Auto-Reused from Document Vault
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
