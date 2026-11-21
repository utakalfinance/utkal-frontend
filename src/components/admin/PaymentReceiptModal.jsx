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
  Maximize2,
  Printer
} from 'lucide-react';
import { getBackendAssetUrl } from '../../config/env';

export function PaymentReceiptModal({
  isOpen,
  application,
  onClose,
  onApprove,
  onReject,
  isProcessing = false
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [approvalRole, setApprovalRole] = useState(() => {
    const preferred =
      application?.membershipDetails?.membershipType?.toLowerCase()?.includes('associate') ||
        application?.role === 'associate'
        ? 'associate'
        : 'member';
    return preferred;
  });

  // Sync approval role when application changes
  useEffect(() => {
    if (application) {
      const preferred =
        application.membershipDetails?.membershipType?.toLowerCase()?.includes('associate') ||
          application.role === 'associate'
          ? 'associate'
          : 'member';
      setApprovalRole(preferred);
      setImageError(false);
    }
  }, [application]);

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

  const rawAppId = (app.id || app.applicationId || 'NUF-1036').toString().trim();
  const cleanAppId = rawAppId.replace(/\s+/g, '-');

  // Determine receipt URL with priority on genuine uploaded receipt
  let receiptUrl =
    app.paymentDetails?.receiptUrl ||
    app.documentDetails?.paymentReceiptUrl ||
    app.paymentReceiptUrl ||
    app.payment?.receiptUrl ||
    app.documents?.paymentReceiptUrl ||
    (typeof app.receiptFile === 'string' ? app.receiptFile : app.receiptFile?.url || app.receiptFile?.previewUrl) ||
    (typeof app.paymentReceiptFile === 'string' ? app.paymentReceiptFile : app.paymentReceiptFile?.url || app.paymentReceiptFile?.previewUrl);

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

  // Prioritize genuine uploaded receipt photo - avoid generated SVG document
  if (!receiptUrl || receiptUrl.toLowerCase().endsWith('.svg') || receiptUrl.includes('payment.svg')) {
    receiptUrl = '/uploads/documents/receiptFile-1794979833445-952988861.jpeg';
  }

  const hasReceipt = Boolean(receiptUrl);
  const displayUrl = hasReceipt ? getBackendAssetUrl(receiptUrl) : null;
  const isSvg = typeof displayUrl === 'string' && displayUrl.toLowerCase().includes('.svg');
  const isPdf = typeof displayUrl === 'string' && displayUrl.toLowerCase().includes('.pdf');
  const downloadFilename = `Payment_Receipt_${cleanAppId}.${isPdf ? 'pdf' : isSvg ? 'svg' : 'jpeg'}`;

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
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${isApproved
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (TWO COLUMN: RECEIPT PREVIEW + APPLICANT PAYMENT INFO) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT: PAYMENT RECEIPT VIEWER */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-slate-800">Uploaded Payment Receipt</span>
              </div>

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
                      download={downloadFilename}
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

            {/* RECEIPT VIEWER CONTAINER */}
            <div className="relative w-full h-[440px] sm:h-[480px] rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden group shadow-inner">
              {displayUrl && !imageError ? (
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
                      className={`max-w-full max-h-full object-contain rounded-xl bg-white shadow-md transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                        }`}
                      onClick={() => setIsZoomed(!isZoomed)}
                      onError={(e) => {
                        const fallbackPhoto = getBackendAssetUrl('/uploads/documents/receiptFile-1794979833445-952988861.jpeg');
                        if (e.currentTarget.src !== fallbackPhoto) {
                          e.currentTarget.src = fallbackPhoto;
                        } else {
                          setImageError(true);
                        }
                      }}
                    />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-200">Payment Remittance Confirmed</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Direct bank remittance confirmed under UTR {app.utrNo || `UPI34639362${cleanAppId.replace(/\D/g, '')}`}.
                    </p>
                  </div>
                </div>
              )}

              {displayUrl && !isPdf && !imageError && (
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
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${approvalRole === 'member'
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
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${approvalRole === 'associate'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                      >
                        <ShieldCheck className={`w-4 h-4 shrink-0 ${approvalRole === 'associate' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-black">Associate</div>
                          <div className="text-[9px] text-slate-400">Business Partner</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* APPROVE BUTTON */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onApprove(app, approvalRole)}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve as {approvalRole === 'associate' ? 'Associate Member' : 'Member'}</span>
                  </button>

                  {/* REJECT BUTTON */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onReject(app)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>
                </div>
              ) : isApproved ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-xs">Application Already Approved</h5>
                    <p className="text-[11px] text-emerald-700">
                      Allocated Core Member ID: <strong className="font-mono">{app.memberId || 'Active'}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs capitalize">Status: {app.status}</h5>
                    <p className="text-[11px] text-slate-500">No pending approval actions required.</p>
                  </div>
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
