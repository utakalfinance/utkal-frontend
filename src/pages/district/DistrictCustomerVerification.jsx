import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  PauseCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Wallet,
  FileText,
  AlertCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  getAssignedLoanApplicationsApi,
  getAssignedLoanApplicationByIdApi,
  verifyCustomerDetailsApi,
} from '../../services/districtAdminService';

export function DistrictCustomerVerification() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();

  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(searchParams.get('appId') || '');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingLoan, setLoadingLoan] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form remarks
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Fetch applications
  useEffect(() => {
    setLoadingList(true);
    getAssignedLoanApplicationsApi()
      .then((res) => {
        if (res && res.loans) {
          setLoans(res.loans);
          if (!selectedLoanId && res.loans.length > 0) {
            setSelectedLoanId(res.loans[0]._id);
          }
        }
      })
      .catch((err) => console.error('Failed to load loans:', err))
      .finally(() => setLoadingList(false));
  }, []);

  // Fetch single loan
  useEffect(() => {
    if (!selectedLoanId) return;
    setLoadingLoan(true);
    setRemarks('');
    setRejectionReason('');
    getAssignedLoanApplicationByIdApi(selectedLoanId)
      .then((data) => {
        const app = data?.loan || data;
        setSelectedLoan(app);
        if (app?.customerVerification?.remarks) {
          setRemarks(app.customerVerification.remarks);
        }
        if (app?.customerVerification?.rejectionReason) {
          setRejectionReason(app.customerVerification.rejectionReason);
        }
      })
      .catch((err) => console.error('Failed to load application:', err))
      .finally(() => setLoadingLoan(false));
  }, [selectedLoanId]);

  const handleAction = async (actionType) => {
    if (!selectedLoan) return;

    if (actionType === 'reject' && !rejectionReason.trim()) {
      alert('Please specify the rejection reason before rejecting customer verification.');
      return;
    }

    if (actionType === 'hold' && !remarks.trim()) {
      alert('Please specify the on-hold remark or missing information needed.');
      return;
    }

    const targetId = selectedLoan._id || selectedLoan.loan?._id || selectedLoanId;
    if (!targetId || targetId === 'undefined') {
      alert('Error: Application ID is missing.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await verifyCustomerDetailsApi(
        targetId,
        actionType,
        remarks,
        rejectionReason
      );

      setSelectedLoan((prev) => ({
        ...prev,
        customerVerification: res.customerVerification,
        status: res.loan?.status || prev.status,
      }));

      setFeedback({
        type: 'success',
        text: `Customer verification set to ${res.customerVerification.status}.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to record customer verification',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const isCustomerVerified = selectedLoan?.customerVerification?.status === 'Verified';
  const isCustomerRejected = selectedLoan?.customerVerification?.status === 'Rejected';
  const isCustomerOnHold = selectedLoan?.customerVerification?.status === 'On Hold';

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Customer Identity & Residency Verification
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authenticate applicant profile against KYC documents for {adminUser?.assignedDistrict} Circle
              </p>
            </div>
          </div>
        </div>

        {/* Application Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Applicant:</span>
          <select
            value={selectedLoanId}
            onChange={(e) => {
              setSelectedLoanId(e.target.value);
              setSearchParams({ appId: e.target.value });
            }}
            disabled={loadingList || loans.length === 0}
            className="w-full sm:w-72 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {loans.map((app) => (
              <option key={app._id} value={app._id}>
                {app.applicantName} - {app.applicationId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {loadingLoan ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500">Loading customer profile details...</p>
        </div>
      ) : !selectedLoan ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
          Please select an applicant from above.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Customer Profile & Comparison */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information Dossier Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center">
                    {selectedLoan.applicantName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedLoan.applicantName}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Member ID: {selectedLoan.memberId} * App: {selectedLoan.applicationId}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isCustomerVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : isCustomerRejected
                      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300'
                      : isCustomerOnHold
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {selectedLoan.customerVerification?.status || 'Verification Pending'}
                </span>
              </div>

              {/* Data Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile Number</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white font-mono">{selectedLoan.mobile}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Address</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{selectedLoan.email}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Assigned Circle & District</span>
                  </div>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">{selectedLoan.district} District, Odisha</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Occupation & Income</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedLoan.employmentDetails?.occupationType || 'Self-Employed'} (₹{(selectedLoan.employmentDetails?.monthlyIncome || 0).toLocaleString('en-IN')}/mo)
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Requested Amount & Tenure</span>
                  </div>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    ₹{(selectedLoan.requestedAmount || 10000).toLocaleString('en-IN')} ({selectedLoan.preferredTenureMonths} Months)
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Stated Purpose</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedLoan.loanPurpose}</p>
                </div>
              </div>

              {/* Uploaded Documents Quick Verification Overview */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Uploaded Documents Verification Status
                </h3>
                <div className="space-y-2">
                  {(selectedLoan.documents || []).map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{doc.documentType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.verificationStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700'
                              : doc.verificationStatus === 'Rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {doc.verificationStatus || 'Pending'}
                        </span>
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Customer Verification Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Customer Verification Actions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Record on-ground identity confirmation in MongoDB
                </p>
              </div>

              {/* Remarks Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Verification Remarks / Notes:
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g., Physical identity, statutory shares, and residential address confirmed in circle office."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Rejection Reason (mandatory if rejecting) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason <span className="text-slate-400 font-normal">(Mandatory if rejecting)</span>:
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Address mismatch or invalid contact number"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* Verify Customer */}
                <button
                  type="button"
                  onClick={() => handleAction('verify')}
                  disabled={actionLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Customer Identity</span>
                </button>

                {/* Put on Hold */}
                <button
                  type="button"
                  onClick={() => handleAction('hold')}
                  disabled={actionLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <PauseCircle className="w-4 h-4" />
                  <span>Put On Hold (Require Clarification)</span>
                </button>

                {/* Reject Verification */}
                <button
                  type="button"
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Customer Verification</span>
                </button>
              </div>

              {selectedLoan.customerVerification?.verifiedAt && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 space-y-0.5 border border-slate-200 dark:border-slate-700">
                  <p>
                    Last Updated: {new Date(selectedLoan.customerVerification.verifiedAt).toLocaleString()}
                  </p>
                  <p>Verified By: {selectedLoan.customerVerification.verifiedBy}</p>
                </div>
              )}
            </div>

            {/* Next Step Link */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Ready for Final Decision?
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  Once customer & documents are verified, forward to Super Admin.
                </p>
              </div>
              <button
                onClick={() => navigate(`/district-dashboard/decisions?appId=${selectedLoan._id}`)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              >
                Proceed &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DistrictCustomerVerification;
