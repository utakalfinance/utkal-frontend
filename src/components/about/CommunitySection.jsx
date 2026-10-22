import React from 'react';
import { FileText, ShieldCheck, Users } from 'lucide-react';
import { SectionHeading } from '../SectionHeading';

export function CommunitySection() {
  return (
    <>
      {/* COMMUNITY / TRUST SECTION */}
      <section className="bg-slate-100/80 py-16 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-8">
          <SectionHeading
            badge="TRUST & INTEGRITY"
            title="Built Around People, Trust and Progress"
            subtitle="We adhere strictly to transparent documentation, non-coercive member support, and institutional standards."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Transparency</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                100% disclosed interest rate slabs and zero hidden fees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Responsible Service</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Ethical lending assistance focused on member financial wellness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Community Focus</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Empowering households and local enterprise growth across Odisha.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default CommunitySection;
