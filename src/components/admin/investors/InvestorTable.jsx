import React from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  RefreshCw,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck2,
  CreditCard,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';

export function InvestorTable({
  investors = [],
  loading = false,
  total = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  filters = {},
  onFilterChange,
  onRefresh,
  onViewInvestor,
  onEditInvestor,
  onFinalApprove,
  onAddNew,
  associates = [],
}) {
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

  const getStatusBadge = (status, type = 'kyc') => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'verified' || s === 'approved' || s === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Verified
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    }
    if (s === 'correction required' || s === 'correction_required') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Correction Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Pending
      </span>
    );
  };

  const getInvestmentStatusBadge = (status = 'Active') => {
    const s = String(status || '').toLowerCase();
    if (s === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    }
    if (s === 'matured') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Matured
        </span>
      );
    }
    if (s === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Pending Verification
      </span>
    );
  };

  const getPlanBadge = (assignedPlan) => {
    if (!assignedPlan || !assignedPlan.planCode || assignedPlan.status === 'None') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
          Not Assigned
        </span>
      );
    }
    return (
      <div className="space-y-0.5 max-w-[150px]">
        <span className="font-bold text-xs text-blue-900 truncate block">
          {assignedPlan.planName}
        </span>
        <span className="text-[10px] text-blue-600 font-mono block">
          {assignedPlan.durationMonths}M ({assignedPlan.status || 'Active'})
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Investor Name, Investor ID, Mobile or Email..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Quick Add and Refresh */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>+ Add New Investor</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Associate Referral Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.associateId || 'All'}
              onChange={(e) => onFilterChange('associateId', e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">Associate: All</option>
              <option value="direct">Associate: Direct (HQ)</option>
              {associates.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} {a.memberId ? `(${a.memberId})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.district || 'All'}
              onChange={(e) => onFilterChange('district', e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Districts</option>
              {districtsList.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* KYC Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <FileCheck2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.kycStatus || 'All'}
              onChange={(e) => onFilterChange('kycStatus', e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">KYC: All Statuses</option>
              <option value="Verified">KYC: Verified Only</option>
              <option value="Pending">KYC: Pending Review</option>
              <option value="Rejected">KYC: Rejected</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.paymentStatus || 'All'}
              onChange={(e) => onFilterChange('paymentStatus', e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">Payment: All</option>
              <option value="Verified">Payment: Verified</option>
              <option value="Pending">Payment: Pending Clearance</option>
              <option value="Rejected">Payment: Rejected</option>
            </select>
          </div>

          {/* Plan Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.planStatus || 'All'}
              onChange={(e) => onFilterChange('planStatus', e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">Plan: All Plans</option>
              <option value="Assigned">Plan: Assigned (Active)</option>
              <option value="Not Assigned">Plan: Not Assigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investor List Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">INVESTOR ID</th>
                <th className="py-3.5 px-4">INVESTOR NAME</th>
                <th className="py-3.5 px-4">ASSIGNED ASSOCIATE</th>
                <th className="py-3.5 px-4">MOBILE</th>
                <th className="py-3.5 px-4">EMAIL</th>
                <th className="py-3.5 px-4">DISTRICT</th>
                <th className="py-3.5 px-4">INVESTMENT AMOUNT</th>
                <th className="py-3.5 px-4">KYC STATUS</th>
                <th className="py-3.5 px-4">PAYMENT STATUS</th>
                <th className="py-3.5 px-4">ASSIGNED PLAN</th>
                <th className="py-3.5 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
                      <span className="text-xs font-bold text-slate-600">Loading Investors Registry...</span>
                    </div>
                  </td>
                </tr>
              ) : investors.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">No Investors Found</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          No investor records match your query. Click "+ Add New Investor" to register a new candidate.
                        </p>
                      </div>
                      <button
                        onClick={onAddNew}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        + Register First Investor
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                investors.map((inv) => (
                  <tr key={inv._id || inv.investorId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Investor ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                        {inv.investorId}
                      </span>
                    </td>

                    {/* Investor Name */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {inv.fullName?.charAt(0)?.toUpperCase() || 'I'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{inv.fullName}</span>
                          {inv.approvalStage === 'approved_by_associate' ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold uppercase tracking-tight block w-max mt-0.5">
                              Associate Approved
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Assigned Associate */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {inv.sourcedBy?.associateName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-300">
                            {inv.sourcedBy.associateName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block truncate max-w-[130px]" title={inv.sourcedBy.associateName}>
                              {inv.sourcedBy.associateName}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              {inv.sourcedBy.associateMemberId ? (
                                <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                  {inv.sourcedBy.associateMemberId}
                                </span>
                              ) : null}
                              {inv.approvalStage === 'approved_by_associate' && (
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                                  Stage 1 OK
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 italic">
                          Direct (HQ)
                        </span>
                      )}
                    </td>

                    {/* Mobile */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-800 font-semibold">{inv.mobile}</span>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[160px] block" title={inv.email}>
                        {inv.email || 'N/A'}
                      </span>
                    </td>

                    {/* District */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-700">{inv.district || 'Odisha'}</span>
                    </td>

                    {/* Investment Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-black text-emerald-700 block text-xs">
                          ₹{Number(inv.verifiedInvestment || inv.totalInvestment || 0).toLocaleString('en-IN')}
                        </span>
                        {inv.totalPaid > 0 && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Paid: ₹{Number(inv.totalPaid).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* KYC Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(inv.kycStatus, 'kyc')}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(inv.paymentStatus, 'payment')}
                    </td>

                    {/* Assigned Plan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[130px]" title={inv.assignedPlan?.planName || 'Standard Term Plan'}>
                          {inv.assignedPlan?.planName || 'Standard Term Plan'}
                        </span>
                      </span>
                    </td>

                    {/* Actions: View / Edit / Final Approve */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {inv.approvalStage === 'approved_by_associate' && onFinalApprove && (
                          <button
                            type="button"
                            onClick={() => onFinalApprove(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                            title="Grant Super Admin Final Approval & Activate Investor"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Final Approve</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onViewInvestor(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004085] hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          title="View Complete Investor Details, Ledger & Payouts"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditInvestor(inv)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                          title="Edit Personal Information"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{investors.length}</span> of{' '}
              <span className="font-bold text-slate-800">{total}</span> total investors
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <span className="px-3 py-1 font-bold text-slate-800">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvestorTable;

