import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  CreditCard,
  User,
  Calendar,
  Phone,
  Mail,
  Building2,
  ShieldCheck,
  UserCheck,
  FileText,
  Clock,
  Maximize2
} from 'lucide-react';
import { getBackendAssetUrl } from '../../config/env';
import indusIndQr from '../../assets/image copy 23.png';

export function PaymentReceiptModal({
  isOpen,
  application,
  onClose,
  onApprove,
  onReject,
  isProcessing = false
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Lock background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !application) return null;

  const app = application;
  const statusLower = (app.status || '').toLowerCase();
  const isPending = statusLower === 'pending';
  const isApproved = statusLower === 'approved';

  // Determine receipt URL
  let receiptUrl =
    app.paymentReceiptUrl ||
    app.paymentDetails?.receiptUrl ||
    app.payment?.receiptUrl ||
    app.documentDetails?.paymentReceiptUrl ||
    app.documents?.paymentReceiptUrl;

  if (!receiptUrl && Array.isArray(app.documentDetails?.additionalDocuments)) {
    const found = app.documentDetails.additionalDocuments.find(
      (d) => d.documentType === 'Payment Receipt' || d.documentName?.toLowerCase().includes('payment') || d.documentName?.toLowerCase().includes('receipt')
    );
    if (found) receiptUrl = found.documentUrl;
  }
  if (!receiptUrl && Array.isArray(app.documents?.additionalDocuments)) {
    const found = app.documents.additionalDocuments.find(
      (d) => d.documentType === 'Payment Receipt' || d.documentName?.toLowerCase().includes('payment') || d.documentName?.toLowerCase().includes('receipt')
    );
    if (found) receiptUrl = found.documentUrl;
  }

  const hasReceipt = Boolean(receiptUrl);
  const displayUrl = hasReceipt ? getBackendAssetUrl(receiptUrl) : null;
  const isPdf = typeof displayUrl === 'string' && (displayUrl.toLowerCase().includes('.pdf') || displayUrl.toLowerCase().startsWith('data:application/pdf'));

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-[94vw] max-w-4xl max-h-[90vh] flex flex-col justify-between overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-slate-50/90 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#004085] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <CreditCard className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Payment Receipt Verification
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    isApproved
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isPending
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {isApproved ? 'Approved Member' : isPending ? 'Pending Admin Approval' : app.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Application: <strong className="text-blue-700">{app.id || app.applicationId}</strong> • Applicant:{' '}
                <strong className="text-slate-800">{app.applicantName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (TWO COLUMN: RECEIPT PREVIEW + APPLICANT PAYMENT INFO) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT: PAYMENT RECEIPT IMAGE VIEWER */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Uploaded Payment Screenshot</span>
              </span>

              <div className="flex items-center gap-2">
                {displayUrl && (
                  <>
                    <a
                      href={displayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Open full size in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Full View</span>
                    </a>
                    <a
                      href={displayUrl}
                      download={`Payment_Receipt_${app.id || 'NUF'}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Download receipt file"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* RECEIPT IMAGE CONTAINER */}
            <div className="relative w-full h-[340px] sm:h-[390px] rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden group shadow-inner">
              {displayUrl ? (
                isPdf ? (
                  <object
                    data={`${displayUrl}#toolbar=0&navpanes=0`}
                    type="application/pdf"
                    className="w-full h-full border-0 rounded-2xl bg-white"
                  >
                    <iframe src={displayUrl} title="Receipt PDF" className="w-full h-full border-0 rounded-2xl bg-white" />
                  </object>
                ) : (
                  <div className="w-full h-full p-2.5 flex items-center justify-center bg-slate-950/30">
                    <img
                      src={displayUrl}
                      alt={`Payment Receipt for ${app.applicantName}`}
                      className={`max-w-full max-h-full object-contain rounded-xl bg-white shadow-md transition-transform duration-300 ${
                        isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                      onClick={() => setIsZoomed(!isZoomed)}
                    />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-200">No Payment Screenshot Uploaded</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      The applicant submitted this application without attaching a receipt file.
                    </p>
                  </div>
                </div>
              )}

              {displayUrl && !isPdf && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-white p-2 rounded-xl text-xs backdrop-blur-xs border border-white/20 transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-md"
                  title={isZoomed ? 'Zoom Out' : 'Zoom In'}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium text-center">
              Click image to zoom in/out • Confirm recipient account, amount (₹200), and transaction timestamp.
            </p>
          </div>

          {/* RIGHT: APPLICANT PAYMENT BREAKDOWN & APPROVAL ACTION */}
          <div className="md:col-span-5 space-y-4">
            {/* PAYMENT DETAILS CARD */}
            <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/90 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Payment Verification Breakdown
                </span>
                <span className="text-emerald-700 font-mono font-black text-sm">
                  ₹{app.totalPaid || 200}.00
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Statutory Membership Fee:</span>
                  <span className="font-bold text-slate-800">₹ 200.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Payment Mode:</span>
                  <span className="font-bold text-blue-700 font-mono">{app.paymentMethod || 'UPI (Scan & Pay)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Payment Reference / UTR:</span>
                  <span className="font-bold text-slate-900 font-mono">{app.utrNo || 'UTR346393622063'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Submission Timestamp:</span>
                  <span className="font-semibold text-slate-700">{app.date || 'Today'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assigned Branch:</span>
                  <span className="font-bold text-slate-800">{app.branch || 'Bhubaneswar HQ'}</span>
                </div>
              </div>
            </div>

            {/* APPLICANT IDENTITY SUMMARY */}
            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Applicant KYC Summary
              </span>
              <div className="space-y-1">
                <div className="font-extrabold text-slate-900 text-sm">{app.applicantName}</div>
                <div className="text-slate-600 font-mono text-[11px]">{app.mobile} • {app.email}</div>
                <div className="text-slate-500 text-[11px]">{app.address1}, {app.district}, {app.state}</div>
              </div>
            </div>

            {/* ACTION CALL TO ACTION BOX */}
            <div className="space-y-2 pt-1">
              {isPending ? (
                <div className="space-y-2.5">
                  {/* ROLE SELECTION */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Choose Approval Role
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Selected: <strong className="text-slate-900">{approvalRole === 'associate' ? 'Associate' : 'Member'}</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setApprovalRole('member')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          approvalRole === 'member'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 shrink-0 ${approvalRole === 'member' ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-black">Member</div>
                          <div className="text-[9px] text-slate-400">Regular Member</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setApprovalRole('associate')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          approvalRole === 'associate'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <ShieldCheck className={`w-4 h-4 shrink-0 ${approvalRole === 'associate' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-black">Associate</div>
                          <div className="text-[9px] text-slate-400">Associate Member</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* SINGLE APPROVE BUTTON */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onApprove && onApprove(app, approvalRole)}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                      approvalRole === 'associate'
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : approvalRole === 'associate' ? (
                      <ShieldCheck className="w-4 h-4 text-white" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-white" />
                    )}
                    <span>{approvalRole === 'associate' ? 'Approve as Associate' : 'Approve as Member'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onReject && onReject(app)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject / Request Correction</span>
                  </button>
                </div>
              ) : isApproved ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-900 text-xs font-bold space-y-1">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-extrabold text-sm">Application Already Approved</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Allocated Core Member ID: <span className="font-mono font-black">{app.memberId || 'Active Member'}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-300 rounded-2xl p-3.5 text-slate-700 text-xs font-medium">
                  Current Status: <strong className="uppercase">{app.status}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nidhi Statutory Member Clearance Portal</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PaymentReceiptModal;
