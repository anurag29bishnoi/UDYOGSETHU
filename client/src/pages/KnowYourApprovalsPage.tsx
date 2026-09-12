import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Search,
  Fuel,
  Hotel,
  HeartPulse,
  Factory,
  Apple,
  Cpu,
  Car,
  FlaskConical,
  SunMedium,
  Download,
  Clock,
  Layers,
  FileCheck2,
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const KnowYourApprovalsPage: React.FC = () => {
  const [businessTypes, setBusinessTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loadingDiscovery, setLoadingDiscovery] = useState<boolean>(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await api.get('/business/business-types');
        setBusinessTypes(types);
        if (types && types.length > 0) {
          handleSelectType(types[0]);
        }
      } catch (err) {
        console.error('Error loading business types:', err);
      }
    };
    loadTypes();
  }, []);

  const handleSelectType = async (bType: any) => {
    setSelectedType(bType);
    try {
      setLoadingDiscovery(true);
      const res = await api.post('/business/discover-requirements', {
        businessTypeCode: bType.code,
        location: {
          state: selectedState,
          district: 'Pune',
          cityOrTaluka: 'Industrial Area'
        },
        projectStage: 'Planning',
        investmentCr: 2.5,
        employeeCount: 25
      });
      setDiscoveryResult(res);
    } catch (err) {
      console.error('Failed to discover requirements:', err);
    } finally {
      setLoadingDiscovery(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Fuel': return <Fuel className="w-4 h-4 text-amber-600" />;
      case 'Hotel': return <Hotel className="w-4 h-4 text-blue-600" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Factory': return <Factory className="w-4 h-4 text-slate-700" />;
      case 'Apple': return <Apple className="w-4 h-4 text-emerald-600" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'Car': return <Car className="w-4 h-4 text-orange-600" />;
      case 'FlaskConical': return <FlaskConical className="w-4 h-4 text-purple-600" />;
      case 'SunMedium': return <SunMedium className="w-4 h-4 text-amber-500" />;
      default: return <Building2 className="w-4 h-4 text-blue-700" />;
    }
  };

  const filteredTypes = businessTypes.filter(t =>
    !searchQuery ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.keywords.some((k: string) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* 1. Official Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:text-blue-700 font-medium">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-semibold">Know Your Approvals (KYA) Explorer</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Know Your Approvals (KYA) Directory
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Explore pre-mapped regulatory clearance roadmaps, statutory Acts, SLAs, and required dossiers for any commercial activity across India.
              </p>
            </div>

            <Link
              to="/start-business"
              className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-xs transition shrink-0"
            >
              Start Guided Application Wizard
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Business Type Selector */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Select Business Activity
              </h2>

              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search: Petrol Pump, Hotel..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
              </div>

              <div className="space-y-1 max-h-[600px] overflow-y-auto text-xs">
                {filteredTypes.map(t => {
                  const isSelected = selectedType?.code === t.code;
                  const isLive = t.isActive !== false;
                  return (
                    <button
                      key={t.code}
                      onClick={() => handleSelectType(t)}
                      className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between transition text-xs ${
                        isSelected
                          ? 'bg-blue-700 text-white font-bold shadow-2xs'
                          : 'hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <div className="shrink-0">{getCategoryIcon(t.icon)}</div>
                        <span className="truncate">{t.name}</span>
                      </div>
                      {isLive ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          LIVE
                        </span>
                      ) : (
                        <span className={`text-[9px] px-1 py-0.2 rounded shrink-0 ${
                          isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 text-slate-500'
                        }`}>
                          Phase 2
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 3 Cols: Comprehensive Clearance Roadmap */}
          <div className="lg:col-span-3 space-y-6">
            {selectedType && (
              <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
                {/* Business Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                        {getCategoryIcon(selectedType.icon)}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">{selectedType.name}</h2>
                      {selectedType.isHazardous && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Controlled Activity
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                      {selectedType.description}
                    </p>
                    <div className="text-[11px] text-slate-500 mt-2">
                      <strong>Governing Acts:</strong> {selectedType.governingActs}
                    </div>
                  </div>

                  <Link
                    to={`/start-business?type=${selectedType.code}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-xs shrink-0"
                  >
                    Start Business Setup &rarr;
                  </Link>
                </div>

                {selectedType.isActive === false && (
                  <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Phase 2 Module Preview:</strong> This statutory roadmap is provided for reference. To experience our fully functional, zero-error single-window license engine with automated forms, NABL tests &amp; subsidy claims, explore <strong>Food Processing &amp; Agro</strong> ventures.
                      </span>
                    </div>
                    <Link
                      to="/start-business?type=FOOD_PROCESSING"
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[11px] shrink-0 transition text-center"
                    >
                      Try Food Engine &rarr;
                    </Link>
                  </div>
                )}

                {loadingDiscovery ? (
                  <div className="p-12 text-center text-xs text-slate-500">
                    Loading statutory clearance roadmap...
                  </div>
                ) : discoveryResult ? (
                  <div className="space-y-6">
                    {/* 4 Summary Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 font-medium">Total Clearances</span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">
                          {discoveryResult.totalRequirementsCount} Sanctions
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 font-medium">Required Dossiers</span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">
                          {discoveryResult.mandatoryDocumentsList.length} Files
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 font-medium">Statutory RTSA SLA</span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">
                          {discoveryResult.estimatedTotalWorkingDays} Working Days
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 font-medium">Parallel Savings</span>
                        <div className="text-xl font-bold text-emerald-700 mt-0.5">
                          +{discoveryResult.parallelProcessingSavesDays} Days Saved
                        </div>
                      </div>
                    </div>

                    {/* Smart Recommendations */}
                    {discoveryResult.smartRecommendations && discoveryResult.smartRecommendations.length > 0 && (
                      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-lg p-5 border border-blue-800 shadow-sm">
                        <div className="flex items-center justify-between border-b border-blue-800/60 pb-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                              Smart Expert Recommendations &amp; Guidance
                            </h3>
                          </div>
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Deterministic Rules Verified
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {discoveryResult.smartRecommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="bg-white/10 p-3 rounded-lg border border-white/10 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                                  {rec.category}
                                </span>
                                <h4 className="font-bold text-xs text-white mt-1.5">{rec.title}</h4>
                                <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">{rec.advice}</p>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-amber-200 font-semibold">
                                {rec.actionItem}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Clearances List */}
                    <div className="space-y-4 text-xs">
                      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                        Statutory Clearances Matrix ({discoveryResult.allRequirements.length})
                      </h3>

                      <div className="space-y-3">
                        {discoveryResult.allRequirements.map((req: any) => (
                          <div key={req.id} className="p-4 bg-slate-50 border border-slate-200 rounded">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <strong className="text-slate-900 text-sm">{req.name}</strong>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    req.jurisdiction === 'CENTRAL' ? 'bg-blue-100 text-blue-800' :
                                    req.jurisdiction === 'STATE' ? 'bg-emerald-100 text-emerald-800' :
                                    req.jurisdiction === 'LOCAL' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {req.jurisdiction}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {req.authority} &bull; <em>Act:</em> {req.legalAct}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
                                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {req.statutorySLA}d SLA
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-600 mt-2 text-[11px] leading-relaxed">
                              <strong>Why Applicable:</strong> {req.applicabilityReason}
                            </p>

                            <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-slate-400">Mandatory Dossiers:</span>
                                {req.requiredDocuments.map((d: any, i: number) => (
                                  <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                                    {d.name}
                                  </span>
                                ))}
                              </div>
                              {req.isInspectionRequired && (
                                <span className="text-amber-800 font-semibold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  Physical Inspection Required
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
