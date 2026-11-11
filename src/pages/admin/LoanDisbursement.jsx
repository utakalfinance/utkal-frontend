import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Building2,
  IndianRupee,
  Calendar,
  Wallet,
  ShieldCheck,
  Eye,
  ArrowRight,
  SendHorizontal,
  ChevronRight,
  FileText,
  BadgeCheck,
  HelpCircle,
  Hash,
} from 'lucide-react';
import {
  getSuperAdminPendingDisbursementsApi,
  getSuperAdminDisbursementHistoryApi,
  getSuperAdminLoanStatsApi,
} from '../../services/superAdminLoanService';
import { DisbursementModal } from '../../components/admin/loans/DisbursementModal';
import { DisbursementDetailsModal } from '../../components/admin/loans/DisbursementDetailsModal';

export function LoanDisbursement() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    pendingDisbursement: 0,
    totalDisbursedAmount: 0,
    activeLoans: 0,
    approvedLoans: 0,
  });

  // Data lists
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Search & Filter state for Pending
  const [searchPending, setSearchPending] = useState('');
  const [districtPending, setDistrictPending] = useState('All');

  // Search & Filter state for History
  const [searchHistory, setSearchHistory] = useState('');
  const [districtHistory, setDistrictHistory] = useState('All');

  // Modals state
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // Load Pending Disbursements
  const loadPendingDisbursements = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const [pendingRes, statsRes] = await Promise.all([
        getSuperAdminPendingDisbursementsApi({
          search: searchPending,
          district: districtPending,
        }).catch((err) => {
          console.warn('Failed to load pending disbursements:', err);
          return { applications: [] };
        }),
        getSuperAdminLoanStatsApi().catch((err) => {
          console.warn('Failed to load stats:', err);
          return { stats: {} };
        }),
      ]);

      if (pendingRes && pendingRes.applications) {
        setPendingList(pendingRes.applications);
      }
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Error fetching pending disbursements:', err);
      showToast(err.message || 'Failed to fetch pending disbursements', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchPending, districtPending]);

  // Load Disbursement History
  const loadDisbursementHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const [historyRes, statsRes] = await Promise.all([
        getSuperAdminDisbursementHistoryApi({
          search: searchHistory,
          district: districtHistory,
        }).catch((err) => {
          console.warn('Failed to load disbursement history:', err);
          return { applications: [] };
        }),
        getSuperAdminLoanStatsApi().catch((err) => {
          console.warn('Failed to load stats:', err);
          return { stats: {} };
        }),
      ]);

      if (historyRes && historyRes.applications) {
        setHistoryList(historyRes.applications);
      }
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Error fetching disbursement history:', err);
      showToast(err.message || 'Failed to fetch disbursement history', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchHistory, districtHistory]);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingDisbursements();
    } else {
      loadDisbursementHistory();
    }
  }, [activeTab, loadPendingDisbursements, loadDisbursementHistory]);

  const handleOpenDisburse = (loan) => {
    setSelectedLoan(loan);
    setIsDisburseModalOpen(true);
  };

  const handleOpenDetails = (loan) => {
    setSelectedLoan(loan);
    setIsDetailsModalOpen(true);
  };

  const handleDisbursementSuccess = (msg) => {
    showToast(msg || 'Loan disbursed successfully!', 'success');
    loadPendingDisbursements(true);
    loadDisbursementHistory(true);
  };

  const pendingCount = pendingList.length;
  const historyCount = historyList.length;

  return (
    <div className="space-y-6">
      {/* TOAST ALERT */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-slide-down ${
            toast.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/40'
              : 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/40'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          )}
          <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
        </div>
      )}

      {/* HEADER WITH BREADCRUMB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Admin Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Financial Services</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-bold">Loan Disbursement</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Loan Disbursement Management
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Disbursement Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record fund transfers for Super Admin-approved credit facilities, verify UTR numbers, and manage disbursement history.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'pending') loadPendingDisbursements();
              else loadDisbursementHistory();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Awaiting Disbursement */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Awaiting Disbursement
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-black">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.pendingDisbursement || pendingCount}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Approved • Ready for bank transfer
            </p>
          </div>
        </div>

        {/* Active Disbursed Loans */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
              Disbursed Facilities
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-black">
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.activeLoans || historyCount}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Active statutory credit facilities
            </p>
          </div>
        </div>

        {/* Total Capital Disbursed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              Total Capital Released
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-black">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-800 tracking-tight">
              ₹{(stats.totalDisbursedAmount || 0).toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Cumulative disbursed credit
            </p>
          </div>
        </div>

        {/* District Coverage */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
              Operational Scope
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center font-black">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-indigo-950 tracking-tight">
              All Districts
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Odisha statutory credit operations
            </p>
          </div>
        </div>
      </div>

      {/* SECTION TABS */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-4 font-black text-xs sm:text-sm border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Approved Loans Awaiting Disbursement</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white shadow-xs">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 font-black text-xs sm:text-sm border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Disbursement History</span>
            {historyCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-slate-200 text-slate-700">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: APPROVED LOANS AWAITING DISBURSEMENT */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, application ID, customer/member ID..."
                value={searchPending}
                onChange={(e) => setSearchPending(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={districtPending}
                  onChange={(e) => setDistrictPending(e.target.value)}
                  className="w-full sm:w-44 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  <option value="All">All Districts</option>
                  <option value="Khurda">Khurda</option>
                  <option value="Cuttack">Cuttack</option>
                  <option value="Puri">Puri</option>
                  <option value="Ganjam">Ganjam</option>
                  <option value="Balasore">Balasore</option>
                  <option value="Bhadrak">Bhadrak</option>
                  <option value="Jajpur">Jajpur</option>
                  <option value="Kendrapada">Kendrapada</option>
                  <option value="Angul">Angul</option>
                  <option value="Dhenkanal">Dhenkanal</option>
                  <option value="Sambalpur">Sambalpur</option>
                  <option value="Mayurbhanj">Mayurbhanj</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE OF AWAITING DISBURSEMENTS */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Application ID</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Customer ID</th>
                    <th className="py-3.5 px-4">District</th>
                    <th className="py-3.5 px-4">Approved Amount</th>
                    <th className="py-3.5 px-4">Tenure</th>
                    <th className="py-3.5 px-4">Interest Rate</th>
                    <th className="py-3.5 px-4">Approval Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-slate-400">
                        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-xs font-bold">Loading approved credit facilities...</span>
                      </td>
                    </tr>
                  ) : pendingList.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-16 text-center text-slate-500 space-y-3">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-900">
                            No Loans Awaiting Disbursement
                          </p>
                          <p className="text-xs text-slate-400 max-w-md mx-auto mt-0.5">
                            All finally approved loan applications have been successfully transferred and recorded. When new loans are approved by Super Admin, they will appear here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingList.map((loan) => (
                      <tr key={loan._id || loan.applicationId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {loan.applicationId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-900 block truncate max-w-[150px]">
                            {loan.customerName}
                          </span>
                          {loan.mobile && (
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {loan.mobile}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {loan.customerId || loan.memberId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {loan.district}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                          ₹{Number(loan.approvedAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {loan.tenure}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-indigo-700">
                          {loan.interestRate}% p.a.
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(loan.approvalDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-amber-50 text-amber-800 border-amber-200">
                            Approved – Not Disbursed
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(loan)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="View dossier"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDisburse(loan)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                              title="Disburse loan"
                            >
                              <SendHorizontal className="w-3.5 h-3.5" />
                              <span>Disburse</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISBURSEMENT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, application ID, transaction ID / UTR number..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={districtHistory}
                  onChange={(e) => setDistrictHistory(e.target.value)}
                  className="w-full sm:w-44 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="All">All Districts</option>
                  <option value="Khurda">Khurda</option>
                  <option value="Cuttack">Cuttack</option>
                  <option value="Puri">Puri</option>
                  <option value="Ganjam">Ganjam</option>
                  <option value="Balasore">Balasore</option>
                  <option value="Bhadrak">Bhadrak</option>
                  <option value="Jajpur">Jajpur</option>
                  <option value="Kendrapada">Kendrapada</option>
                  <option value="Angul">Angul</option>
                  <option value="Dhenkanal">Dhenkanal</option>
                  <option value="Sambalpur">Sambalpur</option>
                  <option value="Mayurbhanj">Mayurbhanj</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE OF DISBURSEMENT HISTORY */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Application ID</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">District</th>
                    <th className="py-3.5 px-4">Disbursed Amount</th>
                    <th className="py-3.5 px-4">Disbursement Date</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Transaction ID / UTR</th>
                    <th className="py-3.5 px-4">Disbursed By</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-slate-400">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-xs font-bold">Loading disbursement history...</span>
                      </td>
                    </tr>
                  ) : historyList.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-16 text-center text-slate-500 space-y-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 border border-blue-100">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-900">
                            No Disbursement Records Found
                          </p>
                          <p className="text-xs text-slate-400 max-w-md mx-auto mt-0.5">
                            When loans are disbursed by Super Admin, completed fund transfers will be permanently logged here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    historyList.map((loan) => (
                      <tr key={loan._id || loan.applicationId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {loan.applicationId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-900 block truncate max-w-[140px]">
                            {loan.customerName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {loan.customerId || loan.memberId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {loan.district}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                          ₹{Number(loan.disbursedAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(loan.disbursementDate)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {loan.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-blue-900">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all">
                            {loan.transactionId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          {loan.disbursedBy}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(loan)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                            title="View full disbursement record"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DISBURSEMENT MODAL */}
      <DisbursementModal
        isOpen={isDisburseModalOpen}
        onClose={() => setIsDisburseModalOpen(false)}
        loan={selectedLoan}
        onSuccess={handleDisbursementSuccess}
      />

      {/* VIEW DETAILS MODAL */}
      <DisbursementDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        loan={selectedLoan}
        onDisburseClick={(loan) => {
          setSelectedLoan(loan);
          setIsDisburseModalOpen(true);
        }}
      />
    </div>
  );
}

export default LoanDisbursement;
