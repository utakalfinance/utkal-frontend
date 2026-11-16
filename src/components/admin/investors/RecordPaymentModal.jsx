import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Upload, AlertCircle } from 'lucide-react';
import { recordPaymentApi } from '../../../services/investorService';

export function RecordPaymentModal({ isOpen, onClose, investor, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !investor) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid investment amount.');
      return;
    }
    if (!utrNumber.trim()) {
      setError('Please provide the UTR / Transaction Reference number.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('amount', amount);
      data.append('paymentDate', paymentDate);
      data.append('paymentMethod', paymentMethod);
      data.append('utrNumber', utrNumber.trim());
      data.append('adminRemarks', adminRemarks.trim());
      if (receiptFile) {
        data.append('receipt', receiptFile);
      }

      await recordPaymentApi(investor._id, data);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError(err.message || 'Unable to record payment.');
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
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Record Additional Payment</h3>
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
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
            <strong>Security Notice:</strong> Payment recorded will be placed in <strong>Pending Verification</strong> status. It will only be credited to the investor ledger upon explicit admin verification.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-emerald-700 focus:bg-white focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash Receipt</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                UTR / Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 5218392019"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receipt / Transfer Screenshot Upload
            </label>
            <div className="p-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {preview ? (
                  <img src={preview} alt="Receipt" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                )}
                <span className="text-xs text-slate-600 truncate max-w-[200px]">
                  {receiptFile ? receiptFile.name : 'Select payment screenshot'}
                </span>
              </div>
              <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                Browse
                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Remarks</label>
            <input
              type="text"
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="e.g. Additional share capital receipt"
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default RecordPaymentModal;

