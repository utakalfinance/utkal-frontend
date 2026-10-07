import React from 'react';
import { Mail, Phone, Bell, Info, Pencil } from 'lucide-react';

/**
 * ContactInformationCard Component
 * Displays registered communication channels, email, mobile, and alerts preferences.
 */
export function ContactInformationCard({
  email = 'Not provided',
  mobile = 'Not provided',
  altMobile = 'Not provided',
  preferredCommunication = 'SMS & Email',
  onEdit,
}) {
  const isMissing = (val) => !val || val === 'Not provided' || val === '—';

  const cleanMobile = !isMissing(mobile)
    ? (mobile.startsWith('+91') ? mobile : `+91 ${mobile}`)
    : 'Not provided';

  const cleanAltMobile = !isMissing(altMobile)
    ? (altMobile.startsWith('+91') ? altMobile : `+91 ${altMobile}`)
    : 'Not provided';

  const displayEmail = !isMissing(email) ? email : 'Not provided';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-4">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Contact Information
              </h3>
              <p className="text-xs text-slate-500">
                Your registered communication channels.
              </p>
            </div>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit('contact')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/80 transition-all cursor-pointer shrink-0"
              title="Edit Contact Information"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* 2-COLUMN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          {/* Email */}
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-1 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Registered Email Address</span>
            </div>
            <span
              className={`font-mono text-xs break-all ${
                isMissing(email) ? 'text-slate-400 italic font-normal' : 'font-extrabold text-slate-900'
              }`}
            >
              {displayEmail}
            </span>
          </div>

          {/* Primary Mobile */}
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Primary Mobile Number</span>
            </div>
            <span
              className={`font-mono text-xs ${
                isMissing(mobile) ? 'text-slate-400 italic font-normal' : 'font-extrabold text-slate-900'
              }`}
            >
              {cleanMobile}
            </span>
          </div>

          {/* Alternate Mobile */}
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Alternate Contact</span>
            </div>
            <span
              className={`font-mono text-xs ${
                isMissing(altMobile) ? 'text-slate-400 italic font-normal' : 'font-extrabold text-slate-900'
              }`}
            >
              {cleanAltMobile}
            </span>
          </div>

          {/* Communication Preference */}
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-1 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Communication Preference</span>
            </div>
            <span className="font-extrabold text-xs text-[#004085]">
              {preferredCommunication || 'SMS & Email'}
            </span>
          </div>
        </div>
      </div>

      {/* COMPLIANCE NOTE */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Notifications and OTPs will be dispatched to these registered channels.</span>
      </div>
    </div>
  );
}
