import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Building2,
  BarChart3,
  Percent,
  Coins,
  ArrowRight,
  Users,
} from 'lucide-react';
import { getInvestorStatsApi, getInvestorsApi } from '../../services/investorService';

export function AssociateOverview() {
  const { associateUser } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [investors, setInvestors] = useState([]);
  const [investorStats, setInvestorStats] = useState({
    totalInvestors: 0,
    verifiedInvestors: 0,
    totalCapitalMobilized: 0,
    totalInvestmentCollection: 0,
    pendingKyc: 0,
    pendingPayment: 0,
    pendingAssociateApproval: 0,
    approvedByAssociate: 0,
  });

  const associateId = associateUser?.memberId || 'NUF-AS-PENDING';
  const associateName = associateUser?.name || 'Associate Partner';
  const branchName = associateUser?.assignedDistrict || 'Bhubaneswar HQ';

  // Fetch live portfolio data strictly for this associate
  const fetchDashboardAnalytics = useCallback(async (showSpinner = false) => {
    if (!associateId || associateId === 'NUF-AS-PENDING') return;
    if (showSpinner) setIsRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch real investor metrics for this associate
      const statsData = await getInvestorStatsApi();
      if (statsData) {
        setInvestorStats({
          totalInvestors: statsData.totalInvestors || 0,
          verifiedInvestors: statsData.verifiedInvestors || 0,
          totalCapitalMobilized: statsData.totalCapitalMobilized || 0,
          totalInvestmentCollection: statsData.totalInvestmentCollection || 0,
          pendingKyc: statsData.pendingKyc || 0,
          pendingPayment: statsData.pendingPayment || 0,
          pendingAssociateApproval: statsData.pendingAssociateApproval || 0,
          approvedByAssociate: statsData.approvedByAssociate || 0,
        });
      }

      // 2. Fetch latest 5 investors sourced by this associate
      const invRes = await getInvestorsApi({ page: 1, limit: 5 });
      if (invRes && Array.isArray(invRes.investors)) {
        setInvestors(invRes.investors);
      }
    } catch (err) {
      console.warn('Dashboard analytics error:', err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [associateId]);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, [fetchDashboardAnalytics]);

  // Derived Metrics
  const totalMobilized = investorStats.totalCapitalMobilized || 0;
  const verifiedCapital = investorStats.totalInvestmentCollection || 0;
  const accruedCommission = Math.round(verifiedCapital * 0.0075); // 0.75% statutory commission on verified investment

  // Conversion rate percentage
  const conversionRate = investorStats.totalInvestors > 0
    ? Math.round((investorStats.verifiedInvestors / investorStats.totalInvestors) * 100)
    : 0;

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. DASHBOARD HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1528] via-[#0F224A] to-[#0A3366] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Associate Partner Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Operational analytics, capital mobilization, verified investor portfolio, and statutory commission ledger for <strong>{associateName}</strong>.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Associate Member ID
              </span>
              <span className="font-mono text-base font-black text-emerald-400 block">
                {associateId}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Circle: <strong>{branchName}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => fetchDashboardAnalytics(true)}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition-colors cursor-pointer"
              title="Refresh Dashboard Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE PORTFOLIO KPI CARDS (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sourced Investors */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sourced Investors
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
              {investorStats.totalInvestors}
            </span>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="text-emerald-700 font-bold">{investorStats.verifiedInvestors} Verified</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700 font-bold">{investorStats.pendingKyc} Pending KYC</span>
            </div>
          </div>
          <Link
            to="/associate-dashboard/investors"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors pt-2 border-t border-slate-100"
          >
            <span>Open investor desk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Total Capital Mobilized */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Capital Mobilized
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              ₹ {totalMobilized.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span>Sourced Portfolio Value</span>
            </div>
          </div>
          <Link
            to="/associate-dashboard/investors"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 transition-colors pt-2 border-t border-slate-100"
          >
            <span>View capital ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Verified Capital Received */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verified Capital
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              ₹ {verifiedCapital.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span>Cleared Bank Deposits</span>
            </div>
          </div>
          <Link
            to="/associate-dashboard/investors"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors pt-2 border-t border-slate-100"
          >
            <span>Verification details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Accrued Commission */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Accrued Commission
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-800 flex items-center justify-center border border-indigo-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              ₹ {accruedCommission.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span>Bi-Weekly Cycle:</span>
              <strong className="text-emerald-700">Active</strong>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-100">
            <span>Accrued Incentive Balance</span>
          </div>
        </div>
      </div>

      {/* 3. DASHBOARD ANALYTICS & PERFORMANCE BENCHMARKS (2 Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Conversion Funnel & Pipeline Analytics */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Investor Pipeline Analytics
                </h3>
                <p className="text-[11px] text-slate-500">
                  Investor review and Super Admin approval pipeline
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              {conversionRate}% Verification Rate
            </span>
          </div>

          {/* Funnel Progress Steps */}
          <div className="space-y-3.5">
            {/* Step 1: Registered Investors */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">1. Total Registered Investors</span>
                <span className="font-mono font-black text-slate-900">{investorStats.totalInvestors}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-full" />
              </div>
            </div>

            {/* Step 2: KYC Verified */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">2. KYC Completed &amp; Verified</span>
                <span className="font-mono font-black text-slate-900">{investorStats.verifiedInvestors}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{
                    width: investorStats.totalInvestors > 0
                      ? `${Math.max(10, Math.round((investorStats.verifiedInvestors / investorStats.totalInvestors) * 100))}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            {/* Step 3: Approved by Associate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">3. Approved by Associate (Submitted to Admin)</span>
                <span className="font-mono font-black text-blue-700">{investorStats.approvedByAssociate}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: investorStats.totalInvestors > 0
                      ? `${Math.round((investorStats.approvedByAssociate / investorStats.totalInvestors) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            {/* Step 4: Active & Admin Approved */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">4. Active &amp; Super Admin Approved</span>
                <span className="font-mono font-black text-emerald-700">{investorStats.verifiedInvestors}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: investorStats.totalInvestors > 0
                      ? `${Math.round((investorStats.verifiedInvestors / investorStats.totalInvestors) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Capital & Commission Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Statutory Commission Schedule
                </h3>
                <p className="text-[11px] text-slate-500">
                  Approved incentive structure for Associate Partners
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              FY 2026-27
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-slate-900">Investor Capital Referral</div>
                <div className="text-[10px] text-slate-500">Term capital investor enrollment</div>
              </div>
              <span className="font-mono font-black text-indigo-700 text-sm">0.75% p.a.</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-slate-900">Credit Facility Sanction</div>
                <div className="text-[10px] text-slate-500">Personal &amp; Micro Business Loans</div>
              </div>
              <span className="font-mono font-black text-blue-700 text-sm">1.00%</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-slate-900">Commercial / MSME Credit</div>
                <div className="text-[10px] text-slate-500">Disbursed capital volume</div>
              </div>
              <span className="font-mono font-black text-blue-700 text-sm">1.25%</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-slate-900">Member Sourcing Override</div>
                <div className="text-[10px] text-slate-500">Statutory member onboarding</div>
              </div>
              <span className="font-mono font-black text-emerald-700 text-sm">₹50.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT SOURCED INVESTORS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Recent Sourced Investors
            </h3>
            <p className="text-xs text-slate-500">
              Investors registered by you or assigned to your Associate Agent ID ({associateId}).
            </p>
          </div>
          <Link
            to="/associate-dashboard/investors"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {investors.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-200">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No Assigned Investors Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Investors assigned to your portfolio by Super Admin will appear here in real-time.
            </p>
            <Link
              to="/associate-dashboard/investors"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors mt-2"
            >
              Open Investor Desk
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b1c3d] text-white text-[10px] uppercase font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Investor ID &amp; Name</th>
                  <th className="py-3 px-4">Contact &amp; District</th>
                  <th className="py-3 px-4">Capital Amount</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4">Approval Stage</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {investors.map((inv) => (
                  <tr key={inv._id || inv.investorId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                          {inv.fullName?.charAt(0).toUpperCase() || 'I'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{inv.fullName}</div>
                          <div className="font-mono text-[10px] text-blue-700 font-bold">{inv.investorId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div>{inv.mobile}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{inv.district || 'Odisha'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-black text-slate-900">
                        ₹{(inv.totalInvestment || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        inv.kycStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.kycStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-extrabold uppercase text-slate-700">
                        {inv.approvalStage === 'approved_by_admin'
                          ? 'Active • Approved'
                          : inv.approvalStage === 'approved_by_associate'
                          ? 'With Admin'
                          : 'Pending Review'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/associate-dashboard/investors"
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssociateOverview;
