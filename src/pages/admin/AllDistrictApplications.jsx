import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Search,
  Filter,
  Eye,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  MapPin,
  ChevronRight,
  ShieldCheck,
  SendHorizontal,
  ChevronLeft,
  X,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import {
  getSuperAdminAllLoansApi,
  getSuperAdminDistrictSummaryApi,
} from '../../services/superAdminLoanService';
import { AllDistrictLoanDetailModal } from '../../components/admin/loans/AllDistrictLoanDetailModal';

export function AllDistrictApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // District Aggregation Summary
  const [districtSummary, setDistrictSummary] = useState({
    totalDistricts: 0,
    stats: {
      totalApplications: 0,
      pendingDistrictVerification: 0,
      forwardedToSuperAdmin: 0,
      approved: 0,
      active: 0,
      rejected: 0,
      onHold: 0,
      totalRequestedAmount: 0,
    },
    districts: [],
  });

  // Modal Details
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const [allRes, summaryRes] = await Promise.all([
        getSuperAdminAllLoansApi({
          search,
          district: districtFilter,
          status: statusFilter,
          page: currentPage,
          limit,
        }).catch((err) => {
          console.warn('Failed to fetch applications:', err);
          return { applications: [], total: 0 };
        }),
        getSuperAdminDistrictSummaryApi().catch((err) => {
          console.warn('Failed to fetch district summary:', err);
          return { totalDistricts: 0, stats: {}, districts: [] };
        }),
      ]);

      if (allRes && allRes.applications) {
        setApplications(allRes.applications);
        setTotalCount(allRes.total || allRes.applications.length);
      }
      if (summaryRes && summaryRes.stats) {
        setDistrictSummary(summaryRes);
      }
    } catch (err) {
      console.error('Error loading all district applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, districtFilter, statusFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page to 1 when filters change
  const handleDistrictChange = (d) => {
    setDistrictFilter(d);
    setCurrentPage(1);
  };

  const handleStatusChange = (s) => {
    setStatusFilter(s);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDistrictFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Disbursed':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            Active
          </span>
        );
      case 'Approved':
      case 'Approved – Not Disbursed':
      case 'Approved - Not Disbursed':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved – Not Disbursed
          </span>
        );
      case 'Verified / Forwarded to Super Admin':
      case 'Forwarded to Super Admin':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            Verified / Forwarded
          </span>
        );
      case 'Pending Final Approval':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">
            Pending Final Approval
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
            Rejected
          </span>
        );
      case 'On Hold':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
            On Hold
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            Pending District Verification
          </span>
        );
    }
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const isFiltered = search !== '' || districtFilter !== 'All' || statusFilter !== 'All';

  // Export to CSV helper
  const handleExportCSV = () => {
    if (applications.length === 0) return;
    const headers = [
      'Application ID',
      'Customer Name',
      'Customer ID',
      'District',
      'Requested Amount',
      'Tenure',
      'Interest Rate',
      'Submission Date',
      'Status',
    ];
    const rows = applications.map((a) => [
      `"${a.applicationId}"`,
      `"${a.customerName || a.applicantName}"`,
      `"${a.customerId || a.memberId}"`,
      `"${a.district}"`,
      a.requestedAmount,
      `"${a.tenure}"`,
      `${a.interestRate}%`,
      `"${formatDate(a.submissionDate || a.createdAt)}"`,
      `"${a.status}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `All_District_Loan_Applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Admin Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Loan Management</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-bold">All District Applications</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              All District Applications
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Master Multi-District Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centrally track, review and audit statutory credit facility applications across all 30 operational districts of Odisha.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={applications.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => loadData()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications Across All Districts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-black">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {districtSummary.stats.totalApplications || totalCount}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Across all {districtSummary.totalDistricts || 12}+ districts
            </p>
          </div>
        </div>

        {/* Pending District Verification */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Pending District Verification
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-black">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-900 tracking-tight">
              {districtSummary.stats.pendingDistrictVerification || 0}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Under on-ground field KYC check
            </p>
          </div>
        </div>

        {/* Forwarded to Super Admin */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
              Verified & Forwarded
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-black">
              <SendHorizontal className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-blue-900 tracking-tight">
              {districtSummary.stats.forwardedToSuperAdmin || 0}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Awaiting Super Admin final sanction
            </p>
          </div>
        </div>

        {/* Approved & Active Facilities */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              Approved / Active
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-black">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-900 tracking-tight">
              {(districtSummary.stats.approved || 0) + (districtSummary.stats.active || 0)}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Sanctioned statutory facilities
            </p>
          </div>
        </div>
      </div>

      {/* DISTRICT SUMMARY PILLS SELECTOR */}
      {districtSummary.districts.length > 0 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Quick District Filter
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Click any district to filter view
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => handleDistrictChange('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                districtFilter === 'All'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>All Districts</span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                  districtFilter === 'All' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {districtSummary.stats.totalApplications || totalCount}
              </span>
            </button>

            {districtSummary.districts.map((d) => (
              <button
                key={d.district}
                type="button"
                onClick={() => handleDistrictChange(d.district)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  districtFilter.toLowerCase() === d.district.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{d.district}</span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                    districtFilter.toLowerCase() === d.district.toLowerCase()
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {d.total}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, application ID, customer/member ID..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={districtFilter}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full sm:w-44 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="All">All Districts</option>
              <option value="Unassigned">⚠️ Unassigned Applications</option>
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

          {/* Status Filter Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending District Verification">Pending District Verification</option>
              <option value="Verified / Forwarded to Super Admin">Verified / Forwarded</option>
              <option value="Pending Final Approval">Pending Final Approval</option>
              <option value="Approved – Not Disbursed">Approved – Not Disbursed</option>
              <option value="Active">Active (Disbursed)</option>
              <option value="Rejected">Rejected</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          {/* Clear Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* MASTER APPLICATIONS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">District</th>
                <th className="py-3.5 px-4">Requested Amount</th>
                <th className="py-3.5 px-4">Tenure</th>
                <th className="py-3.5 px-4">Submission Date</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs font-bold">Loading district applications...</span>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-500 space-y-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900">No Applications Found</p>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-0.5">
                        {isFiltered
                          ? 'No loan applications match your current search and filter criteria. Try adjusting your district or status filters.'
                          : 'No loan applications have been submitted across districts yet.'}
                      </p>
                    </div>
                    {isFiltered && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                applications.map((loan) => (
                  <tr key={loan._id || loan.applicationId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {loan.applicationId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 block truncate max-w-[150px]">
                        {loan.customerName || loan.applicantName}
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
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        {loan.district}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{Number(loan.requestedAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {loan.tenure}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDate(loan.submissionDate || loan.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(loan.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                        title="View complete application dossier"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && totalCount > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
            <div>
              Showing <span className="font-bold text-slate-800">{applications.length}</span> of{' '}
              <span className="font-bold text-slate-800">{totalCount}</span> applications across all districts
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS DOSSIER MODAL */}
      <AllDistrictLoanDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loan={selectedLoan}
      />
    </div>
  );
}

export default AllDistrictApplications;
