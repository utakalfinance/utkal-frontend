import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowDownRight, AlertCircle } from 'lucide-react';
import { recordPayoutOrRefundApi } from '../../../services/investorService';

export function RecordPayoutModal({ isOpen, onClose, investor, currentBalance = 0, onSuccess }) {
  const [category, setCategory] = useState('Payout'); // 'Payout' or 'Refund'
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT/IMPS)');
  const [reference, setReference] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !investor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid positive payout amount.');
      return;
    }

    if (numAmount > currentBalance) {
      setError(`Payout amount (₹${numAmount}) exceeds the investor's current verified balance of ₹${currentBalance}.`);
      return;
    }

    try {
      setSubmitting(true);
      await recordPayoutOrRefundApi(investor._id, {
        category,
        amount: numAmount,
        paymentMethod,
        reference: reference.trim(),
        adminRemarks: adminRemarks.trim(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to record payout:', err);
      setError(err.message || 'Unable to record payout.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-400/40 flex items-center justify-center text-rose-200">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Record Authorized Payout / Refund</h3>
              <p className="text-[11px] text-blue-200 font-mono">
                {investor.fullName} ({investor.investorId})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">Current Verified Ledger Balance:</span>
            <span className="font-black text-emerald-700 text-sm">
              ₹{Number(currentBalance || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Payout">Authorized Payout</option>
                <option value="Refund">Statutory Refund</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Disbursement Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={currentBalance || undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-rose-700 focus:bg-white focus:outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank UTR / Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. UTR-NEFT-928192"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Target Bank Card */}
          {investor.bankDetails?.accountNumber && (
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
              <span className="font-bold text-blue-900 block">Beneficiary Settlement Account:</span>
              <p className="text-slate-700 font-mono">
                {investor.bankDetails.bankName || 'Bank'} • A/C: {investor.bankDetails.accountNumber} • IFSC:{' '}
                {investor.bankDetails.ifscCode}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Remarks</label>
            <input
              type="text"
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="e.g. Interim payout disbursed under agreement terms"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Authorize & Disburse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default RecordPayoutModal;

