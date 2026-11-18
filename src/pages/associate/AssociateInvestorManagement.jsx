import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  UserCheck,
  ShieldCheck,
  Eye,
  Edit,
  Clock,
  Send,
  Building2,
  FileCheck,
  ArrowRight,
  Users,
  CreditCard,
} from 'lucide-react';
import { InvestorDetailsModal } from '../../components/admin/investors/InvestorDetailsModal';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import {
  getInvestorStatsApi,
  getInvestorsApi,
  associateApproveInvestorApi,
} from '../../services/investorService';

export function AssociateInvestorManagement() {
  // Top KPI Stats
  const [stats, setStats] = useState({
    totalInvestors: 0,
    verifiedInvestors: 0,
    pendingKyc: 0,
    pendingPayment: 0,
    totalInvestmentReceived: 0,
    totalInvestmentCollection: 0,
    activeInvestors: 0,
    totalPayouts: 0,
    outstandingLiabilities: 0,
    outstandingBalance: 0,
    pendingAssociateApproval: 0,
    approvedByAssociate: 0,
  });

  // Table Data State
  const [investors, setInvestors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    district: 'All',
    kycStatus: 'All',
    paymentStatus: 'All',
    approvalStage: 'All',
  });
  const [activeStatCard, setActiveStatCard] = useState('');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvestorId, setSelectedInvestorId] = useState(null);

  // Approval Modal State
  const [approvingInvestor, setApprovingInvestor] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 6000);
  };

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await getInvestorStatsApi();
      setStats(data || {});
    } catch (err) {
      console.warn('Failed to fetch associate investor stats:', err);
    }
  }, []);

  // Fetch Investors List
  const fetchInvestors = useCallback(
    async (showRefreshSpinner = false) => {
      try {
        if (showRefreshSpinner) setIsRefreshing(true);
        else setLoading(true);
        setError(null);

        const res = await getInvestorsApi({
          ...filters,
          page,
          limit: 10,
        });

        setInvestors(res.investors || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch associate investors:', err);
        setError(err.message || 'Unable to retrieve investors list.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters, page]
  );

  useEffect(() => {
    fetchStats();
    fetchInvestors();
  }, [fetchStats, fetchInvestors]);

  // Handle Filter Change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setActiveStatCard('');
    setPage(1);
  };

  // Handle Quick Stat Card Filter
  const handleStatCardFilter = (filterKey) => {
    const nextKey = activeStatCard === filterKey ? '' : filterKey;
    setActiveStatCard(nextKey);

    if (nextKey === 'kyc_verified') {
      setFilters({ search: '', district: 'All', kycStatus: 'Verified', paymentStatus: 'All', approvalStage: 'All' });
    } else if (nextKey === 'kyc_pending') {
      setFilters({ search: '', district: 'All', kycStatus: 'Pending', paymentStatus: 'All', approvalStage: 'All' });
    } else if (nextKey === 'payment_pending') {
      setFilters({ search: '', district: 'All', kycStatus: 'All', paymentStatus: 'Pending', approvalStage: 'All' });
    } else if (nextKey === 'payment_verified') {
      setFilters({ search: '', district: 'All', kycStatus: 'All', paymentStatus: 'Verified', approvalStage: 'All' });
    } else {
      setFilters({ search: '', district: 'All', kycStatus: 'All', paymentStatus: 'All', approvalStage: 'All' });
    }
    setPage(1);
  };

  // Open Details Modal
  const handleViewInvestor = (investor) => {
    setSelectedInvestorId(investor._id || investor.investorId);
    setIsDetailsModalOpen(true);
  };

  // Submit Associate Approval
  const handleConfirmAssociateApproval = async () => {
    if (!approvingInvestor) return;
    try {
      setIsApproving(true);
      const investorId = approvingInvestor._id || approvingInvestor.investorId;
      await associateApproveInvestorApi(investorId, approvalRemarks);

      showToast(
        'success',
        `Investor ${approvingInvestor.fullName} (${approvingInvestor.investorId}) approved successfully! Submitted to Super Admin for final approval.`
      );
      setApprovingInvestor(null);
      setApprovalRemarks('');
      fetchStats();
      fetchInvestors();
    } catch (err) {
      console.error('Associate approval failed:', err);
      showToast('error', err.message || 'Failed to approve investor. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  // Helper: Approval Stage Badge
  const renderApprovalStageBadge = (stage) => {
    const s = stage || 'pending_associate';
    switch (s) {
      case 'pending_associate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Pending Your Approval</span>
          </span>
        );
      case 'approved_by_associate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-300">
            <Send className="w-3 h-3 text-blue-600" />
            <span>Awaiting Admin Approval</span>
          </span>
        );
      case 'approved_by_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Active • Admin Approved</span>
          </span>
        );
      case 'rejected_by_associate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-300">
            <X className="w-3 h-3 text-rose-600" />
            <span>Rejected by Associate</span>
          </span>
        );
      case 'rejected_by_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-300">
            <X className="w-3 h-3 text-rose-600" />
            <span>Rejected by Admin</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {stage}
          </span>
        );
    }
  };

  const districtsList = [
    'All',
    'Angul',
    'Balangir',
    'Balasore',
    'Bargarh',
    'Bhadrak',
    'Boudh',
    'Cuttack',
    'Deogarh',
    'Dhenkanal',
    'Gajapati',
    'Ganjam',
    'Jagatsinghpur',
    'Jajpur',
    'Jharsuguda',
    'Kalahandi',
    'Kandhamal',
    'Kendrapara',
    'Kendujhar',
    'Khordha',
    'Koraput',
    'Malkangiri',
    'Mayurbhanj',
    'Nabarangpur',
    'Nayagarh',
    'Nuapada',
    'Puri',
    'Rayagada',
    'Sambalpur',
    'Subarnapur',
    'Sundargarh',
  ];

  return (
    <div className="space-y-6 pb-12 select-none font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-md transition-all animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Investor Management
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Associate Partner Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                View and track investors assigned to your portfolio by Super Admin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => {
              fetchStats();
              fetchInvestors(true);
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh investor metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Summary Cards (Real Associate Data - No Corporate or Dummy Overrides) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 select-none">
        {[
          {
            id: 'total',
            label: 'TOTAL INVESTORS',
            value: stats.totalInvestors || 0,
            icon: Users,
            color: 'text-blue-700',
            bgColor: 'bg-blue-50/80',
            borderColor: 'border-blue-100',
            filterKey: 'all',
          },
          {
            id: 'verified',
            label: 'VERIFIED INVESTORS',
            value: stats.verifiedInvestors || 0,
            icon: UserCheck,
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-50/80',
            borderColor: 'border-emerald-100',
            filterKey: 'kyc_verified',
          },
          {
            id: 'pending_kyc',
            label: 'PENDING KYC',
            value: stats.pendingKyc || 0,
            icon: FileCheck,
            color: 'text-amber-700',
            bgColor: 'bg-amber-50/80',
            borderColor: 'border-amber-100',
            filterKey: 'kyc_pending',
          },
          {
            id: 'pending_payment',
            label: 'PENDING PAYMENT VERIFICATION',
            value: stats.pendingPayment || 0,
            icon: CreditCard,
            color: 'text-purple-700',
            bgColor: 'bg-purple-50/80',
            borderColor: 'border-purple-100',
            filterKey: 'payment_pending',
          },
          {
            id: 'total_capital',
            label: 'TOTAL CAPITAL MOBILIZED',
            value: `₹${Number(stats.totalCapitalMobilized || 0).toLocaleString('en-IN')}`,
            icon: TrendingUp,
            color: 'text-indigo-700',
            bgColor: 'bg-indigo-50/80',
            borderColor: 'border-indigo-100',
            filterKey: 'all',
          },
          {
            id: 'verified_capital',
            label: 'VERIFIED CAPITAL RECEIVED',
            value: `₹${Number(stats.totalInvestmentCollection || 0).toLocaleString('en-IN')}`,
            icon: ShieldCheck,
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-50/80',
            borderColor: 'border-emerald-100',
            filterKey: 'payment_verified',
          },
        ].map((card) => {
          const Icon = card.icon;
          const isActive = activeStatCard === card.filterKey && card.filterKey !== 'all';

          return (
            <div
              key={card.id}
              onClick={() => handleStatCardFilter(card.filterKey)}
              className={`rounded-2xl p-4 border bg-white shadow-xs transition-all cursor-pointer text-left flex flex-col justify-between h-[115px] hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 ${
                isActive
                  ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/20 shadow-md -translate-y-0.5'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 line-clamp-1">
                  {card.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${card.bgColor} ${card.borderColor} ${card.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1">
                <div className="text-xl font-black text-slate-900 tracking-tight font-sans">
                  {card.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Notice:</span> {error}
          </div>
          <button
            onClick={() => fetchInvestors(true)}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by Investor ID, Name, Mobile, Email..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-10 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
            >
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Districts' : d}
                </option>
              ))}
            </select>

            <select
              value={filters.kycStatus}
              onChange={(e) => handleFilterChange('kycStatus', e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All">All KYC Status</option>
              <option value="Pending">KYC Pending</option>
              <option value="Verified">KYC Verified</option>
              <option value="Correction Required">Correction Required</option>
            </select>

            <select
              value={filters.approvalStage}
              onChange={(e) => handleFilterChange('approvalStage', e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All">All Approval Stages</option>
              <option value="pending_associate">Pending Your Approval</option>
              <option value="approved_by_associate">Awaiting Admin Approval</option>
              <option value="approved_by_admin">Active &amp; Admin Approved</option>
            </select>
          </div>
        </div>

        {/* Investors Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1c3d] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="py-3 px-4">Investor ID &amp; Name</th>
                <th className="py-3 px-4">Contact &amp; District</th>
                <th className="py-3 px-4">Capital Amount</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4">Approval Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
                    <p className="font-bold text-xs">Loading your investor records...</p>
                  </td>
                </tr>
              ) : investors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold">No investors found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Investors assigned to your portfolio by Super Admin will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                investors.map((inv) => {
                  const stage = inv.approvalStage || 'pending_associate';
                  const canAssociateApprove = stage === 'pending_associate';

                  return (
                    <tr key={inv._id || inv.investorId} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Investor ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                            {inv.fullName?.charAt(0).toUpperCase() || 'I'}
                          </div>
                          <div>
                            <div className="font-black text-slate-900">{inv.fullName}</div>
                            <div className="font-mono text-[10px] text-blue-700 font-bold">
                              {inv.investorId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact & District */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-bold">{inv.mobile}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {inv.district || 'Odisha'}
                        </div>
                      </td>

                      {/* 3. Capital Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 font-mono text-sm">
                          ₹{(inv.totalInvestment || 0).toLocaleString('en-IN')}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase mt-0.5 ${
                            inv.paymentStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inv.paymentStatus || 'Pending'}
                        </span>
                      </td>

                      {/* 4. KYC Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inv.kycStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.kycStatus === 'Correction Required'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inv.kycStatus === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{inv.kycStatus || 'Pending'}</span>
                        </span>
                      </td>

                      {/* 5. Approval Stage */}
                      <td className="py-3.5 px-4">
                        {renderApprovalStageBadge(stage)}
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewInvestor(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                          title="View Investor Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-500 font-medium">
              Showing page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong> (Total {total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {approvingInvestor && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-lg w-full space-y-4 animate-fade-in text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Approve Investor &amp; Submit to Admin
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {approvingInvestor.investorId} • {approvingInvestor.fullName}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Investor Name</span>
                <span className="font-extrabold text-slate-900">{approvingInvestor.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Investment Capital</span>
                <span className="font-black text-emerald-800 font-mono">
                  ₹{(approvingInvestor.totalInvestment || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">KYC Status</span>
                <span className="font-bold text-slate-800">{approvingInvestor.kycStatus || 'Pending'}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Current Stage</span>
                <span className="text-amber-700 font-extrabold">Pending Associate Review</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              By approving, you confirm that you have verified this investor&apos;s basic details. This investor record will be immediately forwarded to the <strong>Super Admin Dashboard</strong> with status <em>&quot;Awaiting Admin Approval&quot;</em> for final clearance and contract execution.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Associate Remarks / Verification Notes (Optional)
              </label>
              <textarea
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="e.g. KYC documents cross-verified with original Aadhaar and payment verified..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isApproving}
                onClick={() => {
                  setApprovingInvestor(null);
                  setApprovalRemarks('');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isApproving}
                onClick={handleConfirmAssociateApproval}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isApproving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Approve &amp; Forward to Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Comprehensive Investor Details Drawer */}
      <ErrorBoundary onReset={() => setIsDetailsModalOpen(false)}>
        <InvestorDetailsModal
          isOpen={isDetailsModalOpen}
          investorId={selectedInvestorId}
          readOnly={true}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedInvestorId(null);
          }}
          onUpdate={() => {
            fetchStats();
            fetchInvestors();
          }}
        />
      </ErrorBoundary>
    </div>
  );
}

export default AssociateInvestorManagement;
