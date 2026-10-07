import React from 'react';
import { FileText, Clock, CheckCircle2, CreditCard, TrendingUp } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export function DashboardStats({ activeFilter = 'ALL', onSelectFilter }) {
  const { applications } = useAdmin();

  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    return s === 'pending' || s === 'submitted' || s === 'payment' || s === 'correction required' || s === 'correction_required';
  }).length;
  const approvedApps = applications.filter((a) => (a.status || '').toLowerCase() === 'approved').length;

  const totalPaymentSumNumber = applications.reduce((sum, app) => {
    const amt = app.totalPaid || app.payment?.amount || 200;
    return sum + Number(amt);
  }, 0);

  const formattedPaymentsSum = `₹${totalPaymentSumNumber.toLocaleString('en-IN')}`;

  const stats = [
    {
      id: 'ALL',
      label: 'TOTAL APPLICATIONS',
      value: totalApps,
      change: 'Live Total',
      period: '',
      icon: FileText,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      activeRing: 'ring-2 ring-indigo-500 border-indigo-300 shadow-md bg-indigo-50/20',
    },
    {
      id: 'PENDING',
      label: 'PENDING APPLICATIONS',
      value: pendingApps,
      change: 'Needs Review',
      period: '',
      icon: Clock,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-100',
      badgeBg: 'bg-amber-100 text-amber-800',
      activeRing: 'ring-2 ring-amber-500 border-amber-300 shadow-md bg-amber-50/20',
    },
    {
      id: 'APPROVED',
      label: 'APPROVED APPLICATIONS',
      value: approvedApps,
      change: 'Verified',
      period: '',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-300 shadow-md bg-emerald-50/20',
    },
    {
      id: 'PAYMENTS',
      label: 'TOTAL PAYMENTS',
      value: formattedPaymentsSum,
      change: 'Received',
      period: '',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100',
      badgeBg: 'bg-blue-50 text-blue-700',
      activeRing: 'ring-2 ring-blue-500 border-blue-300 shadow-md bg-blue-50/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        const isActive = activeFilter === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onSelectFilter && onSelectFilter(item.id)}
            className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all text-left space-y-3 cursor-pointer select-none hover:-translate-y-0.5 hover:shadow-md ${
              isActive ? item.activeRing : 'hover:border-slate-300'
            }`}
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
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</h3>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${item.badgeBg} inline-flex items-center gap-0.5`}>
                  <TrendingUp className="w-3 h-3" />
                  {item.change}
                </span>
                {item.period && (
                  <span className="text-[11px] text-slate-400 font-medium">{item.period}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardStats;

