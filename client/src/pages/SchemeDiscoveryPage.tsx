import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SchemeMatch, Project } from '../types';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  Scale,
  X
} from 'lucide-react';

export const SchemeDiscoveryPage: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeMatch[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');

  // Scheme Comparison
  const [comparisonList, setComparisonList] = useState<SchemeMatch[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Eligibility Explanation Drawer
  const [activeSchemeDetail, setActiveSchemeDetail] = useState<SchemeMatch | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const projs = await api.get<Project[]>('/projects');
        setProjects(projs || []);
        if (projs && projs.length > 0) {
          setSelectedProjectId(projs[0].id);
          await loadSchemes(projs[0].id);
        } else {
          // Fallback to general schemes
          const allSchemes = await api.get('/schemes');
          setSchemes(allSchemes || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadSchemes = async (projId: string) => {
    setLoading(true);
    try {
      const data = await api.get<SchemeMatch[]>(`/schemes/match/${projId}`);
      setSchemes(data || []);
    } catch (e) {
      console.error('Error loading schemes:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyScheme = async (scheme: SchemeMatch) => {
    try {
      await api.post('/schemes/apply', {
        projectId: selectedProjectId,
        schemeCode: scheme.schemeCode,
        matchScore: scheme.matchScore,
        matchBreakdown: scheme.scoreBreakdown
      });
      alert(`Pre-eligibility dossier generated for ${scheme.schemeName}!`);
      await loadSchemes(selectedProjectId);
    } catch (e: any) {
      alert(e.message || 'Failed to apply');
    }
  };

  const toggleCompare = (scheme: SchemeMatch) => {
    if (comparisonList.some(s => s.schemeId === scheme.schemeId)) {
      setComparisonList(comparisonList.filter(s => s.schemeId !== scheme.schemeId));
    } else {
      if (comparisonList.length >= 3) {
        alert('You can compare up to 3 schemes at a time.');
        return;
      }
      setComparisonList([...comparisonList, scheme]);
    }
  };

  const filteredSchemes = schemes.filter(s => {
    const matchesSearch =
      s.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.benefitsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Government Support &amp; Incentive Schemes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic 100-Point Scored matching based on verified company records and declared project profile.
          </p>
        </div>

        {comparisonList.length > 0 && (
          <button
            onClick={() => setShowComparisonModal(true)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold text-xs shadow-xs transition flex items-center"
          >
            <Scale className="w-4 h-4 mr-1.5" />
            Compare Schemes ({comparisonList.length}/3)
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search subsidies, textile, MSME, capital grants..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="text-[11px] text-slate-500">
          Showing {filteredSchemes.length} verified government support programs
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map(scheme => {
          const isSelectedForCompare = comparisonList.some(s => s.schemeId === scheme.schemeId);

          return (
            <div
              key={scheme.schemeId}
              className="bg-white rounded border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                      {scheme.schemeType}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                      {scheme.schemeName}
                    </h2>
                    <p className="text-[11px] text-slate-500">{scheme.department}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-blue-700">
                      {scheme.matchScore}%
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        scheme.eligibilityStatus === 'Likely Eligible'
                          ? 'bg-emerald-100 text-emerald-800'
                          : scheme.eligibilityStatus === 'Potentially Eligible'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {scheme.eligibilityStatus}
                    </span>
                  </div>
                </div>

                {/* Benefits Pill */}
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Key Statutory Benefit:
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {scheme.benefitsSummary}
                  </p>
                </div>

                {/* Why You May Qualify Bullet Points */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                    Why Your Project Qualifies:
                  </div>
                  <ul className="space-y-1 text-[11px]">
                    {scheme.satisfiedConditions.slice(0, 3).map((c, i) => (
                      <li key={i} className="flex items-start text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unsatisfied Criteria if any */}
                {scheme.missingOrUnsatisfiedConditions.length > 0 && (
                  <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center">
                      <AlertTriangle className="w-3 h-3 text-amber-700 mr-1" />
                      Condition Requiring Verification:
                    </div>
                    <p className="text-amber-800">{scheme.missingOrUnsatisfiedConditions[0]}</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <label className="flex items-center space-x-1.5 text-[11px] text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelectedForCompare}
                    onChange={() => toggleCompare(scheme)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Compare</span>
                </label>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveSchemeDetail(scheme)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 font-semibold text-[11px] transition"
                  >
                    View Breakdown
                  </button>

                  <button
                    onClick={() => handleApplyScheme(scheme)}
                    disabled={scheme.isApplied}
                    className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold text-[11px] rounded shadow-xs transition"
                  >
                    {scheme.isApplied ? 'Dossier Filed' : 'Apply Scheme Docket'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Eligibility Breakdown Drawer / Modal */}
      {activeSchemeDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[10px] text-blue-700 font-bold uppercase">
                  {activeSchemeDetail.schemeType}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeSchemeDetail.schemeName}
                </h3>
              </div>
              <button
                onClick={() => setActiveSchemeDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 100-Point Score Breakdown */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-2">
                100-Point Scored Eligibility Breakdown
              </h4>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Sector Match:</span>
                  <div className="font-bold">{activeSchemeDetail.scoreBreakdown.sectorScore} / 30 pts</div>
                </div>
                <div>
                  <span className="text-slate-500">Location / Zone:</span>
                  <div className="font-bold">{activeSchemeDetail.scoreBreakdown.locationScore} / 20 pts</div>
                </div>
                <div>
                  <span className="text-slate-500">Investment Outlay:</span>
                  <div className="font-bold">{activeSchemeDetail.scoreBreakdown.investmentScore} / 20 pts</div>
                </div>
                <div>
                  <span className="text-slate-500">Entity Constitution:</span>
                  <div className="font-bold">{activeSchemeDetail.scoreBreakdown.entityTypeScore} / 10 pts</div>
                </div>
                <div>
                  <span className="text-slate-500">Workforce Creation:</span>
                  <div className="font-bold">{activeSchemeDetail.scoreBreakdown.employmentScore} / 10 pts</div>
                </div>
                <div>
                  <span className="text-slate-500">Vault Documentation:</span>
                  <div className="font-bold">{activeSchemeDetail.scoreBreakdown.docScore} / 10 pts</div>
                </div>
              </div>
            </div>

            {/* Satisfied Conditions */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1.5">Satisfied Conditions</h4>
              <ul className="space-y-1 text-[11px]">
                {activeSchemeDetail.satisfiedConditions.map((sc, idx) => (
                  <li key={idx} className="flex items-start text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0 mt-0.5" />
                    <span>{sc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Remedies */}
            {activeSchemeDetail.remedySuggestions.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1.5">What Can Change This?</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-950 text-[11px] space-y-1">
                  {activeSchemeDetail.remedySuggestions.map((rem, idx) => (
                    <p key={idx}>&bull; {rem}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-400 border-t pt-2">
              Official Source: {activeSchemeDetail.officialSourceUrl} &bull; Verified: {activeSchemeDetail.lastVerifiedDate}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveSchemeDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Scheme Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Statutory Scheme Comparison Matrix
              </h3>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200 border border-slate-200">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="p-3 w-40 font-bold">Parameter</th>
                    {comparisonList.map(s => (
                      <th key={s.schemeId} className="p-3 font-bold text-slate-900">
                        {s.schemeName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Department</td>
                    {comparisonList.map(s => (
                      <td key={s.schemeId} className="p-3 text-slate-700">{s.department}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Match Score</td>
                    {comparisonList.map(s => (
                      <td key={s.schemeId} className="p-3 font-bold text-blue-700">{s.matchScore}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Primary Benefit</td>
                    {comparisonList.map(s => (
                      <td key={s.schemeId} className="p-3 text-slate-700">{s.benefitsSummary}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Supporting Docs</td>
                    {comparisonList.map(s => (
                      <td key={s.schemeId} className="p-3 text-slate-700">
                        {s.supportingDocumentsFound.join(', ') || 'Standard entity registration'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-right pt-3">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
