import React from 'react';
import { ShieldCheck, Phone, Mail, FileText, CheckSquare, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-sm tracking-wide">
              <span>UDYOGSETU</span>
              <span className="text-[10px] bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-normal">
                Maharashtra Portal
              </span>
            </div>
            <p className="mt-2 text-slate-400 leading-relaxed text-[11px]">
              Unified Industrial Approvals, Statutory Compliance Management & Government Schemes Orchestration System.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>RTSA 2015 Statutory SLA Compliant</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
              Participating Departments
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="hover:text-white cursor-pointer">Maharashtra Pollution Control Board (MPCB)</li>
              <li className="hover:text-white cursor-pointer">Directorate of Maharashtra Fire Services</li>
              <li className="hover:text-white cursor-pointer">Directorate of Industrial Safety & Health (DISH)</li>
              <li className="hover:text-white cursor-pointer">Maharashtra State Electricity Distribution (MSEDCL)</li>
              <li className="hover:text-white cursor-pointer">Maharashtra Industrial Development Corp (MIDC)</li>
              <li className="hover:text-white cursor-pointer">Office of the Labour Commissioner</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
              Helpdesk & Citizen Support
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>1800-120-8040 (Toll Free, 9 AM - 6 PM)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support.udyogsetu@maharashtra.gov.in</span>
              </div>
              <p className="text-slate-500 pt-1 text-[10px]">
                Single Window Citizen Facilitation Center, Industry Directorate, Nariman Point, Mumbai 400021.
              </p>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
              Statutory Disclaimers
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              UdyogSetu is a statutory administrative facilitation platform developed for Smart India Hackathon 2026. Document pre-scrutiny and scheme matching are advisory. Final statutory sanction certificates remain vested with authorized department officers.
            </p>
            <div className="mt-3 text-[10px] text-slate-500">
              ISO/IEC 27001 Security Framework &bull; NIC Interoperability Standard
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] flex flex-col sm:flex-row justify-between items-center text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Government of Maharashtra. All rights reserved. Problem Statement 26130.
          </div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Hyperlinking Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
