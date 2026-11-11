import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  IndianRupee,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Tag,
} from 'lucide-react';

/**
 * Table of Loan Applications awaiting Super Admin Final Approval
 * Shows:
 * - Application ID
 * - Customer Name & Customer ID
 * - District
 * - Loan Amount Requested & Interest Rate
 * - Loan Tenure & Loan Purpose
 * - District Verification Status & Verification Date
 * - District Admin Remarks
 * - Submission Date
 * Actions:
 * - View Details
 * - Approve
 * - Reject
 * - Hold
 */
export function PendingFinalApprovalsTable({
  applications = [],
  loading = false,
  onViewLoan,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');

  const districtsList = Array.from(
    new Set(applications.map((app) => app.district).filter(Boolean))
  );

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchTerm.trim() ||
      (app.applicationId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.memberId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.loanPurpose || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDistrict =
      districtFilter === 'All' ||
      (app.district || '').toLowerCase() === districtFilter.toLowerCase();

    return matchesSearch && matchesDistrict;
  });

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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
      {/* HEADER & FILTERS */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending Final Approval</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200">
              {applications.length} Awaiting Decision
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Applications verified and forwarded by District Administrators requiring Super Admin sanction.
          </p>
        </div>

        {/* SEARCH & DISTRICT FILTER */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, customer, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div className="relative">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="pl-3 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Districts</option>
              {districtsList.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-y border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
              <th className="py-3 px-3">Application ID</th>
              <th className="py-3 px-3">Customer & Member ID</th>
              <th className="py-3 px-3">District</th>
              <th className="py-3 px-3 text-right">Amount & Rate</th>
              <th className="py-3 px-3">Tenure & Purpose</th>
              <th className="py-3 px-3 text-center">District Verification</th>
              <th className="py-3 px-3">District Remarks</th>
              <th className="py-3 px-3 whitespace-nowrap">Submission & Verification</th>
              <th className="py-3 px-3 text-center min-w-[200px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs font-medium">Loading forwarded loan applications...</span>
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No Applications Pending Final Approval</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchTerm || districtFilter !== 'All'
                      ? 'No applications match your current filters.'
                      : 'All district-verified applications have been processed or are currently in field review.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr
                  key={app._id || app.applicationId}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Application ID */}
                  <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {app.applicationId}
                  </td>

                  {/* Customer Name & Member ID */}
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                    <div>{app.customerName}</div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold block">
                      ID: {app.memberId || '—'}
                    </span>
                  </td>

                  {/* District */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {app.district}
                    </span>
                  </td>

                  {/* Requested Loan Amount & Interest Rate */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="font-black text-slate-900">
                      ₹{Number(app.requestedLoanAmount || 10000).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {app.interestRate ? `${app.interestRate}% p.a.` : '5% p.a.'}
                    </span>
                  </td>

                  {/* Selected Tenure & Loan Purpose */}
                  <td className="py-3 px-3 max-w-[180px]">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 inline-block mb-1">
                      {app.selectedTenure}
                    </span>
                    <p className="line-clamp-2 text-[11px] text-slate-600 leading-tight" title={app.loanPurpose}>
                      {app.loanPurpose || 'Agricultural Inputs & Working Capital'}
                    </p>
                  </td>

                  {/* District Verification Status */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {app.districtVerificationStatus || 'Verified'}
                    </span>
                  </td>

                  {/* District Admin Remarks */}
                  <td className="py-3 px-3 max-w-xs text-slate-600">
                    <p className="line-clamp-2 text-[11px] leading-tight" title={app.districtAdminRemarks}>
                      {app.districtAdminRemarks || 'Verified by District Administration.'}
                    </p>
                    {app.districtAdminName && (
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                        By: {app.districtAdminName}
                      </span>
                    )}
                  </td>

                  {/* Submission and Verification Dates */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-medium">Sub:</span> {formatDate(app.submittedDate)}
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Ver:</span> {formatDate(app.districtVerificationDate || app.forwardedDate)}
                    </div>
                  </td>

                  {/* Actions: View Details, Approve, Reject, Hold */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewLoan(app, 'approve', 'details')}
                        title="View Full Application Dossier"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-600" />
                        <span>Details</span>
                      </button>

                      {/* Quick Approve */}
                      <button
                        type="button"
                        onClick={() => onViewLoan(app, 'approve', 'decision')}
                        title="Sanction & Approve Loan"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approve</span>
                      </button>

                      {/* Quick Hold */}
                      <button
                        type="button"
                        onClick={() => onViewLoan(app, 'hold', 'decision')}
                        title="Place Loan On Hold"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                      >
                        <PauseCircle className="w-3 h-3" />
                        <span>Hold</span>
                      </button>

                      {/* Quick Reject */}
                      <button
                        type="button"
                        onClick={() => onViewLoan(app, 'reject', 'decision')}
                        title="Reject Loan Application"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
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
  );
}
export default PendingFinalApprovalsTable;
