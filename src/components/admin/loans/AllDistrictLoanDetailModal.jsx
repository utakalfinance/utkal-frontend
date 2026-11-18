import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Building2,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  SendHorizontal,
  CreditCard,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  FileCheck2,
  Maximize2,
} from 'lucide-react';
import { getBackendAssetUrl } from '../../../config/env';

export function AllDistrictLoanDetailModal({ isOpen, onClose, loan }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !loan) return null;

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', {
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

  const customerName = loan.customerName || loan.applicantName || 'Valued Member';
  const applicationId = loan.applicationId || '—';
  const customerId = loan.customerId || loan.memberId || '—';
  const district = loan.district || 'Khurda';
  const requestedAmount = Number(loan.requestedAmount || 10000);
  const sanctionedAmount = Number(
    loan.sanctionedAmount || loan.finalApproval?.approvedAmount || requestedAmount
  );
  const tenure = loan.tenure || `${loan.preferredTenureMonths || 3} Months`;
  const interestRate = loan.interestRate || 5;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Disbursed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active (Disbursed)
          </span>
        );
      case 'Approved':
      case 'Approved – Not Disbursed':
      case 'Approved - Not Disbursed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved – Not Disbursed
          </span>
        );
      case 'Verified / Forwarded to Super Admin':
      case 'Forwarded to Super Admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <SendHorizontal className="w-3.5 h-3.5 text-blue-600" /> Verified / Forwarded
          </span>
        );
      case 'Pending Final Approval':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" /> Pending Final Approval
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
          </span>
        );
      case 'On Hold':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" /> On Hold
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending District Verification
          </span>
        );
    }
  };

  const districtVerification = loan.districtVerification || {};
  const finalApproval = loan.finalApproval || {};
  const disbursement = loan.disbursement || {};
  const employment = loan.employmentDetails || {};
  const documents = Array.isArray(loan.documents) ? loan.documents : [];
  const activities = Array.isArray(loan.verificationActivities) ? loan.verificationActivities : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fade-in my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {applicationId}
                  </span>
                  {getStatusBadge(loan.status)}
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <strong>{district} District</strong>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                  {customerName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/admin-dashboard/loan-details/${loan._id || loan.applicationId || loan.id}`);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Open full page dossier in Admin Dashboard"
              >
                <Maximize2 className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {/* APPLICANT PROFILE & REGIONAL JURISDICTION */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> Borrower & Membership Identity
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                Member ID: {customerId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Full Name</span>
                <span className="text-sm font-black text-slate-900 block truncate">{customerName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned District</span>
                <span className="text-sm font-bold text-slate-900 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {district}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Mobile Number</span>
                <span className="text-xs font-semibold text-slate-800 font-mono block">
                  {loan.mobile || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
                <span className="text-xs font-semibold text-slate-800 block truncate">
                  {loan.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Occupation / Business</span>
                <span className="text-xs font-semibold text-slate-800 block">
                  {employment.occupationType || employment.employerOrBusinessName || 'Self-Employed'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Monthly Income</span>
                <span className="text-xs font-bold text-slate-900 block">
                  ₹{Number(employment.monthlyIncome || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Submission Date</span>
                <span className="text-xs font-semibold text-slate-800 block">
                  {formatDate(loan.submissionDate || loan.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* LOAN CREDIT SANCTION DETAILS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" /> Credit Facility Terms
              </span>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {loan.loanType || 'Statutory Credit'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 block uppercase">Requested Amount</span>
                <span className="text-base font-black text-blue-900 block">
                  ₹{requestedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">Sanctioned Amount</span>
                <span className="text-base font-black text-emerald-900 block">
                  ₹{sanctionedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Tenure</span>
                <span className="text-sm font-black text-slate-900 block">{tenure}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Interest Rate</span>
                <span className="text-sm font-black text-indigo-700 block">{interestRate}% p.a. Fixed</span>
              </div>

              <div className="col-span-2 sm:col-span-4 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Declared Loan Purpose</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                  {loan.loanPurpose || 'General household/commercial micro-credit'}
                </span>
              </div>
            </div>
          </div>

          {/* TWO-TIER DECISION TIMELINE & DISTRICT AUDIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tier 1: District Admin Verification */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Tier 1: District Verification
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${districtVerification.status === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : districtVerification.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                >
                  {districtVerification.status || 'Pending'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Verified By</span>
                  <span className="font-semibold text-slate-800">
                    {districtVerification.verifiedBy || `${district} District Admin`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Verification Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(districtVerification.verifiedAt || districtVerification.decisionDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">District Admin Remarks</span>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                    "{districtVerification.districtRemarks || 'Awaiting on-ground and document KYC verification.'}"
                  </p>
                </div>
                {districtVerification.isForwardedToSuperAdmin && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Forwarded to Super Admin on {formatDate(districtVerification.forwardedToSuperAdminAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tier 2: Super Admin Final Approval & Disbursement */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tier 2: Super Admin Sanction
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${finalApproval.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : finalApproval.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : finalApproval.status === 'On Hold'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                >
                  {finalApproval.status || 'Pending'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Sanctioned By</span>
                  <span className="font-semibold text-slate-800">
                    {finalApproval.approvedBy || 'Super Admin Executive Credit Committee'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Sanction Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(finalApproval.approvedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Super Admin Remarks</span>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                    "{finalApproval.finalRemarks || finalApproval.rejectionReason || 'Pending Super Admin review.'}"
                  </p>
                </div>
                {disbursement.isDisbursed && (
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 mt-2 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                      Disbursement Executed
                    </span>
                    <span className="text-xs font-mono font-bold block">
                      UTR: {disbursement.transactionId || '—'}
                    </span>
                    <span className="text-[11px] text-emerald-700 block">
                      ₹{Number(disbursement.disbursedAmount).toLocaleString('en-IN')} via {disbursement.paymentMethod} on {formatDate(disbursement.disbursedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* UPLOADED DOCUMENTS & EVIDENCE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-blue-600" /> Uploaded KYC & Supporting Documents ({documents.length})
              </span>
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No external document attachments uploaded for this application.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc, idx) => (
                  <div
                    key={doc._id || idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {doc.documentType || 'KYC Document'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        {doc.documentName || 'Attachment.pdf'}
                      </span>
                      <span className="text-[9px] font-bold text-blue-600 uppercase">
                        Status: {doc.verificationStatus || 'Pending'}
                      </span>
                    </div>

                    {(doc.documentUrl || doc.fileUrl) && (
                      <a
                        href={getBackendAssetUrl(doc.documentUrl || doc.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AUDIT LOG TIMELINE */}
          {activities.length > 0 && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" /> Verification Activities Timeline ({activities.length})
              </span>
              <div className="space-y-2">
                {activities.map((act, idx) => (
                  <div key={idx} className="text-xs bg-white p-2.5 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{act.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(act.timestamp)}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        Performed by {act.performedBy} ({act.role})
                      </span>
                      {act.notes && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5">{act.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER ACTION */}
          <div className="pt-2 flex items-center justify-end border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllDistrictLoanDetailModal;
