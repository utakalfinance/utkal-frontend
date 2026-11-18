import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  PlusCircle,
  CreditCard,
  Layers,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Upload,
  AlertCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  getInvestmentPlansApi,
  createAdditionalInvestmentApi,
} from '../../../services/investorService';

export function AddAdditionalInvestmentModal({ isOpen, onClose, investor, onSuccess }) {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    investmentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'UPI',
    utrNumber: '',
    paymentStatus: 'Pending',
    adminRemarks: '',

    // Plan & Contract Terms
    planCode: '',
    planName: '',
    multiplier: 2,
    contractualPercentage: 100,
    percentageBasis: 'Total Contractual Percentage',
    durationMonths: 24,
    assignedDate: new Date().toISOString().split('T')[0],
    agreementStatus: 'Draft',
  });

  // Files & Previews
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [agreementFile, setAgreementFile] = useState(null);
  const [agreementFileName, setAgreementFileName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load available approved investment plans
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoadingPlans(true);
      getInvestmentPlansApi()
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setPlans(list);
          const firstApproved = list.find((p) => p.status === 'Approved' && !p.is2x3xStructure);
          if (firstApproved) {
            setFormData((prev) => ({
              ...prev,
              planCode: firstApproved.planCode,
              planName: firstApproved.name,
              multiplier: firstApproved.multiplier || 2,
              contractualPercentage: firstApproved.approvedPercentage ?? 100,
              percentageBasis: firstApproved.percentageBasis || 'Total Contractual Percentage',
              durationMonths: firstApproved.durationMonths || 24,
            }));
          }
        })
        .catch((err) => console.warn('Could not load plans:', err))
        .finally(() => setLoadingPlans(false));
    }
  }, [isOpen]);

  if (!isOpen || !investor) return null;

  // Plan Selection Handler
  const handlePlanChange = (code) => {
    const plan = plans.find((p) => p.planCode === code);
    if (plan) {
      setFormData((prev) => ({
        ...prev,
        planCode: plan.planCode,
        planName: plan.name,
        multiplier: plan.multiplier || 2,
        contractualPercentage: plan.approvedPercentage ?? 100,
        percentageBasis: plan.percentageBasis || 'Total Contractual Percentage',
        durationMonths: plan.durationMonths || 24,
      }));
    } else {
      setFormData((prev) => ({ ...prev, planCode: code }));
    }
  };

  // Receipt File Selection
  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      if (file.type.startsWith('image/')) {
        setReceiptPreview(URL.createObjectURL(file));
      } else {
        setReceiptPreview(null);
      }
    }
  };

  // Agreement File Selection
  const handleAgreementChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAgreementFile(file);
      setAgreementFileName(file.name);
    }
  };

  // Live Calculations
  const numAmount = Number(formData.amount || 0);
  const numMultiplier = Number(formData.multiplier || 2);
  const numDuration = Number(formData.durationMonths || 24);
  const targetAmount = Math.round(numAmount * numMultiplier);

  const calculatedMaturityDate = (() => {
    if (!formData.assignedDate) return 'N/A';
    const d = new Date(formData.assignedDate);
    if (isNaN(d.getTime())) return 'N/A';
    d.setMonth(d.getMonth() + numDuration);
    return d.toISOString().split('T')[0];
  })();

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid investment amount greater than ₹0.');
      return;
    }

    if (!formData.utrNumber.trim()) {
      setError('Transaction Reference / UTR Number is required for auditing.');
      return;
    }

    if (!formData.planCode) {
      setError('Please select an authorized investment plan.');
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append('amount', numAmount);
      data.append('investmentDate', formData.investmentDate);
      data.append('paymentMode', formData.paymentMode);
      data.append('utrNumber', formData.utrNumber.trim());
      data.append('paymentStatus', formData.paymentStatus);
      data.append('adminRemarks', formData.adminRemarks.trim());

      data.append('planCode', formData.planCode);
      data.append('planName', formData.planName);
      data.append('multiplier', numMultiplier);
      data.append('contractualPercentage', formData.contractualPercentage);
      data.append('percentageBasis', formData.percentageBasis);
      data.append('durationMonths', numDuration);
      data.append('assignedDate', formData.assignedDate);
      data.append('maturityDate', calculatedMaturityDate !== 'N/A' ? calculatedMaturityDate : '');
      data.append('agreementStatus', agreementFile ? 'Executed' : formData.agreementStatus);

      if (receiptFile) {
        data.append('receipt', receiptFile);
      }
      if (agreementFile) {
        data.append('agreementFile', agreementFile);
      }

      await createAdditionalInvestmentApi(investor._id, data);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Additional investment creation error:', err);
      setError(err.message || 'Failed to record additional investment.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
              <PlusCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Add Additional Investment</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200">
                  Repeat Capital
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Allot new investment contract for {investor.fullName} under Investor ID {investor.investorId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Reused KYC & Profile Confirmation (Read-Only) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Reused Verified Profile & KYC</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                KYC: {investor.kycStatus || 'Verified'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Investor ID</span>
                <span className="font-mono font-bold text-slate-900">{investor.investorId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                <span className="font-bold text-slate-900 truncate block">{investor.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile</span>
                <span className="font-mono text-slate-700">{investor.mobile}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">District</span>
                <span className="font-medium text-slate-700">{investor.district}, {investor.state || 'Odisha'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Investment Amount & Payment Details */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Investment Payment Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Amount */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Investment Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden text-sm"
                  />
                </div>
              </div>

              {/* Investment Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Investment Date</label>
                <input
                  type="date"
                  required
                  value={formData.investmentDate}
                  onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS)</option>
                  <option value="NEFT/RTGS">NEFT / RTGS</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Cash">Cash Deposit</option>
                  <option value="Other">Other Bank Gateway</option>
                </select>
              </div>

              {/* Transaction ID / UTR */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transaction ID / UTR Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 423589102431"
                  value={formData.utrNumber}
                  onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
                />
              </div>

              {/* Payment Verification Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Verification Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                >
                  <option value="Pending">Pending Verification (Bank Audit Required)</option>
                  <option value="Verified">Verified (Credit Immediately to Ledger & Activate 2X)</option>
                </select>
              </div>

              {/* Payment Receipt Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Receipt / Screenshot</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {receiptPreview && (
                  <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                    <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Admin Remarks */}
            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Admin Remarks / Audit Note</label>
              <input
                type="text"
                placeholder="Optional administrative or accounting notes..."
                value={formData.adminRemarks}
                onChange={(e) => setFormData({ ...formData, adminRemarks: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
          </div>

          {/* Section 3: Approved Plan Assignment & Contract Terms */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Investment Plan Assignment & Contract Terms
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Multiplier */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Investment Multiplier</label>
                <select
                  value={formData.multiplier}
                  onChange={(e) => setFormData({ ...formData, multiplier: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                >
                  <option value="1">1X (Standard Principal Only)</option>
                  <option value="1.5">1.5X Growth Plan</option>
                  <option value="2">2X Contractual Payout (Default)</option>
                  <option value="3">3X Plan (Subject to Compliance Approval)</option>
                </select>
              </div>

              {/* Duration in Months */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Duration (Months)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>

              {/* Plan Assignment Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Assignment Date</label>
                <input
                  type="date"
                  value={formData.assignedDate}
                  onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              {/* Calculated Maturity Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Maturity Date <span className="text-[10px] text-blue-600 font-normal">(Auto-calculated)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={calculatedMaturityDate}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 cursor-not-allowed"
                />
              </div>

              {/* Signed Agreement Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Signed Agreement Document</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleAgreementChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {agreementFileName && (
                  <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                    ✓ Attached: {agreementFileName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Live 2X Target & Reference Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-700" />
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                Dedicated 2X Contract Calculation Summary
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-indigo-600 block text-[10px] font-bold uppercase">Investment Amount</span>
                <span className="text-base font-black text-slate-900">
                  ₹{numAmount ? numAmount.toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <div>
                <span className="text-indigo-600 block text-[10px] font-bold uppercase">Contractual Multiplier</span>
                <span className="text-base font-black text-indigo-700">{numMultiplier}X</span>
              </div>
              <div>
                <span className="text-indigo-600 block text-[10px] font-bold uppercase">Contractual Target</span>
                <span className="text-base font-black text-emerald-700">
                  ₹{targetAmount ? targetAmount.toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <div>
                <span className="text-indigo-600 block text-[10px] font-bold uppercase">Tenure Maturity</span>
                <span className="text-xs font-bold text-slate-800">
                  {numDuration}M ({calculatedMaturityDate})
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 pt-1 border-t border-indigo-200/50">
              * A unique sequential Investment Reference ID (e.g. {investor.investorId}-02) will be generated. This contract will maintain separate 2X ledger tracking, independent maturity date, and discrete payout calculation without commingling with prior investments.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              <span>{submitting ? 'Recording Investment...' : 'Save Additional Investment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default AddAdditionalInvestmentModal;

