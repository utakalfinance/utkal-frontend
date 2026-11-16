import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  FileText,
  CreditCard,
  Layers,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Eye,
  Check,
  Plus,
} from 'lucide-react';
import {
  createInvestorApi,
  updateInvestorApi,
  getInvestmentPlansApi,
  getInvestorByIdApi,
} from '../../../services/investorService';
import { getBackendAssetUrl } from '../../../config/env';

function resolveDocUrl(directUrl, docObj) {
  const raw = directUrl || (typeof docObj === 'string' ? docObj : docObj?.url) || '';
  if (!raw) return '';
  return getBackendAssetUrl(raw);
}

export function AddInvestorModal({ isOpen, investor = null, onClose, onSuccess }) {
  const isEditMode = Boolean(investor);
  const [plans, setPlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    dateOfBirth: '',
    address: '',
    state: 'Odisha',
    district: '',
    pinCode: '',
    aadhaarNumber: '',
    panNumber: '',
    kycStatus: 'Pending',
    bankAccountNumber: '',
    bankAccountHolderName: '',
    bankName: '',
    bankIfscCode: '',
    bankBranchName: '',
    investmentAmount: '2000',
    investmentType: 'Term Capital',
    agreedReturnTerms: 'As per Approved Agreement',
    maturityDate: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    utrNumber: '',
    paymentStatus: 'Pending',
    adminRemarks: '',
    planCode: '',
    planMultiplier: 2,
    contractualPercentage: 100,
    percentageBasis: 'Total Contractual Percentage',
    planDuration: 24,
    planAssignmentDate: new Date().toISOString().split('T')[0],
    agreementStatus: 'Draft',
    planActivationStatus: 'Pending',
    sendAcknowledgement: true,
  });

  // File Uploads
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);
  const [panCardFile, setPanCardFile] = useState(null);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState(null);
  const [agreementFile, setAgreementFile] = useState(null);

  // File Preview URLs
  const [previews, setPreviews] = useState({
    aadhaarFront: '',
    aadhaarBack: '',
    panCard: '',
    paymentReceipt: '',
    agreement: '',
  });

  const districtsList = [
    'Angul',
    'Balangir',
    'Balasore',
    'Bargarh',
    'Bhadrak',
    'Boudh',
    'Cuttack',
    'Deogarh',
    'Dhenkanal',
    'Gajapati',
    'Ganjam',
    'Jagatsinghpur',
    'Jajpur',
    'Jharsuguda',
    'Kalahandi',
    'Kandhamal',
    'Kendrapara',
    'Kendujhar',
    'Khurda',
    'Koraput',
    'Malkangiri',
    'Mayurbhanj',
    'Nabarangpur',
    'Nayagarh',
    'Nuapada',
    'Puri',
    'Rayagada',
    'Sambalpur',
    'Subarnapur',
    'Sundargarh',
  ];

  useEffect(() => {
    if (isOpen) {
      getInvestmentPlansApi()
        .then((data) => {
          const plansList = Array.isArray(data) ? data : [];
          setPlans(plansList);
          // Auto-select first approved plan if planCode is empty
          if (!formData.planCode) {
            const firstApproved = plansList.find((p) => p.status === 'Approved' && !p.is2x3xStructure);
            if (firstApproved) {
              setFormData((prev) => ({
                ...prev,
                planCode: firstApproved.planCode,
                planMultiplier: firstApproved.multiplier ?? 2,
                contractualPercentage: firstApproved.approvedPercentage ?? 100,
                percentageBasis: firstApproved.percentageBasis || 'Total Contractual Percentage',
                planDuration: firstApproved.durationMonths || 24,
              }));
            }
          }
        })
        .catch((err) => console.warn('Could not load investment plans:', err));
    }
  }, [isOpen]);

  const populateFromInvestor = useCallback((inv) => {
    if (!inv) return;

    setFormData((prev) => ({
      ...prev,
      fullName: inv.fullName || '',
      mobile: inv.mobile || '',
      email: inv.email || '',
      dateOfBirth: inv.dateOfBirth ? inv.dateOfBirth.split('T')[0] : '',
      address: inv.address || '',
      state: inv.state || 'Odisha',
      district: inv.district || '',
      pinCode: inv.pinCode || '',
      aadhaarNumber:
        inv.aadhaarNumber && !inv.aadhaarNumber.includes('••••')
          ? inv.aadhaarNumber
          : prev.aadhaarNumber && !prev.aadhaarNumber.includes('••••')
          ? prev.aadhaarNumber
          : inv.aadhaarNumber || '',
      panNumber:
        inv.panNumber && !inv.panNumber.includes('••••')
          ? inv.panNumber
          : prev.panNumber && !prev.panNumber.includes('••••')
          ? prev.panNumber
          : inv.panNumber || '',
      kycStatus: inv.kycStatus || 'Pending',
      bankAccountNumber:
        inv.bankDetails?.accountNumber && !inv.bankDetails.accountNumber.includes('••••')
          ? inv.bankDetails.accountNumber
          : prev.bankAccountNumber && !prev.bankAccountNumber.includes('••••')
          ? prev.bankAccountNumber
          : inv.bankDetails?.accountNumber || '',
      bankAccountHolderName: inv.bankDetails?.accountHolderName || '',
      bankName: inv.bankDetails?.bankName || '',
      bankIfscCode: inv.bankDetails?.ifscCode || '',
      bankBranchName: inv.bankDetails?.branchName || '',
      investmentAmount: String(
        inv.verifiedInvestment || inv.totalInvestment || prev.investmentAmount || '2000'
      ),
      investmentType: inv.investmentType || 'Term Capital',
      agreedReturnTerms: inv.agreedReturnTerms || 'As per Approved Agreement',
      maturityDate: inv.maturityDate ? inv.maturityDate.split('T')[0] : '',
      paymentDate: inv.investmentDate
        ? inv.investmentDate.split('T')[0]
        : new Date().toISOString().split('T')[0],
      paymentMethod: inv.paymentMethod || 'UPI',
      utrNumber: inv.utrNumber || '',
      paymentStatus: inv.paymentStatus || 'Pending',
      adminRemarks: inv.adminRemarks || '',
      planCode: inv.assignedPlan?.planCode || prev.planCode || '',
      planMultiplier: inv.assignedPlan?.multiplier || inv.tracking2x?.multiplier || 2,
      contractualPercentage:
        inv.assignedPlan?.contractualPercentage ??
        (inv.tracking2x?.contractualPercentage ?? 100),
      percentageBasis:
        inv.assignedPlan?.percentageBasis ||
        inv.tracking2x?.percentageBasis ||
        'Total Contractual Percentage',
      planDuration:
        inv.assignedPlan?.durationMonths || inv.tracking2x?.durationMonths || 24,
      planAssignmentDate: inv.assignedPlan?.assignedDate
        ? inv.assignedPlan.assignedDate.split('T')[0]
        : new Date().toISOString().split('T')[0],
      agreementStatus:
        inv.assignedPlan?.agreementStatus || inv.agreement?.status || 'Draft',
      planActivationStatus: inv.assignedPlan?.status || 'Pending',
      sendAcknowledgement: false,
    }));

    setPreviews((prev) => ({
      ...prev,
      aadhaarFront:
        resolveDocUrl(inv.aadhaarFrontUrl, inv.documents?.aadhaarFront) || prev.aadhaarFront,
      aadhaarBack:
        resolveDocUrl(inv.aadhaarBackUrl, inv.documents?.aadhaarBack) || prev.aadhaarBack,
      panCard:
        resolveDocUrl(inv.panCardUrl, inv.documents?.panCard) || prev.panCard,
      paymentReceipt:
        resolveDocUrl(inv.paymentReceiptUrl || inv.receiptUrl, inv.documents?.paymentReceipt) ||
        prev.paymentReceipt,
      agreement:
        resolveDocUrl(
          inv.assignedPlan?.agreementUrl || inv.agreement?.agreementUrl || inv.agreementUrl,
          inv.documents?.agreement
        ) || prev.agreement,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (investor && isOpen) {
      // 1. Immediate populate from passed prop
      populateFromInvestor(investor);

      // 2. Fetch full fresh investor details from server by ID
      const invId = investor._id || investor.investorId;
      if (invId) {
        getInvestorByIdApi(invId)
          .then((res) => {
            if (isMounted && res?.investor) {
              populateFromInvestor(res.investor);
            }
          })
          .catch((err) => console.warn('Could not fetch full investor details for edit:', err));
      }
    } else if (isOpen) {
      setFormData({
        fullName: '',
        mobile: '',
        email: '',
        dateOfBirth: '',
        address: '',
        state: 'Odisha',
        district: '',
        pinCode: '',
        aadhaarNumber: '',
        panNumber: '',
        kycStatus: 'Pending',
        bankAccountNumber: '',
        bankAccountHolderName: '',
        bankName: '',
        bankIfscCode: '',
        bankBranchName: '',
        investmentAmount: '2000',
        investmentType: 'Term Capital',
        agreedReturnTerms: 'As per Approved Agreement',
        maturityDate: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        utrNumber: '',
        paymentStatus: 'Pending',
        adminRemarks: '',
        planCode: '',
        planMultiplier: 2,
        contractualPercentage: 100,
        percentageBasis: 'Total Contractual Percentage',
        planDuration: 24,
        planAssignmentDate: new Date().toISOString().split('T')[0],
        agreementStatus: 'Draft',
        planActivationStatus: 'Pending',
        sendAcknowledgement: true,
      });
      setPreviews({
        aadhaarFront: '',
        aadhaarBack: '',
        panCard: '',
        paymentReceipt: '',
        agreement: '',
      });
      setAadhaarFrontFile(null);
      setAadhaarBackFile(null);
      setPanCardFile(null);
      setPaymentReceiptFile(null);
      setAgreementFile(null);
      setError(null);
    }
    return () => {
      isMounted = false;
    };
  }, [investor, isOpen, populateFromInvestor]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === 'aadhaarFront') {
      setAadhaarFrontFile(file);
      setPreviews((prev) => ({ ...prev, aadhaarFront: URL.createObjectURL(file) }));
    } else if (field === 'aadhaarBack') {
      setAadhaarBackFile(file);
      setPreviews((prev) => ({ ...prev, aadhaarBack: URL.createObjectURL(file) }));
    } else if (field === 'panCard') {
      setPanCardFile(file);
      setPreviews((prev) => ({ ...prev, panCard: URL.createObjectURL(file) }));
    } else if (field === 'paymentReceipt') {
      setPaymentReceiptFile(file);
      setPreviews((prev) => ({ ...prev, paymentReceipt: URL.createObjectURL(file) }));
    } else if (field === 'agreement') {
      setAgreementFile(file);
      setPreviews((prev) => ({ ...prev, agreement: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please provide the investor full name.');
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.trim().length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.district) {
      setError('Please select an operational district in Odisha.');
      return;
    }

    if (!isEditMode) {
      if (!formData.investmentAmount || Number(formData.investmentAmount) <= 0) {
        setError('Please specify a positive investment amount.');
        return;
      }
      if (!formData.utrNumber.trim()) {
        setError('Please provide the UTR / Transaction Reference number.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      // Append text fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append files
      if (aadhaarFrontFile) data.append('aadhaarFront', aadhaarFrontFile);
      if (aadhaarBackFile) data.append('aadhaarBack', aadhaarBackFile);
      if (panCardFile) data.append('panCard', panCardFile);
      if (paymentReceiptFile) data.append('paymentReceipt', paymentReceiptFile);
      if (agreementFile) data.append('agreement', agreementFile);

      if (isEditMode) {
        await updateInvestorApi(investor._id, data);
      } else {
        await createInvestorApi(data);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save investor:', err);
      setError(err.message || 'Unable to save investor. Please check input values.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectedPlan = Array.isArray(plans) ? plans.find((p) => p.planCode === formData.planCode) : null;

  const handlePlanSelectChange = (e) => {
    const code = e.target.value;
    const plan = (plans || []).find((p) => p.planCode === code);
    setFormData((prev) => ({
      ...prev,
      planCode: code,
      planMultiplier: plan?.multiplier ?? prev.planMultiplier ?? 2,
      contractualPercentage: plan?.approvedPercentage ?? prev.contractualPercentage ?? 100,
      percentageBasis: plan?.percentageBasis || prev.percentageBasis || 'Total Contractual Percentage',
      planDuration: plan?.durationMonths || prev.planDuration || 24,
    }));
  };

  const calculatedMaturityDate = (() => {
    if (!formData.planAssignmentDate) return 'N/A';
    const d = new Date(formData.planAssignmentDate);
    if (isNaN(d.getTime())) return 'N/A';
    d.setMonth(d.getMonth() + (Number(formData.planDuration) || 24));
    return d.toISOString().split('T')[0];
  })();

  const originalInvestmentNum = Number(formData.investmentAmount) || 0;
  const currentMultiplier = Number(formData.planMultiplier) || 2;
  const calculatedTargetAmount = Math.round(originalInvestmentNum * currentMultiplier);

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                {isEditMode ? 'Update Investor Profile' : 'Add New Investor – Single Complete Form'}
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                {isEditMode
                  ? `Modifying record for ${investor.fullName} (${investor.investorId})`
                  : 'Complete Personal Details, KYC Documents, Investment Payment & Plan in one page.'}
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

        {/* Quick Jump Section Navigation Pills */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold shrink-0 scrollbar-none">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Sections:</span>
          <button
            type="button"
            onClick={() => scrollToSection('sec-personal')}
            className="px-3 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors shadow-2xs whitespace-nowrap"
          >
            1. Personal Details
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-kyc')}
            className="px-3 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors shadow-2xs whitespace-nowrap"
          >
            2. KYC Documents
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-payment')}
            className="px-3 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors shadow-2xs whitespace-nowrap"
          >
            3. Investment Payment
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sec-plan')}
            className="px-3 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors shadow-2xs whitespace-nowrap"
          >
            4. Investment Plan
          </button>
        </div>

        {/* Scrollable Form Body Containing ALL 4 Sections */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8 bg-slate-50/50">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 1: PERSONAL DETAILS */}
          {/* ============================================================== */}
          <div id="sec-personal" className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">1. Personal Information</h3>
                <p className="text-xs text-slate-500">Legal identification, residential address, and bank account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-slate-600 font-bold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar Sahoo"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="investor@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  District <span className="text-rose-500">*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Select District</option>
                  {districtsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">Full Residential Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, Landmark, City/Town"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">PIN Code</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="e.g. 751001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bank Information Sub-panel */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Bank Account Details (Where applicable)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    name="bankAccountHolderName"
                    value={formData.bankAccountHolderName}
                    onChange={handleChange}
                    placeholder="Holder name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g. SBI, HDFC, Canara"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    placeholder="Account Number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    name="bankIfscCode"
                    value={formData.bankIfscCode}
                    onChange={handleChange}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-medium uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Branch Name</label>
                  <input
                    type="text"
                    name="bankBranchName"
                    value={formData.bankBranchName}
                    onChange={handleChange}
                    placeholder="Branch name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: KYC DOCUMENTS */}
          {/* ============================================================== */}
          <div id="sec-kyc" className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">2. KYC Documents</h3>
                  <p className="text-xs text-slate-500">Government identity verification and document uploads</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">KYC Status:</span>
                  <select
                    name="kycStatus"
                    value={formData.kycStatus}
                    onChange={handleChange}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Aadhaar Card Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  maxLength={14}
                  placeholder="12-digit Aadhaar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">PAN Card Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-character PAN (e.g. ABCDE1234F)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-semibold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Document Uploads Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Aadhaar Front */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Aadhaar Front</span>
                  {previews.aadhaarFront && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
                    </span>
                  )}
                </div>
                {previews.aadhaarFront ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-28 bg-white flex items-center justify-center">
                    {previews.aadhaarFront.toLowerCase().includes('.pdf') ? (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <FileText className="w-7 h-7 text-rose-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-700">PDF Document</span>
                        <a
                          href={previews.aadhaarFront}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 underline font-semibold mt-1 flex items-center gap-1 hover:text-blue-800"
                        >
                          <Eye className="w-3 h-3" /> Open PDF
                        </a>
                      </div>
                    ) : (
                      <>
                        <img src={previews.aadhaarFront} alt="Aadhaar Front" className="h-full w-full object-contain" />
                        <a
                          href={previews.aadhaarFront}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/75 hover:bg-black text-white font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-2.5 h-2.5" /> View
                        </a>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-28 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1 bg-white">
                    <Upload className="w-5 h-5 text-slate-300" />
                    <span className="text-[11px]">Upload Front JPG/PNG/PDF</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'aadhaarFront')}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
                />
              </div>

              {/* Aadhaar Back */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Aadhaar Back</span>
                  {previews.aadhaarBack && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
                    </span>
                  )}
                </div>
                {previews.aadhaarBack ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-28 bg-white flex items-center justify-center">
                    {previews.aadhaarBack.toLowerCase().includes('.pdf') ? (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <FileText className="w-7 h-7 text-rose-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-700">PDF Document</span>
                        <a
                          href={previews.aadhaarBack}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 underline font-semibold mt-1 flex items-center gap-1 hover:text-blue-800"
                        >
                          <Eye className="w-3 h-3" /> Open PDF
                        </a>
                      </div>
                    ) : (
                      <>
                        <img src={previews.aadhaarBack} alt="Aadhaar Back" className="h-full w-full object-contain" />
                        <a
                          href={previews.aadhaarBack}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/75 hover:bg-black text-white font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-2.5 h-2.5" /> View
                        </a>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-28 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1 bg-white">
                    <Upload className="w-5 h-5 text-slate-300" />
                    <span className="text-[11px]">Upload Back JPG/PNG/PDF</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'aadhaarBack')}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
                />
              </div>

              {/* PAN Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">PAN Card</span>
                  {previews.panCard && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
                    </span>
                  )}
                </div>
                {previews.panCard ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-28 bg-white flex items-center justify-center">
                    {previews.panCard.toLowerCase().includes('.pdf') ? (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <FileText className="w-7 h-7 text-rose-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-700">PDF Document</span>
                        <a
                          href={previews.panCard}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 underline font-semibold mt-1 flex items-center gap-1 hover:text-blue-800"
                        >
                          <Eye className="w-3 h-3" /> Open PDF
                        </a>
                      </div>
                    ) : (
                      <>
                        <img src={previews.panCard} alt="PAN Card" className="h-full w-full object-contain" />
                        <a
                          href={previews.panCard}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/75 hover:bg-black text-white font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-2.5 h-2.5" /> View
                        </a>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-28 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1 bg-white">
                    <Upload className="w-5 h-5 text-slate-300" />
                    <span className="text-[11px]">Upload PAN Card</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'panCard')}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
                />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 3: INVESTMENT PAYMENT */}
          {/* ============================================================== */}
          <div id="sec-payment" className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">3. Investment Payment</h3>
                  <p className="text-xs text-slate-500">Capital contribution, payment receipt, and transaction reference</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Payment Status:</span>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                  >
                    <option value="Pending">Pending Verification</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Investment Amount (INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                  min="500"
                  step="500"
                  required={!isEditMode}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="Cheque">Cheque / Demand Draft</option>
                  <option value="Cash">Cash Receipt</option>
                  <option value="Other">Other Bank Payment</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">
                  UTR / Transaction ID / Reference <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="utrNumber"
                  value={formData.utrNumber}
                  onChange={handleChange}
                  placeholder="e.g. 12-digit UTR or Bank Ref Number"
                  required={!isEditMode}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-600 font-bold mb-1">Admin Remarks</label>
                <input
                  type="text"
                  name="adminRemarks"
                  value={formData.adminRemarks}
                  onChange={handleChange}
                  placeholder="e.g. Verified via company bank statement on 12/11/2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Payment Screenshot Upload & Preview */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800">
                  Payment Screenshot / Bank Receipt
                </label>
                {previews.paymentReceipt && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Uploaded
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                {previews.paymentReceipt ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-28 w-44 shrink-0 bg-white flex items-center justify-center">
                    {previews.paymentReceipt.toLowerCase().includes('.pdf') ? (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <FileText className="w-7 h-7 text-rose-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-700">Receipt PDF</span>
                        <a
                          href={previews.paymentReceipt}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 underline font-semibold mt-1 flex items-center gap-1 hover:text-blue-800"
                        >
                          <Eye className="w-3 h-3" /> Open Receipt
                        </a>
                      </div>
                    ) : (
                      <>
                        <img src={previews.paymentReceipt} alt="Payment Receipt" className="h-full w-full object-contain" />
                        <a
                          href={previews.paymentReceipt}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-1 right-1 text-[10px] px-2 py-0.5 rounded-md bg-black/75 hover:bg-black text-white font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-2.5 h-2.5" /> View
                        </a>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-28 w-44 shrink-0 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1 bg-white">
                    <Upload className="w-5 h-5 text-slate-300" />
                    <span className="text-[10px] text-center px-1">Upload Receipt JPG/PNG/PDF</span>
                  </div>
                )}
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs font-bold text-slate-800">
                    {previews.paymentReceipt ? 'Official Payment Receipt On Record' : 'Attach Official Payment Screenshot / Challan'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {previews.paymentReceipt
                      ? 'The investor payment voucher is already attached. Upload a new file only if you need to replace it.'
                      : 'Important: Uploading screenshot does not automatically mark payment verified. Strict double-entry verification remains required.'}
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'paymentReceipt')}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 4: INVESTMENT PLAN */}
          {/* ============================================================== */}
          <div id="sec-plan" className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">4. Investment Plan Assignment</h3>
                  <p className="text-xs text-slate-500">Configure approved company term plan, multiplier, duration, and legal agreement</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-semibold text-slate-500">Plan Status:</span>
                  <select
                    name="planActivationStatus"
                    value={formData.planActivationStatus}
                    onChange={handleChange}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending Activation</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Investment Amount (Synced with Section 3) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Investment Amount (₹)</label>
                <input
                  type="number"
                  name="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 50000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Investment Multiplier */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold">Investment Multiplier</label>
                  <span className="text-[10px] text-blue-600 font-semibold">Configurable</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 1.5, 2, 3].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, planMultiplier: m }))}
                      className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        Number(formData.planMultiplier) === m
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
                    name="planMultiplier"
                    value={formData.planMultiplier}
                    onChange={handleChange}
                    className="w-16 px-2 py-2 text-center rounded-lg border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    title="Custom multiplier"
                  />
                </div>
              </div>

              {/* Contractual Percentage */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Contractual Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="contractualPercentage"
                  value={formData.contractualPercentage}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Percentage Type / Calculation Basis */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Percentage Calculation Basis</label>
                <select
                  name="percentageBasis"
                  value={formData.percentageBasis}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Total Contractual Percentage">Total Contractual Percentage</option>
                  <option value="Annual">Annual</option>
                  <option value="Monthly">Monthly</option>
                  <option value="None">None (Principal / Multiplier Only)</option>
                </select>
              </div>

              {/* 2X Plan Duration */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">2X Plan Duration (Months)</label>
                <select
                  name="planDuration"
                  value={formData.planDuration}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                <label className="block text-slate-700 font-bold mb-1">Plan Assignment Date</label>
                <input
                  type="date"
                  name="planAssignmentDate"
                  value={formData.planAssignmentDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Automatically Calculated Maturity Date */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Maturity Date <span className="text-[10px] text-blue-600 font-normal">(Auto-calculated)</span>
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/60 font-mono font-bold text-blue-900">
                  {calculatedMaturityDate !== 'N/A'
                    ? new Date(calculatedMaturityDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Select Assignment Date'}
                </div>
              </div>

              {/* Agreement Status */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Agreement Status</label>
                <select
                  name="agreementStatus"
                  value={formData.agreementStatus}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Draft">Draft</option>
                  <option value="Signed">Signed by Investor</option>
                  <option value="Approved">Approved & Executed</option>
                </select>
              </div>
            </div>

            {/* Agreement Upload / Generation Card */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800">
                  Signed Investment Agreement Document (PDF / Image)
                </label>
                {previews.agreement && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Uploaded
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                {previews.agreement ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block">Agreement Document Attached</span>
                        <span className="text-[10px] text-emerald-700">Official agreement on record</span>
                      </div>
                    </div>
                    <a
                      href={previews.agreement}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 shrink-0 shadow-xs"
                    >
                      <Eye className="w-3 h-3" /> View
                    </a>
                  </div>
                ) : (
                  <div className="h-16 w-32 shrink-0 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1 bg-white">
                    <FileText className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px]">Agreement File</span>
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    {previews.agreement ? 'Replace Signed Investment Agreement (Optional)' : 'Upload Signed Investment Agreement'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Upload official statutory bond or agreement signed with Utkal Finance.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileChange(e, 'agreement')}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Modal Footer with Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isEditMode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Investor</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Investor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default AddInvestorModal;
