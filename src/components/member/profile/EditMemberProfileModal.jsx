import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Image,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Briefcase,
  Shield,
  Bell,
  Sparkles,
} from 'lucide-react';

/**
 * EditMemberProfileModal Component
 * Full-featured profile editor allowing members to update their personal, contact, and address records.
 */
export function EditMemberProfileModal({
  isOpen,
  onClose,
  initialData = {},
  onSave,
  initialTab = 'personal',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    occupation: 'Self Employed',
    email: '',
    mobile: '',
    altMobile: '',
    preferredCommunication: 'SMS & Email',
    address1: '',
    address2: '',
    district: '',
    state: 'Odisha',
    pincode: '',
    photoUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync form data when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'personal');
      setErrorMessage('');
      setSuccessMessage('');
      setFormData({
        name: initialData.name || '',
        dob: initialData.dob && initialData.dob !== 'Not provided' ? initialData.dob : '',
        gender: initialData.gender && initialData.gender !== 'Not provided' ? initialData.gender : 'Male',
        occupation: initialData.occupation && initialData.occupation !== 'Not provided' ? initialData.occupation : 'Self Employed',
        email: initialData.email && initialData.email !== 'Not provided' ? initialData.email : '',
        mobile: initialData.mobile && initialData.mobile !== 'Not provided' ? initialData.mobile.replace(/^\+91\s*/, '') : '',
        altMobile: initialData.altMobile && initialData.altMobile !== 'Not provided' ? initialData.altMobile.replace(/^\+91\s*/, '') : '',
        preferredCommunication: initialData.preferredCommunication || 'SMS & Email',
        address1: initialData.address1 || initialData.address || '',
        address2: initialData.address2 || '',
        district: initialData.district && initialData.district !== 'Not provided' ? initialData.district : '',
        state: initialData.state || 'Odisha',
        pincode: initialData.pincode && initialData.pincode !== 'Not provided' ? initialData.pincode : '',
        photoUrl: initialData.photoUrl || '',
      });
    }
  }, [isOpen, initialData, initialTab]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Legal Full Name is required');
      setActiveTab('personal');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Email address is required');
      setActiveTab('contact');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      setSuccessMessage('Profile update request submitted for admin approval! Changes will take effect once verified.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit profile update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'contact', label: 'Contact Details', icon: Mail },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'avatar', label: 'Profile Photo', icon: Image },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in text-left">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0B1528] to-[#003366] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                Edit Member Profile
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase">
                  Approval Required
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Submit update requests for administrative review and verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS HEADER */}
        <div className="px-6 pt-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#004085] text-[#004085] bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#004085]' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* NOTICES */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM BODY */}
        <form id="edit-profile-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Chandra Das"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Gender
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Occupation / Profession
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="e.g. Business Owner / Agriculture / Salaried"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT DETAILS */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@domain.com"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-mono rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Used for official statements, loan notices, and password reset.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Primary Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 text-slate-900 text-xs font-mono rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Alternate Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="altMobile"
                      value={formData.altMobile}
                      onChange={handleChange}
                      placeholder="9123456780 (Optional)"
                      className="w-full bg-slate-50 text-slate-900 text-xs font-mono rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Communication Preference
                </label>
                <div className="relative">
                  <Bell className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    name="preferredCommunication"
                    value={formData.preferredCommunication}
                    onChange={handleChange}
                    className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="SMS & Email">SMS &amp; Email (Recommended)</option>
                    <option value="WhatsApp & SMS">WhatsApp &amp; SMS</option>
                    <option value="Email Only">Email Only</option>
                    <option value="SMS Only">SMS Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Street Address Line 1
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                    placeholder="Plot / House / Street Name"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  placeholder="Area / Landmark / Post Office"
                  className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Khurda"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Odisha"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Postal PIN</label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="751012"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-mono font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AVATAR / PROFILE PHOTO */}
          {activeTab === 'avatar' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}

                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Profile Avatar Preview
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Paste a direct image URL or cloud link to update your member avatar.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Profile Photo URL
                </label>
                <div className="relative">
                  <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-mono rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="edit-profile-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004085] hover:bg-[#003066] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Submit for Admin Approval</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
