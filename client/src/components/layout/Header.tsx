import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { NotificationItem } from '../../types';
import {
  Building2,
  FileCheck2,
  Layers,
  Award,
  CalendarClock,
  AlertTriangle,
  Bell,
  LogOut,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, company, logout, switchDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  useEffect(() => {
    if (user) {
      // In a full app fetch notifications, for prototype populate or fetch
      setNotifications([
        {
          id: '1',
          title: 'Action Required: Fire NOC Clarification',
          message: 'Divisional Fire Officer requested static water storage calculation.',
          type: 'QUERY',
          link: '/applications',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Common Joint Inspection Scheduled',
          message: 'Joint squad (MPCB, Fire, DISH) will inspect on 16th Sept.',
          type: 'INSPECTION',
          link: '/inspections',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      {/* 1. Official National & State Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-0.5">
            <span className="w-2.5 h-1.5 bg-orange-500 inline-block"></span>
            <span className="w-2.5 h-1.5 bg-white inline-block"></span>
            <span className="w-2.5 h-1.5 bg-emerald-600 inline-block"></span>
          </div>
          <span className="font-medium tracking-wide text-slate-200">
            GOVERNMENT OF MAHARASHTRA &bull; INDUSTRY & ENERGY DEPARTMENT
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Right to Public Services Act (RTSA 2015) Compliant</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-slate-400">Toll Free: 1800-120-8040 (9 AM - 6 PM)</span>
          <span className="text-slate-500">|</span>
          <span className="cursor-pointer hover:text-white font-medium">English</span>
          <span className="text-slate-500">/</span>
          <span className="cursor-pointer hover:text-white font-medium">मराठी</span>
        </div>
      </div>

      {/* 2. Main Portal Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo & Portal Identity */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 focus:outline-hidden">
            <div className="w-10 h-10 rounded bg-[#0F2942] text-white flex items-center justify-center font-bold text-xl tracking-tight shadow-sm border border-slate-700">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  UDYOG<span className="text-blue-700">SETU 360</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  India
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Start Any Business. Know Every Requirement. Stay Compliant.
              </p>
            </div>
          </Link>
        </div>

        {/* Demo Role Switcher Quick Pill (for SIH Judges & Evaluators) */}
        <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs space-x-2">
          <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600" /> Demo Persona:
          </span>
          <button
            onClick={() => switchDemoRole('ENTREPRENEUR')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              user?.role === 'ENTREPRENEUR'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Entrepreneur
          </button>
          <button
            onClick={() => switchDemoRole('officer@udyogsetu.in')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              user?.role === 'DEPARTMENT_OFFICER'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            MPCB Officer
          </button>
          <button
            onClick={() => switchDemoRole('senior@udyogsetu.in')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              user?.role === 'SENIOR_OFFICER'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Senior Officer (IAS)
          </button>
          <button
            onClick={() => switchDemoRole('ADMIN')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              user?.role === 'ADMIN'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Admin
          </button>
        </div>

        {/* User Profile / Notifications */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 relative focus:outline-hidden"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded border border-slate-200 shadow-lg z-50 py-2">
                    <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                        Statutory Notifications
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-1.5 py-0.5 rounded">
                        {unreadCount} New
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.map(n => (
                        <div key={n.id} className="p-3 text-xs hover:bg-slate-50">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Identity Pill */}
              <div className="border-l border-slate-200 pl-3 flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</div>
                  <div className="text-[11px] text-blue-700 font-medium leading-none mt-0.5">
                    {user.designation || (user.role === 'ENTREPRENEUR' ? company?.name || 'ABC Industries Pvt Ltd' : user.role)}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-700 rounded hover:bg-red-50 focus:outline-hidden"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 px-3 py-1.5 rounded shadow-xs"
              >
                Register Business
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Primary Navigation Bar */}
      {user && (
        <nav className="bg-slate-100 border-t border-slate-200 text-xs font-medium">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-1">
            {user.role === 'ENTREPRENEUR' && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/dashboard') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/start-business"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/start-business') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-blue-700 font-semibold hover:bg-white/60'
                  }`}
                >
                  + Start a Business
                </Link>
                <Link
                  to="/know-your-approvals"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/know-your-approvals') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Know Your Approvals
                </Link>
                <Link
                  to="/readiness"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/readiness') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Business Readiness
                </Link>
                <Link
                  to="/projects"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/projects') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  My Projects
                </Link>
                <Link
                  to="/documents"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/documents') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Document Vault
                </Link>
                <Link
                  to="/approvals"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/approvals') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Required Approvals Roadmap
                </Link>
                <Link
                  to="/applications"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/applications') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Track Applications
                </Link>
                <Link
                  to="/schemes"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/schemes') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Government Schemes
                </Link>
                <Link
                  to="/compliance"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/compliance') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Compliance & Renewals
                </Link>
                <Link
                  to="/grievances"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/grievances') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Grievances
                </Link>
              </>
            )}

            {user.role === 'DEPARTMENT_OFFICER' && (
              <>
                <Link
                  to="/officer"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/officer') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Department Scrutiny Queue
                </Link>
                <Link
                  to="/officer/inspections"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/officer/inspections') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Joint Inspections
                </Link>
                <Link
                  to="/officer/analytics"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/officer/analytics') ? 'bg-white text-blue-800 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Department Bottlenecks
                </Link>
              </>
            )}

            {user.role === 'SENIOR_OFFICER' && (
              <>
                <Link
                  to="/senior"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/senior') ? 'bg-white text-amber-900 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Escalated Applications & SLA Monitor
                </Link>
                <Link
                  to="/officer/analytics"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/officer/analytics') ? 'bg-white text-amber-900 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Inter-Department Bottleneck Analytics
                </Link>
              </>
            )}

            {user.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/admin') ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Administration & Rules Builder
                </Link>
                <Link
                  to="/officer/analytics"
                  className={`px-3 py-1.5 rounded transition ${
                    isActive('/officer/analytics') ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  System Analytics
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
