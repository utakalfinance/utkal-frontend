import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Receipt,
  Coins,
  FileCheck2,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Percent,
  Sparkles,
  Award,
  Wallet,
  Calendar,
} from 'lucide-react';
import { getPartnerDashboardSummaryApi } from '../../services/districtAdminService';

export function DistrictDashboardHome() {
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    getPartnerDashboardSummaryApi()
      .then((res) => {
        if (res && res.success) {
          setData(res);
        }
      })
      .catch((err) => console.error('Failed to load partner dashboard summary:', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const summary = data?.summary || {
    totalAssociates: 0,
    newAssociates: 0,
    totalReferrals: 0,
    investorSubmissions: 0,
    verifiedReceiptsAmount: 0,
    verifiedReceiptsCount: 0,
    pendingDocVerification: 0,
    approvedCommission: 0,
    paidCommission: 0,
    pendingCommission: 0,
  };

  const charts = data?.charts || {};
  const recentAssociates = data?.recentAssociates || [];
  const recentReferrals = data?.recentReferrals || [];

  const assignedDistrict = adminUser?.assignedDistrict || 'District';
  const circleLabel = assignedDistrict.toLowerCase().includes('circle')
    ? assignedDistrict
    : `${assignedDistrict} Circle`;

  // 8 Mandatory Summary Cards (Styled identically to Admin Dashboard KPI cards)
  const cards = [
    {
      title: 'Total Associate Members',
      count: summary.totalAssociates,
      icon: Users,
      color: 'text-blue-700',
      iconBg: 'bg-blue-50/80',
      iconBorder: 'border-blue-100',
      sub: 'Enrolled statutory associates',
      link: '/district-dashboard/associates',
    },
    {
      title: 'New Associate Registrations',
      count: summary.newAssociates,
      icon: UserPlus,
      color: 'text-emerald-700',
      iconBg: 'bg-emerald-50/80',
      iconBorder: 'border-emerald-100',
      sub: 'Last 30 days admissions',
      link: '/district-dashboard/associates',
    },
    {
      title: 'Total Referrals',
      count: summary.totalReferrals,
      icon: TrendingUp,
      color: 'text-purple-700',
      iconBg: 'bg-purple-50/80',
      iconBorder: 'border-purple-100',
      sub: 'Candidate pipeline records',
      link: '/district-dashboard/referrals',
    },
    {
      title: 'Investor Submissions',
      count: summary.investorSubmissions,
      icon: Award,
      color: 'text-amber-700',
      iconBg: 'bg-amber-50/80',
      iconBorder: 'border-amber-100',
      sub: 'Direct capital referrals',
      link: '/district-dashboard/referrals',
    },
    {
      title: 'Verified District Receipts',
      count: `₹${Number(summary.verifiedReceiptsAmount || 0).toLocaleString('en-IN')}`,
      icon: Receipt,
      color: 'text-teal-700',
      iconBg: 'bg-teal-50/80',
      iconBorder: 'border-teal-100',
      sub: `${summary.verifiedReceiptsCount} cleared share collections`,
      link: '/district-dashboard/financial-records',
    },
    {
      title: 'Pending Document Verification',
      count: summary.pendingDocVerification,
      icon: FileCheck2,
      color: 'text-rose-700',
      iconBg: 'bg-rose-50/80',
      iconBorder: 'border-rose-100',
      sub: 'Awaiting dossier check',
      link: '/district-dashboard/associates',
    },
    {
      title: 'Approved Commission',
      count: `₹${Number(summary.approvedCommission || 0).toLocaleString('en-IN')}`,
      icon: Coins,
      color: 'text-indigo-700',
      iconBg: 'bg-indigo-50/80',
      iconBorder: 'border-indigo-100',
      sub: 'Sanctioned override credit',
      link: '/district-dashboard/financial-records',
    },
    {
      title: 'Commission Payment History',
      count: `₹${Number(summary.paidCommission || 0).toLocaleString('en-IN')}`,
      icon: Wallet,
      color: 'text-slate-700',
      iconBg: 'bg-slate-100',
      iconBorder: 'border-slate-200',
      sub: 'Disbursed bank transfers',
      link: '/district-dashboard/financial-records',
    },
  ];

  return (
    <div className="space-y-6 text-left pb-12">
      {/* HERO WELCOME BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {adminUser?.name || 'District Partner'}
            </h1>

            <p className="text-xs text-blue-200/90 leading-relaxed font-mono">
              Partner ID: <strong>{adminUser?.username || 'DP-ODISHA'}</strong> • Circle Operations, Associate Onboarding &amp; Commission Ledgers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/district-dashboard/associates')}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Manage Associates
            </button>
            <button
              onClick={() => loadSummary(false)}
              disabled={refreshing}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 8 MANDATORY SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(c.link)}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between space-y-3 group select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  {c.title}
                </span>
                <div className={`p-2.5 rounded-xl ${c.iconBg} border ${c.iconBorder} ${c.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {loading ? '—' : c.count}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {c.sub}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ANALYTICS & CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Associate Registration Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                Associate Registration Trend
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Last 6 months onboarding count</p>
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Monthly
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {(charts.associateTrend || []).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{item.month}</span>
                  <span className="font-mono text-slate-900">{item.count} Associates</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(item.count > 0 ? (item.count / 10) * 100 : 0, 8))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Referral Performance Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-700" />
                Referral Performance
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Attribution lifecycle breakdown</p>
            </div>
            <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              {summary.totalReferrals} Total
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Converted', count: charts.referralPerformance?.['Converted'] || 0, color: 'bg-emerald-500' },
              { label: 'In Process', count: charts.referralPerformance?.['In Process'] || 0, color: 'bg-blue-600' },
              { label: 'New Submissions', count: charts.referralPerformance?.['New'] || 0, color: 'bg-amber-500' },
              { label: 'On Hold', count: charts.referralPerformance?.['On Hold'] || 0, color: 'bg-slate-400' },
              { label: 'Rejected', count: charts.referralPerformance?.['Rejected'] || 0, color: 'bg-rose-500' },
            ].map((st, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{st.label}</span>
                  <span className="font-mono text-slate-900">{st.count}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${st.color} h-full rounded-full transition-all duration-500`}
                    style={{
                      width: summary.totalReferrals > 0
                        ? `${Math.max(8, (st.count / summary.totalReferrals) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. District Collection & Commission Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-700" />
                District Collection &amp; Commission
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Financial reconciliation summary</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/70 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">Verified Collections</span>
                <p className="text-lg font-black text-teal-900">
                  ₹{Number(charts.districtCollection?.verifiedAmount || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <span className="text-xs font-extrabold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs">
                {charts.districtCollection?.verifiedCount || 0} Cleared
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">Approved Commission</span>
                <p className="text-lg font-black text-indigo-900">
                  ₹{Number(charts.commissionOverview?.approved || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <span className="text-xs font-extrabold text-indigo-800 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
                Approved
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Investor Volume Attributed:</span>
              <span className="font-black text-slate-900 font-mono">
                ₹{Number(charts.investorOverview?.totalVolume || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ASSOCIATE REGISTRATIONS & RECENT REFERRALS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Associates Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              Recent Associate Registrations
            </h3>
            <Link
              to="/district-dashboard/associates"
              className="text-xs font-extrabold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAssociates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent associate registrations in {circleLabel}.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAssociates.map((a, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{a.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ID: <span className="text-blue-700 font-bold">{a.memberId}</span> • {a.mobile}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {a.status || 'Active'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {a.joiningDate ? new Date(a.joiningDate).toLocaleDateString('en-GB') : 'Recent'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Referrals Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-700" />
              Recent Referral Activities
            </h3>
            <Link
              to="/district-dashboard/referrals"
              className="text-xs font-extrabold text-purple-700 hover:text-purple-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentReferrals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent referral activities in {circleLabel}. Click "Referral Management" to register new candidates.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentReferrals.map((r, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{r.customerName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Ref: <span className="text-purple-700 font-bold">{r.referralId}</span> • {r.referralType}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {r.status || 'New'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {new Date(r.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DistrictDashboardHome;
