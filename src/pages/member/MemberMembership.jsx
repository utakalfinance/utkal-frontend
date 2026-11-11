import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck,
  Download,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  FileCheck2,
  Clock,
  Sparkles,
  Building2,
  Printer,
} from 'lucide-react';
import { MemberPageHeader } from '../../components/member/MemberPageHeader';
import { StatusBadge } from '../../components/member/StatusBadge';
import { useMemberAuth } from '../../hooks/useMemberAuth';

/**
 * MemberMembership Page (/member-dashboard/membership)
 * Visual Redesign: Modern Fintech Banking Portal
 *
 * Fulfills Section 2 (Registration and KYC):
 * - Membership application status
 * - KYC verification status
 * - Uploaded documents
 * - Verification remarks
 * - Document correction/resubmission option when requested
 * - Membership approval status
 * - Explicit reassurance that approved members do NOT need to register again.
 */
export function MemberMembership() {
  const { memberUser, memberDetails, application } = useMemberAuth();

  const memberId = memberUser?.memberId || application?.memberId || memberDetails?.memberId || '—';
  const applicationId = application?.applicationId || application?._id || '—';
  const isApproved =
    memberUser?.status === 'active' ||
    memberDetails?.status === 'active' ||
    application?.status === 'approved';

  const status = isApproved ? 'Active' : (memberUser?.status || application?.status || 'Active');
  const isCorrectionRequired =
    application?.status === 'correction_required' ||
    memberDetails?.status === 'correction_required' ||
    application?.correctionRequested === true;

  const m = application?.membershipDetails || {};
  const membershipType = m.membershipType || application?.membershipType || memberDetails?.membershipType || 'Associate Member';
  const membershipAmount = m.membershipAmount ? `₹${m.membershipAmount}` : '₹200';
  const numberOfShares = m.numberOfShares ? String(m.numberOfShares) : '10';
  const shareValue = m.shareValue ? `₹${m.shareValue}` : '₹10';
  const processingFee = m.processingFee ? `₹${m.processingFee}` : '₹100';
  const totalContribution = m.totalContribution ? `₹${m.totalContribution}` : '₹200';

  const joiningDate = application?.reviewedAt
    ? new Date(application.reviewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : (application?.submittedAt
      ? new Date(application.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—');

  const verificationRemarks =
    application?.verificationRemarks ||
    application?.rejectionReason ||
    (isApproved
      ? 'Statutory membership verified and approved under Nidhi Rules 2014 & Companies Act 2013. 10 equity shares duly allotted.'
      : 'Application under administrative verification.');

  // Document status
  const docs = application?.documentDetails || memberDetails?.documentDetails || {};
  const uploadedDocsList = [
    { name: 'Identity Proof', type: docs.idProofType || 'Aadhaar Card', uploaded: Boolean(docs.idProofUrl || docs.idProof || docs.doc2_govId) },
    { name: 'Address Proof', type: docs.addressProofType || 'Residential Proof', uploaded: Boolean(docs.addressProofUrl || docs.addressProof) },
    { name: 'Photograph', type: 'Passport Photo', uploaded: Boolean(docs.photoUrl || docs.photo || docs.doc1_photo) },
    { name: 'Signature', type: 'Specimen Signature', uploaded: Boolean(docs.signatureUrl || docs.signature) },
    { name: 'Share Contribution Receipt', type: '₹200 Membership QR Fee', uploaded: Boolean(docs.paymentReceiptUrl || isApproved) },
  ];

  const membershipFields = [
    { label: 'Member ID', value: memberId, helper: 'Unique membership number' },
    { label: 'Application ID', value: applicationId, helper: 'Statutory registration ref' },
    { label: 'Membership Type', value: membershipType, helper: 'Ordinary / Associate class' },
    { label: 'Membership Status', value: status, isStatus: true, helper: isApproved ? 'Verified & Approved' : 'Under Review' },
    { label: 'Membership Amount', value: membershipAmount, helper: 'Qualifying contribution' },
    { label: 'Number of Shares', value: numberOfShares, helper: 'Statutory equity units' },
    { label: 'Share Value', value: shareValue, helper: 'Nominal face value per share' },
    { label: 'Processing Fee', value: processingFee, helper: 'Statutory admission fee' },
    { label: 'Total Contribution', value: totalContribution, helper: 'Combined initial allotment' },
    { label: 'Joining Date', value: joiningDate, helper: 'Official enrollment date' },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="My Membership & Statutory Registration"
        description="Official membership dossier, statutory equity share allotment, and verified KYC compliance record."
        badge="STATUTORY LEDGER"
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
          onClick={() => window.print()}
          title="Print official membership record"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Member Record</span>
        </button>
      </MemberPageHeader>

      {/* DOCUMENT CORRECTION REQUEST BANNER IF APPLICABLE */}
      {isCorrectionRequired && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-r-3xl shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-950">
                Administration Requested Document Correction / Resubmission
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                {application?.rejectionReason ||
                  'One or more of your submitted KYC documents require clarification or re-upload. You do not need to register again.'}
              </p>
            </div>
          </div>
          <div className="pl-8 pt-1">
            <Link
              to="/member-dashboard/documents"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Resubmit / Correct Documents</span>
            </Link>
          </div>
        </div>
      )}

      {/* TOP MEMBERSHIP OVERVIEW CARD */}
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              New Utkal Finance Limited Membership
            </h2>
            <p className="text-xs text-blue-200/90 leading-relaxed">
              As a bona fide member, you hold statutory equity shares conferring participatory rights, dividend entitlements, and access to member-exclusive credit schemes under Nidhi Rules 2014 & Companies Act 2013.
            </p>
            {isApproved && (
              <div className="pt-1 flex items-center gap-2 text-xs text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Statutory Membership Verified & Approved — No re-registration required</span>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shrink-0 text-center md:text-right space-y-1.5 self-start md:self-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 block">
              Enrollment Status
            </span>
            <div className="flex items-center justify-center md:justify-end gap-1.5 text-emerald-300 font-black text-base">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active Member</span>
            </div>
            <span className="text-[11px] font-mono text-white/90 block">
              Member ID: <strong>{memberId}</strong>
            </span>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KYC & VERIFICATION REMARKS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Verification Status & Remarks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                KYC Verification Status
              </h3>
              <span className="text-[10px] text-slate-400">
                Branch & Compliance Decision
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Compliance Review:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-[11px]">
                {isApproved ? 'Verified & Approved' : 'In Verification'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Verification Remarks:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {verificationRemarks}
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Uploaded KYC Documents
                </h3>
                <span className="text-[10px] text-slate-400">
                  9-Step Registration Dossier
                </span>
              </div>
            </div>

            <Link
              to="/member-dashboard/kyc-documents"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>View Dossier</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {uploadedDocsList.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50/60 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      doc.uploaded ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span className="font-bold text-slate-800">{doc.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{doc.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 10 STATUTORY REAL FIELDS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Statutory Allotment Particulars
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Form INC-33 / AOA Registry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {membershipFields.map((field, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 hover:bg-slate-50 transition-colors space-y-1"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {field.label}
              </span>
              <div className="pt-0.5">
                {field.isStatus ? (
                  <StatusBadge status={field.value} />
                ) : (
                  <span className="text-base font-black text-slate-900 font-mono tracking-tight block truncate">
                    {field.value}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                {field.helper}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STATUTORY CERTIFICATE & NOMINATION NOTICE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Digital Share Certificate</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upon verification and allotment approval by the Board of Directors, your signed Digital Share Certificate bearing the common corporate seal is preserved in our registry.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nominee Registration</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Statutory nominee particulars submitted during application are preserved under seal and can be verified by visiting your home district branch.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MemberMembership;