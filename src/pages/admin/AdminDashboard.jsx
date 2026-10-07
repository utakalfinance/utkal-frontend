import React, { useEffect } from 'react';
import { DashboardStats } from '../../components/admin/DashboardStats';
import { RecentApplications } from '../../components/admin/RecentApplications';
import { useAdmin } from '../../context/AdminContext';
import { BarChart3, TrendingUp, Users, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

export function AdminDashboard() {
  const { applications, refreshData } = useAdmin();
  const [activeCardFilter, setActiveCardFilter] = React.useState('ALL');

  useEffect(() => {
    if (typeof refreshData === 'function') {
      refreshData();
    }
  }, [refreshData]);

  // Compute breakdown for Chart (case-insensitive)
  const approved = applications.filter((a) => (a.status || '').toLowerCase() === 'approved').length;
  const pending = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    return s === 'pending' || s === 'submitted' || s === 'payment';
  }).length;
  const review = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    return s === 'under review' || s === 'under_review' || s === 'correction required' || s === 'correction_required';
  }).length;
  const rejected = applications.filter((a) => (a.status || '').toLowerCase() === 'rejected').length;
  const total = applications.length;

  const calcPercent = (count) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const chartItems = [
    { label: 'Approved', count: approved, percent: calcPercent(approved), color: 'bg-emerald-500', textColor: 'text-emerald-700', icon: CheckCircle2 },
    { label: 'Pending', count: pending, percent: calcPercent(pending), color: 'bg-amber-500', textColor: 'text-amber-700', icon: Clock },
    { label: 'Under Review', count: review, percent: calcPercent(review), color: 'bg-blue-600', textColor: 'text-blue-700', icon: AlertTriangle },
    { label: 'Rejected', count: rejected, percent: calcPercent(rejected), color: 'bg-rose-500', textColor: 'text-rose-700', icon: XCircle },
  ];

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good Morning';
    }
    if (currentHour >= 12 && currentHour < 17) {
      return 'Good Afternoon';
    }
    if (currentHour >= 17 && currentHour < 21) {
      return 'Good Evening';
    }
    return 'Good Night';
  };

  const greeting = getGreeting();

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {greeting}, Admin
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          <span className="hidden sm:inline">Here&apos;s what&apos;s happening with New Utkal Finance today.</span>
          <span className="sm:hidden">Here&apos;s what&apos;s happening today.</span>
        </p>
      </div>

      {/* 4 STATISTIC CARDS */}
      <DashboardStats
        activeFilter={activeCardFilter}
        onSelectFilter={(filterId) => setActiveCardFilter(filterId)}
      />

      {/* TWO COLUMN GRID: APPLICATION OVERVIEW CHART + RECENT SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART CONTAINER (CSS-BASED VISUAL CHART) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-700" />
              <span>Application Overview</span>
            </h3>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">REALTIME</span>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Statutory application distribution across lifecycle states.
          </p>

          {/* Clean CSS Horizontal & Vertical Visual Bar */}
          <div className="space-y-3 pt-2">
            {chartItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${item.textColor}`} />
                      <span>{item.label}</span>
                    </span>
                    <span className="font-mono font-black text-slate-900">
                      {item.count} ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: item.count > 0 ? `${Math.max(item.percent, 8)}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Total Summary Badge */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs pt-3">
            <span className="font-bold text-slate-600">Total Processed:</span>
            <span className="font-black text-slate-900 font-mono text-sm">{total} Applications</span>
          </div>
        </div>

        {/* RECENT APPLICATIONS TABLE WIDGET */}
        <div className="lg:col-span-2">
          <RecentApplications
            activeFilter={activeCardFilter}
            onResetFilter={() => setActiveCardFilter('ALL')}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
