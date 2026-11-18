import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Search,
  Filter,
  RefreshCw,
  Download,
  Building2,
  Calendar,
  CreditCard,
  User,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Eye,
  BarChart3,
  ListOrdered,
  Info,
} from 'lucide-react';
import {
  getSuperAdminEmiDashboardApi,
  getSuperAdminAllEmisApi,
  getSuperAdminEmiReportsApi,
} from '../../services/superAdminLoanService';
import { RecordEmiPaymentModal } from '../../components/admin/loans/RecordEmiPaymentModal';
import { EmiScheduleModal } from '../../components/admin/loans/EmiScheduleModal';
import { UserEmiTrackingModal } from '../../components/admin/loans/UserEmiTrackingModal';

const ODISHA_DISTRICTS = [
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
  'Khurda',
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

export function EmiCollectionManagement() {
  const [activeTab, setActiveTab] = useState('desk'); // 'desk' | 'reports'

  // Summary stats
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDisbursedLoans: 0,
    totalActiveLoans: 0,
    totalClosedLoans: 0,
    totalEmiAmountDue: 0,
    totalEmiCollected: 0,
    pendingEmi: 0,
    pendingCount: 0,
    overdueEmi: 0,
    overdueCount: 0,
    paidCount: 0,
  });

  // Desk state
  const [deskLoading, setDeskLoading] = useState(true);
  const [installments, setInstallments] = useState([]);
  const [totalInstallments, setTotalInstallments] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Reports state
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [reportDistrict, setReportDistrict] = useState('All');

  // Modals state
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] = useState(null);
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState(null);
  const [selectedUserForTracking, setSelectedUserForTracking] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load summary dashboard stats
  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const res = await getSuperAdminEmiDashboardApi();
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to fetch EMI dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load installments for Collection Desk
  const loadInstallments = async () => {
    setDeskLoading(true);
    try {
      const params = {
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        search: search.trim() ? search.trim() : undefined,
        page,
        limit,
      };
      const res = await getSuperAdminAllEmisApi(params);
      if (res && res.installments) {
        setInstallments(res.installments);
        setTotalInstallments(res.total || res.installments.length);
      }
    } catch (err) {
      console.error('Failed to fetch installments:', err);
      setInstallments([]);
    } finally {
      setDeskLoading(false);
    }
  };

  // Load reports
  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const params = {
        district: reportDistrict !== 'All' ? reportDistrict : undefined,
      };
      const res = await getSuperAdminEmiReportsApi(params);
      setReportsData(res);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'desk') {
      loadInstallments();
    } else {
      loadReports();
    }
  }, [activeTab, page, selectedDistrict, selectedStatus, reportDistrict]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadInstallments();
  };

  const handleRefreshAll = () => {
    loadDashboardStats();
    if (activeTab === 'desk') {
      loadInstallments();
    } else {
      loadReports();
    }
  };

  const handlePaymentSuccess = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
    loadDashboardStats();
    loadInstallments();
  };

  const handleExportCSV = () => {
    if (!installments || installments.length === 0) return;
    const headers = [
      'Application ID',
      'Customer Name',
      'Member ID',
      'District',
      'Mobile',
      'Instalment #',
      'Due Date',
      'EMI Amount',
      'Status',
      'Paid Amount',
      'Paid Date',
      'Payment Method',
      'Transaction ID / UTR',
    ];

    const rows = installments.map((i) => [
      `"${i.applicationId || ''}"`,
      `"${i.customerName || ''}"`,
      `"${i.customerId || ''}"`,
      `"${i.district || ''}"`,
      `"${i.mobile || ''}"`,
      i.instalmentNumber,
      i.dueDate ? new Date(i.dueDate).toISOString().split('T')[0] : '',
      i.emiAmount,
      i.paymentStatus,
      i.paidAmount || 0,
      i.paidAt ? new Date(i.paidAt).toISOString().split('T')[0] : '',
      `"${i.paymentMethod || ''}"`,
      `"${i.transactionId || i.utrNumber || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `utkal_emi_collections_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatDateTime = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '—';
      return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '—';
    }
  };

  const getPunctualityText = (dueDate, paidAt) => {
    if (!paidAt || !dueDate) return null;
    const due = new Date(dueDate);
    const paid = new Date(paidAt);
    due.setHours(23, 59, 59, 999);
    const diffDays = Math.ceil((paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { text: 'On-time', isLate: false };
    }
    return { text: `+${diffDays}d delay`, isLate: true };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-sm flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 text-xs rounded-md"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              FINANCIAL SERVICES
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-medium">Option 1: Reducing Balance EMI</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-emerald-600" />
            EMI Collection & Reports Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor member EMI repayment schedules, track reducing balance installments, and analyze recovery performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            title="Refresh All Records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading || deskLoading || reportsLoading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Advisory Banner for Option 1 Reducing Balance */}
      <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl text-blue-950 text-xs flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sm text-blue-900">
            Selected Interest Method: Option 1 (Reducing Balance EMI)
          </p>
          <p className="text-blue-800 leading-relaxed">
            Interest is computed strictly on monthly reducing balance principal. Live EMI collections and final schedule enforcement remain subject to client confirmation of statutory interest rules (11% p.a.).
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Active Loans */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Loans</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {statsLoading ? '—' : stats.totalActiveLoans}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Total Disbursed:</span>
            <span className="font-semibold text-slate-700">{stats.totalDisbursedLoans}</span>
          </div>
        </div>

        {/* Total EMI Amount Due */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Due</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{statsLoading ? '—' : stats.totalEmiAmountDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Principal + Reducing Interest</div>
        </div>

        {/* Total EMI Collected */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-colors bg-gradient-to-b from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Total Collected</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{statsLoading ? '—' : stats.totalEmiCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center justify-between">
            <span>Paid EMIs:</span>
            <span className="font-bold">{stats.paidCount} installments</span>
          </div>
        </div>

        {/* Pending EMI */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs hover:border-amber-300 transition-colors bg-gradient-to-b from-white to-amber-50/20">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Pending EMI</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-800">
            ₹{statsLoading ? '—' : stats.pendingEmi.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 flex items-center justify-between">
            <span>Upcoming:</span>
            <span className="font-bold">{stats.pendingCount} installments</span>
          </div>
        </div>

        {/* Overdue EMI */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs hover:border-rose-300 transition-colors bg-gradient-to-b from-white to-rose-50/30">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">Overdue EMI</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">
            ₹{statsLoading ? '—' : stats.overdueEmi.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 flex items-center justify-between">
            <span>Past Due:</span>
            <span className="font-bold px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded">
              {stats.overdueCount} overdue
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('desk')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'desk'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          EMI Collection Desk
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
            {totalInstallments}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          EMI Reports & Recovery Analytics
        </button>
      </div>

      {/* TAB 1: EMI COLLECTION DESK */}
      {activeTab === 'desk' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by customer name, application ID, member ID, or UTR..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* District Filter */}
              <div className="w-full md:w-52">
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="All">All Districts</option>
                  {ODISHA_DISTRICTS.filter((d) => d !== 'All').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-44">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                >
                  <option value="All">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Overdue">Overdue Only</option>
                  <option value="Paid">Paid Only</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Active User Search Pill */}
          {search.trim() && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>
                  Filtering EMI collection records for: <strong>"{search}"</strong>
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">
                  {totalInstallments} matching installments
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                Clear User Filter
              </button>
            </div>
          )}

          {/* Installments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-3 px-4">Application & Customer</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Inst # & Due Date</th>
                    <th className="py-3 px-4">EMI Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Collection Details</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deskLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span>Loading EMI installments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : installments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No EMI installments found matching the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    installments.map((item, idx) => {
                      const isPaid = item.paymentStatus === 'Paid';
                      const isOverdue = item.paymentStatus === 'Overdue';

                      return (
                        <tr
                          key={`${item.applicationId}-${item.instalmentNumber}-${idx}`}
                          className={
                            isPaid
                              ? 'bg-emerald-50/20 hover:bg-emerald-50/50'
                              : isOverdue
                              ? 'bg-rose-50/25 hover:bg-rose-50/60'
                              : 'hover:bg-slate-50'
                          }
                        >
                          {/* App & Customer */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{item.customerName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearch(item.customerName || item.customerId);
                                  setPage(1);
                                }}
                                className="text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors"
                                title="Filter desk to show only this user's EMIs"
                              >
                                Filter User
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-indigo-700 font-semibold">
                                {item.applicationId}
                              </span>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="font-mono text-[10px] text-slate-500">
                                {item.customerId}
                              </span>
                            </div>
                          </td>

                          {/* District & Mobile */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{item.district}</span>
                            <span className="text-[11px] text-slate-500 block font-mono">
                              {item.mobile || '—'}
                            </span>
                          </td>

                          {/* Installment # & Due Date */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">
                              Installment #{item.instalmentNumber}
                            </div>
                            <div className={`text-[11px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                              Due: {formatDate(item.dueDate)}
                            </div>
                          </td>

                          {/* EMI Amount */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">
                              ₹{Number(item.emiAmount || 3500).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              P: ₹{Number(item.principalComponent || 0).toLocaleString('en-IN')} | I: ₹{Number(item.interestComponent || 0).toLocaleString('en-IN')}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Paid
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Upcoming
                              </span>
                            )}
                          </td>

                          {/* Collection Details with exact timestamp */}
                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-emerald-800 block text-xs">
                                    ₹{Number(item.paidAmount || item.emiAmount).toLocaleString('en-IN')}
                                  </span>
                                  {(() => {
                                    const p = getPunctualityText(item.dueDate, item.paidAt);
                                    if (!p) return null;
                                    return (
                                      <span
                                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                                          p.isLate
                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        }`}
                                      >
                                        {p.text}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-700 font-mono">
                                  <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{formatDateTime(item.paidAt)}</span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-500 block truncate max-w-44">
                                  Ref: {item.utrNumber || item.transactionId || '—'}
                                </span>
                                {item.paymentMethod && (
                                  <span className="text-[10px] text-slate-500 block">
                                    Via {item.paymentMethod}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-slate-400 italic block text-xs">Pending collection</span>
                                {isOverdue ? (
                                  <span className="text-[10px] font-bold text-rose-600 block">
                                    Payment overdue
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 block">
                                    Due on {formatDate(item.dueDate)}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Dedicated Tracking Time Button */}
                              <button
                                type="button"
                                onClick={() => setSelectedUserForTracking(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                title="View exact collection tracking timeline and timestamps for this user"
                              >
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                <span>Tracking Time</span>
                              </button>

                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedInstallmentForPayment(item)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  Collect
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedLoanForSchedule(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                title="View Complete Schedule"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Schedule
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalInstallments > limit && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  Showing {Math.min((page - 1) * limit + 1, totalInstallments)} to{' '}
                  {Math.min(page * limit, totalInstallments)} of {totalInstallments} installments
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-white border border-slate-300 rounded-lg disabled:opacity-50 text-slate-700 hover:bg-slate-100"
                  >
                    Previous
                  </button>
                  <span className="font-semibold px-2">Page {page}</span>
                  <button
                    disabled={page * limit >= totalInstallments}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-white border border-slate-300 rounded-lg disabled:opacity-50 text-slate-700 hover:bg-slate-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EMI REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Reports Filter */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-slate-900">Recovery & Portfolio Analytics</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">District:</span>
              <select
                value={reportDistrict}
                onChange={(e) => setReportDistrict(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Districts</option>
                {ODISHA_DISTRICTS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Collection Trend Bar Visualization */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Monthly Collection Trend
            </h3>

            {reportsLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Loading analytics...</div>
            ) : !reportsData?.monthlyCollection || reportsData.monthlyCollection.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No monthly collections recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {reportsData.monthlyCollection.map((m, idx) => {
                  const maxAmt = Math.max(
                    ...reportsData.monthlyCollection.map((x) => x.collectedAmount),
                    1
                  );
                  const pct = Math.round((m.collectedAmount / maxAmt) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{m.month}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[11px]">{m.count} installments</span>
                          <span className="font-bold text-emerald-700">
                            ₹{m.collectedAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* District-wise Recovery Efficiency Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                District-wise Collection & Recovery Efficiency
              </h3>
              <span className="text-xs text-slate-500">
                {reportsData?.districtSummary?.length || 0} Districts with Activity
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Loans (Active / Closed)</th>
                    <th className="py-3 px-4">Total Due</th>
                    <th className="py-3 px-4">Collected</th>
                    <th className="py-3 px-4">Pending</th>
                    <th className="py-3 px-4">Overdue</th>
                    <th className="py-3 px-4">Recovery Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Loading district summary...
                      </td>
                    </tr>
                  ) : !reportsData?.districtSummary || reportsData.districtSummary.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No district data available.
                      </td>
                    </tr>
                  ) : (
                    reportsData.districtSummary.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{d.district}</td>
                        <td className="py-3 px-4 text-slate-700">
                          {d.totalLoans} ({d.activeLoans} active / {d.closedLoans} closed)
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          ₹{d.totalPayable.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ₹{d.totalCollected.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-amber-700 font-medium">
                          ₹{d.totalPending.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-rose-700 font-semibold">
                          ₹{d.totalOverdue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${Math.min(d.efficiencyPercent, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800">
                              {d.efficiencyPercent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loan-wise Repayment History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Loan-wise Settlement Ledger History
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Application & Customer</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Disbursed (Tenure)</th>
                    <th className="py-3 px-4">Total Due</th>
                    <th className="py-3 px-4">Collected</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Installments</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportsLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Loading loan history...
                      </td>
                    </tr>
                  ) : !reportsData?.loanRepaymentHistory || reportsData.loanRepaymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No disbursed loans recorded.
                      </td>
                    </tr>
                  ) : (
                    reportsData.loanRepaymentHistory.map((l, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{l.customerName}</div>
                          <div className="font-mono text-[11px] text-indigo-700">{l.applicationId}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{l.district}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">
                            ₹{l.disbursedAmount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-500">{l.tenure}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          ₹{l.totalPayable.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ₹{l.totalCollected.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-800">
                          ₹{l.outstandingBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {l.installmentsPaid}
                        </td>
                        <td className="py-3 px-4">
                          {l.status === 'Closed' || l.outstandingBalance === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Closed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
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

      {/* MODAL 1: RECORD EMI PAYMENT */}
      <RecordEmiPaymentModal
        isOpen={Boolean(selectedInstallmentForPayment)}
        onClose={() => setSelectedInstallmentForPayment(null)}
        installment={selectedInstallmentForPayment}
        onSuccess={handlePaymentSuccess}
      />

      {/* MODAL 2: EMI SCHEDULE & LEDGER */}
      <EmiScheduleModal
        isOpen={Boolean(selectedLoanForSchedule)}
        onClose={() => setSelectedLoanForSchedule(null)}
        loanData={selectedLoanForSchedule}
      />

      {/* MODAL 3: USER EMI COLLECTION TRACKING TIMELINE */}
      <UserEmiTrackingModal
        isOpen={Boolean(selectedUserForTracking)}
        onClose={() => setSelectedUserForTracking(null)}
        userData={selectedUserForTracking}
        onRecordPaymentClick={(inst) => {
          setSelectedInstallmentForPayment(inst);
        }}
      />
    </div>
  );
}
export default EmiCollectionManagement;

