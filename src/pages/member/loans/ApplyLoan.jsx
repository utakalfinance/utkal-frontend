import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Upload,
  IndianRupee,
  Briefcase,
  Building,
  Info,
  Clock,
  ArrowRight,
  FileText,
  AlertTriangle,
  X,
  FileCheck2,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import {
  fetchAvailableLoanProductsApi,
  submitCustomerLoanApplicationApi,
} from '../../../services/customerLoanService';

/**
 * ApplyLoan Page (/member-dashboard/loans/apply)
 * Modern fintech loan application form:
 * - First loan amount fixed at ₹10,000.
 * - Tenure options: 3, 6, and 9 months.
 * - Loan purpose, occupation, income, enterprise details.
 * - CIBIL score & verification guidelines (11% / 12% tiers).
 * - Required additional documents upload.
 * - Clean pre-submission application summary.
 */
export function ApplyLoan() {
  const navigate = useNavigate();
  const { memberUser, token } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policyData, setPolicyData] = useState({
    products: [],
    isMemberApproved: false,
    isShareAllotted: false,
    hasActivePending: false,
    activeAppId: null,
    memberDistrict: 'Khurda',
  });

  const FIRST_LOAN_AMOUNT = 10000;

  const [formData, setFormData] = useState({
    preferredTenureMonths: '3',
    loanPurpose: 'Agricultural Inputs & Working Capital',
    occupationType: 'Self-Employed / Small Business',
    monthlyIncome: '',
    employerOrBusinessName: '',
    workAddress: '',
    cibilScore: '',
  });

  const [documents, setDocuments] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!token || !memberUser?._id) return;

    setSubmittedApp(null);
    setDocuments({});
    setFormErrors({});
    setError(null);
    setFormData({
      preferredTenureMonths: '3',
      loanPurpose: 'Agricultural Inputs & Working Capital',
      occupationType: 'Self-Employed / Small Business',
      monthlyIncome: '',
      employerOrBusinessName: '',
      workAddress: '',
      cibilScore: '',
    });

    const loadPolicy = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAvailableLoanProductsApi(token);
        if (isMounted) {
          setPolicyData(data);
        }
      } catch (err) {
        console.error('Failed to load loan products policy:', err);
        if (isMounted) {
          setError(
            err.message || 'Unable to retrieve loan policy. Please contact branch administrator.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPolicy();
    return () => {
      isMounted = false;
    };
  }, [token, memberUser?._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (field, file) => {
    setDocuments((prev) => ({ ...prev, [field]: file }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    const tenure = parseInt(formData.preferredTenureMonths, 10);
    if (![3, 6, 9].includes(tenure)) {
      errs.preferredTenureMonths = 'Please select a valid tenure: 3 Months, 6 Months, or 9 Months';
    }

    if (!formData.loanPurpose || !formData.loanPurpose.trim()) {
      errs.loanPurpose = 'Loan purpose explanation is required';
    }

    const income = Number(formData.monthlyIncome);
    if (
      formData.monthlyIncome === '' ||
      formData.monthlyIncome === undefined ||
      isNaN(income) ||
      income < 0
    ) {
      errs.monthlyIncome = 'Please provide a valid monthly income (₹)';
    }

    if (!documents.aadhaar_card) {
      errs.aadhaar_card = 'Identity proof (Aadhaar Card) is required';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('loanType', 'First Member Term Loan');
      payload.append('requestedAmount', String(FIRST_LOAN_AMOUNT));
      payload.append('preferredTenureMonths', formData.preferredTenureMonths);
      payload.append('loanPurpose', formData.loanPurpose);
      payload.append('occupationType', formData.occupationType);
      payload.append('monthlyIncome', formData.monthlyIncome);
      payload.append('employerOrBusinessName', formData.employerOrBusinessName);
      payload.append('workAddress', formData.workAddress);
      if (formData.cibilScore) {
        payload.append('cibilScore', formData.cibilScore);
      }

      Object.entries(documents).forEach(([fieldName, file]) => {
        if (file) {
          payload.append(fieldName, file);
        }
      });

      const response = await submitCustomerLoanApplicationApi(payload, token);
      setSubmittedApp(response.application);
    } catch (err) {
      console.error('Application submission error:', err);
      alert(err.message || 'Submission failed. Please check form fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const tenureOptions = [
    {
      value: '3',
      label: '3 Months',
      tag: 'Short Term',
      schedule: '3 Monthly Cycles',
      desc: 'Short-term settlement plan with lower total interest accrued.',
    },
    {
      value: '6',
      label: '6 Months',
      tag: 'Standard Plan',
      schedule: '6 Monthly Cycles',
      desc: 'Balanced installment plan suited for agriculture and small retail cycles.',
    },
    {
      value: '9',
      label: '9 Months',
      tag: 'Flexible Tenure',
      schedule: '9 Monthly Cycles',
      desc: 'Comfortable installment spread across 9 monthly repayment cycles.',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Apply for First Member Loan"
        description="Statutory introductory loan facility of ₹10,000 for approved members. Select your preferred repayment tenure and attach required documents."
        badge="APPROVED STATUTORY POLICY"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'Apply for Loan' },
        ]}
      />

      {/* SUCCESS MODAL */}
      {submittedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-200">
                Application Successfully Submitted
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                First Loan Application Received!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your application for <strong className="text-slate-900">₹10,000</strong> with{' '}
                <strong className="text-slate-900">{submittedApp.preferredTenureMonths} Months</strong> tenure has been recorded in the credit registry.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Application Reference:</span>
                <span className="font-mono font-black text-blue-700 text-sm">
                  {submittedApp.applicationId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Assigned Jurisdiction:</span>
                <span className="font-bold text-slate-800">
                  {submittedApp.district} District Administration
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Current Lifecycle:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Pending District Verification
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/member-dashboard/loans/track')}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Track Application Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSubmittedApp(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE LOAN NOTICE IF APPLICATION ALREADY IN PROGRESS */}
      {policyData.hasActivePending && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">
                Active Loan Application in Progress
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Under Utkal Finance credit guidelines, members can maintain one active loan application in the underwriting pipeline at a time. Application{' '}
                <strong className="font-mono text-amber-950 font-black">{policyData.activeAppId}</strong> is currently being processed.
              </p>
            </div>
          </div>

          <div className="pl-8 pt-1">
            <button
              type="button"
              onClick={() => navigate('/member-dashboard/loans/track')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>Track Active Application ({policyData.activeAppId})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* APPLICATION FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Form Title Banner */}
        <div className="p-5 sm:p-7 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <FilePlus2 className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                First Member Loan Application Form
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Routed to {policyData.memberDistrict} District Administration for on-ground KYC verification.
            </p>
          </div>
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 self-start sm:self-auto">
            Fixed Amount: ₹10,000
          </span>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {/* STEP 1: LOAN PARAMETERS & TENURE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-200">
                1
              </span>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Loan Amount & Tenure Selection
              </h4>
            </div>

            {/* Fixed ₹10,000 Card */}
            <div className="bg-gradient-to-r from-blue-50/60 via-slate-50 to-white p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  First Loan Facility
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{FIRST_LOAN_AMOUNT.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Fixed introductory amount under approved bylaws (cannot be altered).
                </span>
              </div>
              <div className="text-left sm:text-right space-y-1">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-black uppercase inline-block">
                  11% / 12% CIBIL-Linked Rate*
                </span>
                <span className="text-[10px] text-slate-500 block">
                  *Awaiting final client confirmation
                </span>
              </div>
            </div>

            {/* Repayment Tenure Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">
                Select Repayment Tenure <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {tenureOptions.map((opt) => {
                  const isSelected = formData.preferredTenureMonths === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() =>
                        !policyData.hasActivePending &&
                        setFormData((prev) => ({ ...prev, preferredTenureMonths: opt.value }))
                      }
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{opt.label}</span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.tag}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-blue-700">{opt.schedule}</div>
                      <p className="text-[11px] text-slate-500 leading-snug">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>

              {formErrors.preferredTenureMonths && (
                <p className="text-[11px] text-rose-500 font-semibold">
                  {formErrors.preferredTenureMonths}
                </p>
              )}
            </div>

            {/* Loan Purpose */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700">
                Loan Purpose <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="loanPurpose"
                rows={2}
                value={formData.loanPurpose}
                onChange={handleInputChange}
                disabled={policyData.hasActivePending}
                placeholder="Clearly state how the loan funds will be utilized (e.g. Agricultural equipment, seasonal inventory, store capital, trade purchase)."
                className="w-full text-xs font-normal p-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50 hover:bg-white"
              />
              {formErrors.loanPurpose && (
                <p className="text-[11px] text-rose-500 font-semibold">{formErrors.loanPurpose}</p>
              )}
            </div>
          </div>

          {/* STEP 2: EMPLOYMENT & INCOME */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-200">
                2
              </span>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Occupation & Income Particulars
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Occupation Category</label>
                <select
                  name="occupationType"
                  value={formData.occupationType}
                  onChange={handleInputChange}
                  disabled={policyData.hasActivePending}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
                >
                  <option value="Self-Employed / Small Business">Self-Employed / Small Business</option>
                  <option value="Agriculture / Allied Sector">Agriculture / Allied Sector</option>
                  <option value="Salaried (Private / Govt)">Salaried (Private / Govt)</option>
                  <option value="Artisan / Skilled Worker">Artisan / Skilled Worker</option>
                  <option value="Daily Wage / Other">Daily Wage / Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Approx. Monthly Income (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    disabled={policyData.hasActivePending}
                    placeholder="e.g. 25000"
                    className="w-full text-xs font-semibold pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                {formErrors.monthlyIncome && (
                  <p className="text-[11px] text-rose-500 font-semibold">
                    {formErrors.monthlyIncome}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Enterprise / Employer Name</label>
                <input
                  type="text"
                  name="employerOrBusinessName"
                  value={formData.employerOrBusinessName}
                  onChange={handleInputChange}
                  disabled={policyData.hasActivePending}
                  placeholder="e.g. Maa Tarini Enterprise"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Work / Trade Address</label>
                <input
                  type="text"
                  name="workAddress"
                  value={formData.workAddress}
                  onChange={handleInputChange}
                  disabled={policyData.hasActivePending}
                  placeholder="e.g. Market Chowk, Khurda"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: CIBIL SCORE & VERIFICATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-200">
                3
              </span>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                CIBIL Score & Proposed Interest Tiers
              </h4>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Confirmed Policy Interest Tiers (Reducing Balance)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Official interest rate tier is verified based on your CIBIL credit score:
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                    CIBIL &gt; 600: 11% p.a.
                  </span>
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                    CIBIL &le; 600: 12% p.a.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Self-Reported CIBIL Score <span className="text-slate-400 font-normal">(Optional, 300 - 900)</span>
                  </label>
                  <input
                    type="number"
                    name="cibilScore"
                    value={formData.cibilScore}
                    onChange={handleInputChange}
                    disabled={policyData.hasActivePending}
                    min="300"
                    max="900"
                    placeholder="e.g. 680 (leave blank if unknown)"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    If unknown, official CIBIL score will be verified during administrative underwriting.
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Interest Calculation Policy Notice
                  </span>
                  <p className="leading-relaxed">
                    Management has specified 11% for CIBIL &gt; 600 and 12% for CIBIL &le; 600. Complete interest rules and official repayment schedules are awaiting final confirmation before EMI collection begins.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: REQUIRED VERIFICATION DOCUMENTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-200">
                  4
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Required Verification Documents
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">PDF, JPG, PNG (Max 5MB)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Aadhaar */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Aadhaar / ID Card <span className="text-rose-500">*</span>
                  </span>
                  {documents.aadhaar_card && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Government identity verification</p>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  disabled={policyData.hasActivePending}
                  onChange={(e) => handleFileChange('aadhaar_card', e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {formErrors.aadhaar_card && (
                  <p className="text-[10px] text-rose-500 font-semibold">
                    {formErrors.aadhaar_card}
                  </p>
                )}
              </div>

              {/* PAN */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">PAN Card / Form 60</span>
                  {documents.pan_card && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-slate-500">Tax identification proof</p>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  disabled={policyData.hasActivePending}
                  onChange={(e) => handleFileChange('pan_card', e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {/* Bank Statement */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Bank Statement</span>
                  {documents.bank_statement && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Last 3 months or passbook</p>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  disabled={policyData.hasActivePending}
                  onChange={(e) => handleFileChange('bank_statement', e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {/* Income Proof */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Income Declaration</span>
                  {documents.income_proof && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-slate-500">Self-declaration or bill</p>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  disabled={policyData.hasActivePending}
                  onChange={(e) => handleFileChange('income_proof', e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: PRE-SUBMISSION SUMMARY */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                5
              </span>
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-950">
                Application Summary (Review Before Final Submission)
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-blue-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Loan Amount
                </span>
                <span className="text-base font-black text-slate-900">
                  ₹{FIRST_LOAN_AMOUNT.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Selected Tenure
                </span>
                <span className="text-base font-black text-blue-700">
                  {formData.preferredTenureMonths} Months
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Proposed Interest Tier
                </span>
                <span className="text-xs font-black text-slate-900 block truncate">
                  {formData.cibilScore
                    ? Number(formData.cibilScore) > 600
                      ? '11% p.a. (>600)'
                      : '12% p.a. (<=600)'
                    : '11% / 12% CIBIL*'}
                </span>
                <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                  *Pending policy sign-off
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Routing Branch
                </span>
                <span className="text-base font-black text-slate-900 truncate block">
                  {policyData.memberDistrict} District
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              By submitting this dossier, you confirm that your declared occupational and identity information is authentic and subject to on-ground verification by your assigned District Administration.
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/member-dashboard/loans/overview')}
              className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || policyData.hasActivePending}
              className="py-3.5 px-7 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <FilePlus2 className="w-4 h-4" />
                  <span>Submit First Loan Application (₹10,000)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ApplyLoan;
