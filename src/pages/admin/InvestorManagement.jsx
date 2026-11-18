import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Sliders,
} from 'lucide-react';
import { InvestorStats } from '../../components/admin/investors/InvestorStats';
import { InvestorTable } from '../../components/admin/investors/InvestorTable';
import { AddInvestorModal } from '../../components/admin/investors/AddInvestorModal';
import { InvestorDetailsModal } from '../../components/admin/investors/InvestorDetailsModal';
import { PlanConfigurationModal } from '../../components/admin/investors/PlanConfigurationModal';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import {
  getInvestorStatsApi,
  getInvestorsApi,
  finalApproveInvestorApi,
  getAssociatesListApi,
} from '../../services/investorService';

export function InvestorManagement() {
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
  });

  // Table Data State
  const [investors, setInvestors] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    district: 'All',
    kycStatus: 'All',
    paymentStatus: 'All',
    planStatus: 'All',
    associateId: 'All',
  });
  const [activeStatCard, setActiveStatCard] = useState('');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvestorId, setSelectedInvestorId] = useState(null);
  const [isPlanConfigOpen, setIsPlanConfigOpen] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await getInvestorStatsApi();
      setStats(data || {});
    } catch (err) {
      console.warn('Failed to fetch investor stats:', err);
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
        console.error('Failed to fetch investors list:', err);
        setError(err.message || 'Unable to retrieve investors list.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters, page]
  );

  // Initial and reactive load
  useEffect(() => {
    fetchStats();
    fetchInvestors();
  }, [fetchStats, fetchInvestors]);

  // Fetch active Associate Members for assignment filter
  useEffect(() => {
    getAssociatesListApi()
      .then((data) => setAssociates(data || []))
      .catch((err) => console.warn('Failed to load associates list:', err));
  }, []);

  // Handle Filter Change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setActiveStatCard(''); // clear quick stat card selection when manual filter is applied
    setPage(1); // Reset to page 1 on filter change
  };

  // Quick stat card click filter
  const handleStatCardFilter = (filterKey) => {
    // If clicking the active card, toggle it off back to empty
    const nextKey = activeStatCard === filterKey ? '' : filterKey;
    setActiveStatCard(nextKey);

    if (nextKey === 'kyc_verified') {
      setFilters({
        search: '',
        district: 'All',
        kycStatus: 'Verified',
        paymentStatus: 'All',
        planStatus: 'All',
      });
    } else if (nextKey === 'kyc_pending') {
      setFilters({
        search: '',
        district: 'All',
        kycStatus: 'Pending',
        paymentStatus: 'All',
        planStatus: 'All',
      });
    } else if (nextKey === 'payment_pending') {
      setFilters({
        search: '',
        district: 'All',
        kycStatus: 'All',
        paymentStatus: 'Pending',
        planStatus: 'All',
      });
    } else if (nextKey === 'payment_verified') {
      setFilters({
        search: '',
        district: 'All',
        kycStatus: 'All',
        paymentStatus: 'Verified',
        planStatus: 'All',
      });
    } else if (nextKey === 'active_plans') {
      setFilters({
        search: '',
        district: 'All',
        kycStatus: 'All',
        paymentStatus: 'All',
        planStatus: 'Active',
      });
    } else {
      // 'all' or toggled off -> reset
      setFilters({
        search: '',
        district: 'All',
        kycStatus: 'All',
        paymentStatus: 'All',
        planStatus: 'All',
      });
    }
    setPage(1);
  };

  // Super Admin Final Approval
  const handleFinalApprove = async (investor) => {
    if (!window.confirm(`Grant final approval to investor ${investor.fullName} (${investor.investorId})? This will fully activate their profile.`)) return;
    try {
      await finalApproveInvestorApi(investor._id || investor.investorId, 'Super Admin Final Approval');
      showToast('success', `Investor ${investor.fullName} successfully approved and activated!`);
      fetchStats();
      fetchInvestors();
    } catch (err) {
      showToast('error', err.message || 'Failed to grant final approval.');
    }
  };

  // Open Details Modal (View action)
  const handleViewInvestor = (investor) => {
    setSelectedInvestorId(investor._id || investor.investorId);
    setIsDetailsModalOpen(true);
  };

  // Open Add/Edit Modal (Edit action)
  const handleEditInvestor = (investor) => {
    setEditingInvestor(investor);
    setIsAddModalOpen(true);
  };

  // Open Add Modal for New Registration
  const handleAddNew = () => {
    setEditingInvestor(null);
    setIsAddModalOpen(true);
  };

  // Callback after creating or updating an investor
  const handleDataUpdated = () => {
    fetchStats();
    fetchInvestors();
  };

  return (
    <div className="space-y-6 pb-12 select-none">
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
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Investor Management
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Main Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized investor administration, verified capital collection, KYC compliance & contractual records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsPlanConfigOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Configure authorized investment plans & 2X parameters"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Plan Configuration</span>
          </button>

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

          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Investor</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Summary Cards */}
      <InvestorStats
        stats={stats}
        activeFilter={activeStatCard}
        onFilterChange={handleStatCardFilter}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">System Notice:</span> {error}
          </div>
          <button
            onClick={() => fetchInvestors(true)}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Investor List Table (Directly on Main Page without Subtabs) */}
      <div className="space-y-6">
        <InvestorTable
          investors={investors}
          loading={loading}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onRefresh={() => fetchInvestors(true)}
          onViewInvestor={handleViewInvestor}
          onEditInvestor={handleEditInvestor}
          onFinalApprove={handleFinalApprove}
          onAddNew={handleAddNew}
          associates={associates}
        />
      </div>

      {/* Add / Update Investor Modal (Single Complete Form on One Page) */}
      <ErrorBoundary onReset={() => setIsAddModalOpen(false)}>
        <AddInvestorModal
          isOpen={isAddModalOpen}
          investor={editingInvestor}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingInvestor(null);
          }}
          onSuccess={() => {
            showToast(
              'success',
              editingInvestor
                ? 'Investor profile updated successfully!'
                : 'New investor registered successfully with initial payment record!'
            );
            handleDataUpdated();
          }}
        />
      </ErrorBoundary>

      {/* Comprehensive Investor Details Drawer / Modal (Single Scrollable View with 9 Collapsible Sections) */}
      <ErrorBoundary onReset={() => setIsDetailsModalOpen(false)}>
        <InvestorDetailsModal
          isOpen={isDetailsModalOpen}
          investorId={selectedInvestorId}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedInvestorId(null);
          }}
          onUpdate={handleDataUpdated}
        />
      </ErrorBoundary>

      {/* Admin Plan Configuration Modal */}
      <ErrorBoundary onReset={() => setIsPlanConfigOpen(false)}>
        <PlanConfigurationModal
          isOpen={isPlanConfigOpen}
          onClose={() => setIsPlanConfigOpen(false)}
          onPlansUpdated={() => {
            fetchStats();
            fetchInvestors();
          }}
        />
      </ErrorBoundary>
    </div>
  );
}

export default InvestorManagement;
