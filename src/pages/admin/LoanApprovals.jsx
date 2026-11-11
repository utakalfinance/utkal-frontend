import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Building2,
  FileSpreadsheet,
  Wallet,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  getSuperAdminLoanStatsApi,
  getSuperAdminPendingApprovalsApi,
  getSuperAdminAllLoansApi,
} from '../../services/superAdminLoanService';
import { PendingFinalApprovalsTable } from '../../components/admin/loans/PendingFinalApprovalsTable';
import { FinalApprovalModal } from '../../components/admin/loans/FinalApprovalModal';

export function LoanApprovals() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalLoanApplications: 0,
    pendingDistrictVerification: 0,
    pendingFinalApproval: 0,
    approvedLoans: 0,
    totalDisbursedAmount: 0,
    activeLoans: 0,
  });

  const [pendingApplications, setPendingApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [allTotalCount, setAllTotalCount] = useState(0);

  // Filters for All Applications
  const [searchAll, setSearchAll] = useState('');
  const [statusFilterAll, setStatusFilterAll] = useState('All');
  const [districtFilterAll, setDistrictFilterAll] = useState('All');

  // Modal
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialAction, setInitialAction] = useState('approve');
  const [initialTab, setInitialTab] = useState('decision');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        getSuperAdminLoanStatsApi().catch((err) => {
          console.warn('Failed to load stats:', err);
          return { stats: {} };
        }),
        getSuperAdminPendingApprovalsApi().catch((err) => {
          console.warn('Failed to load pending:', err);
          return { applications: [] };
        }),
      ]);

      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (pendingRes && pendingRes.applications) {
        setPendingApplications(pendingRes.applications);
      }
    } catch (err) {
      console.error('Error fetching loan approvals data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadAllLoans = useCallback(async () => {
    try {
      const res = await getSuperAdminAllLoansApi({
        search: searchAll,
        status: statusFilterAll,
        district: districtFilterAll,
        limit: 50,
      });
      if (res && res.applications) {
        setAllApplications(res.applications);
        setAllTotalCount(res.total || res.applications.length);
      }
    } catch (err) {
      console.warn('Failed to load all loans:', err);
    }
  }, [searchAll, statusFilterAll, districtFilterAll]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'all') {
      loadAllLoans();
    }
  }, [activeTab, loadAllLoans]);

  const handleOpenReview = (loan, action = 'approve', tab = 'decision') => {
    setSelectedLoan(loan);
    setInitialAction(action);
    setInitialTab(tab);
    setIsModalOpen(true);
  };

  const handleDecisionSuccess = (message) => {
    showToast(message, 'success');
    loadData(true);
    if (activeTab === 'all') {
      loadAllLoans();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* TOAST MESSAGE */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Coins className="w-6 h-6 text-blue-700" />
              <span>Loan Applications &amp; Sanctions</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-700" />
              <span>Super Admin Authority</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Centralized credit underwriting • Review district recommendations, examine KYC, and authorize final loan sanctions.
          </p>
        </div>

        <button
          onClick={() => loadData(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Pending Final Approval</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.pendingFinalApproval ?? pendingApplications.length}
          </div>
          <p className="text-[10px] text-amber-600 font-semibold">
            Forwarded by District Admins
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>In District Review</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.pendingDistrictVerification ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Field KYC in progress</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Total Sanctioned</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.approvedLoans ?? 0}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">Approved by Super Admin</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Total Disbursed</span>
            <Wallet className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{Number(stats.totalDisbursedAmount || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Active credit facilities: {stats.activeLoans ?? 0}
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#004085] text-white shadow-md shadow-blue-900/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Final Approval ({pendingApplications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#004085] text-white shadow-md shadow-blue-900/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>All Applications Registry</span>
        </button>
      </div>

      {/* TAB 1: PENDING FINAL APPROVAL TABLE */}
      {activeTab === 'pending' && (
        <PendingFinalApprovalsTable
          applications={pendingApplications}
          loading={loading}
          onViewLoan={handleOpenReview}
          onRefresh={() => loadData(false)}
        />
      )}

      {/* TAB 2: ALL APPLICATIONS MASTER TABLE */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
          {/* FILTERS */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Master Loan Applications Registry
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive record of all loan applications across all 30 Odisha districts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ID, name, mobile..."
                  value={searchAll}
                  onChange={(e) => setSearchAll(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              <select
                value={statusFilterAll}
                onChange={(e) => setStatusFilterAll(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending District Verification">Pending District Verification</option>
                <option value="Pending Final Approval">Pending Final Approval</option>
                <option value="Approved">Approved</option>
                <option value="Disbursed">Disbursed</option>
                <option value="On Hold">On Hold</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Tenure</th>
                  <th className="py-3 px-4 text-center">Lifecycle Status</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No loan applications match your filters.
                    </td>
                  </tr>
                ) : (
                  allApplications.map((app) => (
                    <tr
                      key={app._id || app.applicationId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {app.applicationId}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {app.applicantName || app.customerName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {app.district}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                        ₹{Number(app.requestedAmount || 10000).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {app.preferredTenureMonths} Months
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            app.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : app.status === 'Pending Final Approval'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReview(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FINAL DECISION MODAL */}
      <FinalApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loan={selectedLoan}
        onSuccess={handleDecisionSuccess}
        initialAction={initialAction}
        initialTab={initialTab}
      />
    </div>
  );
}

export default LoanApprovals;
