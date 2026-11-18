import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  FileText,
  CheckCircle2,
  Clock,
  Wallet,
  IndianRupee,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  RefreshCw,
  Download,
  AlertCircle,
  X,
  ChevronLeft,
  Building2,
  Eye,
  ShieldCheck,
  TrendingUp,
  Percent,
  XCircle,
  PauseCircle,
  ArrowRight,
  Layers,
  Sliders,
  Calculator,
  Plus,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import {
  getSuperAdminLoanStatsApi,
  getSuperAdminAllLoansApi,
  getLoanSettingsApi,
  updateLoanSettingsApi,
} from '../../services/superAdminLoanService';
import { AllDistrictLoanDetailModal } from '../../components/admin/loans/AllDistrictLoanDetailModal';

export function LoanDashboard() {
  const navigate = useNavigate();

  // Data states
  const [loanPolicy, setLoanPolicy] = useState(null);
  const [stats, setStats] = useState({
    totalLoanApplications: 0,
    pendingDistrictVerification: 0,
    pendingFinalApproval: 0,
    approvedLoans: 0,
    totalDisbursedAmount: 0,
    activeLoans: 0,
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Policy Editor State (Configured directly on this single dashboard page)
  const [policyAmount, setPolicyAmount] = useState(10000);
  const [policyInterestRate, setPolicyInterestRate] = useState(1);
  const [policyTenures, setPolicyTenures] = useState([3, 6, 9]);
  const [customTenure, setCustomTenure] = useState('');
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySuccessMsg, setPolicySuccessMsg] = useState(null);
  const [policyErrorMsg, setPolicyErrorMsg] = useState(null);

  // Quick selections
  const quickAmounts = [5000, 10000, 15000, 20000, 25000, 50000];
  const quickRates = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
  const commonMonths = [1, 2, 3, 6, 9, 12, 18, 24];

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format currency helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // Fetch real data from MongoDB APIs via superAdminLoanService
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const [statsRes, loansRes, policyRes] = await Promise.all([
        getSuperAdminLoanStatsApi().catch((err) => {
          console.warn('Loan stats notice:', err?.message);
          return { stats: null };
        }),
        getSuperAdminAllLoansApi({ limit: 100 }).catch((err) => {
          console.warn('Loan applications notice:', err?.message);
          return { applications: [] };
        }),
        getLoanSettingsApi().catch((err) => {
          console.warn('Loan settings notice:', err?.message);
          return { settings: null };
        }),
      ]);

      if (statsRes?.stats) {
        setStats(statsRes.stats);
      }

      if (Array.isArray(loansRes?.applications)) {
        setApplications(loansRes.applications);
      }

      if (policyRes?.settings) {
        setLoanPolicy(policyRes.settings);
        setPolicyAmount(Number(policyRes.settings.defaultAmount) || 10000);
        if (
          policyRes.settings.monthlyInterestRate !== undefined &&
          policyRes.settings.monthlyInterestRate !== null
        ) {
          setPolicyInterestRate(Number(policyRes.settings.monthlyInterestRate));
        } else if (policyRes.settings.baseInterestRate) {
          const baseRate = Number(policyRes.settings.baseInterestRate);
          setPolicyInterestRate(baseRate > 5 ? Math.round((baseRate / 12) * 100) / 100 : baseRate);
        } else {
          setPolicyInterestRate(1);
        }
        if (
          Array.isArray(policyRes.settings.availableTenureMonths) &&
          policyRes.settings.availableTenureMonths.length > 0
        ) {
          setPolicyTenures(
            policyRes.settings.availableTenureMonths.map(Number).sort((a, b) => a - b)
          );
        } else {
          setPolicyTenures([3, 6, 9]);
        }
      }
    } catch (err) {
      console.error('Failed to load Loan Dashboard data:', err);
      setError('Unable to synchronize live loan records. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Toggle tenure month
  const handleToggleTenure = (m) => {
    setPolicyTenures((prev) => {
      if (prev.includes(m)) {
        if (prev.length === 1) {
          alert('At least one EMI month must be selected.');
          return prev;
        }
        return prev.filter((item) => item !== m);
      } else {
        return [...prev, m].sort((a, b) => a - b);
      }
    });
  };

  // Add custom month
  const handleAddCustomTenure = () => {
    const m = parseInt(customTenure, 10);
    if (isNaN(m) || m <= 0 || m > 60) {
      alert('Please enter a valid month between 1 and 60.');
      return;
    }
    if (policyTenures.includes(m)) {
      alert(`${m} Months is already selected.`);
      return;
    }
    setPolicyTenures((prev) => [...prev, m].sort((a, b) => a - b));
    setCustomTenure('');
  };

  // Real-time EMI breakdown calculation
  const liveEmiBreakdowns = useMemo(() => {
    const P = Number(policyAmount) || 0;
    const rate = Number(policyInterestRate) || 0;
    // Rate is entered as Monthly Interest Rate (% / Month)
    const monthlyRate = rate / 100;

    return policyTenures.map((n) => {
      let emi = 0;
      let totalInterest = 0;
      if (P > 0 && n > 0) {
        if (monthlyRate > 0) {
          emi = Math.round(
            (P * monthlyRate * Math.pow(1 + monthlyRate, n)) /
            (Math.pow(1 + monthlyRate, n) - 1)
          );
        } else {
          emi = Math.round(P / n);
        }
        totalInterest = Math.max(0, Math.round(emi * n - P));
      }
      return {
        months: n,
        monthlyEmi: emi,
        totalInterest,
        totalPayable: P + totalInterest,
      };
    });
  }, [policyAmount, policyInterestRate, policyTenures]);

  // Save policy directly on this dashboard page
  const handleSavePolicy = async (e) => {
    if (e) e.preventDefault();
    setIsSavingPolicy(true);
    setPolicyErrorMsg(null);
    setPolicySuccessMsg(null);

    const P = Number(policyAmount);
    if (isNaN(P) || P <= 0) {
      setPolicyErrorMsg('Please enter a valid loan amount (e.g. ₹10,000).');
      setIsSavingPolicy(false);
      return;
    }

    const rate = Number(policyInterestRate);
    if (isNaN(rate) || rate < 0) {
      setPolicyErrorMsg('Please enter a valid monthly interest rate (e.g. 1% or 1.5%).');
      setIsSavingPolicy(false);
      return;
    }

    const tenures = policyTenures
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);
    if (tenures.length === 0) {
      setPolicyErrorMsg('Please select at least one EMI month.');
      setIsSavingPolicy(false);
      return;
    }

    try {
      const annualEquivalent = Math.round(rate * 12 * 100) / 100;
      const payload = {
        defaultAmount: P,
        minAmount: P,
        maxAmount: P,
        isAmountFixed: true,
        allowedAmounts: [P],
        monthlyInterestRate: rate,
        baseInterestRate: annualEquivalent,
        highCibilInterestRate: annualEquivalent,
        standardCibilInterestRate: annualEquivalent,
        cibilThreshold: 600,
        interestRateDisplay: `${rate}% / month (${annualEquivalent}% p.a.)`,
        availableTenureMonths: tenures,
        defaultTenureMonths: tenures[0] || 3,
        emiCalculationMethod: 'reducing_balance',
        processingFeePercent: 1,
        processingFeeFixed: 0,
        aboutEmiNote: `EMI is calculated on monthly reducing balance at ${rate}% per month. Repayments are scheduled monthly following disbursement with zero prepayment penalty.`,
        repaymentGuidelines: [
          'Monthly installments are auto-debited or payable via direct UPI/IMPS.',
          'Grace period of 3 business days is provided before late charges apply.',
          'Timely repayments elevate your credit profile and unlock larger loan limits.',
        ],
        policyReference: 'Utkal Finance Statutory Member Credit Policy',
      };

      const res = await updateLoanSettingsApi(payload);
      if (res && res.settings) {
        setLoanPolicy(res.settings);
      }
      setPolicySuccessMsg('Loan parameters saved successfully! Live in Member Portal now.');
      setTimeout(() => setPolicySuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error saving loan policy:', err);
      setPolicyErrorMsg(err.message || 'Failed to save loan policy.');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  // Dynamic status mapping for clean badge display
  const getStatusBadge = (rawStatus) => {
    const s = (rawStatus || '').toLowerCase();
    if (s === 'approved' || s === 'sanctioned') {
      return {
        label: 'Approved',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    }
    if (s === 'disbursed' || s === 'active') {
      return {
        label: 'Disbursed',
        className: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        icon: Wallet,
      };
    }
    if (s === 'rejected' || s === 'declined') {
      return {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      };
    }
    if (s === 'on_hold' || s === 'on hold') {
      return {
        label: 'On Hold',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: PauseCircle,
      };
    }
    if (s.includes('district') || s.includes('forwarded')) {
      return {
        label: 'District Review',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Building2,
      };
    }
    // Default Pending
    return {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
    };
  };

  // Filter logic
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Search filter
      const searchTarget = search.trim().toLowerCase();
      const applicantName = (app.customerName || app.applicantName || '').toLowerCase();
      const memberId = (app.memberId || app.customerId || '').toLowerCase();
      const appId = (app.applicationId || app.id || '').toLowerCase();
      const mobile = (app.mobile || app.phone || app.mobileNumber || '').toLowerCase();
      const district = (app.district || '').toLowerCase();

      const matchesSearch =
        !searchTarget ||
        applicantName.includes(searchTarget) ||
        memberId.includes(searchTarget) ||
        appId.includes(searchTarget) ||
        mobile.includes(searchTarget) ||
        district.includes(searchTarget);

      // 2. Status filter
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        const appStatus = (app.status || '').toLowerCase();
        const targetStatus = statusFilter.toLowerCase();
        if (targetStatus === 'pending') {
          matchesStatus =
            appStatus.includes('pending') ||
            appStatus.includes('submitted') ||
            appStatus.includes('review');
        } else if (targetStatus === 'approved') {
          matchesStatus = appStatus === 'approved' || appStatus === 'sanctioned';
        } else if (targetStatus === 'disbursed') {
          matchesStatus = appStatus === 'disbursed' || appStatus === 'active';
        } else if (targetStatus === 'rejected') {
          matchesStatus = appStatus === 'rejected';
        } else {
          matchesStatus = appStatus.includes(targetStatus);
        }
      }

      // 3. Date filter
      let matchesDate = true;
      const appDateVal = app.submissionDate || app.createdAt || app.applicationDate;
      if (appDateVal && dateFilter !== 'All') {
        const d = new Date(appDateVal);
        const now = new Date();

        if (dateFilter === 'Today') {
          matchesDate = d.toDateString() === now.toDateString();
        } else if (dateFilter === 'This Week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = d >= sevenDaysAgo && d <= now;
        } else if (dateFilter === 'This Month') {
          matchesDate =
            d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'Custom' && startDate) {
          const start = new Date(startDate);
          const end = endDate ? new Date(endDate) : new Date();
          end.setHours(23, 59, 59, 999);
          matchesDate = d >= start && d <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [applications, search, statusFilter, dateFilter, startDate, endDate]);

  // Derived KPI metrics
  const totalAppsCount = stats.totalLoanApplications || applications.length;
  const pendingAppsCount =
    (stats.pendingFinalApproval || 0) + (stats.pendingDistrictVerification || 0) ||
    applications.filter((a) => (a.status || '').toLowerCase().includes('pending')).length;
  const approvedLoansCount =
    stats.approvedLoans ||
    applications.filter((a) => (a.status || '').toLowerCase() === 'approved').length;
  const totalDisbursedAmt = stats.totalDisbursedAmount || 0;

  // Pagination calculation
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage) || 1;
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter, startDate, endDate]);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setDateFilter('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'All' ||
    dateFilter !== 'All' ||
    Boolean(startDate);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredApplications.length === 0) return;

    const headers = [
      'Application ID',
      'Member ID',
      'Customer Name',
      'District',
      'Loan Amount (INR)',
      'Tenure',
      'Application Date',
      'Status',
    ];

    const rows = filteredApplications.map((app) => [
      `"${app.applicationId || app.id || ''}"`,
      `"${app.memberId || app.customerId || 'MEM-PENDING'}"`,
      `"${app.customerName || app.applicantName || 'Applicant'}"`,
      `"${app.district || 'Khurda'}"`,
      app.requestedAmount || app.loanAmount || app.amount || 0,
      `"${app.tenure || '12 Months'}"`,
      `"${formatDate(app.submissionDate || app.createdAt)}"`,
      `"${app.status || 'Pending'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Utkal_Loan_Applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12 select-none">
      {/* 1. BREADCRUMBS & PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Admin Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-600">Loan Management</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-bold">Overview</span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Loan Management Dashboard
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Statutory Credit Desk
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl leading-relaxed">
            Centralized statutory credit facility oversight, loan lifecycle tracking, and capital disbursement intelligence.
          </p>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredApplications.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => loadDashboardData(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh loan data from live database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/emi-collections')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            title="Inspect member EMI schedules, track payments & recovery"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>User EMI Collections</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('loan-policy-config-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            title="Configure dynamic loan amount, interest rate, and EMI rules"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Set Loan &amp; EMI</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/loans')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
          >
            <span>Loan Approvals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ERROR NOTICE (IF ANY) */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ACTIVE LOAN & EMI POLICY CONFIGURATION (EMBEDDED DIRECTLY IN DASHBOARD) */}
      <div id="loan-policy-config-card" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 via-blue-50/20 to-indigo-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Set Loan Amount, Interest &amp; EMI Months
                </h2>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Member Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                These dynamic values will instantly show in the member dashboard during loan application.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleSavePolicy}
              disabled={isSavingPolicy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              {isSavingPolicy ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save &amp; Publish Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {policyErrorMsg && (
          <div className="m-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{policyErrorMsg}</span>
          </div>
        )}
        {policySuccessMsg && (
          <div className="m-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{policySuccessMsg}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: CONFIGURATION FIELDS */}
          <div className="lg:col-span-2 space-y-5">
            {/* FIELD 1: LOAN AMOUNT */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    1. Loan Amount (₹)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Amount offered to members for application
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Statutory
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-black text-xl">₹</span>
                <input
                  type="number"
                  value={policyAmount}
                  onChange={(e) => setPolicyAmount(e.target.value)}
                  min="1000"
                  step="500"
                  required
                  placeholder="e.g. 10000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-black text-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 bg-white"
                />
              </div>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPolicyAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${Number(policyAmount) === amt
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* FIELD 2: MONTHLY INTEREST RATE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    2. Monthly Interest Rate (% / Month)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Monthly reducing interest rate applied to member loans
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Monthly Reducing
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={policyInterestRate}
                  onChange={(e) => setPolicyInterestRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  placeholder="e.g. 1"
                  className="w-full pl-4 pr-24 py-2.5 rounded-xl border border-slate-300 font-black text-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 bg-white"
                />
                <span className="absolute right-4 top-3 text-slate-400 font-black text-sm">
                  % / Month
                </span>
              </div>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
                {quickRates.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setPolicyInterestRate(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${Number(policyInterestRate) === r
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                  >
                    {r}% / mo
                  </button>
                ))}
              </div>
            </div>

            {/* FIELD 3: REPAYMENT TENURES & EMI MONTHS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  3. Select EMI Months Offered to Members
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Click any month chip to enable/disable. Selected months appear as options in the member panel.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {commonMonths.map((m) => {
                  const isSelected = policyTenures.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleToggleTenure(m)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      <span>{m} Months</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Month */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <input
                  type="number"
                  placeholder="Custom month (e.g. 5, 8, 10)..."
                  value={customTenure}
                  onChange={(e) => setCustomTenure(e.target.value)}
                  min="1"
                  max="60"
                  className="w-48 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTenure}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Month</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE MEMBER PREVIEW */}
          <div className="bg-linear-to-b from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Calculator className="w-4 h-4 text-cyan-300" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-200">
                    Live Member Panel Preview
                  </h4>
                  <p className="text-[10px] text-blue-200">
                    What members see during application:
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-200 block">
                  Sanctioned Amount
                </span>
                <div className="text-2xl font-black text-white tracking-tight">
                  ₹{Number(policyAmount).toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300">
                  <span>{policyInterestRate}% / Month ({Math.round(Number(policyInterestRate || 0) * 12 * 10) / 10}% p.a.)</span>
                  <span>•</span>
                  <span className="text-emerald-300">Reducing Balance</span>
                </div>
              </div>

              {/* Monthly EMI list */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-cyan-200 block">
                  Monthly EMI Breakdown:
                </span>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {liveEmiBreakdowns.map((item) => (
                    <div
                      key={item.months}
                      className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between hover:bg-white/15 transition-all text-xs"
                    >
                      <div>
                        <span className="font-black text-white block">
                          {item.months} Months
                        </span>
                        <span className="text-[9px] text-blue-200 block">
                          Total Repay: ₹{item.totalPayable.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-400 block text-sm">
                          ₹{item.monthlyEmi.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[8px] text-blue-300 block">/ month</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-[10px] text-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Saves directly to MongoDB database.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY CARDS (REQUIRED 4 KEY METRIC CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL APPLICATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
              {totalAppsCount}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                Live Record
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Registered borrowers
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: PENDING APPLICATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Pending Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
              {pendingAppsCount}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100">
                In Review
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Awaiting sanction
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: APPROVED LOANS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Approved Loans
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
              {approvedLoansCount}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Sanctioned
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Cleared for payout
              </span>
            </div>
          </div>
        </div>

        {/* CARD 4: TOTAL DISBURSED AMOUNT */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Total Disbursed Amount
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
              {formatCurrency(totalDisbursedAmt)}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-100">
                Capital Released
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Statutory credit funds
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT LOAN APPLICATIONS SECTION (MAIN TABLE WITH FILTERS) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* TABLE HEADER & FILTER BAR */}
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-600" />
                <span>Recent Loan Applications</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time registry of loan requests submitted by approved associate members.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500">
                Total Found: <strong className="text-slate-900 font-mono">{filteredApplications.length}</strong>
              </span>
            </div>
          </div>

          {/* SEARCH, STATUS FILTER & DATE FILTER CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member, name, ID..."
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved Loans</option>
                <option value="Disbursed">Disbursed (Active)</option>
                <option value="Rejected">Rejected</option>
                <option value="On_Hold">On Hold</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">Last 7 Days</option>
                <option value="This Month">This Month</option>
                <option value="Custom">Custom Date Range</option>
              </select>
            </div>

            {/* Clear Filters / Actions */}
            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              ) : (
                <div className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-xs font-medium">
                  Showing All Records
                </div>
              )}
            </div>
          </div>

          {/* Custom Date Pickers (Shown only when dateFilter === 'Custom') */}
          {dateFilter === 'Custom' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-extrabold text-slate-600">Select Range:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Loan Amount</th>
                <th className="py-3.5 px-4">Tenure</th>
                <th className="py-3.5 px-4">Application Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-600">
                      Synchronizing loan applications from database...
                    </span>
                  </td>
                </tr>
              ) : paginatedApplications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-xs mb-3">
                      <Coins className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">
                      {hasActiveFilters ? 'No Matching Loan Applications Found' : 'No Loan Applications Recorded Yet'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mt-1 leading-relaxed">
                      {hasActiveFilters
                        ? 'No loan records match your current search and filter settings. Try clearing the search query or changing filters.'
                        : 'The statutory loan portfolio is operational. When approved members submit credit applications, they will log here automatically in real time.'}
                    </p>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear All Filters</span>
                      </button>
                    ) : (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('/admin-dashboard/loan-enquiries')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Check Visitor Enquiries</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedApplications.map((loan) => {
                  const badge = getStatusBadge(loan.status);
                  const BadgeIcon = badge.icon;
                  const memberIdVal = loan.memberId || loan.customerId || 'MEM-PENDING';
                  const customerNameVal = loan.customerName || loan.applicantName || 'Member Applicant';
                  const initialLetter = customerNameVal.charAt(0).toUpperCase();
                  const loanAmountVal = loan.requestedAmount || loan.loanAmount || loan.amount || 0;
                  const tenureVal = loan.tenure || `${loan.preferredTenureMonths || 12} Months`;
                  const appDateVal = loan.submissionDate || loan.createdAt || loan.applicationDate;

                  return (
                    <tr
                      key={loan._id || loan.applicationId || loan.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        const targetId = loan._id || loan.applicationId || loan.id;
                        navigate(`/admin-dashboard/loans/${targetId}`);
                      }}
                    >
                      {/* 1. MEMBER ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        <div className="flex flex-col">
                          <span>{memberIdVal}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            App: {loan.applicationId || '—'}
                          </span>
                        </div>
                      </td>

                      {/* 2. CUSTOMER NAME */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                            {initialLetter}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 block truncate max-w-[160px]">
                              {customerNameVal}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {loan.mobile || loan.phone || loan.district || 'Verified Member'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. LOAN AMOUNT */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-xs">
                          {formatCurrency(loanAmountVal)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {loan.loanCategory || loan.loanPurpose || 'General Facility'}
                        </span>
                      </td>

                      {/* 4. TENURE */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {tenureVal}
                      </td>

                      {/* 5. APPLICATION DATE */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {formatDate(appDateVal)}
                      </td>

                      {/* 6. STATUS */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.className}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* 7. ACTION */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const targetId = loan._id || loan.applicationId || loan.id;
                            navigate(`/admin-dashboard/loans/${targetId}`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer border border-blue-200"
                          title="View loan details dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && filteredApplications.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-900">{paginatedApplications.length}</strong> of{' '}
              <strong className="text-slate-900">{filteredApplications.length}</strong> applications
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. LOAN DETAIL MODAL */}
      <AllDistrictLoanDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLoan(null);
        }}
        loan={selectedLoan}
      />
    </div>
  );
}

export default LoanDashboard;
