import React, { useState, useEffect } from 'react';
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
  Eye,
  FileCheck2,
} from 'lucide-react';
import {
  superAdminProcessLoanDecisionApi,
  getSuperAdminLoanByIdApi,
} from '../../../services/superAdminLoanService';
import { getBackendAssetUrl } from '../../../config/env';
import { ZoomableImageViewer } from '../../common/ZoomableImageViewer';

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

  // Enriched loan details loaded from server
  const [enrichedLoan, setEnrichedLoan] = useState(loan);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null); // Document selected for lightbox preview

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
  useEffect(() => {
    if (loan) {
      setEnrichedLoan(loan);
      setApprovedAmount(loan.requestedLoanAmount || loan.requestedAmount || 10000);
      setApprovedTenureMonths(loan.preferredTenureMonths || 3);
      setRemarks('');
      setRejectionReason('');
      setErrorMsg(null);
      setPreviewDoc(null);
      if (initialAction) setDecisionAction(initialAction);
      if (initialTab) setActiveTab(initialTab);

      const loanId = loan._id || loan.applicationId;
      if (loanId) {
        setLoadingDetails(true);
        getSuperAdminLoanByIdApi(loanId)
          .then((res) => {
            const fullData = res?.application || res?.loan || res;
            if (fullData && (fullData._id || fullData.applicationId)) {
              setEnrichedLoan(fullData);
            }
          })
          .catch((err) => {
            console.warn('Could not fetch enriched loan details in modal:', err);
          })
          .finally(() => {
            setLoadingDetails(false);
          });
      }
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

  const isImageFile = (urlOrName) => {
    if (!urlOrName || typeof urlOrName !== 'string') return false;
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(urlOrName.split('?')[0]);
  };

  const currentLoan = enrichedLoan || loan;
  const applicantName = currentLoan.customerName || currentLoan.applicantName || 'Customer';
  const appId = currentLoan.applicationId || 'LOAN';
  const documents = Array.isArray(currentLoan.documents) ? currentLoan.documents : [];
  const empDetails = currentLoan.employmentDetails || {};

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
              {loadingDetails && (
                <span className="text-[10px] text-blue-600 animate-pulse font-medium">
                  Syncing dossier...
                </span>
              )}
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

          {/* APPLICATION ROUTING & JURISDICTION CARD - ALWAYS VISIBLE */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Application Routing & Review Status</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                {currentLoan.districtVerificationStatus || 'Direct to Super Admin'}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium italic bg-white/80 p-2.5 rounded-lg border border-blue-100">
              "{currentLoan.districtAdminRemarks || 'Direct member application routed to Super Admin for approval.'}"
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>Jurisdiction: <strong>{currentLoan.district} District</strong></span>
              {currentLoan.forwardedDate && (
                <span>Received: <strong>{formatDate(currentLoan.forwardedDate)}</strong></span>
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
                        Requested: ₹{Number(currentLoan.requestedLoanAmount || currentLoan.requestedAmount || 10000).toLocaleString('en-IN')}
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
                        Requested: {currentLoan.selectedTenure || `${currentLoan.preferredTenureMonths || 3} Months`}
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
                    <span>Member ID: {currentLoan.memberId || '—'}</span>
                  </div>
                  {currentLoan.district && (
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>District: {currentLoan.district}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Loan Specifications
                  </span>
                  <div className="font-black text-blue-700 text-sm">
                    ₹{Number(currentLoan.requestedLoanAmount || currentLoan.requestedAmount || 10000).toLocaleString('en-IN')}
                  </div>
                  <div className="text-slate-600">
                    Tenure: <strong>{currentLoan.selectedTenure || `${currentLoan.preferredTenureMonths || 3} Months`}</strong>
                  </div>
                  <div className="text-slate-600">
                    Purpose: <strong>{currentLoan.loanPurpose || 'First Member Term Loan'}</strong>
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
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-700">
                  Attached KYC & Verification Documents ({documents.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Full Dossier Verified
                </span>
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No direct document uploads attached to this application. Customer identity verified via central member dossier.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {documents.map((doc, idx) => {
                    const rawUrl = doc.documentUrl || doc.fileUrl;
                    const validUrl = getBackendAssetUrl(rawUrl);
                    const isImage = isImageFile(rawUrl) || isImageFile(doc.documentName);
                    const isPdf = /\.pdf$/i.test((rawUrl || doc.documentName || '').split('?')[0]);

                    return (
                      <div
                        key={doc._id || idx}
                        className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Document Thumbnail / Icon */}
                          <div
                            onClick={() => validUrl && setPreviewDoc({ ...doc, validUrl, isImage, isPdf })}
                            className={`w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs ${
                              validUrl ? 'cursor-pointer hover:ring-2 hover:ring-blue-500/50 hover:opacity-90' : ''
                            }`}
                            title={validUrl ? 'Click to preview document' : undefined}
                          >
                            {isImage && validUrl ? (
                              <img
                                src={validUrl}
                                alt={doc.documentType || 'KYC Document'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`${isImage && validUrl ? 'hidden' : 'flex'} flex-col items-center justify-center`}>
                              {isPdf ? (
                                <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                                  PDF
                                </span>
                              ) : (
                                <FileText className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>

                          {/* Document Metadata */}
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {doc.documentType || 'KYC Document'}
                              </span>
                              <span className="px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {doc.verificationStatus || 'Uploaded Proof'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs sm:max-w-md">
                              {doc.documentName || 'Attachment File'}
                            </div>
                            {doc.uploadedAt && (
                              <div className="text-[10px] text-slate-400">
                                Uploaded: {formatDate(doc.uploadedAt)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {validUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({ ...doc, validUrl, isImage, isPdf })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                              title="Preview document"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>Preview</span>
                            </button>
                          )}

                          {validUrl ? (
                            <a
                              href={validUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                              title="Open original document in new tab"
                            >
                              <span>View Document</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No File Link</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-left">
            {/* LIGHTBOX HEADER */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
                  {previewDoc.documentType || 'KYC Document'}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {previewDoc.documentName || 'Document File'}
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.validUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                  title="Open original file in new browser window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LIGHTBOX BODY */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[350px] max-h-[75vh] p-2">
              {previewDoc.isImage ? (
                <div className="w-full h-full min-h-[400px]">
                  <ZoomableImageViewer
                    src={previewDoc.validUrl}
                    alt={previewDoc.documentType || 'Document Preview'}
                    onClose={() => setPreviewDoc(null)}
                  />
                </div>
              ) : previewDoc.isPdf ? (
                <iframe
                  src={previewDoc.validUrl}
                  title={previewDoc.documentName || 'PDF Viewer'}
                  className="w-full h-full min-h-[500px] border-0 rounded-lg bg-white"
                />
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-xs">Preview is not directly embeddable for this format.</p>
                  <a
                    href={previewDoc.validUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-500"
                  >
                    <span>Download / View File</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinalApprovalModal;
