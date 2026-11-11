import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  User,
  Mail,
  Phone,
  AtSign,
  MapPin,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export function AddDistrictAdminModal({
  isOpen,
  onClose,
  onSubmit,
  districts = [],
  initialDistrictId = '',
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    username: '',
    districtId: '',
    status: 'active',
    customPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Success dialog after creation
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const selectedDistId = initialDistrictId || (districts.length > 0 ? districts[0]._id : '');
      setFormData({
        name: '',
        email: '',
        mobile: '',
        username: '',
        districtId: selectedDistId,
        status: 'active',
        customPassword: '',
      });
      setErrors({});
      setServerError('');
      setCreatedResult(null);
      setCopied(false);
    }
  }, [isOpen, districts, initialDistrictId]);

  // Auto-generate username when email or district changes
  const handleEmailChange = (e) => {
    const emailVal = e.target.value;
    setFormData((prev) => {
      const suggestedUsername = !prev.username || prev.username === prev.email.split('@')[0]
        ? emailVal.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '')
        : prev.username;
      return { ...prev, email: emailVal, username: suggestedUsername };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    const cleanPhone = formData.mobile.trim().replace(/\D/g, '');
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (cleanPhone.length < 10) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.districtId) {
      newErrors.districtId = 'Please select an assigned district';
    }

    if (formData.customPassword && formData.customPassword.trim().length < 6) {
      newErrors.customPassword = 'Password must be at least 6 characters';
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
      const result = await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        username: formData.username.trim().toLowerCase(),
        districtId: formData.districtId,
        status: formData.status,
        customPassword: formData.customPassword.trim() || undefined,
      });

      // Show temporary password result card
      setCreatedResult(result);
    } catch (err) {
      setServerError(err.message || 'Failed to create district administrator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!createdResult) return;
    const portalUrl = `${window.location.origin}/district-admin/login`;
    const textToCopy = `Utkal Finance - District Admin Login Credentials
Portal URL: ${portalUrl}
Login Email / ID: ${createdResult.admin?.email}
Username: ${createdResult.admin?.username}
Temporary Password: ${createdResult.temporaryPassword}
Assigned District Circle: ${createdResult.admin?.assignedDistrict}

How to Open District Dashboard:
1. Open ${portalUrl} in your browser
2. Log in using your email or username and temporary password
3. You will immediately access the ${createdResult.admin?.assignedDistrict} District Dashboard.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[82vh] flex flex-col my-auto text-left animate-slide-up">
        {/* Header - Fixed & Pinned */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#004085] dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {createdResult ? 'District Admin Created' : 'Add New District Admin'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {createdResult
                  ? 'Account generated successfully. Share login credentials.'
                  : 'Register a nodal circle administrator for district loan verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {createdResult ? (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Result Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Administrator Registered Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    The account has been created with role <span className="font-mono font-semibold">district_admin</span> and bound to <span className="font-semibold">{createdResult.admin?.assignedDistrict}</span> circle.
                  </p>
                </div>
              </div>

              {/* Credentials Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Administrator Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-sans">{createdResult.admin?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Email / Login ID:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{createdResult.admin?.email}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Username:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">@{createdResult.admin?.username}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Assigned District:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-sans">{createdResult.admin?.assignedDistrict}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Temporary Password:</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                    {createdResult.temporaryPassword}
                  </span>
                </div>
              </div>

              {/* Access Instructions */}
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <p className="font-bold text-[#004085] dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>How the District Admin Opens Their District:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>
                    Direct District Portal URL: <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{window.location.origin}/district-admin/login</span>
                  </li>
                  <li>
                    Sign in with their Login ID / Email and temporary password.
                  </li>
                  <li>
                    Upon login, they will open their <span className="font-bold text-slate-900 dark:text-white">{createdResult.admin?.assignedDistrict}</span> district dashboard with all scoped associate members, loan verification pipelines, and financial records.
                  </li>
                </ul>
              </div>
            </div>

            {/* Pinned Footer Actions */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#004085] hover:bg-[#003366] text-white shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Form Body with Visible Side Scrollbar */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {/* Banner when adding admin for a specific district */}
              {initialDistrictId && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#004085] dark:text-blue-400 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Assigning Admin to Circle:{' '}
                      <span className="font-extrabold text-[#004085] dark:text-blue-400">
                        {districts.find((d) => d._id?.toString() === formData.districtId?.toString())?.name || 'Selected Circle'}
                      </span>
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-900/60 text-[#004085] dark:text-blue-300 px-2 py-0.5 rounded">
                    Direct Assignment
                  </span>
                </div>
              )}

              {serverError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Rajesh Kumar Mohapatra"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      placeholder="khurda.admin@utkalfinance.com"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="9437012345"
                      maxLength={10}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        errors.mobile ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {errors.mobile && <p className="text-[11px] text-red-500 mt-1">{errors.mobile}</p>}
                </div>
              </div>

              {/* Username & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username <span className="text-slate-400 font-normal">(Optional login alias)</span>
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                      placeholder="e.g., khurda.admin"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned District <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={formData.districtId}
                      onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                        errors.districtId ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                      }`}
                    >
                      <option value="">Select Circle District</option>
                      {districts.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} {d.code ? `(${d.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.districtId && <p className="text-[11px] text-red-500 mt-1">{errors.districtId}</p>}
                </div>
              </div>

              {/* Custom Password & Account Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Temporary Password <span className="text-slate-400 font-normal">(Leave blank to auto-generate)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.customPassword}
                      onChange={(e) => setFormData({ ...formData, customPassword: e.target.value })}
                      placeholder="Auto-generated secure password"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.customPassword && <p className="text-[11px] text-red-500 mt-1">{errors.customPassword}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active (Immediate Portal Access)</option>
                    <option value="inactive">Inactive (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Note */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                <span className="font-bold">Security Note:</span> The password will be hashed with bcrypt before saving to MongoDB. You will receive a copy of the temporary password upon creation.
              </div>
            </div>

            {/* Pinned Sticky Footer Actions */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-black rounded-xl bg-[#004085] hover:bg-[#003366] text-white shadow-md shadow-blue-900/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Admin...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Create District Admin</span>
                  </>
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
