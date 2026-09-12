import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AssistantWidget } from '../common/AssistantWidget';
import { MobileBottomNav } from './MobileBottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />
      <main className="flex-1 flex flex-col pb-14 md:pb-0">
        <Outlet />
      </main>
      <AssistantWidget />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};
