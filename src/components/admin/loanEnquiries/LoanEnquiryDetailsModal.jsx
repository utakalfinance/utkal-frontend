import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  XCircle,
  AlertTriangle,
  Send,
  Save,
  Info,
  History,
  Copy,
  Check,
} from 'lucide-react';
import { updateLoanEnquiryStatusApi } from '../../../services/loanEnquiryService';

function formatDate(dateVal) {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return String(dateVal);
  }
}

export function LoanEnquiryDetailsModal({ isOpen, onClose, enquiry, onEnquiryUpdated }) {
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  useEffect(() => {
    if (enquiry) {
      setRemarks(enquiry.adminRemarks || '');
      setErrorMessage('');
      setShowCloseConfirm(false);
    }
  }, [enquiry]);

  if (!isOpen || !enquiry) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    setErrorMessage('');
    try {
      const res = await updateLoanEnquiryStatusApi(enquiry.enquiryId || enquiry._id, {
        status: newStatus,
        adminRemarks: remarks,
      });

      if (onEnquiryUpdated && res.enquiry) {
        onEnquiryUpdated(res.enquiry);
      }
      setShowCloseConfirm(false);
    } catch (err) {
      console.error('Failed to update enquiry:', err);
      setErrorMessage(err.message || 'Failed to update enquiry status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveRemarksOnly = async () => {
    setIsUpdating(true);
    setErrorMessage('');
    try {
      const res = await updateLoanEnquiryStatusApi(enquiry.enquiryId || enquiry._id, {
        adminRemarks: remarks,
      });

      if (onEnquiryUpdated && res.enquiry) {
        onEnquiryUpdated(res.enquiry);
      }
    } catch (err) {
      console.error('Failed to save remarks:', err);
      setErrorMessage(err.message || 'Failed to save admin remarks');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = enquiry.status || 'New';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-black font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              {enquiry.enquiryId}
            </span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                currentStatus === 'New'
                  ? 'bg-amber-100 text-amber-800'
                  : currentStatus === 'Contacted'
                  ? 'bg-purple-100 text-purple-800'
                  : currentStatus === 'Membership Registration Informed'
                  ? 'bg-blue-100 text-blue-800'
                  : currentStatus === 'Converted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Status: {currentStatus}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Loan Enquiry Details
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Submitted via public website on {formatDate(enquiry.submittedAt || enquiry.createdAt)}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Customer Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Customer Name */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Customer Full Name
            </span>
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">
                {enquiry.fullName}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(enquiry.fullName, 'name')}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Copy name"
              >
                {copiedField === 'name' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Contact Mobile
            </span>
            <div className="flex items-center justify-between">
              <a
                href={`tel:${enquiry.mobileNumber}`}
                className="text-base font-mono font-bold text-blue-700 hover:underline flex items-center gap-1.5"
                title="Click to dial"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span>+91 {enquiry.mobileNumber}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(enquiry.mobileNumber, 'phone')}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Copy mobile"
              >
                {copiedField === 'phone' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Email Address */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Email Address
            </span>
            <div className="flex items-center justify-between">
              <a
                href={`mailto:${enquiry.email}`}
                className="text-sm font-semibold text-slate-800 hover:text-blue-600 hover:underline flex items-center gap-1.5 truncate max-w-[220px]"
                title="Click to send email"
              >
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{enquiry.email}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(enquiry.email, 'email')}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Copy email"
              >
                {copiedField === 'email' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submission Timestamp */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Submission Date &amp; Time
            </span>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{formatDate(enquiry.submittedAt || enquiry.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Statutory Membership Guidance Strip */}
        <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl mb-6 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Statutory Nidhi Protocol Reminder</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-800">
            Explain to the customer that credit facilities are strictly available to registered associate members. Guide them to complete the <strong>9-step registration</strong> with ₹200 contribution. Formal loan selection and appraisal will occur inside their Member Dashboard after approval.
          </p>
        </div>

        {/* Admin Remarks Section */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Admin Remarks &amp; Contact Notes
            </label>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleSaveRemarksOnly}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Remarks</span>
            </button>
          </div>
          <textarea
            rows={3}
            placeholder="Add notes about phone conversation with applicant, loan interest preference, follow-up schedule, or membership registration status..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* History Audit Trail (if present) */}
        {enquiry.history && enquiry.history.length > 0 && (
          <div className="mb-6 space-y-2 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit History</span>
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {enquiry.history.map((h, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-slate-800">{h.status}</span>
                    {h.remarks && (
                      <p className="text-slate-500 text-[10px] mt-0.5">{h.remarks}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatDate(h.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Enquiry Confirmation View */}
        {showCloseConfirm ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Confirm Closing This Enquiry</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              Are you sure you want to mark this enquiry as <strong>Closed</strong>? This indicates no further follow-up is planned.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('Closed')}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Closing...' : 'Confirm & Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Admin Action Buttons */
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Update Status / Actions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Action 1: Mark as Contacted */}
              <button
                type="button"
                disabled={isUpdating || currentStatus === 'Contacted'}
                onClick={() => handleUpdateStatus('Contacted')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentStatus === 'Contacted'
                    ? 'bg-purple-100 border-purple-300 text-purple-800 cursor-default'
                    : 'bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-300'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Mark as Contacted</span>
              </button>

              {/* Action 2: Membership Registration Informed */}
              <button
                type="button"
                disabled={isUpdating || currentStatus === 'Membership Registration Informed'}
                onClick={() => handleUpdateStatus('Membership Registration Informed')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentStatus === 'Membership Registration Informed'
                    ? 'bg-blue-100 border-blue-300 text-blue-800 cursor-default'
                    : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Membership Informed</span>
              </button>

              {/* Action 3: Mark as Converted */}
              <button
                type="button"
                disabled={isUpdating || currentStatus === 'Converted'}
                onClick={() => handleUpdateStatus('Converted')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentStatus === 'Converted'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 cursor-default'
                    : 'bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-300'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mark as Converted</span>
              </button>

              {/* Action 4: Close Enquiry */}
              <button
                type="button"
                disabled={isUpdating || currentStatus === 'Closed'}
                onClick={() => setShowCloseConfirm(true)}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentStatus === 'Closed'
                    ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-default'
                    : 'bg-white hover:bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-300'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Close Enquiry</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanEnquiryDetailsModal;
