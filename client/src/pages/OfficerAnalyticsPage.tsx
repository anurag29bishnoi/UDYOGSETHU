import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const OfficerAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/overview');
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">
        <Clock className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span>Loading state industrial clearance analytics...</span>
      </div>
    );
  }

  const COLORS = ['#1E3A8A', '#2563EB', '#0D9488', '#D97706', '#DC2626'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          State Clearance Analytics &amp; Bottleneck Diagnostics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time performance across participating departments under Maharashtra Right to Public Services Act (RTSA 2015).
        </p>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Clearances Processed</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{data.summary.totalApplications}</div>
          <span className="text-[10px] text-slate-400">Current financial year</span>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">RTSA SLA Compliance</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{data.summary.slaComplianceRate}%</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Statutory target: 90%+</span>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Avg Clearance Duration</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">{data.summary.averageApprovalDays} Days</div>
          <span className="text-[10px] text-slate-400">Down from 45 days baseline</span>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Synchronized Joint Inspections</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{data.summary.activeJointInspections} Squads</div>
          <span className="text-[10px] text-slate-400">Zero site redundancy</span>
        </div>
      </div>

      {/* Department Bottleneck Detection Section */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Department Bottleneck Diagnostics &amp; Delay Attribution
            </h2>
            <p className="text-[11px] text-slate-500">
              Identifies root-cause delays across environmental, fire, and industrial safety desks.
            </p>
          </div>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
            Bottleneck Detector Active
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {data.departments?.map((dept: any) => (
            <div key={dept.code} className="p-4 space-y-2 hover:bg-slate-50 transition">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-xs">{dept.name} ({dept.code})</span>
                  <div className="text-[11px] text-slate-500">
                    Statutory Target: {dept.slaTargetDays} Days &bull; Actual Avg: {dept.avgProcessingDays} Days
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="font-bold text-slate-800">{dept.pending} Pending</span>
                    <div className="text-[10px] text-slate-400">In Scrutiny Queue</div>
                  </div>

                  <div className="text-right">
                    <span className={`font-bold ${dept.breached > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                      {dept.breached} Breached ({dept.breachPercentage}%)
                    </span>
                    <div className="text-[10px] text-slate-400">RTSA Overdue</div>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 flex items-start space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Primary Delay Driver:</strong> {dept.topIssue}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Document Errors Chart */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Top Root-Cause Document Rejections &amp; Errors
          </h3>
          <p className="text-[11px] text-slate-500">
            Errors flagged by UdyogSetu automated pre-scrutiny before department submission.
          </p>

          <div className="space-y-3 pt-2">
            {data.commonDocumentIssues?.map((issue: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                  <span className="font-medium truncate max-w-[280px]">{issue.issue}</span>
                  <span className="font-bold">{issue.percentage}% ({issue.count})</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-700 rounded-full"
                    style={{ width: `${issue.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sectoral Breakdown */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Clearance Distribution by Manufacturing Sector
          </h3>
          <p className="text-[11px] text-slate-500">
            Breakdown of industrial investments undergoing single-window processing.
          </p>

          <div className="space-y-3 pt-2">
            {data.sectorDistribution?.map((sec: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">{sec.sector}</span>
                <span className="font-bold text-blue-700">{sec.count} Projects</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
