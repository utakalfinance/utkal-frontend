import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Send,
  PhoneCall,
  UserCheck,
  Lock,
  Sparkles,
} from 'lucide-react';
import { FormInput } from './FormInput';
import { Button } from './Button';
import { validateLoanEnquiryForm } from '../utils/validators';
import { submitLoanEnquiryApi } from '../services/loanEnquiryService';

export function ApplicationModal({ isOpen, onClose, selectedLoan = null }) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const loanCategoryName = typeof selectedLoan === 'string' 
    ? selectedLoan 
    : (selectedLoan?.title || selectedLoan?.name || null);

  // Reset errors and submission state when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setSubmittedResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'mobileNumber') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateLoanEnquiryForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        ...formData,
        ...(loanCategoryName ? { loanCategory: loanCategoryName } : {}),
      };
      const res = await submitLoanEnquiryApi(payload);
      setSubmittedResult(res);
    } catch (err) {
      console.error('Loan interest submission failed:', err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({
          form: err.message || 'Submission failed. Please check your network and try again.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setFormData({
      fullName: '',
      mobileNumber: '',
      email: '',
    });
    setSubmittedResult(null);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedResult ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-2 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Interest Logged Successfully
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Loan Interest Received!
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-800">{submittedResult.enquiry?.fullName || formData.fullName}</strong>. Your interest has been registered with New Utkal Finance.
              </p>
            </div>

            {/* Unique Enquiry ID Card */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 text-left border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Unique Enquiry ID
                  </p>
                  <p className="text-xl font-extrabold text-blue-700 tracking-tight mt-0.5">
                    {submittedResult.enquiryId || submittedResult.enquiry?.enquiryId}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                  Status: New
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-700 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold">{submittedResult.enquiry?.fullName || formData.fullName}</span>
                </div>
                {submittedResult.enquiry?.loanCategory && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loan Facility:</span>
                    <span className="font-semibold text-blue-700">{submittedResult.enquiry?.loanCategory}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Mobile:</span>
                  <span className="font-semibold">+91 {submittedResult.enquiry?.mobileNumber || formData.mobileNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold">{submittedResult.enquiry?.email || formData.email}</span>
                </div>
              </div>
            </div>

            {/* Next Steps Workflow Guide */}
            <div className="bg-blue-50/70 rounded-2xl p-4 text-left border border-blue-100/80 space-y-3">
              <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Next Steps in Utkal Finance Process:</span>
              </p>

              <ol className="text-[11px] text-blue-950/85 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                <li>
                  <strong>Advisory Call:</strong> Our loan officer will contact you to explain the membership onboarding process.
                </li>
                <li>
                  <strong>Membership Enrollment:</strong> Complete membership registration and upload basic KYC documents.
                </li>
                <li>
                  <strong>Member Access &amp; First Loan:</strong> After admin approval, log in with your official Member ID to apply for your first loan of ₹10,000 in the Member Dashboard.
                </li>
              </ol>
            </div>

            <div className="pt-2">
              <Button variant="primary" fullWidth size="lg" onClick={resetAndClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* FORM SCREEN (ONLY 3 FIELDS) */
          <div>
            {/* Header */}
            <div className="mb-6 text-left pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Loan Interest Desk
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  No Login Required
                </span>
                {loanCategoryName && (
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                    {loanCategoryName}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Apply for Loan
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Please enter your contact information below. Our loan officer will contact you to guide you through associate membership onboarding and loan appraisal.
              </p>
            </div>

            {errors.form && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Field 1: Full Name */}
              <FormInput
                label="Full Name"
                name="fullName"
                placeholder="e.g. Alok Kumar Mohapatra"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />

              {/* Field 2: Mobile Number */}
              <FormInput
                label="Mobile Number"
                name="mobileNumber"
                type="tel"
                placeholder="10-digit mobile number (e.g. 9861054321)"
                value={formData.mobileNumber}
                onChange={handleChange}
                error={errors.mobileNumber}
                helperText="We will contact you via this number regarding your loan interest."
                required
              />

              {/* Field 3: Email Address */}
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. name@domain.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              {/* Membership Guidance Notice */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Membership Requirement</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Loans are disbursed exclusively to approved registered members. Our loan officer will guide you through simple membership onboarding before you can apply for your first loan in the Member Dashboard.
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={submitting}
                  icon={Send}
                  iconPosition="right"
                >
                  Submit Loan Interest
                </Button>
              </div>

              {/* Non-membership reassurance note */}
              <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Initial enquiry only. Does not charge any fee or create an account.
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export const LoanEnquiryModal = ApplicationModal;
export default ApplicationModal;
