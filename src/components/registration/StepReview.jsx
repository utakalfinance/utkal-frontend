import React, { useState } from 'react';
import { FormSection } from './FormSection';
import { ValidationMessage } from './ValidationMessage';
import { MembershipFeeSection } from './payment/MembershipFeeSection';
import { Edit3, CheckCircle2, User, MapPin, Shield, Heart, Coins, FileText, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function StepReview({ formData = {}, onGoToStep, onSubmit, onPaymentChange, errors = {} }) {
  const [reviewedChecked, setReviewedChecked] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Payment section local state
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paymentData, setPaymentData] = useState(() => formData.payment?.data || {
    receiptFile: null,
    card: {},
    netBank: 'State Bank of India (SBI)',
    branch: { branchLocation: 'Bhubaneswar HQ (Nayapalli, Khurda)' },
  });
  const [utrError, setUtrError] = useState('');

  const personal = formData.personal || {};
  const address = formData.address || {};
  const account = formData.account || {};
  const nominee = formData.nominee || {};
  const shares = formData.shares || {};
  const documents = formData.documents || {};
  const witness = formData.witness || {};
  const declaration = formData.declaration || {};

  const handlePaymentDataChange = (key, val) => {
    setPaymentData((prev) => {
      const updated = {
        ...prev,
        [key]: val,
      };
      if (onPaymentChange) {
        onPaymentChange({ ...updated, method: selectedMethod });
      }
      return updated;
    });
    if (key === 'receiptFile' || key === 'utr') setUtrError('');
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (onPaymentChange) {
      onPaymentChange({ ...paymentData, method });
    }
  };

  const handleAutoFillTestInfo = () => {
    setSelectedMethod('upi');
    const updated = {
      ...paymentData,
      receiptFile: null,
    };
    setPaymentData(updated);
    if (onPaymentChange) {
      onPaymentChange({ ...updated, method: 'upi' });
    }
    setUtrError('');
  };

  const handleFinalSubmitValidation = () => {
    setReviewError('');
    setUtrError('');
    onSubmit({
      ...paymentData,
      method: selectedMethod || 'upi',
    });
    return true;
  };

  return (
    <FormSection
      title="REVIEW APPLICATION"
      subtitle="Verify all entered details carefully and complete statutory joining fee clearance before final submission to New Utkal Finance."
    >
      <div className="space-y-8">
        {/* 1. APPLICATION REVIEW SECTION (8 SUMMARY CARDS) */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
            1. Statutory Application Summary Review
          </h3>

          {/* 1. Personal Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-700" />
                <span>1. Personal &amp; Statutory Details</span>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(1)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name:</span>
                <span className="font-bold text-slate-800">
                  {personal.title} {personal.firstName} {personal.middleName} {personal.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Father / Guardian:</span>
                <span className="font-semibold text-slate-800">{personal.fatherLegalName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth / Age:</span>
                <span className="font-semibold text-slate-800">{personal.dob} ({personal.age} Years)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gender / Status:</span>
                <span className="font-semibold text-slate-800">{personal.gender} • {personal.maritalStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Education / Occupation:</span>
                <span className="font-semibold text-slate-800">{personal.education} • {personal.occupation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Religion / Category:</span>
                <span className="font-semibold text-slate-800">{personal.religion} ({personal.category})</span>
              </div>
            </div>
          </div>

          {/* 2. Address Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>2. Residential &amp; Communication Address</span>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Permanent Address:</span>
                <span className="font-semibold text-slate-800">
                  {address.address1}, {address.address2 ? `${address.address2}, ` : ''}{address.villageTown}, {address.district}, {address.state} - {address.pincode}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Communication Address:</span>
                <span className="font-semibold text-slate-800">
                  {address.sameAsResidential !== false
                    ? 'Same as Permanent Residential Address'
                    : `${address.commAddress1}, ${address.commDistrict}, ${address.commState} - ${address.commPincode}`}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Account Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>3. Company Association &amp; Account</span>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(3)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">EMP ID / Member ID:</span>
                <span className="font-bold text-slate-800">{account.empId || 'EMP-2026-8529'} • {account.membershipId || 'UF-2026-4271'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Branch:</span>
                <span className="font-bold text-blue-700">{account.assignedBranch || 'Bhubaneswar HQ (Nayapalli, Khurda)'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Agent Referral Code:</span>
                <span className="font-semibold text-slate-800">{account.agentCode || 'Direct Application'}</span>
              </div>
            </div>
          </div>

          {/* 4. Nominee Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>4. Nominee Beneficiary</span>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(4)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nominee Name:</span>
                <span className="font-bold text-slate-800">
                  {nominee.title} {nominee.firstName} {nominee.lastName || nominee.fullName} ({nominee.relationship})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth / Age:</span>
                <span className="font-semibold text-slate-800">{nominee.dob} ({nominee.age || '32'} Yrs)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nominee ID Details:</span>
                <span className="font-semibold text-slate-800">{nominee.identityDetails || 'Aadhaar Verified'}</span>
              </div>
            </div>
          </div>

          {/* 5. Share Contribution */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>5. Share Holder &amp; Status of Depositor</span>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(5)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Repayment Preference:</span>
                <span className="font-bold text-slate-800">{shares.repaymentPreference || 'First depositor'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Shares Quantity &amp; Value:</span>
                <span className="font-semibold text-slate-800">{shares.numberOfShares || 10} Shares (₹ {shares.allocatedShareValue || 500})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">TDS Status:</span>
                <span className="font-extrabold text-emerald-700">{shares.tdsOption || 'No (Form 15G/15H Enclosed)'}</span>
              </div>
            </div>
          </div>

          {/* 6. Document Proofs */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>6. Verification Documents</span>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(6)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Govt ID Proof:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {documents.idProofType || 'Aadhaar Card'} {documents.idProofNumber ? `(${documents.idProofNumber})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Attachments Uploaded:</span>
                <span className={`font-semibold flex items-center gap-1 mt-0.5 ${[documents.doc1_photo, documents.doc2_govId, documents.doc3_eduCert, documents.doc4_birthCert, documents.doc5_utility].filter(Boolean).length === 5
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                  }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {[documents.doc1_photo, documents.doc2_govId, documents.doc3_eduCert, documents.doc4_birthCert, documents.doc5_utility].filter(Boolean).length} of 5 KYC Documents Attached
                </span>
              </div>
            </div>
          </div>

          {/* 7. Witness Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>7. Independent Witnesses</span>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(7)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Witness 1:</span>
                <span className="font-semibold text-slate-800">{witness.witness1Name || 'Subhasish Dash'} ({witness.witness1Mobile || '9437012345'})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Witness 2:</span>
                <span className="font-semibold text-slate-800">{witness.witness2Name || 'Manas Ranjan Sahoo'} ({witness.witness2Mobile || '9861122334'})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PAYMENT / STATUTORY MEMBERSHIP JOINING FEE SECTION */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            2. Payment / Statutory Membership Joining Fee
          </h3>

          <MembershipFeeSection
            selectedMethod={selectedMethod}
            onSelectMethod={handleMethodSelect}
            paymentData={paymentData}
            onPaymentDataChange={handlePaymentDataChange}
            utrError={utrError || errors?.payment}
            onGoToStep={onGoToStep}
          />
        </div>

        {/* 3. FINAL CONFIRMATION CHECKBOX */}
        <div className="bg-amber-50/90 border border-amber-300/90 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={reviewedChecked}
              onChange={(e) => {
                setReviewedChecked(e.target.checked);
                if (e.target.checked) setReviewError('');
              }}
              className="mt-0.5 w-4.5 h-4.5 rounded text-blue-700 focus:ring-blue-600 border-slate-300 shrink-0 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-900 leading-normal">
              I confirm that I have reviewed my application details and payment information. <span className="text-rose-500 font-extrabold">*</span>
            </span>
          </label>
          <ValidationMessage message={reviewError} />
        </div>
      </div>
    </FormSection>
  );
}
