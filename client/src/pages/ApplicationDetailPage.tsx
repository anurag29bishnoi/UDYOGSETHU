import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Application, ClarificationQuery } from '../types';
import { StatusBadge, SLABadge } from '../components/common/StatusBadge';
import confetti from 'canvas-confetti';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  ShieldCheck,
  Download,
  Calendar,
  User,
  ArrowLeft,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Clarification response form
  const [queryResponseText, setQueryResponseText] = useState('');
  const [respondingQueryId, setRespondingQueryId] = useState<string | null>(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Officer action form
  const [officerDecision, setOfficerDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [queryText, setQueryText] = useState('');
  const [showQueryModal, setShowQueryModal] = useState(false);

  const fetchApplication = async () => {
    try {
      const data = await api.get<Application>(`/applications/${id}`);
      setApplication(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleRespondToQuery = async (queryId: string) => {
    if (!queryResponseText.trim()) return;
    setSubmittingResponse(true);
    try {
      await api.post(`/applications/${id}/respond`, {
        queryId,
        responseText: queryResponseText
      });
      setQueryResponseText('');
      setRespondingQueryId(null);
      await fetchApplication();
    } catch (e: any) {
      alert(e.message || 'Failed to submit response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleOfficerDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!window.confirm(`Confirm ${decision} for application ${application?.applicationNumber}?`)) return;
    try {
      await api.post(`/applications/${id}/decision`, {
        decision,
        remarks: officerRemarks || `Application verified and ${decision.toLowerCase()} by competent authority.`
      });

      if (decision === 'APPROVED') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      await fetchApplication();
    } catch (e: any) {
      alert(e.message || 'Failed to record decision');
    }
  };

  const handleRaiseOfficerQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    try {
      await api.post(`/applications/${id}/query`, { queryText });
      setQueryText('');
      setShowQueryModal(false);
      await fetchApplication();
    } catch (e: any) {
      alert(e.message || 'Failed to raise query');
    }
  };

  if (loading || !application) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">
        <Clock className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span>Loading application record...</span>
      </div>
    );
  }

  const isOfficer = user?.role === 'DEPARTMENT_OFFICER' || user?.role === 'SENIOR_OFFICER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-xs">
      <Link
        to={isOfficer ? '/officer' : '/applications'}
        className="inline-flex items-center text-slate-500 hover:text-slate-900 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to {isOfficer ? 'Desk Queue' : 'My Applications'}
      </Link>

      {/* Main Header Banner */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-slate-900">{application.approval.name}</span>
            <StatusBadge status={application.status} />
          </div>
          <div className="text-slate-600 text-xs flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <strong>Application #:</strong> {application.applicationNumber}
            </span>
            <span>
              <strong>Department:</strong> {application.department.name}
            </span>
            <span>
              <strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <SLABadge
            slaStatus={application.slaStatus}
            remainingDays={application.slaInfo?.remainingDays}
            statutoryDays={application.approval.statutoryDaysSLA}
          />

          {application.status === 'APPROVED' && (
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-xs shadow-xs transition flex items-center"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Sanction Certificate
            </button>
          )}
        </div>
      </div>

      {/* Officer Action Bar (Visible when viewing as Officer) */}
      {isOfficer && application.status !== 'APPROVED' && application.status !== 'REJECTED' && (
        <div className="p-4 bg-slate-900 text-white rounded border border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="font-bold text-sm text-blue-300">Desk Officer Determination Panel</div>
            <p className="text-[11px] text-slate-400">
              Assigned verification officer: {user?.name} &bull; Statutory RTSA SLA active
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowQueryModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs transition"
            >
              Request Clarification
            </button>

            <button
              onClick={() => handleOfficerDecision('REJECTED')}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded font-semibold text-xs transition"
            >
              Reject Dossier
            </button>

            <button
              onClick={() => handleOfficerDecision('APPROVED')}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs shadow-xs transition flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Approve &amp; Issue Sanction
            </button>
          </div>
        </div>
      )}

      {/* Application Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Queries */}
        <div className="lg:col-span-2 space-y-6">
          {/* One-Time Data Reuse Card */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Verified Industrial Dossier (One-Time Data Reuse)
              </h2>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Auto-Populated from Vault
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Entity Name:</span>
                <p className="font-bold text-slate-800">{application.project?.company?.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">GSTIN:</span>
                <p className="font-bold text-slate-800 font-mono">{application.project?.company?.gstin}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">PAN:</span>
                <p className="font-bold text-slate-800 font-mono">{application.project?.company?.pan}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">MIDC Plot:</span>
                <p className="font-bold text-slate-800">{application.project?.midcPlot || 'Plot C-14'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Capital Outlay:</span>
                <p className="font-bold text-blue-700">₹{application.project?.totalInvestment} Cr</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Workforce:</span>
                <p className="font-bold text-slate-800">{application.project?.employeeCount} Workers</p>
              </div>
            </div>
          </div>

          {/* AI Pre-Scrutiny & Transparent Risk Assessment */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Pre-Scrutiny Analysis &amp; Risk Score</h2>
                <p className="text-[11px] text-slate-500">Automated structural verification summary</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Risk Score:</span>
                <span className="text-sm font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {application.riskScore}/100 (Low Risk)
                </span>
              </div>
            </div>

            <p className="text-slate-700 text-xs leading-relaxed">
              {application.preScrutinySummary || 'Mandatory company credentials verified consistent from Document Vault. Statutory SLA deadline established.'}
            </p>
          </div>

          {/* Clarification Queries Box */}
          <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Clarifications &amp; Department Queries</h2>
                <p className="text-[11px] text-slate-500">
                  Direct statutory dialogue between desk officer and applicant.
                </p>
              </div>
              {application.queries && (
                <span className="text-[10px] bg-slate-200 font-semibold px-2 py-0.5 rounded">
                  {application.queries.length} Record(s)
                </span>
              )}
            </div>

            <div className="p-4 space-y-4">
              {!application.queries || application.queries.length === 0 ? (
                <div className="text-center py-4 text-slate-500 italic">
                  No clarification queries raised for this application.
                </div>
              ) : (
                application.queries.map(q => (
                  <div key={q.id} className="p-4 rounded border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">
                          Query by Department Officer:
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {new Date(q.queryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <StatusBadge status={q.status} />
                    </div>

                    <p className="text-xs text-slate-800 bg-white p-3 rounded border border-slate-200">
                      &quot;{q.queryText}&quot;
                    </p>

                    {/* If Resolved, show response */}
                    {q.responseText ? (
                      <div className="pl-4 border-l-2 border-emerald-500 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">
                          Applicant Response ({new Date(q.responseDate || '').toLocaleDateString()}):
                        </span>
                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                          {q.responseText}
                        </p>
                      </div>
                    ) : (
                      // If Pending and user is Entrepreneur, show response input
                      !isOfficer && (
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <textarea
                            rows={3}
                            value={queryResponseText}
                            onChange={e => setQueryResponseText(e.target.value)}
                            placeholder="Type your official explanation / clarification response here..."
                            className="w-full border border-slate-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                          />
                          <div className="text-right">
                            <button
                              onClick={() => handleRespondToQuery(q.id)}
                              disabled={submittingResponse || !queryResponseText.trim()}
                              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold text-xs shadow-xs transition disabled:opacity-50"
                            >
                              {submittingResponse ? 'Submitting...' : 'Submit Official Response'}
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Timeline & SLA Countdown */}
        <div className="space-y-6">
          {/* Statutory SLA Countdown Box */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">RTSA 2015 SLA Countdown</h3>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Statutory Target:</span>
                <span className="font-bold">{application.approval.statutoryDaysSLA} Working Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Days Elapsed:</span>
                <span className="font-bold text-slate-800">{application.slaInfo?.elapsedDays || 0} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Days Remaining:</span>
                <span className="font-bold text-blue-700">{application.slaInfo?.remainingDays || 0} Days</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-slate-600">Statutory Due Date:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(application.slaDueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Official Application Timeline */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Audit Progress Timeline</h3>

            <div className="space-y-4 pl-2 border-l-2 border-slate-200 text-xs">
              {application.timeline?.map((t, idx) => (
                <div key={idx} className="relative pl-4">
                  <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                  <div className="font-bold text-slate-900">{t.stage}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()} by {t.actorName} ({t.actorRole})
                  </div>
                  {t.remarks && <p className="text-slate-600 text-[11px] mt-1">{t.remarks}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Officer Raising Query */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Request Clarification from Applicant
            </h3>
            <p className="text-[11px] text-slate-500">
              This query will be recorded in the audit trail and sent immediately to the applicant.
            </p>
            <form onSubmit={handleRaiseOfficerQuery} className="space-y-3">
              <textarea
                required
                rows={4}
                value={queryText}
                onChange={e => setQueryText(e.target.value)}
                placeholder="Specify the exact technical calculation, drawing sheet, or clarification required..."
                className="w-full border border-slate-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQueryModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold"
                >
                  Send Clarification Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
