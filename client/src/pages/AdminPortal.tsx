import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { AuditLogItem } from '../types';
import {
  Settings,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Play,
  RotateCcw,
  PlusCircle,
  FileCode,
  Layers,
  Award,
  ListFilter,
  CheckCircle2,
  FolderPlus,
  SlidersHorizontal,
  Search,
  Building2,
  HelpCircle,
  Hash,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BusinessTypeItem {
  code: string;
  name: string;
  categoryCode: string;
  description: string;
  icon: string;
  isHazardous: boolean;
  typicalInvestmentRange: string;
  governingActs: string;
  keywords: string[];
}

interface DynamicQuestion {
  code: string;
  questionText: string;
  helpText?: string;
  inputType: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'RADIO';
  options?: Array<{ label: string; value: string }>;
  isRequired: boolean;
  sortOrder: number;
}

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'rules' | 'audit' | 'simulator'>('taxonomy');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);

  // Business Taxonomy State
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);
  const [taxonomySearch, setTaxonomySearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [expandedTypeCode, setExpandedTypeCode] = useState<string | null>(null);
  const [typeQuestions, setTypeQuestions] = useState<Record<string, DynamicQuestion[]>>({});

  // New Business Type Form
  const [showNewTypeModal, setShowNewTypeModal] = useState(false);
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState('MANUFACTURING');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [newTypeInvestment, setNewTypeInvestment] = useState('₹2.0 Cr - ₹15.0 Cr');
  const [newTypeActs, setNewTypeActs] = useState('');
  const [newTypeHazardous, setNewTypeHazardous] = useState(false);
  const [creatingType, setCreatingType] = useState(false);
  const [typeSuccessMsg, setTypeSuccessMsg] = useState<string | null>(null);

  // New Dynamic Question Form
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [questionTargetType, setQuestionTargetType] = useState('PETROL_PUMP');
  const [questionCode, setQuestionCode] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionHelp, setQuestionHelp] = useState('');
  const [questionType, setQuestionType] = useState<'BOOLEAN' | 'NUMBER' | 'SELECT' | 'TEXT'>('BOOLEAN');
  const [questionOptionsRaw, setQuestionOptionsRaw] = useState('');
  const [addingQuestion, setAddingQuestion] = useState(false);

  // Statutory Rule Form State
  const [ruleSector, setRuleSector] = useState('Chemical');
  const [ruleApprovalId, setRuleApprovalId] = useState('MPCB_CTE');
  const [ruleRationale, setRuleRationale] = useState('');
  const [ruleCreatedNotice, setRuleCreatedNotice] = useState(false);

  // Fetch Taxonomy
  const fetchTaxonomy = async () => {
    setLoadingTaxonomy(true);
    try {
      const [typesData, catsData] = await Promise.all([
        api.get<BusinessTypeItem[]>('/business/business-types'),
        api.get<any[]>('/business/categories')
      ]);
      setBusinessTypes(typesData || []);
      setCategories(catsData || []);
    } catch (e) {
      console.error('Failed to fetch taxonomy:', e);
    } finally {
      setLoadingTaxonomy(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const data = await api.get<AuditLogItem[]>('/admin/audit-logs');
      setAuditLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const toggleExpandType = async (code: string) => {
    if (expandedTypeCode === code) {
      setExpandedTypeCode(null);
      return;
    }
    setExpandedTypeCode(code);
    if (!typeQuestions[code]) {
      try {
        const qData = await api.get<DynamicQuestion[]>(`/business/business-types/${code}/questions`);
        setTypeQuestions(prev => ({ ...prev, [code]: qData || [] }));
      } catch (err) {
        console.error('Failed to load questions for', code, err);
      }
    }
  };

  const handleCreateBusinessType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeCode || !newTypeName) return;
    setCreatingType(true);
    setTypeSuccessMsg(null);
    try {
      await api.post('/business/business-types', {
        code: newTypeCode,
        name: newTypeName,
        categoryCode: newTypeCategory,
        description: newTypeDescription,
        typicalInvestmentRange: newTypeInvestment,
        governingActs: newTypeActs,
        isHazardous: newTypeHazardous
      });
      setTypeSuccessMsg(`Business Type '${newTypeName}' registered successfully in Rules-as-Code engine!`);
      setShowNewTypeModal(false);
      setNewTypeCode('');
      setNewTypeName('');
      setNewTypeDescription('');
      fetchTaxonomy();
      setTimeout(() => setTypeSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to register business type');
    } finally {
      setCreatingType(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionCode || !questionText) return;
    setAddingQuestion(true);
    try {
      const optionsParsed = questionOptionsRaw
        ? questionOptionsRaw.split(',').map(s => {
            const trimmed = s.trim();
            return { label: trimmed, value: trimmed };
          })
        : [];

      await api.post(`/business/business-types/${questionTargetType}/questions`, {
        questionCode,
        questionText,
        helpText: questionHelp,
        inputType: questionType,
        options: optionsParsed,
        isRequired: true
      });

      alert(`Dynamic question added to ${questionTargetType}!`);
      setShowNewQuestionModal(false);
      setQuestionCode('');
      setQuestionText('');
      setQuestionHelp('');
      setQuestionOptionsRaw('');

      // Refresh questions cache for this type
      const qData = await api.get<DynamicQuestion[]>(`/business/business-types/${questionTargetType}/questions`);
      setTypeQuestions(prev => ({ ...prev, [questionTargetType]: qData || [] }));
    } catch (err: any) {
      alert(err.message || 'Failed to add question');
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleSimulateSLABreach = async () => {
    setSimulating(true);
    setSimulationMessage(null);
    try {
      const res = await api.post('/admin/demo/simulate-sla-breach');
      setSimulationMessage(res.message || 'SLA Breach simulated successfully!');
    } catch (e: any) {
      alert(e.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateSLAWarning = async () => {
    setSimulating(true);
    setSimulationMessage(null);
    try {
      const res = await api.post('/admin/demo/simulate-sla-warning');
      setSimulationMessage(res.message || 'SLA Warning simulated successfully!');
    } catch (e: any) {
      alert(e.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleSaveDynamicRule = (e: React.FormEvent) => {
    e.preventDefault();
    setRuleCreatedNotice(true);
    setTimeout(() => setRuleCreatedNotice(false), 3000);
  };

  const filteredBusinessTypes = businessTypes.filter(t => {
    const matchCat = selectedCategoryFilter === 'ALL' || t.categoryCode === selectedCategoryFilter;
    const matchQuery =
      !taxonomySearch ||
      t.name.toLowerCase().includes(taxonomySearch.toLowerCase()) ||
      t.code.toLowerCase().includes(taxonomySearch.toLowerCase()) ||
      t.description.toLowerCase().includes(taxonomySearch.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-900 text-white font-mono text-[10px] font-bold">
              SYS-ADMIN
            </span>
            <h1 className="text-lg font-bold text-slate-900">
              UdyogSetu 360 State Administrative &amp; Rules-as-Code Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven business taxonomy engine, dynamic questionnaire compiler, statutory clearance triggers, and immutable audit logs.
          </p>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[11px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Engine Status: <strong>LIVE (Rules Deterministic)</strong></span>
        </div>
      </div>

      {typeSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 font-semibold flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-700" />
          <span>{typeSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`px-4 py-2 font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'taxonomy'
              ? 'border-blue-700 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Business Taxonomy &amp; Questions ({businessTypes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'rules'
              ? 'border-blue-700 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Statutory Rule Builder</span>
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'simulator'
              ? 'border-blue-700 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>SIH Demo Simulator</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'audit'
              ? 'border-blue-700 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Immutable Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: BUSINESS TAXONOMY & DYNAMIC QUESTIONS */}
      {activeTab === 'taxonomy' && (
        <div className="space-y-6">
          {/* Metrics summary banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Business Types</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{businessTypes.length}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Extensible without code rewrite</span>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Master Sectors</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{categories.length}</p>
              <span className="text-[10px] text-slate-500">Standard NIC-2008 &amp; State Policy</span>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dynamic Questions</span>
              <p className="text-xl font-bold text-blue-900 mt-1">
                {Object.values(typeQuestions).reduce((acc, q) => acc + q.length, 0) || '40+'}
              </p>
              <span className="text-[10px] text-blue-600 font-medium">Conditional branch triggers</span>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Statutory Clearances</span>
              <p className="text-xl font-bold text-slate-900 mt-1">26</p>
              <span className="text-[10px] text-slate-500">Central + State + Local Bodies</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search business type, code, or description..."
                  value={taxonomySearch}
                  onChange={e => setTaxonomySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewTypeModal(true)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Register New Business Type</span>
              </button>
              <button
                onClick={() => setShowNewQuestionModal(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Dynamic Question</span>
              </button>
            </div>
          </div>

          {/* Business Types Table/Card List */}
          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[11px] font-semibold text-slate-600">
              <span>Showing {filteredBusinessTypes.length} configured business activities</span>
              <span className="font-mono text-[10px] text-slate-400">Click any row to inspect conditional dynamic questions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredBusinessTypes.map(bType => {
                const isExpanded = expandedTypeCode === bType.code;
                const questions = typeQuestions[bType.code];

                return (
                  <div key={bType.code} className="hover:bg-slate-50/70 transition">
                    <div
                      onClick={() => toggleExpandType(bType.code)}
                      className="p-4 cursor-pointer flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{bType.name}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                            {bType.code}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            {bType.categoryCode}
                          </span>
                          {bType.isHazardous && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-red-600 inline mr-0.5" />
                              Hazardous Tier
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px]">{bType.description}</p>
                        <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-slate-500">
                          <span><strong>Outlay Window:</strong> {bType.typicalInvestmentRange}</span>
                          <span>•</span>
                          <span className="truncate max-w-md"><strong>Governing Acts:</strong> {bType.governingActs}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
                        <span className="text-[11px] text-blue-700 hover:underline">
                          {isExpanded ? 'Hide Questions' : 'Inspect Questions'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
                      </div>
                    </div>

                    {/* Expandable Dynamic Questions Section */}
                    {isExpanded && (
                      <div className="bg-slate-50/90 border-t border-slate-200 p-4 pl-8 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                            <span>Configured Dynamic Questionnaire for {bType.name}</span>
                          </h4>
                          <button
                            onClick={() => {
                              setQuestionTargetType(bType.code);
                              setShowNewQuestionModal(true);
                            }}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-blue-700"
                          >
                            + Add Question to {bType.code}
                          </button>
                        </div>

                        {!questions ? (
                          <div className="text-slate-500 text-[11px] py-2">Loading dynamic questions...</div>
                        ) : questions.length === 0 ? (
                          <div className="text-slate-500 text-[11px] py-2 italic bg-white p-3 rounded border border-slate-200">
                            No sector-specific questions defined yet. Standard baseline questions (Location, Stage, Outlay, Employees) will apply.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {questions.map((q, idx) => (
                              <div key={q.code || idx} className="bg-white p-3 rounded border border-slate-200 flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-slate-900 text-xs">{q.questionText}</span>
                                    <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                      {q.code}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                      [{q.inputType}]
                                    </span>
                                  </div>
                                  {q.helpText && (
                                    <p className="text-slate-500 text-[11px]">{q.helpText}</p>
                                  )}
                                  {q.options && q.options.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      <span className="text-[10px] text-slate-400 font-semibold">Options:</span>
                                      {q.options.map((opt, oIdx) => (
                                        <span key={oIdx} className="px-1.5 py-0.2 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[10px]">
                                          {opt.label}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                  {q.isRequired ? 'Mandatory' : 'Optional'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC RULE BUILDER */}
      {activeTab === 'rules' && (
        <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Administrative Statutory Rule Builder (Rules-as-Code)
            </h2>
            <p className="text-[11px] text-slate-500">
              Configure deterministic triggers (Sectors, Investment, Wastewater, Fire Risk) to automatically map required department clearances without changing backend source code.
            </p>
          </div>

          {ruleCreatedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-700" />
              <span>Rule saved and synced with active statutory evaluation engine!</span>
            </div>
          )}

          <form onSubmit={handleSaveDynamicRule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trigger Sector / Business Category
                </label>
                <select
                  value={ruleSector}
                  onChange={e => setRuleSector(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                >
                  <option value="Chemical">Chemical &amp; Petrochemicals</option>
                  <option value="Petroleum">Petroleum &amp; Fuel Retail</option>
                  <option value="Hospitality">Hospitality &amp; Hotels</option>
                  <option value="Healthcare">Healthcare &amp; Hospitals</option>
                  <option value="Textile">Textile &amp; Apparel</option>
                  <option value="Food Processing">Agro &amp; Food Processing</option>
                  <option value="Electronics">Electronics &amp; Hardware</option>
                  <option value="IT_BPM">Information Technology &amp; BPM</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mapped Statutory Approval / NOC
                </label>
                <select
                  value={ruleApprovalId}
                  onChange={e => setRuleApprovalId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                >
                  <option value="MPCB_CTE">MPCB Consent to Establish (CTE)</option>
                  <option value="PESO_FORM_XIV">PESO Petroleum Storage &amp; Dispensing License (Form XIV)</option>
                  <option value="FIRE_NOC">Provisional Fire Safety NOC (MIDC/Municipal)</option>
                  <option value="DISH_FACTORY">DISH Factory License Plan Approval</option>
                  <option value="FSSAI_MFG">FSSAI Food Business Manufacturing License</option>
                  <option value="AERB_RADIATION">AERB Radiation Equipment License</option>
                  <option value="NHAI_ACCESS">NHAI Highway Access &amp; Deceleration Lane Clearance</option>
                  <option value="MSEDCL_HT_SANCTION">MSEDCL HT Power Sanction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Statutory Rationale / Regulatory Act Reference
              </label>
              <textarea
                rows={3}
                value={ruleRationale}
                onChange={e => setRuleRationale(e.target.value)}
                placeholder="e.g. 'Mandatory under Petroleum Act 1934 and Petroleum Rules 2002 for storage of Class A/B petroleum products exceeding 2,500 litres'..."
                className="w-full border border-slate-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs shadow-xs transition flex items-center"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Save Dynamic Clearance Rule
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: DEMO SIMULATOR CONTROLS */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Live Demonstration Simulator (SIH 2026 Evaluation Suite)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Trigger real-time state machine transitions to demonstrate statutory escalation under the Maharashtra Right to Public Services Act (RTSA 2015).
              </p>
            </div>

            {simulationMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 font-semibold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>{simulationMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded border border-red-200 bg-red-50/60 space-y-2">
                <div className="flex items-center space-x-2 text-red-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Simulate Statutory SLA Breach</span>
                </div>
                <p className="text-[11px] text-red-800 leading-relaxed">
                  Immediately shifts an active clearance application 35 days into the past, causing an automated SLA breach event, dispatching urgent notifications, and routing the file to the Senior Supervisory Officer (IAS) queue.
                </p>
                <button
                  onClick={handleSimulateSLABreach}
                  disabled={simulating}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-xs shadow-xs transition disabled:opacity-50"
                >
                  {simulating ? 'Executing...' : 'Trigger Immediate SLA Breach'}
                </button>
              </div>

              <div className="p-4 rounded border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Simulate SLA Expiry Warning</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Sets the statutory due date of an application to within 24 hours, triggering an amber warning pill and desk officer alert.
                </p>
                <button
                  onClick={handleSimulateSLAWarning}
                  disabled={simulating}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded font-bold text-xs shadow-xs transition disabled:opacity-50"
                >
                  {simulating ? 'Executing...' : 'Trigger SLA Due Warning (Amber)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Statutory Immutable Audit Trail
              </h2>
              <p className="text-[11px] text-slate-500">
                Cryptographically sequenced administrative action records (Log-only, cannot be edited).
              </p>
            </div>
            <button
              onClick={fetchAuditLogs}
              className="px-3 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Loading immutable audit logs...
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {log.userName || 'System'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{log.entityType}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[10px] max-w-xs truncate">
                        {log.detailsJson || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW BUSINESS TYPE */}
      {showNewTypeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Register New Commercial Business Type</h3>
                <p className="text-[11px] text-slate-500">Extends the platform taxonomy and dynamic questionnaire without code redeployment.</p>
              </div>
              <button onClick={() => setShowNewTypeModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBusinessType} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unique Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DATA_CENTER"
                    value={newTypeCode}
                    onChange={e => setNewTypeCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sector Category</label>
                  <select
                    value={newTypeCategory}
                    onChange={e => setNewTypeCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Business Type Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyperscale Green Data Center & Cloud Park"
                  value={newTypeName}
                  onChange={e => setNewTypeName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description &amp; Operational Scope</label>
                <textarea
                  rows={2}
                  value={newTypeDescription}
                  onChange={e => setNewTypeDescription(e.target.value)}
                  placeholder="Server rack housing, high-voltage substations, and cooling towers..."
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Typical Capital Outlay Range</label>
                  <input
                    type="text"
                    value={newTypeInvestment}
                    onChange={e => setNewTypeInvestment(e.target.value)}
                    placeholder="₹50 Cr - ₹500 Cr"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTypeHazardous}
                      onChange={e => setNewTypeHazardous(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-slate-700 text-xs">Classify as Hazardous Tier</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Governing Statutory Acts</label>
                <input
                  type="text"
                  value={newTypeActs}
                  onChange={e => setNewTypeActs(e.target.value)}
                  placeholder="e.g. Information Technology Act 2000, CEA Grid Standards, DISH Factory Rules"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewTypeModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingType}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs"
                >
                  {creatingType ? 'Registering...' : 'Register Business Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DYNAMIC QUESTION */}
      {showNewQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Add Conditional Dynamic Question</h3>
                <p className="text-[11px] text-slate-500">Injects dynamic questionnaire branching based on project specifics.</p>
              </div>
              <button onClick={() => setShowNewQuestionModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Business Type</label>
                  <select
                    value={questionTargetType}
                    onChange={e => setQuestionTargetType(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
                  >
                    {businessTypes.map(t => (
                      <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Question Identifier Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HAS_UNDERGROUND_TANK"
                    value={questionCode}
                    onChange={e => setQuestionCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Prompt (User Facing)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Will your facility store Class A petroleum products underground?"
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Help / Guidance Text</label>
                <input
                  type="text"
                  placeholder="e.g. Triggers Form XIV PESO underground storage licensing requirements."
                  value={questionHelp}
                  onChange={e => setQuestionHelp(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Input Field Type</label>
                  <select
                    value={questionType}
                    onChange={e => setQuestionType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="BOOLEAN">Yes / No (Boolean)</option>
                    <option value="NUMBER">Numeric Value</option>
                    <option value="SELECT">Dropdown Selection</option>
                    <option value="TEXT">Short Text</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dropdown Options (Comma separated)</label>
                  <input
                    type="text"
                    disabled={questionType !== 'SELECT'}
                    placeholder="e.g. 5 KL, 10 KL, 25 KL"
                    value={questionOptionsRaw}
                    onChange={e => setQuestionOptionsRaw(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewQuestionModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingQuestion}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs"
                >
                  {addingQuestion ? 'Adding...' : 'Attach Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
