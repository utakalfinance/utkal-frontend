import React from 'react';
import { Users, UserCheck, Award, ShieldCheck } from 'lucide-react';

export function MemberStats({ members = [] }) {
  const total = members.length;
  const associate = members.filter(
    (m) => m.role === 'associate' || m.isAssociate === true
  ).length;
  const regular = Math.max(0, total - associate);
  const active = members.filter((m) => m.membershipStatus === 'Active').length;

  const stats = [
    {
      label: 'TOTAL MEMBERS',
      value: total,
      subtext: 'Approved cooperative members',
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100',
    },
    {
      label: 'ASSOCIATE MEMBERS',
      value: associate,
      subtext: 'Statutory Associate class',
      icon: Award,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'REGULAR MEMBERS',
      value: regular,
      subtext: 'Ordinary member class',
      icon: ShieldCheck,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-100',
    },
    {
      label: 'ACTIVE STATUS',
      value: active,
      subtext: 'Good standing accounts',
      icon: UserCheck,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50/80',
      borderColor: 'border-teal-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all text-left space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {stat.value}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{stat.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MemberStats;
