import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Info } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF9] text-[#111827]">
      {/* Sandbox Test Banner matching exact design */}
      <div className="bg-[#0f2e23] text-white/90 text-xs py-2 px-4 sm:px-8 flex items-center justify-between border-b border-[#1b4334]">
        <div className="flex items-center gap-2 max-w-5xl">
          <Info className="w-4 h-4 text-[#d8eb69] shrink-0" />
          <span className="text-[11px] sm:text-xs font-normal text-[#eaf3ed] tracking-normal">
            PayPal AI Hackathon 2026 Prototype — Connected to PayPal Sandbox (Mock/Verified Environment). No real transactions or funds.
          </span>
        </div>
        <div className="hidden sm:inline-flex items-center px-3.5 py-1 rounded-full bg-[#1b5e3f] text-white text-[11px] font-medium tracking-wide">
          <span>Sandbox Mode</span>
        </div>
      </div>

      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
