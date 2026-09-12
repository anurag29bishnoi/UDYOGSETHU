import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Grievance } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';

export const GrievancesPage: React.FC = () => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [department, setDepartment] = useState('Maharashtra Pollution Control Board');
  const [category, setCategory] = useState('Delay in Approval Processing');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGrievances = async () => {
    try {
      const data = await api.get<Grievance[]>('/grievances');
      setGrievances(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/grievances', {
        department,
        category,
        description
      });
      setDescription('');
      await fetchGrievances();
    } catch (err: any) {
      alert(err.message || 'Failed to file grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          State Administrative Grievance Redressal Cell
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lodge formal grievances under Maharashtra Right to Public Services Act (RTSA 2015) for departmental delays, unwarranted objections, or inspection inaction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to submit grievance */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2">
            Lodge Formal Grievance
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Authority / Department *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
              >
                <option value="Maharashtra Pollution Control Board">Maharashtra Pollution Control Board (MPCB)</option>
                <option value="Directorate of Maharashtra Fire Services">Directorate of Maharashtra Fire Services</option>
                <option value="Directorate of Industrial Safety & Health">Directorate of Industrial Safety &amp; Health (DISH)</option>
                <option value="Maharashtra State Electricity Distribution">MSEDCL Power Distribution</option>
                <option value="Office of the Labour Commissioner">Office of the Labour Commissioner</option>
                <option value="MIDC Single Window Cell">MIDC Special Planning Authority</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Grievance Nature / Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
              >
                <option value="Delay in Approval Processing">Delay Beyond Statutory RTSA SLA Deadline</option>
                <option value="Unreasonable Clarification">Repetitive / Unwarranted Clarification Queries</option>
                <option value="Inspection Grievance">Inspection Scheduling Delay or Non-attendance</option>
                <option value="Technical Portal Issue">Technical Document Upload / Sync Failure</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Description of Grievance &amp; Application Reference *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Specify application number, date of submission, and the statutory delay faced..."
                className="w-full border border-slate-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded font-semibold text-xs shadow-xs transition disabled:opacity-50 flex items-center justify-center"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
              {submitting ? 'Generating Token...' : 'Lodge Grievance (Generate GRV Token)'}
            </button>
          </form>
        </div>

        {/* Existing Grievances List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Your Registered Grievances</h2>
                <p className="text-[11px] text-slate-500">
                  Track resolution status monitored by State Appellate Authority.
                </p>
              </div>
              <span className="text-[10px] bg-slate-200 font-semibold px-2 py-0.5 rounded">
                {grievances.length} Active
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {grievances.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No grievances registered. Department operations are proceeding within standard service limits.
                </div>
              ) : (
                grievances.map(grv => (
                  <div key={grv.id} className="p-4 space-y-2 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            {grv.token}
                          </span>
                          <StatusBadge status={grv.status} />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <strong>Department:</strong> {grv.department} &bull;{' '}
                          <strong>Category:</strong> {grv.category}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(grv.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                      {grv.description}
                    </p>

                    {grv.officerRemarks && (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px]">
                        <strong>Appellate Officer Action:</strong> {grv.officerRemarks}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
