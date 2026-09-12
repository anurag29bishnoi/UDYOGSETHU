import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Project, Application, DocumentHealthReport, SchemeMatch } from '../types';
import { StatusBadge, SLABadge } from '../components/common/StatusBadge';
import {
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const EntrepreneurDashboard: React.FC = () => {
  const { user, company } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [healthReport, setHealthReport] = useState<DocumentHealthReport | null>(null);
  const [schemes, setSchemes] = useState<SchemeMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projRes, appRes, docRes] = await Promise.all([
          api.get<Project[]>('/projects'),
          api.get<Application[]>('/applications'),
          api.get<{ health: DocumentHealthReport }>('/documents')
        ]);

        setProjects(projRes || []);
        setApplications(appRes || []);
        setHealthReport(docRes?.health || null);

        // If there's an active project, load its scheme matches
        if (projRes && projRes.length > 0) {
          const matched = await api.get<SchemeMatch[]>(`/schemes/match/${projRes[0].id}`);
          setSchemes(matched ? matched.slice(0, 3) : []);
        }
      } catch (e) {
        console.error('Error loading dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const activeProject = projects[0] || null;

  const journeySteps = [
    { name: 'Project Profile', status: activeProject ? 'completed' : 'pending' },
    { name: 'Document Vault', status: healthReport && healthReport.overallScore > 70 ? 'completed' : 'in-progress' },
    { name: 'Approval Roadmap', status: applications.length > 0 ? 'completed' : 'pending' },
    { name: 'Department Applications', status: applications.length > 0 ? 'completed' : 'pending' },
    { name: 'Desk Scrutiny', status: applications.some(a => a.status === 'UNDER_REVIEW') ? 'active' : 'pending' },
    { name: 'Joint Inspection', status: applications.some(a => a.status === 'INSPECTION_SCHEDULED') ? 'active' : 'pending' },
    { name: 'Final Clearances', status: applications.some(a => a.status === 'APPROVED') ? 'completed' : 'pending' },
    { name: 'Compliance Center', status: 'pending' }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">
        <Clock className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span>Loading your industrial journey...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcome & Company Banner */}
      <div className="bg-white rounded border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">
              Welcome, {user?.name || 'Industrialist'}
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Verified Enterprise
            </span>
          </div>
          <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <strong>Company:</strong> {company?.name || 'ABC Industries Pvt Ltd'}
            </span>
            <span>
              <strong>GSTIN:</strong> {company?.gstin || '27AABCA1234F1Z5'}
            </span>
            <span>
              <strong>District:</strong> {company?.district || 'Pune'} (Additional Baramati MIDC)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeProject && (
            <Link
              to={`/projects/${activeProject.id}`}
              className="inline-flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition"
            >
              <Building2 className="w-4 h-4 mr-1.5 text-blue-400" />
              Project Control Center
            </Link>
          )}
          <Link
            to="/projects/new"
            className="inline-flex items-center px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Project
          </Link>
          <Link
            to="/readiness"
            className="inline-flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300 transition"
          >
            Business Readiness
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Projects
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            {activeProject ? activeProject.name : 'No projects created'}
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pending Clearances
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            {applications.filter(a => a.status !== 'APPROVED').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Across MPCB, Fire, DISH
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Document Health
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {healthReport ? `${healthReport.overallScore}%` : '88%'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {healthReport && healthReport.issues.length > 0
              ? `${healthReport.issues.length} items need review`
              : 'All mandatory docs verified'}
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Available Schemes
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {schemes.length > 0 ? schemes.length : 4}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Up to 50% capital subsidy
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Statutory SLA Status
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
            100%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            RTSA 2015 tracking active
          </div>
        </div>
      </div>

      {/* 3. Your Industrial Journey Progress Stepper */}
      <div className="bg-white rounded border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your Industrial Journey</h2>
            <p className="text-xs text-slate-500">
              Complete single-window sequence from profile creation to operational compliance.
            </p>
          </div>
          {activeProject && (
            <Link
              to={`/projects/${activeProject.id}`}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 transition flex items-center"
            >
              <span>Active: {activeProject.name} (₹{activeProject.totalInvestment} Cr)</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {journeySteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded border transition ${
                step.status === 'completed'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                  : step.status === 'active' || step.status === 'in-progress'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider mb-1">
                Step {idx + 1}
              </div>
              <div className="leading-tight text-[11px]">{step.name}</div>
              <div className="mt-1">
                {step.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" />}
                {step.status === 'active' && <Clock className="w-3.5 h-3.5 text-blue-600 mx-auto animate-pulse" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Active Applications & Document Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Statutory Department Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Department Applications &amp; Parallel Processing
                </h3>
                <p className="text-[11px] text-slate-500">
                  Track independent departmental clearances and statutory RTSA deadlines.
                </p>
              </div>
              <Link
                to="/approvals"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center"
              >
                Approval Roadmap
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              {applications.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No clearance applications initiated yet.{' '}
                  <Link to="/approvals" className="text-blue-700 underline font-semibold">
                    Discover required approvals
                  </Link>
                </div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{app.approval.name}</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
                        <span>
                          <strong>Dept:</strong> {app.department.name}
                        </span>
                        <span>
                          <strong>App #:</strong> {app.applicationNumber}
                        </span>
                        <span>
                          <strong>Stage:</strong> {app.currentStage}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <SLABadge
                        slaStatus={app.slaStatus}
                        remainingDays={app.slaInfo?.remainingDays}
                        statutoryDays={app.approval.statutoryDaysSLA}
                      />
                      <Link
                        to={`/applications/${app.id}`}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 font-semibold text-[11px] transition"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended Government Support Schemes */}
          <div className="bg-white rounded border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Government Support Schemes &amp; Subsidies
                </h3>
                <p className="text-[11px] text-slate-500">
                  Calculated against your verified business documents and project profile.
                </p>
              </div>
              <Link
                to="/schemes"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center"
              >
                View All Schemes
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              {schemes.map(s => (
                <div key={s.schemeId} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{s.schemeName}</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {s.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {s.benefitsSummary}
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{s.satisfiedConditions[0] || 'Eligible sector and investment threshold'}</span>
                    </div>
                  </div>

                  <Link
                    to="/schemes"
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded font-medium text-[11px] transition shrink-0"
                  >
                    View Eligibility
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Document Vault Health & Action Items */}
        <div className="space-y-6">
          {/* Document Health Card */}
          <div className="bg-white rounded border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Document Health</h3>
                <p className="text-[11px] text-slate-500">Automated pre-scrutiny score</p>
              </div>
              <span className="text-2xl font-black text-emerald-700">
                {healthReport ? `${healthReport.overallScore}%` : '88%'}
              </span>
            </div>

            {/* Health Breakdown Bars */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Completeness</span>
                  <span>{healthReport?.completeness || 90}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${healthReport?.completeness || 90}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Cross-Doc Consistency</span>
                  <span>{healthReport?.consistency || 85}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${healthReport?.consistency || 85}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Validity &amp; Signatures</span>
                  <span>{healthReport?.validity || 90}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${healthReport?.validity || 90}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Issues Requiring Attention */}
            {healthReport && healthReport.issues.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 mr-1.5 shrink-0" />
                  {healthReport.issues.length} Items Require Review:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800">
                  {healthReport.issues.slice(0, 2).map((issue, idx) => (
                    <li key={idx}>{issue.title}</li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              to="/documents"
              className="block text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded border border-slate-300 transition"
            >
              Open Document Vault
            </Link>
          </div>

          {/* Quick Support & Grievance Card */}
          <div className="bg-slate-50 rounded border border-slate-200 p-4 text-xs space-y-3">
            <h4 className="font-bold text-slate-900">Facing Department Delays?</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              If an authority exceeds its statutory RTSA timeline without reason, lodge a formal administrative grievance.
            </p>
            <Link
              to="/grievances"
              className="inline-flex items-center text-blue-700 font-semibold hover:underline text-xs"
            >
              Raise Grievance (GRV Token)
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
