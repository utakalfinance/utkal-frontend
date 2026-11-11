import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  Calendar,
  X,
  RefreshCw,
  MapPin,
  FileCheck2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { getAssignedLoanApplicationsApi } from '../../services/districtAdminService';

export function DistrictApplications() {
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Details Modal
  const [selectedLoan, setSelectedLoan] = useState(null);

  const fetchApplications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const res = await getAssignedLoanApplicationsApi({
        search,
        status: statusFilter,
      });
      if (res && res.loans) {
        setLoans(res.loans);
      }
    } catch (err) {
      console.error('Failed to load assigned loans:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Client-side date filter & pagination
  const filteredLoans = loans.filter((l) => {
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      const itemDate = new Date(l.createdAt).getTime();
      if (itemDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo).setHours(23, 59, 59, 999);
      const itemDate = new Date(l.createdAt).getTime();
      if (itemDate > to) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage) || 1;
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Assigned District Applications
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Loan applications submitted under <span className="font-semibold text-blue-600 dark:text-blue-400">{adminUser?.assignedDistrict} Circle</span>
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchApplications(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, app ID, mobile..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status & Date Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending District Verification">Pending District Verification</option>
            <option value="Under Verification">Under Verification</option>
            <option value="On Hold">On Hold</option>
            <option value="Rejected">Rejected</option>
            <option value="Forwarded to Super Admin">Forwarded to Super Admin</option>
            <option value="Pending Final Approval">Pending Final Approval</option>
            <option value="Approved">Approved</option>
          </select>

          {/* Date From */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Mobile Number</th>
                <th className="py-3.5 px-4">Loan Amount</th>
                <th className="py-3.5 px-4">Tenure</th>
                <th className="py-3.5 px-4">Application Date</th>
                <th className="py-3.5 px-4">Document Verification</th>
                <th className="py-3.5 px-4">Customer Verification</th>
                <th className="py-3.5 px-4">Overall Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                    <p className="mt-2 text-xs">Loading circle applications...</p>
                  </td>
                </tr>
              ) : paginatedLoans.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      No applications found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      No loan records match your current search and filter criteria in {adminUser?.assignedDistrict}.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLoans.map((app) => {
                  const allDocsVerified =
                    app.documents &&
                    app.documents.length > 0 &&
                    app.documents.every((d) => d.verificationStatus === 'Verified');

                  const customerVerified = app.customerVerification?.status === 'Verified';

                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {app.applicationId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {app.applicantName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {app.memberId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {app.mobile}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ₹{(app.requestedAmount || 10000).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {app.preferredTenureMonths} Months
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            allDocsVerified
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {allDocsVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            customerVerified
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : app.customerVerification?.status === 'Rejected'
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {app.customerVerification?.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            app.status === 'Pending Final Approval' || app.status === 'Forwarded to Super Admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                              : app.status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300'
                              : app.status === 'On Hold'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLoan(app)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/district-dashboard/document-verification?appId=${app._id}`)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                          >
                            Review
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {filteredLoans.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredLoans.length)} of {filteredLoans.length} applications
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Application Dossier: {selectedLoan.applicationId}</span>
                </h3>
                <p className="text-xs text-slate-500">{selectedLoan.applicantName} - {selectedLoan.memberId}</p>
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Applicant & Financial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400">Applicant:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedLoan.applicantName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Requested Amount:</span>
                  <p className="font-bold text-blue-600">₹{(selectedLoan.requestedAmount || 10000).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-400">Tenure:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedLoan.preferredTenureMonths} Months</p>
                </div>
                <div>
                  <span className="text-slate-400">Mobile:</span>
                  <p className="font-mono">{selectedLoan.mobile}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="truncate">{selectedLoan.email}</p>
                </div>
                <div>
                  <span className="text-slate-400">Circle District:</span>
                  <p className="font-bold text-indigo-600">{selectedLoan.district}</p>
                </div>
              </div>

              {/* Purpose & Employment */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Purpose & Occupation
                </h4>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div>
                    <span className="text-slate-400">Loan Purpose:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedLoan.loanPurpose}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Occupation:</span>
                    <p className="text-slate-700 dark:text-slate-300">
                      {selectedLoan.employmentDetails?.occupationType || 'Self-Employed / Business'} - Monthly: ₹{(selectedLoan.employmentDetails?.monthlyIncome || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Uploaded KYC Documents ({selectedLoan.documents?.length || 0})
                </h4>
                <div className="space-y-2">
                  {!selectedLoan.documents || selectedLoan.documents.length === 0 ? (
                    <p className="text-slate-400 italic">No documents uploaded.</p>
                  ) : (
                    selectedLoan.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{doc.documentType}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{doc.documentName}</p>
                          {doc.verificationRemarks && (
                            <p className="text-[11px] text-amber-600 mt-0.5">Remark: "{doc.verificationRemarks}"</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              doc.verificationStatus === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700'
                                : doc.verificationStatus === 'Rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {doc.verificationStatus || 'Pending'}
                          </span>
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                            title="Open File"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status and Verification History */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-bold text-blue-600">{selectedLoan.status}</span>
                </div>
                {selectedLoan.districtVerification?.districtRemarks && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">District Remarks:</span>
                    <span className="font-medium">{selectedLoan.districtVerification.districtRemarks}</span>
                  </div>
                )}
                {selectedLoan.districtVerification?.verifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified By:</span>
                    <span>{selectedLoan.districtVerification.verifiedBy}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => {
                  const id = selectedLoan._id;
                  setSelectedLoan(null);
                  navigate(`/district-dashboard/document-verification?appId=${id}`);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Go to Verification Room
              </button>
              <button
                type="button"
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
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

export default DistrictApplications;
