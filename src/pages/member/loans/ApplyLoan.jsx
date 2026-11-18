import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Calendar,
  Percent,
  Calculator,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import {
  fetchAvailableLoanProductsApi,
  submitCustomerLoanApplicationApi,
} from '../../../services/customerLoanService';

/**
 * ApplyLoan Page (/member-dashboard/loans/apply)
 * Displays strictly what admin configured:
 * 1. Admin-set Loan Amount
 * 2. Admin-set Annual Interest Rate
 * 3. Admin-set EMI Months (Tenures) & calculated monthly EMI
 * 4. Document upload inputs only (Aadhaar, PAN, Bank Statement, Photo/Income)
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
    loanSetting: null,
  });

  const primaryProduct = policyData.products?.[0] || {};
  const activeSetting = policyData.loanSetting || {};

  // 1. Admin-configured Loan Amount
  const loanAmount = Number(
    activeSetting.defaultAmount || primaryProduct.defaultAmount || 10000
  );

  // 2. Admin-configured Monthly Interest Rate (% / Month)
  const monthlyRateVal = Number(
    activeSetting.monthlyInterestRate !== undefined && activeSetting.monthlyInterestRate !== null
      ? activeSetting.monthlyInterestRate
      : (activeSetting.baseInterestRate ? (activeSetting.baseInterestRate > 5 ? Math.round((activeSetting.baseInterestRate / 12) * 100) / 100 : activeSetting.baseInterestRate) : (primaryProduct.interestRate || 1))
  );
  const monthlyRateDisplay = `${monthlyRateVal}% / Month`;
  const monthlyRateDecimal = monthlyRateVal / 100;

  // 3. Admin-configured Available EMI Months
  const availableTenures = useMemo(() => {
    if (
      Array.isArray(activeSetting.availableTenureMonths) &&
      activeSetting.availableTenureMonths.length > 0
    ) {
      return activeSetting.availableTenureMonths.map(Number).sort((a, b) => a - b);
    }
    if (
      Array.isArray(primaryProduct.availableTenureMonths) &&
      primaryProduct.availableTenureMonths.length > 0
    ) {
      return primaryProduct.availableTenureMonths.map(Number).sort((a, b) => a - b);
    }
    return [3, 6, 9];
  }, [activeSetting.availableTenureMonths, primaryProduct.availableTenureMonths]);

  // Selected EMI tenure month
  const [selectedTenure, setSelectedTenure] = useState('3');

  // Uploaded documents
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

    const loadPolicy = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAvailableLoanProductsApi(token);
        if (isMounted) {
          setPolicyData(data);
          const s = data.loanSetting || data.products?.[0] || {};
          const ten = s.defaultTenureMonths
            ? String(s.defaultTenureMonths)
            : data.availableTenureMonths?.[0]
            ? String(data.availableTenureMonths[0])
            : '3';
          setSelectedTenure(ten);
        }
      } catch (err) {
        console.error('Failed to load loan policy:', err);
        if (isMounted) {
          setError(err.message || 'Unable to load active loan policy.');
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

  // Handle document file select
  const handleFileChange = (field, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: 'File size must be less than 5MB',
      }));
      return;
    }
    setFormErrors((prev) => ({ ...prev, [field]: null }));
    setDocuments((prev) => ({ ...prev, [field]: file }));
  };

  // Live EMI calculation based on admin-set Amount, Interest Rate, and selected Month
  const calculatedEmi = useMemo(() => {
    const P = loanAmount;
    const N = Number(selectedTenure) || 3;
    const monthlyRate = monthlyRateDecimal;

    let emi = 0;
    let totalInterest = 0;

    if (P > 0 && N > 0) {
      if (monthlyRate > 0) {
        emi = Math.round(
          (P * monthlyRate * Math.pow(1 + monthlyRate, N)) /
            (Math.pow(1 + monthlyRate, N) - 1)
        );
      } else {
        emi = Math.round(P / N);
      }
      totalInterest = Math.max(0, Math.round(emi * N - P));
    }

    return {
      principal: P,
      tenure: N,
      monthlyEmi: emi,
      totalInterest,
      totalRepayable: P + totalInterest,
    };
  }, [loanAmount, monthlyRateDecimal, selectedTenure]);

  // Tenure option details with real-time calculated monthly EMI
  const tenureCards = useMemo(() => {
    const P = loanAmount;
    const monthlyRate = monthlyRateDecimal;

    return availableTenures.map((m) => {
      let emi = 0;
      if (P > 0 && m > 0) {
        if (monthlyRate > 0) {
          emi = Math.round(
            (P * monthlyRate * Math.pow(1 + monthlyRate, m)) /
              (Math.pow(1 + monthlyRate, m) - 1)
          );
        } else {
          emi = Math.round(P / m);
        }
      }
      const total = emi * m;
      return {
        months: m,
        value: String(m),
        monthlyEmi: emi,
        totalRepayment: total,
      };
    });
  }, [availableTenures, loanAmount, monthlyRateDecimal]);

  // Form Validation: Only require identity proof (Aadhaar)
  const validateForm = () => {
    const errs = {};
    if (!documents.aadhaar_card) {
      errs.aadhaar_card = 'Identity proof (Aadhaar Card / ID) is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit loan application
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('loanType', 'First Member Term Loan');
      payload.append('requestedAmount', String(loanAmount));
      payload.append('preferredTenureMonths', String(selectedTenure || availableTenures[0] || 3));
      payload.append('loanPurpose', 'Statutory Member Term Loan Facility');
      payload.append('occupationType', 'Member / Self-Employed');
      payload.append('monthlyIncome', '25000');
      payload.append('employerOrBusinessName', 'Member');
      payload.append('workAddress', `${policyData.memberDistrict || 'Khurda'} District`);

      Object.entries(documents).forEach(([fieldName, file]) => {
        if (file) {
          payload.append(fieldName, file);
        }
      });

      const response = await submitCustomerLoanApplicationApi(payload, token);
      setSubmittedApp(response.application);
    } catch (err) {
      console.error('Application submission error:', err);
      alert(err.message || 'Submission failed. Please check your uploaded documents.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Apply for Loan"
        description={`Statutory loan facility of ₹${loanAmount.toLocaleString('en-IN')} at ${monthlyRateDisplay}. Select your preferred EMI months and upload required verification documents.`}
        badge="APPROVED STATUTORY POLICY"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'Apply for Loan' },
        ]}
      />

      {/* SUCCESS MODAL ON SUBMISSION */}
      {submittedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 border border-slate-200 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
                Application Received Successfully
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
                Loan Application Submitted!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your loan dossier has been forwarded directly to Super Admin for final review and sanction.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Application ID</span>
                <span className="font-mono font-black text-slate-900">
                  {submittedApp.applicationId}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Sanctioned Amount</span>
                <span className="font-black text-slate-900">
                  ₹{loanAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Repayment Tenure</span>
                <span className="font-black text-blue-700">
                  {submittedApp.preferredTenureMonths || selectedTenure} Months
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Estimated Monthly EMI</span>
                <span className="font-black text-emerald-700">
                  ₹{calculatedEmi.monthlyEmi.toLocaleString('en-IN')} / mo
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/member-dashboard/loans/track')}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Track Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Form Title Banner */}
        <div className="p-5 sm:p-7 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <FilePlus2 className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Member Loan Application Form
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Configured under active administrative policy for {policyData.memberDistrict || 'Khurda'} District.
            </p>
          </div>
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 self-start sm:self-auto">
            Loan Amount: ₹{loanAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {/* SECTION 1: ADMIN-CONFIGURED LOAN DETAILS & EMI MONTH SELECTION */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                1
              </span>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Loan Facility &amp; EMI Months Selection
              </h4>
            </div>

            {/* 3 Core Highlight Cards: Amount, Interest, Estimated EMI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Loan Amount */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Loan Amount</span>
                  <IndianRupee className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹{loanAmount.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-500 block">Sanctioned Principal</span>
              </div>

              {/* Card 2: Monthly Interest Rate */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Interest Rate</span>
                  <Percent className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 tracking-tight">
                  {monthlyRateDisplay}
                </div>
                <span className="text-[10px] text-slate-500 block">Reducing balance calculation</span>
              </div>

              {/* Card 3: Monthly EMI */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <div className="flex items-center justify-between text-blue-600">
                  <span className="text-[10px] font-black uppercase tracking-wider">Estimated Monthly EMI</span>
                  <Calculator className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-700 tracking-tight">
                  ₹{calculatedEmi.monthlyEmi.toLocaleString('en-IN')}
                  <span className="text-xs text-blue-500 font-bold"> / mo</span>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold block">
                  For {selectedTenure} Months tenure
                </span>
              </div>
            </div>

            {/* Select EMI Tenure Months */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">
                Choose Repayment EMI Months: <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {tenureCards.map((card) => {
                  const isSelected = selectedTenure === card.value;
                  return (
                    <div
                      key={card.value}
                      onClick={() =>
                        !policyData.hasActivePending && setSelectedTenure(card.value)
                      }
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900">
                          {card.months} Months
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                      </div>
                      <div className="text-base font-black text-emerald-700">
                        ₹{card.monthlyEmi.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">/ month</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                        <span>Total Repayment:</span>
                        <span className="font-bold text-slate-800">
                          ₹{card.totalRepayment.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-200">
                  Total Loan Breakdown
                </span>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-blue-200 text-[10px] block">Principal</span>
                    <strong className="text-white text-base">
                      ₹{calculatedEmi.principal.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <span className="text-blue-400 font-bold">+</span>
                  <div>
                    <span className="text-blue-200 text-[10px] block">Total Interest ({monthlyRateDisplay})</span>
                    <strong className="text-amber-300 text-base">
                      ₹{calculatedEmi.totalInterest.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <span className="text-blue-400 font-bold">=</span>
                  <div>
                    <span className="text-blue-200 text-[10px] block">Total Repayable ({selectedTenure} mos)</span>
                    <strong className="text-emerald-300 text-base">
                      ₹{calculatedEmi.totalRepayable.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-blue-200 uppercase block">Monthly Payment</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{calculatedEmi.monthlyEmi.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-300 block">per month</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: UPLOAD REQUIRED DOCUMENTS ONLY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Upload Required Verification Documents
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">PDF, JPG, PNG (Max 5MB)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Aadhaar Card (Required) */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Aadhaar Card / ID <span className="text-rose-500">*</span>
                  </span>
                  {documents.aadhaar_card ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-slate-400" />
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

              {/* 2. PAN Card */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">PAN Card / Form 60</span>
                  {documents.pan_card ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                  )}
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

              {/* 3. Bank Statement */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Bank Statement</span>
                  {documents.bank_statement ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Passbook or last 3 months</p>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  disabled={policyData.hasActivePending}
                  onChange={(e) => handleFileChange('bank_statement', e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {/* 4. Photo / Income Proof */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Photo / Income Proof</span>
                  {documents.income_proof ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                  )}
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

          {/* SUBMISSION & ACTIONS */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 text-center sm:text-left">
              By submitting, you apply for a loan facility of ₹{loanAmount.toLocaleString('en-IN')} for {selectedTenure} months at {monthlyRateDisplay}.
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
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
                    <FileCheck className="w-4 h-4" />
                    <span>Submit Loan Application (₹{loanAmount.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ApplyLoan;
