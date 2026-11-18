import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  CreditCard,
  Save,
  Check,
  Lock,
  Download,
  AlertCircle,
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';

export function AssociateProfile() {
  const { associateUser, refreshProfile } = useOutletContext();
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: 'State Bank of India',
    accountNumber: '•••• •••• 4821',
    ifsc: 'SBIN0001234',
    accountHolder: associateUser?.name || 'Associate Member',
    upiId: `${associateUser?.mobile || '9861000000'}@sbi`,
  });

  const associateName = associateUser?.name || 'Valued Associate Member';
  const associateId = associateUser?.memberId || 'NUF-AS-0001';
  const email = associateUser?.email || 'associate@utkalfinance.com';
  const mobile = associateUser?.mobile || '9861000000';
  const district = associateUser?.assignedDistrict || 'Bhubaneswar HQ';
  const joiningDate = associateUser?.createdAt
    ? new Date(associateUser.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '17 Nov 2026';

  const handleSaveBank = (e) => {
    e.preventDefault();
    setBankSaved(true);
    setIsEditingBank(false);
    setTimeout(() => setBankSaved(false), 3000);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. HEADER SECTION */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Associate Member Profile &amp; Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Official statutory registration credentials, circle attribution, and payout disbursement accounts.
        </p>
      </div>

      {/* 2. STATUTORY ASSOCIATE IDENTIFICATION CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#0D1F3C] to-[#0A294A] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-lg border border-emerald-300/30">
              {associateName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Statutory Associate Member Class</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {associateName}
              </h2>
              <p className="font-mono text-xs sm:text-sm text-emerald-400 font-extrabold">
                {associateId}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700/80 space-y-1.5 shrink-0 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">Circle Branch:</span>
              <span className="font-bold text-white">{district}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">Enrolled Since:</span>
              <span className="font-mono text-slate-200">{joiningDate}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">Approval Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-black text-[10px] uppercase border border-emerald-400/30">
                Active &amp; Approved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DOSSIER DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal & Contact Credentials */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Contact &amp; Field Credentials</h3>
              <p className="text-[11px] text-slate-500">Registered member details with New Utkal Finance</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500">
                <User className="w-4 h-4" />
                <span>Full Legal Name</span>
              </div>
              <span className="font-bold text-slate-900">{associateName}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{email}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="w-4 h-4" />
                <span>Mobile Number</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{mobile}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>Assigned Circle / Branch</span>
              </div>
              <span className="font-bold text-slate-900">{district}</span>
            </div>
          </div>
        </div>

        {/* Bank & Payout Disbursement Settings */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Commission Settlement Account</h3>
                <p className="text-[11px] text-slate-500">Bank credentials for direct brokerage deposits</p>
              </div>
            </div>

            {!isEditingBank && (
              <button
                type="button"
                onClick={() => setIsEditingBank(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          {bankSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Commission settlement account updated successfully.</span>
            </div>
          )}

          {isEditingBank ? (
            <form onSubmit={handleSaveBank} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={bankDetails.ifsc}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={bankDetails.upiId}
                    onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBank(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500">Bank Name</span>
                <span className="font-bold text-slate-900">{bankDetails.bankName}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500">Account Number</span>
                <span className="font-mono font-bold text-slate-900">{bankDetails.accountNumber}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500">IFSC Code</span>
                <span className="font-mono font-bold text-slate-900">{bankDetails.ifsc}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500">UPI Handle</span>
                <span className="font-mono font-bold text-emerald-700">{bankDetails.upiId}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. STATUTORY REGULATORY NOTE */}
      <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Statutory Compliance Notice</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          New Utkal Finance Limited is governed under the provisions of the Companies Act, 2013 and Nidhi Rules, 2014. As an approved Associate Member, you are authorized to mobilize membership admissions and coordinate statutory credit appraisals within your assigned district jurisdiction.
        </p>
      </div>
    </div>
  );
}

export default AssociateProfile;
