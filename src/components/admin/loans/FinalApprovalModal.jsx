import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Mail,
  Briefcase,
  IndianRupee,
  Calendar,
  FileText,
  ExternalLink,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { superAdminProcessLoanDecisionApi } from '../../../services/superAdminLoanService';

export function FinalApprovalModal({
  isOpen,
  onClose,
  loan,
  onSuccess,
  initialAction = 'approve',
  initialTab = 'decision',
}) {
  if (!isOpen || !loan) return null;

  const [activeTab, setActiveTab] = useState(initialTab || 'decision'); // 'decision' | 'details' | 'documents'
  const [decisionAction, setDecisionAction] = useState(initialAction || 'approve'); // 'approve' | 'reject' | 'hold'

  // Approval Form fields
  const [approvedAmount, setApprovedAmount] = useState(
    loan.requestedLoanAmount || loan.requestedAmount || 10000
  );
  const [approvedTenureMonths, setApprovedTenureMonths] = useState(
    loan.preferredTenureMonths || 3
  );
  const [interestPolicyRef, setInterestPolicyRef] = useState(
    'Utkal Finance Statutory Credit Policy 2026'
  );
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync state whenever modal is opened or loan / action changes
  React.useEffect(() => {
    if (loan) {
      setApprovedAmount(loan.requestedLoanAmount || loan.requestedAmount || 10000);
      setApprovedTenureMonths(loan.preferredTenureMonths || 3);
      setRemarks('');
      setRejectionReason('');
      setErrorMsg(null);
      if (initialAction) setDecisionAction(initialAction);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [loan, initialAction, initialTab]);

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (decisionAction === 'reject' && !rejectionReason.trim() && !remarks.trim()) {
      setErrorMsg('Please specify a rejection reason or justification.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        action: decisionAction,
        approvedAmount: Number(approvedAmount) || 10000,
        approvedTenureMonths: Number(approvedTenureMonths) || 3,
        interestPolicyReference: interestPolicyRef.trim(),
        remarks: remarks.trim(),
        rejectionReason: rejectionReason.trim(),
      };

      const loanId = loan._id || loan.applicationId;
      const res = await superAdminProcessLoanDecisionApi(loanId, payload);

      if (typeof onSuccess === 'function') {
        onSuccess(res.message || 'Loan decision recorded successfully!');
      }
      onClose();
    } catch (err) {
      console.error('Error submitting loan decision:', err);
      setErrorMsg(err.message || 'Failed to record loan decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const applicantName = loan.customerName || loan.applicantName || 'Customer';
  const appId = loan.applicationId || 'LOAN';
  const documents = loan.documents || [];
  const empDetails = loan.employmentDetails || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-left my-auto">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {appId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                Pending Super Admin Sanction
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Final Loan Approval Review • {applicantName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 px-4 sm:px-5 pt-3 border-b border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('decision')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'decision'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Final Decision
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer &amp; Loan Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            KYC Documents ({documents.length})
          </button>
        </div>

        {/* MODAL CONTENT AREA */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* DISTRICT VERIFICATION CARD - ALWAYS VISIBLE */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>District Administration Preliminary Verification</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700">
                {loan.districtAdminName ? `Verified by ${loan.districtAdminName}` : 'Status: Verified'}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium italic bg-white/80 p-2.5 rounded-lg border border-emerald-100">
              "{loan.districtAdminRemarks || 'Verified and forwarded for Super Admin sanction.'}"
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>Jurisdiction: <strong>{loan.district} District</strong></span>
              {loan.forwardedDate && (
                <span>Forwarded: <strong>{formatDate(loan.forwardedDate)}</strong></span>
              )}
            </div>
          </div>

          {/* TAB 1: DECISION FORM */}
          {activeTab === 'decision' && (
            <form onSubmit={handleSubmitDecision} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Select Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionAction('approve')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      decisionAction === 'approve'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs font-bold block">Approve Loan</span>
                    <span className="text-[10px] text-slate-400">Sanction facility</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionAction('reject')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      decisionAction === 'reject'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                    <span className="text-xs font-bold block">Reject Loan</span>
                    <span className="text-[10px] text-slate-400">Decline application</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionAction('hold')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      decisionAction === 'hold'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                    <span className="text-xs font-bold block">Put On Hold</span>
                    <span className="text-[10px] text-slate-400">Await clarification</span>
                  </button>
                </div>
              </div>

              {/* ACTION: APPROVE FIELDS */}
              {decisionAction === 'approve' && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Approved Loan Amount */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Approved Loan Amount (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={approvedAmount}
                          onChange={(e) => setApprovedAmount(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-black bg-white focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Requested: ₹{Number(loan.requestedLoanAmount || 10000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Approved Tenure */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Approved Tenure
                      </label>
                      <select
                        value={approvedTenureMonths}
                        onChange={(e) => setApprovedTenureMonths(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="9">9 Months</option>
                      </select>
                      <span className="text-[10px] text-slate-400">
                        Requested: {loan.selectedTenure || '3 Months'}
                      </span>
                    </div>
                  </div>

                  {/* Approved Interest Policy Reference */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Approved Interest Policy Reference
                    </label>
                    <input
                      type="text"
                      value={interestPolicyRef}
                      onChange={(e) => setInterestPolicyRef(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-800"
                      placeholder="e.g. Utkal Finance Statutory Credit Policy 2026"
                    />
                  </div>

                  {/* Final Remarks */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Final Approval Remarks / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter remarks for sanction record (e.g. KYC verified, recommended for first loan ₹10,000)..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Important Policy Note */}
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Statutory Loan Approval Safeguard:</span>
                    </div>
                    <p className="text-slate-600 text-[10px] leading-relaxed">
                      Final approval registers formal statutory loan sanction by Super Admin.
                      In accordance with company guidelines, this action does NOT automatically disburse funds.
                      Disbursement remains an independent statutory step.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTION: REJECT FIELDS */}
              {decisionAction === 'reject' && (
                <div className="space-y-3 p-4 rounded-xl bg-rose-50/60 border border-rose-200 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-rose-800 block">
                      Rejection Reason (Required) *
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify clear legal or documentary justification for rejecting this loan application..."
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 text-xs bg-white focus:outline-none focus:border-rose-600"
                      required
                    />
                  </div>
                </div>
              )}

              {/* ACTION: HOLD FIELDS */}
              {decisionAction === 'hold' && (
                <div className="space-y-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-800 block">
                      Hold Instructions / Clarification Needed
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Specify documents or clarification required from district admin or customer..."
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs bg-white focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                    decisionAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : decisionAction === 'reject'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : decisionAction === 'approve' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : decisionAction === 'reject' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>
                    {decisionAction === 'approve'
                      ? 'Approve & Sanction Loan'
                      : decisionAction === 'reject'
                      ? 'Confirm Loan Rejection'
                      : 'Put Application On Hold'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CUSTOMER & LOAN DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Applicant Profile
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{applicantName}</div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Member ID: {loan.memberId || '—'}</span>
                  </div>
                  {loan.district && (
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>District: {loan.district}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Loan Specifications
                  </span>
                  <div className="font-black text-blue-700 text-sm">
                    ₹{Number(loan.requestedLoanAmount || loan.requestedAmount || 10000).toLocaleString('en-IN')}
                  </div>
                  <div className="text-slate-600">
                    Tenure: <strong>{loan.selectedTenure || `${loan.preferredTenureMonths} Months`}</strong>
                  </div>
                  <div className="text-slate-600">
                    Purpose: <strong>{loan.loanPurpose || 'First Member Term Loan'}</strong>
                  </div>
                </div>
              </div>

              {/* Employment / Enterprise Info */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Employment / Business Profile
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Occupation Type</span>
                    <span className="font-semibold text-slate-800">
                      {empDetails.occupationType || 'Self-Employed / Business'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Monthly Income</span>
                    <span className="font-bold text-slate-900">
                      ₹{Number(empDetails.monthlyIncome || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Employer / Enterprise</span>
                    <span className="font-semibold text-slate-800">
                      {empDetails.employerOrBusinessName || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KYC DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No direct document uploads attached to this application. Customer identity verified via central member dossier.
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">{doc.documentType}</div>
                          <div className="text-[10px] text-slate-400">{doc.documentName}</div>
                        </div>
                      </div>

                      {doc.documentUrl && (
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-600 text-blue-700 font-bold text-[11px] shadow-2xs transition-colors"
                        >
                          <span>View Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinalApprovalModal;
