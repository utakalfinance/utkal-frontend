import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DashboardStats } from '../../components/admin/DashboardStats';
import { LoanStats } from '../../components/admin/LoanStats';
import { RecentLoanActivities } from '../../components/admin/RecentLoanActivities';
import { RecentApplications } from '../../components/admin/RecentApplications';
import { PendingFinalApprovalsTable } from '../../components/admin/loans/PendingFinalApprovalsTable';
import { FinalApprovalModal } from '../../components/admin/loans/FinalApprovalModal';
import { useAdmin } from '../../context/AdminContext';
import { getLoanEnquiriesApi } from '../../services/loanEnquiryService';
import {
  getSuperAdminLoanStatsApi,
  getSuperAdminPendingApprovalsApi,
} from '../../services/superAdminLoanService';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Building2,
  Coins,
  LayoutDashboard,
  Layers,
  ArrowDown,
} from 'lucide-react';

export function AdminDashboard() {
  const { applications, members, refreshData } = useAdmin();
  const [activeCardFilter, setActiveCardFilter] = useState('ALL');

  // Real Loan Applications state from LoanApplication MongoDB model
  const [loanStats, setLoanStats] = useState(null);
  const [pendingLoanApps, setPendingLoanApps] = useState([]);
  const [loadingPendingLoans, setLoadingPendingLoans] = useState(false);
  const [selectedReviewLoan, setSelectedReviewLoan] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Marketing enquiries fallback
  const [loanEnquiries, setLoanEnquiries] = useState([]);
  const [loanSummary, setLoanSummary] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    membershipInformed: 0,
    converted: 0,
    closed: 0,
  });

  const fetchLoanData = useCallback(async () => {
    setLoadingPendingLoans(true);
    try {
      const [enqRes, statsRes, pendingRes] = await Promise.all([
        getLoanEnquiriesApi().catch(() => ({ enquiries: [], summary: {} })),
        getSuperAdminLoanStatsApi().catch(() => ({ stats: {} })),
        getSuperAdminPendingApprovalsApi().catch(() => ({ applications: [] })),
      ]);

      if (Array.isArray(enqRes.enquiries)) {
        setLoanEnquiries(enqRes.enquiries);
      }
      if (enqRes.summary) {
        setLoanSummary(enqRes.summary);
      }
      if (statsRes && statsRes.stats) {
        setLoanStats(statsRes.stats);
      }
      if (pendingRes && pendingRes.applications) {
        setPendingLoanApps(pendingRes.applications);
      }
    } catch (err) {
      console.warn('Could not fetch loan enquiries for dashboard:', err.message);
    } finally {
      setLoadingPendingLoans(false);
    }
  }, []);

  useEffect(() => {
    if (typeof refreshData === 'function') {
      refreshData();
    }
    fetchLoanData();
  }, [refreshData, fetchLoanData]);

  // Compute breakdown for Statutory Membership Chart (case-insensitive)
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

  // Map real LoanApplication data to 8 Super Admin KPI Cards
  const realLoanStats = useMemo(() => {
    if (loanStats) {
      return {
        totalLoanApplications: loanStats.totalLoanApplications ?? 0,
        pendingDistrictVerification: loanStats.pendingDistrictVerification ?? 0,
        pendingFinalApproval: loanStats.pendingFinalApproval ?? pendingLoanApps.length,
        approvedLoans: loanStats.approvedLoans ?? 0,
        totalDisbursedAmount: loanStats.totalDisbursedAmount ?? 0,
        activeLoans: loanStats.activeLoans ?? 0,
        emiCollected: loanStats.emiCollected ?? 0,
        overdueLoans: loanStats.overdueLoans ?? 0,
      };
    }

    const convertedAmountSum = loanEnquiries
      .filter((e) => (e.status || '').toLowerCase() === 'converted')
      .reduce((sum, e) => sum + Number(e.expectedAmount || 0), 0);

    return {
      totalLoanApplications: loanSummary.total || loanEnquiries.length || 0,
      pendingDistrictVerification: loanSummary.new || 0,
      pendingFinalApproval: pendingLoanApps.length || (loanSummary.contacted || 0) + (loanSummary.membershipInformed || 0),
      approvedLoans: loanSummary.converted || 0,
      totalDisbursedAmount: convertedAmountSum || 0,
      activeLoans: loanSummary.converted || 0,
      emiCollected: 0,
      overdueLoans: 0,
    };
  }, [loanStats, loanEnquiries, loanSummary, pendingLoanApps]);

  // Format real loan activities for feed
  const formattedLoanActivities = useMemo(() => {
    return loanEnquiries.map((enq) => {
      const timeStr = enq.submittedAt
        ? new Date(enq.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Recent';

      return {
        id: enq.enquiryId || enq._id,
        enquiryId: enq.enquiryId || 'ENQ',
        fullName: enq.fullName || 'Member Applicant',
        loanCategory: enq.loanCategory || 'General Loan',
        expectedAmount: enq.expectedAmount || 0,
        status: enq.status || 'New',
        time: timeStr,
      };
    });
  }, [loanEnquiries]);

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
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* EXECUTIVE SUPER ADMIN PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {greeting}, Super Admin
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200/80">
              <ShieldCheck className="w-3 h-3 text-blue-700" />
              <span>Phase 1 Super Admin</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Executive Command Center • Centralized statutory oversight and credit portfolio.
          </p>
        </div>

        {/* REAL-TIME SYSTEM STATUS BADGES */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700">Live Database</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-xs">
            <span className="font-mono font-bold text-slate-900">{members.length || 0}</span>
            <span className="text-slate-500 font-medium">Approved Members</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: MEMBERSHIP & SHARE CAPITAL OPERATIONS (4 CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black tracking-widest uppercase text-slate-500 flex items-center gap-2">
            <span>MEMBERSHIP &amp; SHARE CAPITAL OPERATIONS</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Click metric card to filter the applications table below
          </span>
        </div>
        <DashboardStats
          activeFilter={activeCardFilter}
          onSelectFilter={(filterId) => setActiveCardFilter(filterId)}
        />
      </div>

      {/* SECTION 2: CREDIT PORTFOLIO & LOAN OPERATIONS (8 CARDS - WITH REAL DATA) */}
      <div className="space-y-4">
        <LoanStats loanData={realLoanStats} />

        {/* REQUIREMENT 3: PENDING FINAL APPROVAL APPLICATIONS TABLE */}
        <PendingFinalApprovalsTable
          applications={pendingLoanApps}
          loading={loadingPendingLoans}
          onViewLoan={(loan) => {
            setSelectedReviewLoan(loan);
            setIsReviewModalOpen(true);
          }}
          onRefresh={fetchLoanData}
        />
      </div>

      {/* SECTION 3: RECENT LOAN ACTIVITIES + STATUTORY LIFECYCLE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* RECENT LOAN ACTIVITIES (Requirement 5 & 8 - WITH REAL DATA) */}
        <RecentLoanActivities loanActivities={formattedLoanActivities} />

        {/* APPLICATION OVERVIEW CHART (CSS-BASED VISUAL CHART) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <span>Statutory Membership Distribution</span>
              </h3>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                REALTIME
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Distribution of statutory member registration applications across KYC verification lifecycle stages.
            </p>

            {/* Clean CSS Horizontal Visual Bars */}
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
          </div>

          {/* Bottom Total Summary Badge */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs mt-4">
            <span className="font-bold text-slate-600">Total Statutory Registrations:</span>
            <span className="font-black text-slate-900 font-mono text-sm">{total} Applications</span>
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT APPLICATIONS TABLE WIDGET (Requirement 6) */}
      <div className="space-y-3">
        <RecentApplications
          activeFilter={activeCardFilter}
          onResetFilter={() => setActiveCardFilter('ALL')}
        />
      </div>

      {/* REQUIREMENT 4: SUPER ADMIN FINAL APPROVAL MODAL */}
      <FinalApprovalModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        loan={selectedReviewLoan}
        onSuccess={() => {
          fetchLoanData();
          if (typeof refreshData === 'function') {
            refreshData();
          }
        }}
      />
    </div>
  );
}

export default AdminDashboard;
