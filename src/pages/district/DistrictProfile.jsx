import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Save,
  RefreshCw,
  BadgeCheck,
  ShieldAlert,
  Coins,
  Users,
} from 'lucide-react';
import {
  getDistrictAdminProfileApi,
  updateDistrictAdminProfileApi,
} from '../../services/districtAdminService';

export default function DistrictProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
  });
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDistrictAdminProfileApi();
      setProfile(data);
      setFormData({
        name: data.name || '',
        mobile: data.mobile || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Unable to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    try {
      setIsUpdatingInfo(true);
      const res = await updateDistrictAdminProfileApi({
        name: formData.name.trim(),
        mobile: cleanMobile,
      });

      setSuccessMsg(res.message || 'District Partner profile updated successfully.');
      setProfile((prev) => ({
        ...prev,
        name: formData.name.trim(),
        mobile: cleanMobile,
      }));

      // Update stored user in localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const userObj = JSON.parse(stored);
          userObj.name = formData.name.trim();
          userObj.mobile = cleanMobile;
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (_) {}
      }

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update profile info:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!passwordData.currentPassword) {
      setError('Current password is required.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await updateDistrictAdminProfileApi({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccessMsg(res.message || 'Security password updated successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setError(err.message || 'Failed to change password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const assignedDistrict = profile?.assignedDistrict || 'District';
  const circleLabel = assignedDistrict.toLowerCase().includes('circle')
    ? assignedDistrict
    : `${assignedDistrict} Circle`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <RefreshCw className="w-8 h-8 text-blue-700 animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading District Partner Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left pb-12">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-700" />
          <span>My Profile &amp; Jurisdiction Credentials</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Review your assigned Circle jurisdiction, contact details, and manage portal security credentials.
        </p>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{successMsg}</div>
        </div>
      )}

      {/* Header Profile Summary Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-2xl font-black shadow-xs">
              {profile?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-slate-900">{profile?.name || 'District Partner'}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {profile?.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-blue-700 font-mono font-bold mt-1 flex items-center gap-2">
                <span>Partner ID: {profile?.username || profile?.id?.substring(0, 8)}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">Role: District Partner</span>
              </p>
            </div>
          </div>

          {/* Assigned District Pill - Prominently Locked */}
          <div className="flex flex-col sm:items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              Assigned Circle Jurisdiction (Locked)
            </span>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
              <MapPin className="w-4 h-4 text-blue-700" />
              <div>
                <span className="text-sm font-black text-slate-900 tracking-wide">
                  {circleLabel}
                </span>
                {profile?.districtCode && (
                  <span className="ml-2 text-xs font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold">
                    {profile?.districtCode}
                  </span>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Super Admin Controlled • Fixed Circle Jurisdiction</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Edit Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Read-Only System Details & Policy */}
        <div className="lg:col-span-1 space-y-6">
          {/* Official Verification Details Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700" />
              Circle Partner Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-extrabold tracking-wider">Official Email</span>
                <div className="flex items-center gap-2 text-slate-900 font-mono font-bold break-all">
                  <Mail className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>{profile?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-extrabold tracking-wider">Registered Mobile</span>
                <div className="flex items-center gap-2 text-slate-900 font-mono font-bold">
                  <Phone className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>+91 {profile?.mobile || 'N/A'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-extrabold tracking-wider">Assigned Circle</span>
                <div className="flex items-center justify-between text-slate-900 font-bold">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{circleLabel}</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Read Only
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-extrabold tracking-wider">Appointment Date</span>
                <div className="flex items-center gap-2 text-slate-700 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* District Partner Scope Notice Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-blue-900">
              <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0" />
              <span>District Partner Authority Scope</span>
            </div>
            <p className="leading-relaxed text-blue-800 font-medium">
              As District Partner for <strong>{circleLabel}</strong>, you manage Associate Member onboarding, district referrals, investor submissions, and track verified collections and commissions within this Circle.
            </p>
            <p className="leading-relaxed text-slate-500 font-medium">
              Only Super Admin can change your Circle assignment or execute statutory payout disbursements.
            </p>
          </div>
        </div>

        {/* Right Column: Update Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Contact Information */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-700" />
              Contact Information
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-5">
              Update your display name and official mobile number used for internal communications.
            </p>

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors font-medium"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={formData.mobile}
                      maxLength={10}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors font-medium font-mono"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Locked District Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Assigned Circle Jurisdiction (Read Only)
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between cursor-not-allowed">
                  <span className="font-bold text-slate-900">{circleLabel}</span>
                  <span className="text-[11px] text-slate-400 italic">Managed strictly by Super Admin</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingInfo}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#004085] hover:bg-blue-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingInfo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Information</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Security & Password Update */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-700" />
              Security &amp; Password
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-5">
              Change your District Partner portal access password. Must be at least 6 characters.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-blue-400" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export { DistrictProfile };
