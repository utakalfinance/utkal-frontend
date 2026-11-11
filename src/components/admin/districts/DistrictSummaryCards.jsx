import React from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export function DistrictSummaryCards({ summary = {} }) {
  const total = summary.totalDistricts || 0;
  const active = summary.activeDistricts || 0;
  const inactive = summary.inactiveDistricts || 0;
  const admins = summary.totalDistrictAdmins || 0;

  const stats = [
    {
      id: 'total',
      label: 'TOTAL DISTRICTS',
      value: total,
      change: 'Operational Circles',
      icon: Building2,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100',
      badgeBg: 'bg-blue-50 text-blue-700',
    },
    {
      id: 'active',
      label: 'ACTIVE DISTRICTS',
      value: active,
      change: 'Active Branch Hubs',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'inactive',
      label: 'INACTIVE DISTRICTS',
      value: inactive,
      change: inactive === 0 ? 'Zero Inactive' : 'Temporarily Suspended',
      icon: XCircle,
      iconColor: inactive === 0 ? 'text-slate-400' : 'text-rose-600',
      bgColor: inactive === 0 ? 'bg-slate-50/80' : 'bg-rose-50/80',
      borderColor: inactive === 0 ? 'border-slate-200/80' : 'border-rose-100',
      badgeBg: inactive === 0 ? 'bg-slate-100 text-slate-700' : 'bg-rose-50 text-rose-700',
    },
    {
      id: 'admins',
      label: 'TOTAL DISTRICT ADMINS',
      value: admins,
      change: admins === 0 ? 'Phase 3 Pending' : 'Designated Officers',
      icon: ShieldCheck,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all text-left space-y-3 select-none hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">
                {item.label}
              </span>
              <div className={`p-2.5 rounded-xl ${item.bgColor} border ${item.borderColor}`}>
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {item.value}
              </h3>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${item.badgeBg} inline-flex items-center gap-1`}>
                  <TrendingUp className="w-3 h-3" />
                  {item.change}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DistrictSummaryCards;
