import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, FileCheck2, LayoutDashboard, FolderLock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'SENIOR_OFFICER') return '/senior-officer';
    if (user.role === 'DEPARTMENT_OFFICER') return '/officer';
    if (user.role === 'ADMIN') return '/admin';
    return '/dashboard';
  };

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      exact: true
    },
    {
      to: '/start-business',
      label: 'Start Unit',
      icon: Compass
    },
    {
      to: '/know-your-approvals',
      label: 'Approvals',
      icon: FileCheck2
    },
    {
      to: getDashboardLink(),
      label: user ? 'Desk' : 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/documents',
      label: 'Vault',
      icon: FolderLock
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex justify-around items-center">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = item.exact
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded transition text-[10px] font-semibold ${
              isActive
                ? 'text-blue-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
