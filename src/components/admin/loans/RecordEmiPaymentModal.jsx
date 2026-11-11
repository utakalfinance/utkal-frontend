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
  ShieldCheck,
  Receipt,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { superAdminCollectEmiPaymentApi } from '../../../services/superAdminLoanService';

export function RecordEmiPaymentModal({ isOpen, onClose, installment, onSuccess }) {
  if (!isOpen || !installment) return null;

  // Format today as YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [paymentDate, setPaymentDate] = useState(getTodayString());
  const [collectedAmount, setCollectedAmount] = useState(
    installment.emiAmount || 3500
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (installment) {
      setPaymentDate(getTodayString());
      setCollectedAmount(installment.emiAmount || 3500);
      setPaymentMethod('UPI');
      setTransactionId('');
      setRemarks('');
      setErrorMsg(null);
    }
  }, [installment]);

  const customerName = installment.customerName || 'Valued Member';
  const applicationId = installment.applicationId || '—';
  const customerId = installment.customerId || installment.memberId || '—';
  const district = installment.district || 'Khurda';
  const instalmentNumber = installment.instalmentNumber || 1;
  const dueDate = installment.dueDate
    ? new Date(installment.dueDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const isOverdue = installment.paymentStatus === 'Overdue';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const amt = Number(collectedAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Please enter a valid collected amount greater than ₹0.');
      return;
    }

    if (!transactionId || !transactionId.trim()) {
      setErrorMsg('Transaction ID / UTR reference number is required to confirm EMI collection.');
      return;
    }

    if (!paymentDate) {
      setErrorMsg('Please select a valid payment date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        applicationId: installment.applicationId || installment.loanDbId,
        instalmentNumber,
        collectedAmount: amt,
        paymentDate,
        paymentMethod: paymentMethod.trim(),
        transactionId: transactionId.trim(),
        remarks: remarks.trim(),
      };

      const res = await superAdminCollectEmiPaymentApi(payload);
      if (onSuccess) {
        onSuccess(
          res.message ||
            `Installment #${instalmentNumber} collection of ₹${amt.toLocaleString('en-IN')} recorded successfully!`
        );
      }
      onClose();
    } catch (err) {
      console.error('EMI collection submission error:', err);
      setErrorMsg(
        err.message ||
          'Failed to record EMI payment. Please verify transaction details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <Receipt className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Record EMI Collection</h3>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  Instalment #{instalmentNumber}
                </span>
                {isOverdue && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    OVERDUE
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Utkal Finance Statutory Member Credit Facility Repayment Desk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Read-Only Loan & Customer Details Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Loan & Customer Context (Read-Only)
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                District: {district}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Customer Name</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {customerName}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Application ID</span>
                <span className="font-mono font-semibold text-slate-800">
                  {applicationId}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Customer / Member ID</span>
                <span className="font-mono text-slate-700">{customerId}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Scheduled Due Date</span>
                <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                  {dueDate}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Scheduled EMI</span>
                <span className="font-bold text-emerald-700 text-base">
                  ₹{Number(installment.emiAmount || 3500).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Principal / Interest</span>
                <span className="text-xs text-slate-600">
                  ₹{Number(installment.principalComponent || 0).toLocaleString('en-IN')} / ₹{Number(installment.interestComponent || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs text-rose-900">Collection Validation Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Collected Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Collected Amount (₹) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={collectedAmount}
                  onChange={(e) => setCollectedAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Scheduled installment amount: ₹{Number(installment.emiAmount || 3500).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Collection Date <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  max={getTodayString()}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Date when funds were credited</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method <span className="text-rose-600">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="UPI">UPI (QR / VPA)</option>
                <option value="Bank Transfer (NEFT/RTGS/IMPS)">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="Cash / Cash Counter">Cash / Cash Counter Collection</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other Verified Method</option>
              </select>
            </div>

            {/* Transaction ID / UTR Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Transaction ID / Bank UTR Number <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 20261103001234 or UTR-INDUS-889"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Must be unique. Duplicate UTR references will be rejected.
              </p>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Collection Remarks / Verification Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Verified via IndusInd bank statement, credited on counter ledger, or branch collection note"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Mandatory Statutory Confirmation Notice */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Statutory Verification Notice:</p>
              <p className="mt-0.5 leading-relaxed text-amber-800">
                Please confirm that the EMI amount has been successfully received and verified in the
                Utkal Finance bank account or authorized branch counter before recording this collection.
                Recording this payment updates the remaining loan balance and customer ledger.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Recording Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Record EMI Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

