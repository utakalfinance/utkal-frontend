import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, AlertCircle, ShieldCheck, TrendingUp, Lock } from 'lucide-react';
import { getInvestmentPlansApi, assignPlanApi } from '../../../services/investorService';

export function AssignPlanModal({ isOpen, onClose, investor, onSuccess }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState('');
  const [multiplier, setMultiplier] = useState(2);
  const [contractualPercentage, setContractualPercentage] = useState(100);
  const [percentageBasis, setPercentageBasis] = useState('Total Contractual Percentage');
  const [customDurationMonths, setCustomDurationMonths] = useState('');
  const [planAssignmentDate, setPlanAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [agreementStatus, setAgreementStatus] = useState('Draft');
  const [planActivationStatus, setPlanActivationStatus] = useState('Pending');
  const [auditReason, setAuditReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getInvestmentPlansApi()
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setPlans(list);
          const currentCode = investor?.assignedPlan?.planCode;
          if (currentCode) {
            setSelectedPlanCode(currentCode);
            setMultiplier(investor.assignedPlan.multiplier || 2);
            setContractualPercentage(investor.assignedPlan.contractualPercentage ?? 100);
            setPercentageBasis(investor.assignedPlan.percentageBasis || 'Total Contractual Percentage');
            setCustomDurationMonths(investor.assignedPlan.durationMonths || '');
            if (investor.assignedPlan.assignedDate) {
              setPlanAssignmentDate(investor.assignedPlan.assignedDate.split('T')[0]);
            }
            setAgreementStatus(investor.assignedPlan.agreementStatus || 'Draft');
            setPlanActivationStatus(investor.assignedPlan.status || 'Pending');
          } else {
            const firstApproved = list.find((p) => p.status === 'Approved' && !p.is2x3xStructure);
            if (firstApproved) {
              setSelectedPlanCode(firstApproved.planCode);
              setMultiplier(firstApproved.multiplier || 2);
              setContractualPercentage(firstApproved.approvedPercentage ?? 100);
              setPercentageBasis(firstApproved.percentageBasis || 'Total Contractual Percentage');
              setCustomDurationMonths(firstApproved.durationMonths || 24);
            }
          }
        })
        .catch((err) => console.warn('Could not load plans:', err));
    }
  }, [isOpen, investor]);

  if (!isOpen || !investor) return null;

  const handlePlanSelect = (code) => {
    setSelectedPlanCode(code);
    const plan = plans.find((p) => p.planCode === code);
    if (plan) {
      setMultiplier(plan.multiplier || 2);
      setContractualPercentage(plan.approvedPercentage ?? 100);
      setPercentageBasis(plan.percentageBasis || 'Total Contractual Percentage');
      setCustomDurationMonths(plan.durationMonths || 24);
    }
  };

  const selectedPlan = plans.find((p) => p.planCode === selectedPlanCode);

  const durationNum = customDurationMonths ? Number(customDurationMonths) : (selectedPlan?.durationMonths || 24);
  const calculatedMaturityDate = (() => {
    if (!planAssignmentDate) return 'N/A';
    const d = new Date(planAssignmentDate);
    if (isNaN(d.getTime())) return 'N/A';
    d.setMonth(d.getMonth() + durationNum);
    return d.toISOString().split('T')[0];
  })();

  const invAmount = Number(investor.verifiedInvestment || investor.totalInvestment || 0);
  const targetAmount = Math.round(invAmount * (Number(multiplier) || 2));

  const isCurrentPlanActive = investor.assignedPlan?.status === 'Active';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedPlanCode) {
      setError('Please select an authorized investment plan.');
      return;
    }

    if (isCurrentPlanActive && !auditReason.trim()) {
      setError('A formal audit reason is required to re-assign or alter an active contractual agreement.');
      return;
    }

    try {
      setSubmitting(true);
      await assignPlanApi(investor._id, {
        planCode: selectedPlanCode,
        multiplier: Number(multiplier) || 2,
        contractualPercentage: Number(contractualPercentage) || 0,
        percentageBasis,
        customDurationMonths: durationNum,
        planAssignmentDate,
        agreementStatus,
        planActivationStatus,
        auditReason: auditReason.trim(),
        notes: notes.trim(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to assign plan:', err);
      setError(err.message || 'Unable to assign investment plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-fade-in max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Assign Approved Investment Plan & 2X Contract</h3>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Active Agreement Notice */}
          {isCurrentPlanActive && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Active Agreement Lock Guardrail:</strong> An approved plan is currently active on this account. Modifying contractual terms requires recording an audited justification.
              </div>
            </div>
          )}

          {/* Plan Selector Cards */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Select Approved Plan</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {plans.map((p) => {
                const isDraftOrDisabled = p.status !== 'Approved';
                const isSelected = selectedPlanCode === p.planCode;

                return (
                  <div
                    key={p.planCode}
                    onClick={() => !isDraftOrDisabled && handlePlanSelect(p.planCode)}
                    className={`p-3 rounded-xl border transition-all ${
                      isDraftOrDisabled
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 cursor-pointer shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs truncate">{p.name}</span>
                      <span className="font-bold text-blue-700 text-xs shrink-0">{p.multiplier || 2}X</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{p.durationMonths}M Standard</span>
                      <span className="uppercase font-semibold">{p.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Multiplier */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Contractual Multiplier</label>
                <span className="text-[10px] text-blue-600 font-semibold">Configurable</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 1.5, 2, 3].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMultiplier(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      Number(multiplier) === m
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {m}X
                  </button>
                ))}
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Contractual Percentage */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contractual Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={contractualPercentage}
                onChange={(e) => setContractualPercentage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
              />
            </div>

            {/* Percentage Basis */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Percentage Calculation Basis</label>
              <select
                value={percentageBasis}
                onChange={(e) => setPercentageBasis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
              >
                <option value="Total Contractual Percentage">Total Contractual Percentage</option>
                <option value="Annual">Annual</option>
                <option value="Monthly">Monthly</option>
                <option value="None">None (Multiplier Only)</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Duration (Months)</label>
              <select
                value={customDurationMonths}
                onChange={(e) => setCustomDurationMonths(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
              >
                {[12, 18, 24, 36, 48, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} Months {m === 24 ? '(Standard 2X)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Assignment Date */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Assignment Date</label>
              <input
                type="date"
                value={planAssignmentDate}
                onChange={(e) => setPlanAssignmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
              />
            </div>

            {/* Calculated Maturity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Calculated Maturity Date</label>
              <div className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/60 font-mono font-bold text-blue-900">
                {calculatedMaturityDate}
              </div>
            </div>

            {/* Agreement Status */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Agreement Status</label>
              <select
                value={agreementStatus}
                onChange={(e) => setAgreementStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
              >
                <option value="Draft">Draft</option>
                <option value="Signed">Signed by Investor</option>
                <option value="Approved">Approved & Executed</option>
              </select>
            </div>

            {/* Plan Activation Status */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Activation Status</label>
              <select
                value={planActivationStatus}
                onChange={(e) => setPlanActivationStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
              >
                <option value="Pending">Pending Activation</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          {/* Live Calculation Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <span className="font-bold flex items-center gap-1.5 text-blue-200">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Target Calculation Preview</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                {multiplier}X Target
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-[10px] text-blue-200 block">Capital</span>
                <span className="font-bold text-white">₹{invAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-400/20">
                <span className="text-[10px] text-emerald-200 block font-bold">2X Target Payout</span>
                <span className="font-black text-emerald-300">₹{targetAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-[10px] text-blue-200 block">Due Date</span>
                <span className="font-bold text-white text-[11px]">{calculatedMaturityDate}</span>
              </div>
            </div>
          </div>

          {/* Audit Reason if active */}
          {isCurrentPlanActive && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Audit Modification Reason <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="Reason for modifying active agreement (e.g. Terms renegotiation approved by board)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Assignment Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Standard 2X allotment with agreement executed."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {submitting ? 'Assigning...' : 'Assign Plan & Initialize 2X Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default AssignPlanModal;
