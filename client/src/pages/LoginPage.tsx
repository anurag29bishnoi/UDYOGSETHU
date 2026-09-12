import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('demo@udyogsetu.in');
  const [password, setPassword] = useState('Demo@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail: string, redirectPath: string) => {
    setLoading(true);
    try {
      await switchDemoRole(demoEmail);
      navigate(redirectPath);
    } catch (err: any) {
      setError('Demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded bg-[#0F2942] text-white flex items-center justify-center font-bold text-2xl shadow-sm border border-slate-700">
            <Building2 className="w-7 h-7 text-blue-400" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign In to UdyogSetu
        </h2>
        <p className="mt-1 text-center text-xs text-slate-600">
          Single Window Industrial Clearances & Compliance Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xs border border-slate-200 sm:rounded sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded text-xs shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-700 mb-2 flex items-center">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 mr-1" />
              1-Click Demo Accounts (Hackathon Evaluator Quick Access):
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoClick('demo@udyogsetu.in', '/dashboard')}
                className="p-2 border border-slate-200 rounded bg-slate-50 hover:bg-blue-50 text-left transition"
              >
                <div className="font-semibold text-slate-800">Entrepreneur</div>
                <div className="text-slate-500 text-[10px]">ABC Industries (Textile)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('officer@udyogsetu.in', '/officer')}
                className="p-2 border border-slate-200 rounded bg-slate-50 hover:bg-blue-50 text-left transition"
              >
                <div className="font-semibold text-slate-800">MPCB Officer</div>
                <div className="text-slate-500 text-[10px]">Desk Scrutiny Queue</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('senior@udyogsetu.in', '/senior')}
                className="p-2 border border-slate-200 rounded bg-slate-50 hover:bg-amber-50 text-left transition"
              >
                <div className="font-semibold text-slate-800">Senior Officer (IAS)</div>
                <div className="text-slate-500 text-[10px]">SLA Breach Escalations</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('admin@udyogsetu.in', '/admin')}
                className="p-2 border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 text-left transition"
              >
                <div className="font-semibold text-slate-800">Administrator</div>
                <div className="text-slate-500 text-[10px]">Rules & Audit Logs</div>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-600">
            Don&apos;t have an industrial profile?{' '}
            <Link to="/register" className="font-semibold text-blue-700 hover:underline">
              Register Company
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
