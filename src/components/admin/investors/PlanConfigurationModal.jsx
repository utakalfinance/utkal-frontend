import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import {
  getInvestmentPlansApi,
  createInvestmentPlanApi,
  updateInvestmentPlanApi,
} from '../../../services/investorService';

export function PlanConfigurationModal({ isOpen, onClose, onPlansUpdated }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Editing or creating mode
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [planForm, setPlanForm] = useState({
    planCode: '',
    name: '',
    version: '1.0',
    multiplier: 2,
    approvedPercentage: 100,
    percentageBasis: 'Total Contractual Percentage',
    durationMonths: 24,
    availableDurations: '12, 18, 24, 36, 48, 60',
    minAmount: 5000,
    maxAmount: 10000000,
    terms: '',
    status: 'Approved',
    regulatoryNotice: 'Subject to statutory mutual benefit cooperative norms. Approved under company framework.',
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvestmentPlansApi();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError(err.message || 'Unable to load investment plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      setEditingPlanId(null);
      setIsCreatingNew(false);
      setSuccessMsg('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingPlanId(null);
    setIsCreatingNew(true);
    setPlanForm({
      planCode: `UF-PLAN-${Date.now().toString().slice(-4)}`,
      name: '',
      version: '1.0',
      multiplier: 2,
      approvedPercentage: 100,
      percentageBasis: 'Total Contractual Percentage',
      durationMonths: 24,
      availableDurations: '12, 18, 24, 36, 48, 60',
      minAmount: 5000,
      maxAmount: 10000000,
      terms: 'Contractual return target upon maturity. Verified capital repaid in accordance with approved company agreement rules.',
      status: 'Approved',
      regulatoryNotice: 'Compliant with statutory cooperative guidelines and Utkal Finance credit framework.',
    });
    setError(null);
    setSuccessMsg('');
  };

  const handleStartEdit = (plan) => {
    setIsCreatingNew(false);
    setEditingPlanId(plan._id);
    setPlanForm({
      planCode: plan.planCode,
      name: plan.name,
      version: plan.version || '1.0',
      multiplier: plan.multiplier ?? 2,
      approvedPercentage: plan.approvedPercentage ?? 100,
      percentageBasis: plan.percentageBasis || 'Total Contractual Percentage',
      durationMonths: plan.durationMonths || 24,
      availableDurations: Array.isArray(plan.availableDurations)
        ? plan.availableDurations.join(', ')
        : '12, 18, 24, 36, 48, 60',
      minAmount: plan.minAmount || 5000,
      maxAmount: plan.maxAmount || 10000000,
      terms: plan.terms || '',
      status: plan.status || 'Approved',
      regulatoryNotice: plan.regulatoryNotice || '',
    });
    setError(null);
    setSuccessMsg('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPlanForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    if (!planForm.name.trim()) {
      setError('Plan Name is required.');
      return;
    }
    if (!planForm.terms.trim()) {
      setError('Agreement terms and conditions are required.');
      return;
    }

    // Parse available durations array
    const parsedDurations = planForm.availableDurations
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    const payload = {
      ...planForm,
      multiplier: Number(planForm.multiplier) || 2,
      approvedPercentage: Number(planForm.approvedPercentage) || 0,
      durationMonths: Number(planForm.durationMonths) || 24,
      availableDurations: parsedDurations.length ? parsedDurations : [Number(planForm.durationMonths) || 24],
      minAmount: Number(planForm.minAmount) || 1000,
      maxAmount: Number(planForm.maxAmount) || 10000000,
    };

    try {
      setSubmitting(true);
      if (isCreatingNew) {
        await createInvestmentPlanApi(payload);
        setSuccessMsg(`Plan "${payload.name}" created successfully!`);
      } else {
        await updateInvestmentPlanApi(editingPlanId, payload);
        setSuccessMsg(`Plan "${payload.name}" updated successfully!`);
      }

      await loadPlans();
      setIsCreatingNew(false);
      setEditingPlanId(null);
      if (onPlansUpdated) onPlansUpdated();
    } catch (err) {
      console.error('Save plan error:', err);
      setError(err.message || 'Failed to save plan configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Admin Plan Configuration
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Configure authorized company investment plans, multipliers, percentage basis & terms
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Action Bar */}
          {!isCreatingNew && !editingPlanId && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configured Investment Plans</h3>
                <p className="text-xs text-slate-500">
                  Only plans with Approved status can be assigned to verified investors.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartCreate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Plan</span>
              </button>
            </div>
          )}

          {/* EDIT / CREATE FORM */}
          {(isCreatingNew || editingPlanId) && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Edit2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isCreatingNew ? 'Create New Authorized Plan' : `Configure Plan: ${planForm.name}`}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingPlanId(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Plan Code */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Plan Code {isCreatingNew && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="planCode"
                      value={planForm.planCode}
                      onChange={handleFormChange}
                      disabled={!isCreatingNew}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono uppercase font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Plan Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      Plan Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={planForm.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Utkal 2X Capital Growth Plan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Multiplier */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Investment Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      name="multiplier"
                      value={planForm.multiplier}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Approved Percentage */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Approved Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      name="approvedPercentage"
                      value={planForm.approvedPercentage}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Percentage Basis */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Percentage Calculation Basis</label>
                    <select
                      name="percentageBasis"
                      value={planForm.percentageBasis}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Total Contractual Percentage">Total Contractual Percentage</option>
                      <option value="Annual">Annual</option>
                      <option value="Monthly">Monthly</option>
                      <option value="None">None (Multiplier Only)</option>
                    </select>
                  </div>

                  {/* Default Duration Months */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Standard Duration (Months)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      name="durationMonths"
                      value={planForm.durationMonths}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Available Durations List */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Available Duration Options (Months)
                    </label>
                    <input
                      type="text"
                      name="availableDurations"
                      value={planForm.availableDurations}
                      onChange={handleFormChange}
                      placeholder="e.g. 12, 18, 24, 36, 48, 60"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Plan Status */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Plan Status</label>
                    <select
                      name="status"
                      value={planForm.status}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Approved">Approved (Ready for Assignment)</option>
                      <option value="Draft">Draft (Pending Legal Clearance)</option>
                      <option value="Disabled">Disabled (Suspended)</option>
                    </select>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Agreement Terms & Conditions <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    name="terms"
                    value={planForm.terms}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-normal text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contractual terms and conditions applicable upon maturity..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingPlanId(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Saving Plan...' : isCreatingNew ? 'Create Plan' : 'Update Plan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PLANS LIST */}
          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading investment plans...</div>
            ) : plans.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No plans found. Click Create New Plan above.</div>
            ) : (
              plans.map((plan) => {
                const isApproved = plan.status === 'Approved';
                const isDraft = plan.status === 'Draft';

                return (
                  <div
                    key={plan._id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isDraft
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {plan.multiplier || 2}X
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-xs">{plan.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isDraft
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {plan.status}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {plan.planCode} • v{plan.version || '1.0'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(plan)}
                        className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Config</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Multiplier Target</span>
                        <span className="font-extrabold text-slate-900">{plan.multiplier || 2}X Multiplier</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Approved Percentage</span>
                        <span className="font-bold text-slate-900">
                          {plan.approvedPercentage ?? 100}% ({plan.percentageBasis || 'Total Contractual'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tenure</span>
                        <span className="font-bold text-slate-900">{plan.durationMonths || 24} Months</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Available Tenures</span>
                        <span className="font-mono text-slate-700 text-[11px]">
                          {Array.isArray(plan.availableDurations) && plan.availableDurations.length
                            ? plan.availableDurations.join(', ') + ' M'
                            : `${plan.durationMonths || 24} M`}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed italic line-clamp-2">
                      &quot;{plan.terms}&quot;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Compliance Note: Unapproved schemes remain locked in Draft status until board clearance.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

