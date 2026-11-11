import React from 'react';
import {
  X,
  CreditCard,
  Building2,
  User,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Hash,
  Phone,
  Mail,
  HelpCircle,
} from 'lucide-react';

export function DisbursementDetailsModal({ isOpen, onClose, loan, onDisburseClick }) {
  if (!isOpen || !loan) return null;

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

  const isDisbursed =
    loan.status === 'Active' ||
    loan.status === 'Disbursed' ||
    Boolean(loan.disbursementDate) ||
    Boolean(loan.disbursement?.isDisbursed);

  const customerName = loan.customerName || loan.applicantName || 'Valued Member';
  const applicationId = loan.applicationId || '—';
  const customerId = loan.customerId || loan.memberId || '—';
  const district = loan.district || 'Khurda';
  const approvedAmount = Number(
    loan.approvedAmount || loan.sanctionedAmount || loan.requestedAmount || 10000
  );
  const disbursedAmount = Number(loan.disbursedAmount || approvedAmount);
  const tenure = loan.tenure || `${loan.tenureMonths || loan.preferredTenureMonths || 3} Months`;
  const interestRate = loan.interestRate || 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fade-in my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      isDisbursed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isDisbursed ? 'Active (Disbursed)' : 'Approved – Not Disbursed'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {applicationId}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                  Credit Facility Dossier
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* APPLICANT CARD */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> Borrower & Membership Identity
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                {customerId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Customer Name</span>
                <span className="text-sm font-black text-slate-900 block truncate">{customerName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">District</span>
                <span className="text-sm font-bold text-slate-800 block">{district}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Facility Type</span>
                <span className="text-sm font-bold text-slate-800 block">{loan.loanType || 'Statutory Credit'}</span>
              </div>
              {loan.mobile && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Contact Mobile</span>
                  <span className="text-xs font-semibold text-slate-800 block font-mono">{loan.mobile}</span>
                </div>
              )}
              {loan.email && (
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
                  <span className="text-xs font-semibold text-slate-800 block truncate">{loan.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* LOAN FINANCIAL SUMMARY */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" /> Sanction & Terms
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Approved by Super Admin
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                  {isDisbursed ? 'Disbursed Capital' : 'Approved Sanction'}
                </span>
                <span className="text-base font-black text-emerald-900">
                  ₹{(isDisbursed ? disbursedAmount : approvedAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Tenure</span>
                <span className="text-sm font-black text-slate-800">{tenure}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Interest Rate</span>
                <span className="text-sm font-black text-indigo-700">{interestRate}% p.a. Fixed</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Approval Date</span>
                <span className="text-sm font-bold text-slate-800">{formatDate(loan.approvalDate)}</span>
              </div>
            </div>
          </div>

          {/* DISBURSEMENT METADATA (IF DISBURSED) */}
          {isDisbursed ? (
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" /> Recorded Disbursement Details
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Disbursement Date</span>
                  <span className="text-sm font-black text-slate-900 block">{formatDate(loan.disbursementDate)}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Payment Method</span>
                  <span className="text-sm font-bold text-slate-900 block">{loan.paymentMethod || 'Bank Transfer'}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Transaction ID / UTR Number</span>
                  <span className="text-sm font-black font-mono text-blue-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 block mt-0.5 select-all">
                    {loan.transactionId || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Disbursed By</span>
                  <span className="text-xs font-semibold text-slate-800 block">{loan.disbursedBy || 'Super Admin'}</span>
                </div>

                {loan.remarks && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Administrative Remarks</span>
                    <span className="text-xs text-slate-700 italic block mt-0.5 bg-white/70 p-2.5 rounded-xl border border-slate-200">
                      "{loan.remarks}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm">Awaiting Fund Transfer</p>
                <p className="text-amber-800 font-medium mt-0.5">
                  This loan is approved for <strong>₹{approvedAmount.toLocaleString('en-IN')}</strong> and is awaiting transfer to the customer's bank account.
                </p>
              </div>
            </div>
          )}

          {/* MODAL FOOTER ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            {!isDisbursed && onDisburseClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDisburseClick(loan);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" /> Disburse Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisbursementDetailsModal;
