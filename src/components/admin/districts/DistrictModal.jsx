import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
} from 'lucide-react';

export function DistrictModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create', // 'create' | 'edit'
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    state: 'Odisha',
    address: '',
    contactNumber: '',
    email: '',
    description: '',
    status: 'active',
    adminName: '',
    username: '',
    customPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        state: initialData.state || 'Odisha',
        address: initialData.address || '',
        contactNumber: initialData.contactNumber || initialData.assignedAdmin?.phone || '',
        email: initialData.email || initialData.assignedAdmin?.email || '',
        description: initialData.description || '',
        status: initialData.status || 'active',
        adminName: initialData.assignedAdmin?.name || '',
        username: '',
        customPassword: '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        state: 'Odisha',
        address: '',
        contactNumber: '',
        email: '',
        description: '',
        status: 'active',
        adminName: '',
        username: '',
        customPassword: '',
      });
    }
    setErrors({});
    setServerError('');
    setCreatedResult(null);
    setCopied(false);
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'District Name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'District Code is required (e.g. OD-KHU-01)';
    } else if (formData.code.trim().length < 2) {
      newErrors.code = 'District Code must be at least 2 characters';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Branch / Office Address is required';
    }

    const rawContact = formData.contactNumber.replace(/\D/g, '');
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact / Mobile Number is required';
    } else if (rawContact.length < 10) {
      newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Official Email Address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (mode === 'create' && !formData.adminName.trim()) {
      newErrors.adminName = 'Administrator Full Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await onSubmit({
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        state: formData.state.trim(),
        address: formData.address.trim(),
        contactNumber: formData.contactNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        description: formData.description.trim(),
        adminName: formData.adminName?.trim(),
        username: formData.username?.trim(),
        customPassword: formData.customPassword?.trim(),
      });

      if (mode === 'create' && res?.admin && res?.temporaryPassword) {
        setCreatedResult(res);
      } else {
        onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Failed to save district and administrator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const credText = `Utkal Finance - District Admin Portal Credentials\nDistrict Circle: ${createdResult.admin?.assignedDistrict || formData.name}\nAdmin Name: ${createdResult.admin?.name || formData.adminName}\nUsername: ${createdResult.admin?.username}\nTemporary Password: ${createdResult.temporaryPassword}\nLogin Portal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden text-left animate-slide-up max-h-[84vh] flex flex-col my-auto">
        {/* HEADER - Fixed & Pinned */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#004085] text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {createdResult
                  ? 'District & Administrator Created'
                  : mode === 'edit'
                  ? `Edit District: ${initialData?.name}`
                  : 'Add Operational District & Admin'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {createdResult
                  ? 'Circle registered & administrative credentials provisioned in MongoDB.'
                  : mode === 'edit'
                  ? 'Update operational circle details, office address, and status.'
                  : 'Register operational circle & provision designated District Admin in one step.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SERVER ERROR ALERT */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-bold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW A: SUCCESS CREDENTIALS CARD */}
        {/* ================================================================= */}
        {createdResult ? (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-950">
                    Registration &amp; Provisioning Completed
                  </p>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    District circle <strong className="text-emerald-950">{createdResult.district?.name}</strong> has been registered and administrator account <strong className="text-emerald-950">{createdResult.admin?.name}</strong> is now live in MongoDB.
                  </p>
                </div>
              </div>

              {/* CREDENTIALS BOX */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-sans">
                    Admin Portal Credentials
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-sans font-bold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1 font-sans">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 text-xs">District Circle:</span>
                    <span className="font-bold text-white text-xs">{createdResult.admin?.assignedDistrict || formData.name} Circle</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 text-xs">Administrator Name:</span>
                    <span className="font-bold text-white text-xs">{createdResult.admin?.name || formData.adminName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80 font-mono">
                    <span className="text-slate-400 text-xs font-sans">Login Username:</span>
                    <span className="font-bold text-blue-300 text-xs">{createdResult.admin?.username}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80 font-mono">
                    <span className="text-slate-400 text-xs font-sans">Official Email:</span>
                    <span className="text-white text-xs">{createdResult.admin?.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 font-mono">
                    <span className="text-slate-400 text-xs font-sans">Temporary Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 text-xs tracking-wider">
                        {showPassword ? createdResult.temporaryPassword : '••••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Official credentials have also been dispatched to <strong>{createdResult.admin?.email}</strong> via Nodemailer.
              </p>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#004085] hover:bg-[#003366] text-white shadow-md shadow-blue-900/20 transition-all cursor-pointer"
              >
                Done &amp; View in District Management
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* VIEW B: UNIFIED DISTRICT & ADMIN CREATION / EDIT FORM */
          /* ================================================================= */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              {/* SECTION 1: DISTRICT OPERATIONAL DETAILS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-[#004085]" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    1. Operational Circle &amp; Branch Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* DISTRICT NAME */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      District Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Khurda, Cuttack, Ganjam"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
                  </div>

                  {/* DISTRICT CODE */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      District Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OD-KHU-01"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.code ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.code && <p className="text-[11px] text-rose-500 font-medium">{errors.code}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* STATE */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* STATUS */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      Operational Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    >
                      <option value="active">Active (Accepting Registrations &amp; Circles)</option>
                      <option value="inactive">Inactive (Temporarily Suspended)</option>
                    </select>
                  </div>
                </div>

                {/* BRANCH ADDRESS */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    Branch / Office Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Plot No. 214, IRC Village, Nayapalli, Bhubaneswar, 751015"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      errors.address ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.address && <p className="text-[11px] text-rose-500 font-medium">{errors.address}</p>}
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    Circle Description / Operational Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Regional circle coordinating cooperative savings and credit facilities."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004085]"
                  />
                </div>
              </div>

              {/* SECTION 2: DISTRICT ADMINISTRATOR DETAILS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#004085]" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    2. Designated District Administrator Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* ADMIN FULL NAME */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      Administrator Full Name {mode === 'create' && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. Rajesh Kumar Mohapatra`}
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.adminName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.adminName && <p className="text-[11px] text-rose-500 font-medium">{errors.adminName}</p>}
                  </div>

                  {/* ADMIN MOBILE */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      Mobile / Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9861012345"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value.replace(/\D/g, '') })}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.contactNumber ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.contactNumber && <p className="text-[11px] text-rose-500 font-medium">{errors.contactNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* OFFICIAL EMAIL */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      Official Login &amp; Branch Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. khurda.admin@newutkalfinance.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>}
                  </div>

                  {/* USERNAME */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      Username <span className="text-slate-400 font-normal">(Optional login alias)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. admin.${formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'district'}`}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* TEMPORARY PASSWORD */}
                {mode === 'create' && (
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      Temporary Password <span className="text-slate-400 font-normal">(Leave blank to auto-generate)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generates secure password if blank"
                      value={formData.customPassword}
                      onChange={(e) => setFormData({ ...formData, customPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* INFO NOTE */}
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 leading-relaxed font-medium">
                  <span className="font-bold">Security Note:</span> The District Admin account will be provisioned simultaneously in MongoDB. Official login credentials will be dispatched to <strong>{formData.email || 'the specified email'}</strong> and displayed upon creation.
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS - PINNED & VISIBLE */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#004085] hover:bg-[#003366] text-white shadow-md shadow-blue-900/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving to MongoDB...</span>
                  </>
                ) : (
                  <span>{mode === 'edit' ? 'Save District Changes' : 'Create District & Admin'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default DistrictModal;
