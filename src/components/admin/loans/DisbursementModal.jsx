import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Calendar,
  CreditCard,
  Building2,
  User,
  Hash,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { superAdminDisburseLoanApi } from '../../../services/superAdminLoanService';

export function DisbursementModal({ isOpen, onClose, loan, onSuccess }) {
  if (!isOpen || !loan) return null;

  // Format today as YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [disbursementDate, setDisbursementDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT/RTGS/IMPS)');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (loan) {
      setDisbursementDate(getTodayString());
      setPaymentMethod('Bank Transfer (NEFT/RTGS/IMPS)');
      setTransactionId('');
      setRemarks('');
      setErrorMsg(null);
    }
  }, [loan]);

  const customerName = loan.customerName || loan.applicantName || 'Valued Member';
  const applicationId = loan.applicationId || '—';
  const customerId = loan.customerId || loan.memberId || '—';
  const district = loan.district || 'Khurda';
  const approvedAmount = Number(
    loan.approvedAmount || loan.sanctionedAmount || loan.requestedAmount || 10000
  );
  const tenure = loan.tenure || `${loan.tenureMonths || loan.preferredTenureMonths || 3} Months`;
  const interestRate = loan.interestRate || 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!transactionId || !transactionId.trim()) {
      setErrorMsg('Transaction ID / UTR number is required to confirm disbursement.');
      return;
    }

    if (!disbursementDate) {
      setErrorMsg('Please select a valid disbursement date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        disbursementDate,
        paymentMethod,
        transactionId: transactionId.trim(),
        remarks: remarks.trim(),
      };

      const result = await superAdminDisburseLoanApi(loan._id || loan.applicationId, payload);
      if (onSuccess) {
        onSuccess(result.message || `Loan ${applicationId} disbursed successfully!`);
      }
      onClose();
    } catch (err) {
      console.error('Disbursement submission error:', err);
      setErrorMsg(err.message || 'Failed to record loan disbursement. Please verify transaction details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={submitting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fade-in my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Statutory Loan Disbursement
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {applicationId}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                  Record Loan Disbursement
                </h2>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-bold leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* READ-ONLY APPLICATION DETAILS CARD */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Approved Credit Facility Overview (Read-Only)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Approved by Super Admin
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Customer Name
                </span>
                <span className="text-sm font-black text-slate-900 block truncate">
                  {customerName}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Customer / Member ID
                </span>
                <span className="text-sm font-black text-blue-700 font-mono block">
                  {customerId}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  District
                </span>
                <span className="text-sm font-bold text-slate-800 block">
                  {district}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Approved Amount
                </span>
                <span className="text-base font-black text-emerald-700 block">
                  ₹{approvedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Loan Tenure
                </span>
                <span className="text-sm font-black text-slate-900 block">
                  {tenure}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Interest Rate
                </span>
                <span className="text-sm font-black text-indigo-700 block">
                  {interestRate}% p.a. Fixed
                </span>
              </div>
            </div>
          </div>

          {/* DISBURSEMENT TRANSACTION INPUTS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" /> Transaction & Payment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Disbursement Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Disbursement Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={disbursementDate}
                    onChange={(e) => setDisbursementDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Date on which funds were credited to customer's account.
                </span>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Bank Transfer (NEFT/RTGS/IMPS)">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="Cheque">Account Payee Cheque</option>
                  <option value="Cash / Cash Order">Cash / Cash Order</option>
                  <option value="Other">Other Electronic Transfer</option>
                </select>
                <span className="text-[10px] text-slate-500 block">
                  Corporate banking channel used for fund transfer.
                </span>
              </div>
            </div>

            {/* Transaction ID / UTR Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Transaction ID / UTR Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. UTRIB20260421099881 or CMS299104"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:font-normal placeholder:normal-case placeholder:text-slate-400"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Unique bank reference or UTR number. Prevents duplicate disbursement records.
              </span>
            </div>

            {/* Remarks (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Remarks <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes regarding the disbursement, payment portal, bank branch..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* CONFIRMATION MANDATORY NOTICE BOX */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-extrabold text-amber-900 tracking-tight">
                Mandatory Operational Confirmation
              </h4>
              <p className="text-amber-800 leading-relaxed font-medium">
                "Please confirm that the loan amount has been successfully transferred to the customer's bank account before recording this disbursement."
              </p>
              <p className="text-[11px] text-amber-700/90 font-medium">
                Once confirmed, the loan status will update to <strong>Active</strong> and immediately reflect in the customer's portal under <strong>My Active Loans</strong>.
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recording Disbursement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Disbursement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DisbursementModal;
