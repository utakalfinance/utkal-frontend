import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
  IndianRupee,
  Building,
  ShieldCheck,
  ChevronRight,
  X,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import { fetchCustomerLoanApplicationsApi } from '../../../services/customerLoanService';

/**
 * MyLoanApplications Page (/member-dashboard/loans/applications)
 * Displays customer's submitted loan applications with 2-tier lifecycle tracking:
 * Application ID, Loan Type, Requested Amount, Date, District Verification Status,
 * Final Approval Status, Current Application Status, and detailed View Modal.
 */
export function MyLoanApplications() {
  const navigate = useNavigate();
  const { token, memberUser } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);

  const loadApplications = async () => {
    if (!token || !memberUser?._id) return;
    setLoading(true);
    setError(null);
    setApplications([]);
    setSelectedApp(null);
    try {
      const data = await fetchCustomerLoanApplicationsApi(token);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Error fetching customer loan applications:', err.message);
      setError(err.message || 'Unable to retrieve applications.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [token, memberUser?._id]);

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      term === '' ||
      app.applicationId?.toLowerCase().includes(term) ||
      app.loanType?.toLowerCase().includes(term) ||
      app.district?.toLowerCase().includes(term);

    const matchesStatus =
      selectedStatus === 'ALL' ||
      app.status?.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const s = status || 'Submitted';
    switch (s) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending District Verification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Verification':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Forwarded to Super Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Pending Final Approval':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Disbursed':
        return 'bg-teal-50 text-teal-800 border-teal-300 font-black';
      case 'On Hold':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDistrictBadge = (status) => {
    switch (status) {
      case 'Verified':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'On Hold':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Under Verification':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  const getFinalBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'On Hold':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
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

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="My Loan Applications"
        description="Track your member loan applications through direct Super Admin review, sanction, and disbursement."
        badge="APPLICATION TRACKER"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'My Loan Applications' },
        ]}
      >
        <button
          onClick={() => navigate('/member-dashboard/loans/apply')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Apply for New Loan
        </button>
      </MemberPageHeader>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, loan type, district..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="Pending Final Approval">Pending Super Admin Approval</option>
            <option value="Approved">Approved</option>
            <option value="Approved – Not Disbursed">Approved (Pending Disbursement)</option>
            <option value="Disbursed">Disbursed</option>
            <option value="On Hold">On Hold</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={loadApplications}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* APPLICATIONS TABLE */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading your loan applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No Loan Applications Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || selectedStatus !== 'ALL'
                ? 'No applications match your active search filter.'
                : 'You have not submitted any loan applications yet. Explore our client-approved member credit facilities.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/member-dashboard/loans/apply')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Apply for First Member Loan
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Loan Type</th>
                  <th className="py-3 px-4">Requested</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Routing / Branch</th>
                  <th className="py-3 px-4">Super Admin Sanction</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Application ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      <div>{app.applicationId}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {app.district} District
                      </span>
                    </td>

                    {/* Loan Type */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{app.loanType}</span>
                      <span className="text-[10px] text-slate-400">
                        {app.preferredTenureMonths} Months Tenure
                      </span>
                    </td>

                    {/* Requested Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{Number(app.requestedAmount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(app.createdAt)}</td>

                    {/* Routing / Branch */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border text-blue-700 bg-blue-50 border-blue-200">
                        {app.districtVerification?.status === 'Verified' ? 'Verified' : 'Direct to HQ'}
                      </span>
                    </td>

                    {/* Super Admin Sanction */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getFinalBadge(
                          app.finalApproval?.status || (app.status === 'Approved' ? 'Approved' : 'Pending')
                        )}`}
                      >
                        {app.finalApproval?.status || (app.status === 'Approved' ? 'Approved' : 'Pending')}
                      </span>
                    </td>

                    {/* Current Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedApp.applicationId}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                      selectedApp.status
                    )}`}
                  >
                    {selectedApp.status}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {selectedApp.loanType}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 text-xs">
              {/* Stepper Progress */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">
                  Super Admin Approval &amp; Sanction Lifecycle
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  {/* Step 1: Submitted */}
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mx-auto">
                      ✓
                    </div>
                    <span className="font-bold text-slate-700 block">Submitted</span>
                    <span className="text-slate-400 text-[9px]">
                      {formatDate(selectedApp.createdAt)}
                    </span>
                  </div>

                  {/* Step 2: Super Admin Sanction */}
                  <div className="space-y-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mx-auto ${
                        selectedApp.finalApproval?.status === 'Approved' || selectedApp.status === 'Approved'
                          ? 'bg-emerald-600 text-white'
                          : selectedApp.finalApproval?.status === 'Rejected' || selectedApp.status === 'Rejected'
                          ? 'bg-rose-600 text-white'
                          : selectedApp.finalApproval?.status === 'On Hold' || selectedApp.status === 'On Hold'
                          ? 'bg-orange-500 text-white'
                          : 'bg-blue-600 text-white animate-pulse'
                      }`}
                    >
                      {selectedApp.finalApproval?.status === 'Approved' || selectedApp.status === 'Approved'
                        ? '✓'
                        : selectedApp.finalApproval?.status === 'Rejected' || selectedApp.status === 'Rejected'
                        ? '✕'
                        : '2'}
                    </div>
                    <span className="font-bold text-slate-700 block">Super Admin Sanction</span>
                    <span className="text-slate-400 text-[9px]">
                      {selectedApp.finalApproval?.status ||
                        (selectedApp.status === 'Approved' ? 'Approved' : 'Under Review')}
                    </span>
                  </div>

                  {/* Step 3: Disbursed */}
                  <div className="space-y-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mx-auto ${
                        selectedApp.disbursement?.isDisbursed || selectedApp.status === 'Active'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {selectedApp.disbursement?.isDisbursed || selectedApp.status === 'Active' ? '✓' : '3'}
                    </div>
                    <span className="font-bold text-slate-700 block">Capital Disbursed</span>
                    <span className="text-slate-400 text-[9px]">
                      {selectedApp.disbursement?.isDisbursed || selectedApp.status === 'Active'
                        ? 'Completed'
                        : 'Awaiting'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Requested Amount</span>
                  <span className="text-sm font-black text-slate-900">
                    ₹{Number(selectedApp.requestedAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Interest Rate</span>
                  <span className="text-sm font-black text-blue-700">
                    {selectedApp.interestRate}% p.a.
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Tenure</span>
                  <span className="text-sm font-black text-slate-900">
                    {selectedApp.preferredTenureMonths} Months
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Sanctioned Amount</span>
                  <span className="text-sm font-black text-emerald-700">
                    {selectedApp.sanctionedAmount
                      ? `₹${Number(selectedApp.sanctionedAmount).toLocaleString('en-IN')}`
                      : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Purpose & Employment */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Declared Purpose:</span>
                  <span className="text-slate-600">{selectedApp.loanPurpose}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Occupation / Income:</span>
                  <span className="text-slate-600">
                    {selectedApp.employmentDetails?.occupationType || 'Self-Employed'} (₹
                    {Number(selectedApp.employmentDetails?.monthlyIncome || 0).toLocaleString('en-IN')}
                    /mo)
                  </span>
                </div>
              </div>

              {/* District Remarks & Rejection Reason */}
              <div className="p-4 rounded-xl border space-y-2 bg-blue-50/50 border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    District Verification Notes ({selectedApp.district} District)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDistrictBadge(
                      selectedApp.districtVerification?.status
                    )}`}
                  >
                    {selectedApp.districtVerification?.status || 'Pending'}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {selectedApp.districtVerification?.districtRemarks ||
                    'Awaiting KYC, field inspection, and document verification by the designated District Admin.'}
                </p>
                {selectedApp.districtVerification?.rejectionReason && (
                  <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-800 text-[11px] font-semibold">
                    District Hold/Rejection Reason: {selectedApp.districtVerification.rejectionReason}
                  </div>
                )}
              </div>

              {/* Final Super Admin Decision */}
              {selectedApp.finalApproval?.finalRemarks && (
                <div className="p-4 rounded-xl border space-y-2 bg-emerald-50/50 border-emerald-100">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Super Admin Sanction Decision
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    {selectedApp.finalApproval.finalRemarks}
                  </p>
                  {selectedApp.finalApproval.rejectionReason && (
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-800 text-[11px] font-semibold">
                      Reason: {selectedApp.finalApproval.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded Documents */}
              {selectedApp.documents && selectedApp.documents.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Uploaded Documents:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedApp.documents.map((doc, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-700 font-medium">
                            {doc.documentType || doc.documentName}
                          </span>
                        </div>
                        {doc.documentUrl && (
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 shrink-0 ml-2"
                            title="View Document"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="py-2 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLoanApplications;
