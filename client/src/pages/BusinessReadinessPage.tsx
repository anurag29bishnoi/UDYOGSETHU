import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { DocumentHealthReport, DocumentIssue } from '../types';
import {
  ShieldCheck,
  FileCheck2,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  ExternalLink
} from 'lucide-react';

export const BusinessReadinessPage: React.FC = () => {
  const [healthReport, setHealthReport] = useState<DocumentHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await api.get<{ health: DocumentHealthReport }>('/documents');
        setHealthReport(data?.health || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const actionItems = [
    {
      severity: 'HIGH',
      title: 'Missing Authorized Architect Signature & Seal',
      category: 'Factory Layout (DISH Blueprint)',
      description: 'Factory structural layout blueprint sheet 3 is missing the certified signature of a licensed architect.',
      link: '/documents'
    },
    {
      severity: 'MEDIUM',
      title: 'Company Name Variation Detected in GST Certificate',
      category: 'Tax Document Consistency',
      description: "Entity name appears as 'ABC Industries Private Limited' on GST REG-06 and 'ABC Industries Pvt Ltd' on PAN.",
      link: '/documents'
    },
    {
      severity: 'LOW',
      title: 'Environmental Baseline Study Approaching Validity Expiry',
      category: 'MPCB Consent Compliance',
      description: 'Baseline ambient air & water monitoring report expires within 60 days. Renewal recommended before final CTO filing.',
      link: '/documents'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Business Readiness &amp; Health Index</h1>
        <p className="text-xs text-slate-500 mt-1">
          Comprehensive statutory compliance, document integrity, and government clearance readiness score.
        </p>
      </div>

      {/* 1. Readiness Health Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
        <div className="bg-white p-5 rounded border border-slate-200 space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-semibold text-slate-600">Company Verification</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">94%</div>
          <p className="text-[11px] text-slate-500">PAN, CIN, GSTIN matched with ROC</p>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-semibold text-slate-600">Document Readiness</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {healthReport ? `${healthReport.overallScore}%` : '88%'}
          </div>
          <p className="text-[11px] text-slate-500">5 of 6 mandatory categories present</p>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-semibold text-slate-600">Approval Readiness</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">76%</div>
          <p className="text-[11px] text-slate-500">Roadmap clear, 1 application approved</p>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-semibold text-slate-600">Compliance Health</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">100%</div>
          <p className="text-[11px] text-slate-500">No overdue statutory returns</p>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-semibold text-slate-600">Scheme Opportunities</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">4 Active</div>
          <p className="text-[11px] text-slate-500">Potential capital subsidies</p>
        </div>
      </div>

      {/* 2. "What Do I Need To Fix?" Priority Action List */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">What Do I Need To Fix?</h2>
            <p className="text-[11px] text-slate-500">
              Prioritized statutory action items to reach 100% clearance velocity.
            </p>
          </div>
          <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
            3 Action Items
          </span>
        </div>

        <div className="divide-y divide-slate-200 text-xs">
          {actionItems.map((item, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      item.severity === 'HIGH'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : item.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {item.severity} PRIORITY
                  </span>
                  <span className="font-bold text-slate-900">{item.title}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  <strong>Category:</strong> {item.category}
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <Link
                to={item.link}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded shadow-xs transition shrink-0"
              >
                Fix Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
