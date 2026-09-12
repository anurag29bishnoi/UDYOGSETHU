import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  Layers,
  Award,
  ShieldCheck,
  ArrowRight,
  Clock,
  FileText,
  HelpCircle,
  TrendingUp,
  UserCheck,
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
  Sparkles,
  Zap,
  MapPin
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickDemo = async (role: string) => {
    await switchDemoRole(role);
    if (role === 'ENTREPRENEUR') navigate('/dashboard');
    else if (role.includes('officer')) navigate('/officer');
    else if (role.includes('senior')) navigate('/senior');
    else navigate('/admin');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/start-business?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/start-business');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* 1. Hero Section */}
      <section className="border-b border-slate-200 bg-slate-50 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>National Single Window Platform Architecture &bull; SIH 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Start Any Business. Know Every Requirement. Stay Compliant.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              One Business Profile. Every Approval. Every Document. Every Compliance. Every Opportunity. Whether starting a petrol pump, hotel, hospital, textile factory, or IT company — get a personalized statutory roadmap in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/start-business"
                className="inline-flex items-center px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded shadow-sm transition"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Your Business
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/know-your-approvals"
                className="inline-flex items-center px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-sm font-semibold rounded border border-slate-300 transition"
              >
                Know Your Approvals Directory
              </Link>
            </div>

            {/* Quick Demo Credentials Box for Hackathon Reviewers */}
            <div className="mt-8 p-3.5 bg-white border border-slate-200 rounded text-xs">
              <div className="font-semibold text-slate-800 flex items-center mb-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                SIH 2026 Evaluation Personas (Click to launch instant role):
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickDemo('ENTREPRENEUR')}
                  className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 px-2.5 py-1 rounded border border-slate-200 transition font-medium text-[11px]"
                >
                  1. Entrepreneur (ABC Industries, 25 Cr Textile)
                </button>
                <button
                  onClick={() => handleQuickDemo('officer@udyogsetu.in')}
                  className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 px-2.5 py-1 rounded border border-slate-200 transition font-medium text-[11px]"
                >
                  2. MPCB Desk Officer
                </button>
                <button
                  onClick={() => handleQuickDemo('senior@udyogsetu.in')}
                  className="bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 px-2.5 py-1 rounded border border-slate-200 transition font-medium text-[11px]"
                >
                  3. Senior Officer (IAS) & SLA Escalations
                </button>
                <button
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded border border-slate-200 transition font-medium text-[11px]"
                >
                  4. Admin & Rule Builder
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT BUSINESS DO YOU WANT TO START? - Major Signature Discovery Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block mb-2">
              Instant Regulatory Discovery Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              WHAT BUSINESS DO YOU WANT TO START?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Select any commercial activity below or type your business idea. Our dynamic rules engine will construct your personalized compliance blueprint.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-5 relative max-w-2xl mx-auto flex">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type your proposed business: Petrol Pump, Hotel, Hospital, Textile Factory, Pharmacy, IT Company..."
                  className="w-full pl-11 pr-4 py-2.5 text-xs rounded-l border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-700 bg-white shadow-2xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-r transition shrink-0"
              >
                Find Requirements
              </button>
            </form>
          </div>

          {/* Quick Business Activity Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Petrol Pump', category: 'Petroleum Retail', icon: <Fuel className="w-5 h-5 text-amber-600" />, code: 'PETROL_PUMP' },
              { name: 'Hotel & Resort', category: 'Hospitality', icon: <Hotel className="w-5 h-5 text-blue-600" />, code: 'HOTEL' },
              { name: 'Hospital & Clinic', category: 'Healthcare', icon: <HeartPulse className="w-5 h-5 text-rose-600" />, code: 'HOSPITAL' },
              { name: 'Textile Factory', category: 'Manufacturing', icon: <Factory className="w-5 h-5 text-slate-700" />, code: 'TEXTILE_FACTORY' },
              { name: 'Food Processing', category: 'Agro & Cold Chain', icon: <Apple className="w-5 h-5 text-emerald-600" />, code: 'FOOD_PROCESSING' },
              { name: 'IT / Software Hub', category: 'Tech & BPM', icon: <Cpu className="w-5 h-5 text-indigo-600" />, code: 'IT_COMPANY' },
              { name: 'Auto Components', category: 'Engineering', icon: <Car className="w-5 h-5 text-orange-600" />, code: 'AUTO_COMPONENTS' },
              { name: 'Pharmacy Chemist', category: 'Retail Healthcare', icon: <Building2 className="w-5 h-5 text-teal-600" />, code: 'PHARMACY' },
              { name: 'Pharma / API Plant', category: 'Formulations', icon: <FlaskConical className="w-5 h-5 text-purple-600" />, code: 'PHARMACEUTICAL' },
              { name: 'Restaurant & Bar', category: 'Food Service', icon: <Building2 className="w-5 h-5 text-red-600" />, code: 'RESTAURANT' },
              { name: 'Solar Power Plant', category: 'Renewable Energy', icon: <SunMedium className="w-5 h-5 text-amber-500" />, code: 'SOLAR_PROJECT' },
              { name: 'EV Fast Charging', category: 'Mobility Hub', icon: <Zap className="w-5 h-5 text-blue-500" />, code: 'EV_CHARGING' }
            ].map(b => (
              <Link
                key={b.code}
                to={`/start-business?type=${b.code}`}
                className="p-3 bg-slate-50 hover:bg-blue-50 rounded border border-slate-200 hover:border-blue-300 transition text-center flex flex-col items-center justify-between group shadow-2xs"
              >
                <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{b.name}</h3>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{b.category}</span>
                </div>
                <span className="text-[10px] text-blue-700 font-semibold mt-2 opacity-0 group-hover:opacity-100 transition">
                  Explore Roadmap &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Key Problem & Solution: From Documents to Decisions */}
      <section id="how-it-works" className="py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Integrated Industrial Lifecycle
            </h2>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              From Documents to Clearances & Incentives
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Upload business documents once. UdyogSetu extracts credentials, identifies compliance errors, maps required clearances, and finds matching incentive schemes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="p-4 rounded border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Upload & Verify Vault</h4>
              <p className="text-slate-600 mt-1.5 leading-relaxed">
                Upload PAN, GSTIN, Udyam, Land Lease & Factory layouts. Automated pre-scrutiny detects 20+ statutory errors & consistency mismatches.
              </p>
            </div>

            <div className="p-4 rounded border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Statutory Approval Roadmap</h4>
              <p className="text-slate-600 mt-1.5 leading-relaxed">
                Deterministic rules evaluate sector, water, power, and fire risk to generate customized roadmaps for MPCB, Fire, DISH, and MSEDCL.
              </p>
            </div>

            <div className="p-4 rounded border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Government Scheme Matching</h4>
              <p className="text-slate-600 mt-1.5 leading-relaxed">
                100-Point Scored matching against Maharashtra PSI 2019, PM MITRA, and MoFPI capital subsidies with clear &quot;Why You Qualify&quot; reasons.
              </p>
            </div>

            <div className="p-4 rounded border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Joint Inspections & SLA Tracking</h4>
              <p className="text-slate-600 mt-1.5 leading-relaxed">
                Coordinated joint squads visit once instead of 3 separate times. Automated statutory escalation triggers if RTSA SLA is breached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Statutory Clearances Single Window */}
      <section id="approvals" className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
            <div>
              <h2 className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Statutory Clearances
              </h2>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Participating Government Authorities
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 md:mt-0 max-w-md">
              Processed in parallel with enforceable timelines under the Maharashtra Right to Public Services Act (RTSA 2015).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">MPCB Consent to Establish (CTE)</span>
                <span className="bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">21 Days SLA</span>
              </div>
              <p className="text-slate-600 mt-1">Maharashtra Pollution Control Board</p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Joint Inspection: Yes</span>
                <span>Water & Air Acts</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">Provisional Fire Safety NOC</span>
                <span className="bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">15 Days SLA</span>
              </div>
              <p className="text-slate-600 mt-1">Directorate of Maharashtra Fire Services</p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Joint Inspection: Yes</span>
                <span>Fire Prevention Act 2006</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">Factory License Plan Approval</span>
                <span className="bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">30 Days SLA</span>
              </div>
              <p className="text-slate-600 mt-1">Directorate of Industrial Safety & Health (DISH)</p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Joint Inspection: Yes</span>
                <span>Factories Act 1948</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">High Tension (HT) Power Sanction</span>
                <span className="bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">14 Days SLA</span>
              </div>
              <p className="text-slate-600 mt-1">Maharashtra State Electricity Distribution (MSEDCL)</p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Technical Feasibility</span>
                <span>Electricity Act 2003</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">MIDC Building Plan Approval</span>
                <span className="bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">21 Days SLA</span>
              </div>
              <p className="text-slate-600 mt-1">Maharashtra Industrial Development Corporation</p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Special Planning Authority</span>
                <span>MIDC Regulations</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">Principal Employer Labour Registration</span>
                <span className="bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">7 Days SLA</span>
              </div>
              <p className="text-slate-600 mt-1">Office of the Labour Commissioner</p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Instant Auto-Processing</span>
                <span>Contract Labour Act 1970</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions */}
      <section id="faq" className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded border border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900">
                Does UdyogSetu grant government approvals directly?
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                No. UdyogSetu is an official administrative orchestration and document pre-scrutiny platform. It coordinates and verifies your dossiers, checks legal rules, schedules joint inspections, and routes your application to authorized officers in MPCB, Fire, DISH, and other statutory bodies who issue the formal sanction certificates.
              </p>
            </div>

            <div className="p-4 rounded border border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900">
                How does the Common Joint Inspection work?
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                If your industrial project requires inspections from MPCB, the Fire Department, and DISH, UdyogSetu coordinates a single unified inspection window. Officers from all three departments visit your site simultaneously using a consolidated safety checklist, saving you weeks of redundant site visits.
              </p>
            </div>

            <div className="p-4 rounded border border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900">
                What happens if a department breaches its statutory SLA?
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Under the Maharashtra Right to Public Services Act (RTSA 2015), every clearance has a fixed statutory deadline. If a department does not respond within this window, the system automatically escalates the application to the Senior Appellate Officer (Joint CEO / IAS Officer) and Department Head for priority clearance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
