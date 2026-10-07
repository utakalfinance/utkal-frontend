import React from 'react';
import { User, Info, Calendar, Briefcase, Award, Shield, Pencil } from 'lucide-react';

/**
 * PersonalInformationCard Component
 * Displays authenticated member personal legal records.
 */
export function PersonalInformationCard({
  fullName = 'Not provided',
  dob = 'Not provided',
  gender = 'Not provided',
  occupation = 'Not provided',
  membershipType = 'Not provided',
  onEdit,
}) {
  const fields = [
    {
      label: 'Full Legal Name',
      value: fullName,
      icon: User,
      highlight: true,
    },
    {
      label: 'Date of Birth',
      value: dob,
      icon: Calendar,
    },
    {
      label: 'Gender',
      value: gender,
      icon: Shield,
    },
    {
      label: 'Occupation / Profession',
      value: occupation,
      icon: Briefcase,
    },
    {
      label: 'Membership Type',
      value: membershipType,
      icon: Award,
      badge: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-4">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#004085] shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500">
                Personal details recorded during your membership registration.
              </p>
            </div>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit('personal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#004085] bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/80 transition-all cursor-pointer shrink-0"
              title="Edit Personal Information"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* 2-COLUMN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          {fields.map((f, idx) => {
            const Icon = f.icon;
            const isMissing = !f.value || f.value === 'Not provided' || f.value === '—';
            const displayValue = isMissing ? 'Not provided' : f.value;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-1 ${
                  f.highlight ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                  {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span>{f.label}</span>
                </div>
                {f.badge && !isMissing ? (
                  <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-50 text-[#004085] border border-blue-200/70">
                    {displayValue}
                  </span>
                ) : (
                  <span
                    className={`font-extrabold text-xs break-words ${
                      isMissing ? 'text-slate-400 italic font-normal' : 'text-slate-900'
                    }`}
                  >
                    {displayValue}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPLIANCE NOTE */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Recorded as per statutory membership declaration.</span>
      </div>
    </div>
  );
}
