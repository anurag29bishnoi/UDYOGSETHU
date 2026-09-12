import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Project, DocumentItem, Application, ComplianceItem, RenewalItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Building2,
  FileCheck2,
  Layers,
  Award,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Sliders,
  Sparkles,
  GitBranch,
  Timer,
  AlertCircle,
  FileText,
  Eye,
  RefreshCw,
  TrendingUp,
  Cpu,
  Check,
  X,
  FileCode,
  FileArchive,
  ArrowUpRight
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active tab state (from URL query param or default to 'overview')
  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Engines state
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [loadingPipeline, setLoadingPipeline] = useState(false);

  const [preSubmissionData, setPreSubmissionData] = useState<any>(null);
  const [loadingPreSub, setLoadingPreSub] = useState(false);

  // Change Simulator State
  const [simInvestment, setSimInvestment] = useState<number>(25);
  const [simWorkforce, setSimWorkforce] = useState<number>(100);
  const [simSector, setSimSector] = useState<string>('Textile');
  const [simHazardousWaste, setSimHazardousWaste] = useState<boolean>(false);
  const [simWastewater, setSimWastewater] = useState<number>(15);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [applyingSimulation, setApplyingSimulation] = useState(false);
  const [simulationAppliedMessage, setSimulationAppliedMessage] = useState<string | null>(null);

  // Package download feedback
  const [downloadingPackage, setDownloadingPackage] = useState<string | null>(null);

  const fetchProjectDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.get<Project>(`/projects/${id}`);
      setProject(data);
      if (data) {
        setSimInvestment(data.totalInvestment || 25);
        setSimWorkforce(data.employeeCount || 100);
        setSimSector(data.sector || 'Textile');
        setSimHazardousWaste(Boolean(data.hazardousWaste));
        setSimWastewater(data.wastewater || 15);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPipeline = async () => {
    if (!id) return;
    try {
      setLoadingPipeline(true);
      const data = await api.get(`/projects/${id}/pipeline`);
      setPipelineData(data);
    } catch (err) {
      console.error('Failed to load pipeline:', err);
    } finally {
      setLoadingPipeline(false);
    }
  };

  const fetchPreSubmission = async () => {
    if (!id) return;
    try {
      setLoadingPreSub(true);
      const data = await api.post(`/projects/${id}/pre-submission-check`, {
        approvalCode: 'MPCB_CTE'
      });
      setPreSubmissionData(data);
    } catch (err) {
      console.error('Failed to load pre-submission check:', err);
    } finally {
      setLoadingPreSub(false);
    }
  };

  const runSimulation = async () => {
    if (!id) return;
    try {
      setSimulating(true);
      setSimulationAppliedMessage(null);
      const result = await api.post(`/projects/${id}/simulate-change`, {
        totalInvestment: simInvestment,
        employeeCount: simWorkforce,
        sector: simSector,
        hazardousWaste: simHazardousWaste,
        wastewater: simWastewater
      });
      setSimulationResult(result);
    } catch (err: any) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const applySimulationToProject = async () => {
    if (!id || !simulationResult) return;
    try {
      setApplyingSimulation(true);
      const res = await api.post(`/projects/${id}/apply-simulation`, {
        proposedProfile: simulationResult.proposedProfile
      });
      setSimulationAppliedMessage('Simulated parameters committed successfully to project profile!');
      await fetchProjectDetails();
      await fetchPipeline();
    } catch (err: any) {
      console.error('Error applying simulation:', err);
    } finally {
      setApplyingSimulation(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'pipeline' || activeTab === 'critical-path' || activeTab === 'overview') {
      fetchPipeline();
    }
    if (activeTab === 'pre-submission') {
      fetchPreSubmission();
    }
    if (activeTab === 'simulator' && !simulationResult) {
      runSimulation();
    }
  }, [activeTab, id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-700 mb-2" />
        <span className="text-xs font-medium">Compiling Industrial Control Center dossier...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h2 className="text-base font-bold text-red-900">Unable to Load Project</h2>
        <p className="text-xs text-red-700 mt-1">{error || 'Project record does not exist.'}</p>
        <Link to="/dashboard" className="inline-block mt-4 text-xs font-semibold text-blue-700 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const documents = project.documents || [];
  const applications = project.applications || [];
  const compliances = project.compliances || [];
  const renewals = project.renewals || [];

  const verifiedDocsCount = documents.filter(d => d.status === 'VERIFIED').length;
  const docHealthScore = documents.length > 0 ? Math.round((verifiedDocsCount / documents.length) * 100) : 85;

  const tabs = [
    { id: 'overview', label: 'Control Center' },
    { id: 'twin', label: 'Digital Twin' },
    { id: 'vault', label: 'Document Vault' },
    { id: 'pipeline', label: 'Approval Pipeline' },
    { id: 'critical-path', label: 'Critical Path' },
    { id: 'applications', label: 'Clearances Desk' },
    { id: 'schemes', label: 'Scheme Optimizer' },
    { id: 'compliance', label: 'ComplianceOS' },
    { id: 'renewals', label: 'Renewals' },
    { id: 'simulator', label: 'Change Simulator' },
    { id: 'pre-submission', label: 'Pre-Submission Audit' },
    { id: 'actions', label: 'Action Center' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* 1. Official Enterprise Breadcrumb & Project Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5">
            <Link to="/dashboard" className="hover:text-blue-700 font-medium">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/projects" className="hover:text-blue-700 font-medium">Projects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-semibold">{project.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {project.name}
                </h1>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded border border-blue-200">
                  {project.sector}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded border border-slate-200">
                  {project.projectType || 'New Unit'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                <span className="font-medium text-slate-700">{project.company?.name || 'Enterprise'}</span>
                <span>&bull;</span>
                <span>{project.industrialArea || 'MIDC Industrial Estate'}, Plot {project.midcPlot || 'C-14'}, {project.district}, {project.state}</span>
                <span>&bull;</span>
                <span>Capital Outlay: <strong className="text-slate-800">₹{project.totalInvestment} Cr</strong></span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTab('simulator')}
                className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300 transition"
              >
                <Sliders className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
                Change Simulator
              </button>
              <button
                onClick={() => setTab('pre-submission')}
                className="inline-flex items-center px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-xs transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Audit & Submit
              </button>
            </div>
          </div>
        </div>

        {/* 2. Dense 12-Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto border-t border-slate-200">
          <nav className="flex space-x-1 py-1" aria-label="Tabs">
            {tabs.map(t => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded transition flex items-center space-x-1.5 ${
                    active
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.id === 'simulator' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                  {t.id === 'pre-submission' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. Main Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW / INDUSTRIAL CONTROL CENTER */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Business Readiness</span>
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">88%</span>
                  <span className="text-xs font-semibold text-emerald-700">Good Standing</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className="bg-blue-700 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Document Health</span>
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">{docHealthScore}%</span>
                  <span className="text-xs text-slate-500">{verifiedDocsCount}/{documents.length} verified</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${docHealthScore}%` }}></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Critical Path SLA</span>
                  <Timer className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {pipelineData?.criticalPath?.totalEstimatedDays || 60} Days
                  </span>
                  <span className="text-xs text-slate-500">RTSA 2015 Max</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate">Saves ~45d vs sequential filing</p>
              </div>

              <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Active Blockers</span>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-red-700">
                    {pipelineData?.currentBlockers?.length || 2}
                  </span>
                  <span className="text-xs text-red-600 font-medium">Require Action</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Dossier / Clarification gates</p>
              </div>
            </div>

            {/* Industrial Journey Stepper */}
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Your Industrial Journey Pipeline
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
                {[
                  { step: '1. Profile', status: 'COMPLETED' },
                  { step: '2. Documents', status: 'COMPLETED' },
                  { step: '3. Discovery', status: 'COMPLETED' },
                  { step: '4. Pipeline', status: 'IN_PROGRESS' },
                  { step: '5. Scrutiny', status: 'IN_PROGRESS' },
                  { step: '6. Inspection', status: 'READY' },
                  { step: '7. Sanction', status: 'PENDING' },
                  { step: '8. Compliance', status: 'PENDING' }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded border ${
                      s.status === 'COMPLETED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : s.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                      {s.status}
                    </div>
                    <div>{s.step}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Blockers & Next Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blocker Engine Card */}
              <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-bold text-slate-900">Clearance Blocker Engine</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Automatic Detection</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-red-900">
                          Fire Safety Plan Architectural Seal
                        </span>
                        <p className="text-xs text-red-700 mt-0.5">
                          Architect signature missing on uploaded layout. Blocks Fire Provisional NOC sanction.
                        </p>
                      </div>
                      <span className="bg-red-200 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        HIGH
                      </span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => setTab('vault')}
                        className="text-xs font-semibold text-red-800 hover:text-red-900 underline"
                      >
                        Replace in Vault &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-900">
                          GSTIN Address Mismatch Review
                        </span>
                        <p className="text-xs text-amber-700 mt-0.5">
                          GST principal place of business registered in Mumbai; factory site in Baramati, Pune.
                        </p>
                      </div>
                      <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        MEDIUM
                      </span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => setTab('twin')}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline"
                      >
                        Verify Address in Digital Twin &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Actions Card */}
              <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <h3 className="text-sm font-bold text-slate-900">Action Center &bull; Next Steps</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Prioritized</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800">1. Run Pre-Submission Audit</strong>
                      <p className="text-slate-500 text-[11px]">Verify complete dossier readiness before filing MPCB CTE.</p>
                    </div>
                    <button
                      onClick={() => setTab('pre-submission')}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded"
                    >
                      Audit
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800">2. Explore 4 Matched Schemes</strong>
                      <p className="text-slate-500 text-[11px]">Up to 30% capital subsidy under Maharashtra PSI 2019.</p>
                    </div>
                    <button
                      onClick={() => setTab('schemes')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded border border-slate-300"
                    >
                      View Schemes
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800">3. Test Investment Expansion</strong>
                      <p className="text-slate-500 text-[11px]">Simulate impact of scaling from ₹25 Cr to ₹50 Cr.</p>
                    </div>
                    <button
                      onClick={() => setTab('simulator')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded border border-slate-300"
                    >
                      Simulate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BUSINESS DIGITAL TWIN */}
        {/* ========================================================= */}
        {activeTab === 'twin' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Business Digital Twin</h2>
                  <p className="text-xs text-slate-500">
                    Live structured representation of enterprise legal entity and project parameters with full data provenance.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="font-semibold text-slate-600">Provenance Legend:</span>
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">Manual Entry</span>
                  <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded border border-indigo-200">Uploaded Doc</span>
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">OCR Extracted</span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">Officer Verified</span>
                </div>
              </div>

              {/* Corporate Legal Entity Grid */}
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Corporate Entity Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-6">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Company Legal Name</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">[Officer Verified]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">{project.company?.name}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Permanent Account Number (PAN)</span>
                    <span className="text-[10px] text-amber-700 font-semibold">[OCR Extracted]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1 font-mono">{project.company?.pan || 'AAACA1234F'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>GSTIN Identification</span>
                    <span className="text-[10px] text-amber-700 font-semibold">[OCR Extracted]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1 font-mono">{project.company?.gstin || '27AAACA1234F1Z5'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Corporate Identity Number (CIN)</span>
                    <span className="text-[10px] text-indigo-700 font-semibold">[Uploaded Doc]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1 font-mono">{project.company?.cin || 'U17120MH2022PTC123456'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Udyam Registration</span>
                    <span className="text-[10px] text-amber-700 font-semibold">[OCR Extracted]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1 font-mono">{project.company?.udyam || 'UDYAM-MH-26-0012345'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Constitution of Business</span>
                    <span className="text-[10px] text-slate-600 font-semibold">[Manual Entry]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">{project.company?.companyType || 'Private Limited'}</div>
                </div>
              </div>

              {/* Industrial Project Specifications */}
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Industrial Unit Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Capital Outlay</span>
                    <span className="text-[10px] text-blue-700 font-semibold">[DPR Audit]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">₹{project.totalInvestment} Crore</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Workforce Employed</span>
                    <span className="text-[10px] text-slate-600 font-semibold">[Manual Entry]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">{project.employeeCount} Workers</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Connected Power Load</span>
                    <span className="text-[10px] text-slate-600 font-semibold">[Manual Entry]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">{project.powerReq} kVA</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Water Demand & Effluent</span>
                    <span className="text-[10px] text-slate-600 font-semibold">[Manual Entry]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">{project.waterReq} KLD (Effluent: {project.wastewater} KLD)</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Factory Built-up Area</span>
                    <span className="text-[10px] text-indigo-700 font-semibold">[MIDC Plan]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">{project.buildingArea} sq.m.</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Fire Risk Category</span>
                    <span className="text-[10px] text-blue-700 font-semibold">[System Rule]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">{project.fireRisk} Risk</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Hazardous Substances</span>
                    <span className="text-[10px] text-blue-700 font-semibold">[System Rule]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">
                    {project.hazardousMaterials ? 'Present (Chemical Storage)' : 'None Reported'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] flex justify-between">
                    <span>Cadastral Plot Location</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">[Allotment Verified]</span>
                  </div>
                  <div className="font-bold text-slate-900 mt-1">Plot {project.midcPlot}, {project.industrialArea}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DOCUMENT VAULT */}
        {/* ========================================================= */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Document Vault & Intelligence</h2>
                  <p className="text-xs text-slate-500">
                    Uploaded dossiers undergo 20-point optical scrutiny, cross-document reconciliation and cryptographic checksumming.
                  </p>
                </div>
                <Link
                  to="/documents"
                  className="inline-flex items-center px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload New Document
                </Link>
              </div>

              {/* Document Health Card */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-700">Dossier Health Score</span>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">{docHealthScore}%</div>
                  <span className="text-[11px] text-slate-500">
                    {verifiedDocsCount} of {documents.length} statutory files passed automated integrity checks.
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200 text-center">
                    <span className="text-slate-500 text-[10px]">Readability</span>
                    <div className="font-bold text-slate-900">100%</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 text-center">
                    <span className="text-slate-500 text-[10px]">Validity</span>
                    <div className="font-bold text-slate-900">98%</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 text-center">
                    <span className="text-slate-500 text-[10px]">Consistency</span>
                    <div className="font-bold text-slate-900">84%</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 text-center">
                    <span className="text-slate-500 text-[10px]">Completeness</span>
                    <div className="font-bold text-slate-900">92%</div>
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3.5 py-2.5">Document Dossier</th>
                      <th className="px-3.5 py-2.5">Category</th>
                      <th className="px-3.5 py-2.5">File Size</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5">OCR Intelligence</th>
                      <th className="px-3.5 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {documents.map((doc, idx) => (
                      <tr key={doc.id || idx} className="hover:bg-slate-50">
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                            <span>{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[11px]">{doc.category}</td>
                        <td className="px-3.5 py-2.5 text-slate-500">{((doc.fileSize || 1024 * 400) / 1024).toFixed(0)} KB</td>
                        <td className="px-3.5 py-2.5">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600">
                          {doc.extractedData ? (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center">
                              <Check className="w-3 h-3 mr-1 text-emerald-600" />
                              Entities Extracted
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Parsed</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right space-x-2">
                          <Link
                            to="/documents"
                            className="text-blue-700 hover:text-blue-900 font-semibold"
                          >
                            Scrutinize
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: APPROVAL PIPELINE (PIPELINE COMPILER) */}
        {/* ========================================================= */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Live Approval Pipeline Compiler</h2>
                  <p className="text-xs text-slate-500">
                    Compiled directed acyclic graph (DAG) indicating parallel clearance branches and prerequisite blockers.
                  </p>
                </div>
                <button
                  onClick={fetchPipeline}
                  disabled={loadingPipeline}
                  className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingPipeline ? 'animate-spin' : ''}`} />
                  Recompile Graph
                </button>
              </div>

              {/* Parallel Execution Branches */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 mb-2">
                    <GitBranch className="w-4 h-4 text-blue-700" />
                    <span>Phase 1: Environmental & Civil Approvals (Executing Concurrently)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="font-bold text-slate-900">MPCB Consent to Establish (CTE)</div>
                      <div className="text-[11px] text-slate-500">Maharashtra Pollution Control Board &bull; 21d SLA</div>
                      <div className="mt-2"><StatusBadge status="IN_PROGRESS" /></div>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="font-bold text-slate-900">MIDC Building Plan Sanction</div>
                      <div className="text-[11px] text-slate-500">MIDC Engineering &bull; 21d SLA</div>
                      <div className="mt-2"><StatusBadge status="APPROVED" /></div>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="font-bold text-slate-900">Fire Provisional NOC</div>
                      <div className="text-[11px] text-slate-500">Fire Prevention &bull; 15d SLA</div>
                      <div className="mt-2"><StatusBadge status="QUERY_RAISED" /></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-2">
                    <Layers className="w-4 h-4 text-slate-600" />
                    <span>Phase 2: Factory, Power & Safety Authorizations (Pre-Operation)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <div className="font-bold text-slate-900">DISH Factory License Registration</div>
                      <div className="text-[11px] text-slate-500">Factories Act 1948 &bull; 30d SLA</div>
                      <div className="mt-2"><StatusBadge status="READY" /></div>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <div className="font-bold text-slate-900">MSEDCL HT Industrial Power Connection</div>
                      <div className="text-[11px] text-slate-500">Energy Department &bull; 15d SLA</div>
                      <div className="mt-2"><StatusBadge status="READY" /></div>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <div className="font-bold text-slate-900">Labour Department Shop & Est. Act</div>
                      <div className="text-[11px] text-slate-500">Labour Commissionerate &bull; 7d SLA</div>
                      <div className="mt-2"><StatusBadge status="READY" /></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blocker Engine Findings */}
              {pipelineData?.currentBlockers && pipelineData.currentBlockers.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                    Pipeline Compiler Dependency Blockers
                  </h3>
                  <div className="space-y-2 text-xs">
                    {pipelineData.currentBlockers.map((blk: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between bg-white p-2.5 rounded border border-amber-200">
                        <div>
                          <strong className="text-slate-900">{blk.approvalName}</strong>
                          <p className="text-slate-600 text-[11px]">{blk.blockedBy}</p>
                        </div>
                        <span className="text-blue-700 font-semibold">{blk.actionRequired}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CRITICAL PATH */}
        {/* ========================================================= */}
        {activeTab === 'critical-path' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900">Critical Path Duration Engine</h2>
                <p className="text-xs text-slate-500">
                  Calculates theoretical statutory timeline under Right to Services Act (RTSA 2015) and highlights bottleneck dependencies.
                </p>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-slate-400">Total Statutory Critical Path Duration</span>
                  <div className="text-3xl font-black text-blue-400 mt-1">
                    {pipelineData?.criticalPath?.totalEstimatedDays || 60} Working Days
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Parallel processing eliminates sequential stacking, accelerating establishment by 45 business days.
                  </p>
                </div>
                <div className="text-xs bg-slate-800 p-3 rounded border border-slate-700">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Traditional Sequential Filing</div>
                  <div className="text-lg font-bold text-slate-300 line-through">135 Working Days</div>
                  <div className="text-emerald-400 font-semibold text-[11px] mt-0.5">UdyogSetu Efficiency: +55% faster</div>
                </div>
              </div>

              {/* Critical Sequence Chain */}
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Longest Statutory Dependency Chain
              </h3>
              <div className="space-y-3">
                {[
                  { name: '1. MIDC Building Plan Sanction', days: 21, dept: 'MIDC', status: 'COMPLETED', note: 'Prerequisite for physical site erection.' },
                  { name: '2. Fire Provisional NOC', days: 15, dept: 'Fire Service', status: 'IN_PROGRESS', note: 'Prerequisite for structural plan sign-off.' },
                  { name: '3. MPCB Consent to Establish (CTE)', days: 21, dept: 'MPCB', status: 'IN_PROGRESS', note: 'Statutory gate for industrial machinery erection.' },
                  { name: '4. DISH Factory Plan Approval', days: 30, dept: 'DISH', status: 'READY', note: 'Final statutory sanction before commercial trials.' }
                ].map((step, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{step.name}</div>
                      <div className="text-[11px] text-slate-500">{step.dept} &bull; {step.note}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {step.days}d SLA
                      </span>
                      <StatusBadge status={step.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CLEARANCES APPLICATIONS */}
        {/* ========================================================= */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Clearances Tracking Desk</h2>
                  <p className="text-xs text-slate-500">
                    Real-time status tracking, statutory SLA countdowns, and clarification query responses.
                  </p>
                </div>
                <Link
                  to="/approvals"
                  className="inline-flex items-center px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  File New Clearance
                </Link>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3.5 py-2.5">Application ID</th>
                      <th className="px-3.5 py-2.5">Clearance Title</th>
                      <th className="px-3.5 py-2.5">Department</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5">RTSA SLA Countdown</th>
                      <th className="px-3.5 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {applications.map((app, idx) => (
                      <tr key={app.id || idx} className="hover:bg-slate-50">
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">{app.applicationNumber}</td>
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">{app.approval?.name}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{app.department?.code}</td>
                        <td className="px-3.5 py-2.5">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-800">
                              {app.approval?.statutoryDaysSLA ? `${app.approval.statutoryDaysSLA}d` : '21d'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <Link
                            to={`/applications/${app.id}`}
                            className="text-blue-700 hover:text-blue-900 font-semibold"
                          >
                            View Dossier &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SCHEMES OPTIMIZER */}
        {/* ========================================================= */}
        {activeTab === 'schemes' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Government Support & Incentive Schemes</h2>
                  <p className="text-xs text-slate-500">
                    Deterministic 100-point matching against verified Business Digital Twin and capital expenditure metrics.
                  </p>
                </div>
                <Link
                  to="/schemes"
                  className="inline-flex items-center px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-xs"
                >
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  Full Scheme Optimizer
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        92/100 MATCH &bull; LIKELY ELIGIBLE
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2">
                        Maharashtra Package Scheme of Incentives (PSI) 2019
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Up to 30% capital subsidy on eligible plant and machinery + 100% stamp duty exemption for industrial plot.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs flex justify-between items-center">
                    <span className="text-slate-500">Authority: Directorate of Industries</span>
                    <Link to="/schemes" className="text-blue-700 font-semibold hover:underline">
                      View Full Breakdown &rarr;
                    </Link>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        85/100 MATCH &bull; POTENTIALLY ELIGIBLE
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2">
                        PM Mega Integrated Textile Region and Apparel (PM MITRA)
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Infrastructure support and fiscal grant for integrated spinning and garment manufacturing setups.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs flex justify-between items-center">
                    <span className="text-slate-500">Authority: Ministry of Textiles (Govt of India)</span>
                    <Link to="/schemes" className="text-blue-700 font-semibold hover:underline">
                      View Full Breakdown &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: COMPLIANCEOS */}
        {/* ========================================================= */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">ComplianceOS & Statutory Calendar</h2>
                  <p className="text-xs text-slate-500">
                    Automated calendar tracking for recurring post-approval filings, environmental returns and workplace safety audits.
                  </p>
                </div>
                <Link
                  to="/compliance"
                  className="inline-flex items-center px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-xs"
                >
                  <CalendarClock className="w-3.5 h-3.5 mr-1.5" />
                  Compliance Center
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'MPCB Environmental Statement (Form V)', freq: 'Annual (30th Sept)', dept: 'MPCB', due: 'In 18 days', status: 'UPCOMING' },
                  { title: 'DISH Annual Safety & Health Return (Form 27)', freq: 'Annual (15th Jan)', dept: 'DISH', due: 'In 120 days', status: 'UPCOMING' },
                  { title: 'Hazardous Waste Annual Manifest (Form 4)', freq: 'Annual (30th June)', dept: 'MPCB', due: 'Submitted', status: 'COMPLETED' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.dept} &bull; Frequency: {item.freq}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-600 font-semibold">{item.due}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: RENEWALS */}
        {/* ========================================================= */}
        {activeTab === 'renewals' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900">Statutory Renewals Engine</h2>
                <p className="text-xs text-slate-500">
                  Automated countdowns and multi-stage reminders (90, 60, 30, and 7 days) for expiring licenses and NOCs.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Fire Safety Provisional NOC Renewal</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Fire Prevention Act &bull; Renewal valid for 1 year during construction</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">
                      Expires in 62 Days
                    </span>
                    <button className="px-2.5 py-1 bg-white hover:bg-slate-100 font-semibold rounded border border-slate-300">
                      Initiate Renewal
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">MPCB Consent to Operate (CTO)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Water & Air Acts &bull; 5-Year Triennial Renewal Cycle</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                      Valid (2 Years Remaining)
                    </span>
                    <button className="px-2.5 py-1 bg-white hover:bg-slate-100 font-semibold rounded border border-slate-300">
                      View Certificate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 10: CHANGE IMPACT SIMULATOR (COMPULSORY FEATURE 22 & 100) */}
        {/* ========================================================= */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-5 h-5 text-blue-700" />
                    <h2 className="text-base font-bold text-slate-900">Change Impact Simulator</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Simulate hypothetical changes to capital expenditure, workforce, or sector to project regulatory and scheme deltas before modifying live data.
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded border border-slate-300">
                  Simulation Only &bull; Read-Only Sandbox
                </span>
              </div>

              {/* Interactive Simulation Sliders / Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded border border-slate-200 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Total Investment (Current: ₹{project.totalInvestment} Cr)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={simInvestment}
                      onChange={e => setSimInvestment(parseFloat(e.target.value))}
                      className="flex-1 accent-blue-700 cursor-pointer"
                    />
                    <span className="font-bold text-sm text-blue-700 w-16 text-right">₹{simInvestment} Cr</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Mega Project threshold: ₹50 Cr</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Total Workforce (Current: {project.employeeCount})
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="20"
                      max="500"
                      step="10"
                      value={simWorkforce}
                      onChange={e => setSimWorkforce(parseInt(e.target.value, 10))}
                      className="flex-1 accent-blue-700 cursor-pointer"
                    />
                    <span className="font-bold text-sm text-blue-700 w-16 text-right">{simWorkforce}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Welfare officer mandatory at ≥100</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Hazardous Waste Generation
                  </label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="simHazWaste"
                      checked={simHazardousWaste}
                      onChange={e => setSimHazardousWaste(e.target.checked)}
                      className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 h-4 w-4"
                    />
                    <label htmlFor="simHazWaste" className="text-xs text-slate-700 font-medium">
                      Yes, generate scheduled toxic waste
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Triggers Form 4 and TSDF manifest</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={runSimulation}
                  disabled={simulating}
                  className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${simulating ? 'animate-spin' : ''}`} />
                  Recalculate Regulatory Impact
                </button>

                {simulationResult && (
                  <button
                    onClick={applySimulationToProject}
                    disabled={applyingSimulation}
                    className="inline-flex items-center px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow-xs transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Apply Simulated Changes to Project
                  </button>
                )}
              </div>

              {simulationAppliedMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded text-xs mb-4 font-medium flex items-center">
                  <Check className="w-4 h-4 mr-2 text-emerald-600" />
                  {simulationAppliedMessage}
                </div>
              )}

              {/* Simulation Result Displays */}
              {simulationResult && (
                <div className="space-y-6">
                  {/* Executive Impact Summary */}
                  <div className="p-4 bg-slate-900 text-white rounded">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Simulation Engine Output
                    </span>
                    <p className="text-sm font-semibold text-slate-100 mt-1 leading-relaxed">
                      {simulationResult.executiveSummary}
                    </p>
                  </div>

                  {/* 4 Impact Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 font-medium">Approvals Delta</span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        {simulationResult.approvalsImpact.netChange >= 0
                          ? `+${simulationResult.approvalsImpact.netChange}`
                          : simulationResult.approvalsImpact.netChange} Clearances
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {simulationResult.approvalsImpact.added.length} added, {simulationResult.approvalsImpact.removed.length} removed
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 font-medium">Mandatory Dossiers</span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        +{simulationResult.documentsImpact.added.length} Documents
                      </div>
                      <span className="text-[11px] text-slate-500">Required attachments</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 font-medium">Compliance Filings</span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        +{simulationResult.complianceImpact.added.length} Returns
                      </div>
                      <span className="text-[11px] text-slate-500">New statutory duties</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 font-medium">Critical Path Impact</span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        {simulationResult.timelineImpact.deltaDays > 0 ? `+${simulationResult.timelineImpact.deltaDays}d` : '0d'}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {simulationResult.timelineImpact.proposedCriticalDays} working days total
                      </span>
                    </div>
                  </div>

                  {/* Detailed Added Requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Added Compliance */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                      <h3 className="font-bold text-slate-900 mb-2">New Compliance Duties Triggered:</h3>
                      {simulationResult.complianceImpact.added.length > 0 ? (
                        <div className="space-y-2">
                          {simulationResult.complianceImpact.added.map((c: any, idx: number) => (
                            <div key={idx} className="bg-white p-2.5 rounded border border-slate-200">
                              <div className="font-bold text-slate-800">{c.title}</div>
                              <div className="text-[11px] text-slate-500">{c.department} &bull; {c.frequency}</div>
                              <p className="text-[11px] text-slate-600 mt-1"><em>Reason:</em> {c.reason}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500">No additional compliance duties triggered.</p>
                      )}
                    </div>

                    {/* Added Schemes / Fiscal Incentives */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                      <h3 className="font-bold text-slate-900 mb-2">Fiscal Incentive Opportunities:</h3>
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-950 mb-2">
                        <strong className="block text-emerald-900">Enhanced Scheme Potential:</strong>
                        <p className="text-[11px] mt-0.5">{simulationResult.schemesImpact.additionalIncentivesPotential}</p>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {simulationResult.schemesImpact.newlyEligible.length > 0 && (
                          <div className="font-medium">
                            Newly Unlocked Schemes: {simulationResult.schemesImpact.newlyEligible.map((s: any) => s.schemeName).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 11: PRE-SUBMISSION AUDIT & SUBMISSION PACKAGE */}
        {/* ========================================================= */}
        {activeTab === 'pre-submission' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Pre-Submission Validator & Submission Package</h2>
                  <p className="text-xs text-slate-500">
                    Automated scrutinizer audits dossiers and declarations prior to officer submission to guarantee zero query rejection.
                  </p>
                </div>
                <button
                  onClick={fetchPreSubmission}
                  disabled={loadingPreSub}
                  className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingPreSub ? 'animate-spin' : ''}`} />
                  Re-run Scrutiny
                </button>
              </div>

              {loadingPreSub ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-700 mb-2" />
                  Running pre-submission rules engine audit...
                </div>
              ) : preSubmissionData ? (
                <div className="space-y-6">
                  {/* Readiness Banner */}
                  <div
                    className={`p-4 rounded border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      preSubmissionData.status === 'READY_TO_SUBMIT'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        {preSubmissionData.status === 'READY_TO_SUBMIT' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                        <span className="font-bold text-sm tracking-wide">
                          {preSubmissionData.status === 'READY_TO_SUBMIT'
                            ? 'READY FOR STATUTORY SUBMISSION'
                            : 'BLOCKED BY PREREQUISITE DOSSIER GATES'}
                        </span>
                      </div>
                      <p className="text-xs mt-1">
                        Overall Scrutiny Score: <strong>{preSubmissionData.overallScore}/100</strong> &bull;{' '}
                        {preSubmissionData.criticalIssuesCount} critical blocker(s), {preSubmissionData.warningCount} scrutiny warning(s).
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setDownloadingPackage('PDF');
                          setTimeout(() => setDownloadingPackage(null), 2000);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded border border-slate-300"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
                        {downloadingPackage === 'PDF' ? 'Generating PDF...' : 'Download Summary PDF'}
                      </button>
                      <button
                        onClick={() => {
                          setDownloadingPackage('ZIP');
                          setTimeout(() => setDownloadingPackage(null), 2000);
                        }}
                        className="inline-flex items-center px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-xs"
                      >
                        <FileArchive className="w-3.5 h-3.5 mr-1.5" />
                        {downloadingPackage === 'ZIP' ? 'Compiling ZIP Archive...' : 'Download Package ZIP'}
                      </button>
                    </div>
                  </div>

                  {/* Package Summary Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Filing Package Manifest
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px]">Package Reference</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                          {preSubmissionData.submissionPackage.packageReference}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Statutory SLA Window</span>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {preSubmissionData.submissionPackage.statutorySLAWorkingDays} Working Days
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Filing Challan Estimate</span>
                        <div className="font-bold text-slate-900 mt-0.5">
                          ₹{preSubmissionData.submissionPackage.filingFeeINR.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Attached Dossiers</span>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {preSubmissionData.submissionPackage.attachedDocuments.length} Verified Files
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scrutiny Checks Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Issues to Resolve */}
                    <div className="p-4 bg-white border border-slate-200 rounded">
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Issues Requiring Resolution ({preSubmissionData.issues.length})</span>
                      </h4>
                      {preSubmissionData.issues.length > 0 ? (
                        <div className="space-y-2.5">
                          {preSubmissionData.issues.map((iss: any, idx: number) => (
                            <div key={idx} className="p-2.5 bg-red-50 border border-red-200 rounded">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-red-900">{iss.title}</span>
                                <span className="text-[10px] font-bold bg-red-200 text-red-800 px-1.5 py-0.2 rounded">
                                  {iss.severity}
                                </span>
                              </div>
                              <p className="text-slate-700 mt-1 text-[11px]">{iss.description}</p>
                              <div className="mt-2 flex justify-between items-center pt-1 border-t border-red-100">
                                <span className="text-[10px] text-slate-500">{iss.source}</span>
                                <button
                                  onClick={() => setTab('vault')}
                                  className="font-semibold text-blue-700 hover:underline"
                                >
                                  {iss.actionRequired} &rarr;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-emerald-700">Zero issues detected. Dossier ready for submission.</p>
                      )}
                    </div>

                    {/* Passed Checks */}
                    <div className="p-4 bg-white border border-slate-200 rounded">
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified Pre-Submission Verifications ({preSubmissionData.passedChecks.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {preSubmissionData.passedChecks.map((chk: any, idx: number) => (
                          <div key={idx} className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                            <span className="font-bold text-emerald-950">{chk.title}</span>
                            <p className="text-emerald-800 text-[11px] mt-0.5">{chk.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 12: ACTION CENTER & JOURNEY TIMELINE */}
        {/* ========================================================= */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900">What Do I Need To Do Next?</h2>
                <p className="text-xs text-slate-500">
                  Prioritized chronological actions to progress your industrial unit toward commissioning.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-red-50 border border-red-200 rounded flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">HIGH PRIORITY</span>
                      <strong className="text-red-950">Upload Architect-Sealed Fire Safety Plan</strong>
                    </div>
                    <p className="text-slate-700 mt-1">
                      Divisional Fire Officer cannot issue Provisional Fire NOC without architect-certified layout.
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">Due: Immediate &bull; Prerequisite for MIDC Building Sanction</span>
                  </div>
                  <button
                    onClick={() => setTab('vault')}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded shrink-0"
                  >
                    Upload to Vault
                  </button>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">MEDIUM</span>
                      <strong className="text-amber-950">Respond to MPCB Clarification Query</strong>
                    </div>
                    <p className="text-slate-700 mt-1">
                      MPCB Sub-Regional Officer requested zero-liquid discharge (ZLD) effluent treatment flow schematic.
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">Due: Within 7 working days</span>
                  </div>
                  <Link
                    to="/applications"
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded shrink-0"
                  >
                    Submit Response
                  </Link>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LOW</span>
                      <strong className="text-slate-900">Prepare MSEDCL HT Power Substation Drawing</strong>
                    </div>
                    <p className="text-slate-700 mt-1">
                      Pre-operation requirement for 250 kVA electrical connection setup.
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">Due: Prior to machinery installation</span>
                  </div>
                  <button
                    onClick={() => setTab('vault')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded border border-slate-300 shrink-0"
                  >
                    Upload Drawing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
