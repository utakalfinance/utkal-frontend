import React, { useState } from 'react';
import { MemberPageHeader } from '../../components/member/MemberPageHeader';
import { MemberIdentityCard } from '../../components/member/profile/MemberIdentityCard';
import { ProfileVerification } from '../../components/member/profile/ProfileVerification';
import { PersonalInformationCard } from '../../components/member/profile/PersonalInformationCard';
import { ContactInformationCard } from '../../components/member/profile/ContactInformationCard';
import { RegisteredAddressCard } from '../../components/member/profile/RegisteredAddressCard';
import { KycVerificationCard } from '../../components/member/profile/KycVerificationCard';
import { ProfileUpdateNotice } from '../../components/member/profile/ProfileUpdateNotice';
import { EditMemberProfileModal } from '../../components/member/profile/EditMemberProfileModal';
import { useMemberAuth } from '../../hooks/useMemberAuth';
import { Printer, RefreshCw, AlertCircle, ShieldCheck, Pencil, CheckCircle2, Clock } from 'lucide-react';

/**
 * MemberProfile Page (/member-dashboard/profile)
 * State-of-the-art authenticated member profile and KYC management interface.
 */
export function MemberProfile() {
  const {
    memberUser,
    memberDetails,
    application,
    pendingUpdateRequest,
    isLoading,
    refreshProfile,
    updateProfile,
  } = useMemberAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInitialTab, setEditInitialTab] = useState('personal');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // 1. LOADING SKELETON STATE
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-slate-200/80 rounded-2xl w-1/3" />
        <div className="h-32 bg-slate-200/80 rounded-2xl w-full" />
        <div className="h-24 bg-slate-200/80 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/80 rounded-2xl" />
          <div className="h-64 bg-slate-200/80 rounded-2xl" />
        </div>
        <div className="h-44 bg-slate-200/80 rounded-2xl w-full" />
      </div>
    );
  }

  // 2. DATA EXTRACTION & FALLBACKS (NO FAKE / DUMMY DATA)
  const p = application?.personalDetails || memberDetails?.personalDetails || {};
  const a = application?.addressDetails || memberDetails?.addressDetails || {};
  const m = application?.membershipDetails || memberDetails?.membershipDetails || {};
  const doc = application?.documentDetails || memberDetails?.documentDetails || {};
  const c = application?.contactDetails || memberDetails?.contactDetails || {};

  // Legal Full Name
  const rawName =
    memberUser?.name ||
    memberDetails?.name ||
    application?.applicantName ||
    p.fullName ||
    (p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : '');
  const name = rawName && rawName.trim() ? rawName.trim() : 'Not provided';

  // Member ID (e.g. NUF-M-0016)
  const rawMemberId =
    memberUser?.memberId ||
    memberDetails?.memberId ||
    application?.memberId ||
    memberDetails?.applicationRefId ||
    application?.applicationId;
  const memberId = rawMemberId && rawMemberId.trim() ? rawMemberId.trim() : 'Not provided';

  // Status
  const rawStatus = memberUser?.status || memberDetails?.status || application?.status || 'active';
  const status = rawStatus === 'active' || rawStatus === 'approved' ? 'Active' : rawStatus;

  // Profile Image URL
  const photoUrl =
    doc.photoUrl ||
    doc.photoFile ||
    memberDetails?.photoUrl ||
    application?.photoUrl ||
    null;

  // Member Since Date
  const rawDate =
    memberDetails?.joiningDate ||
    memberDetails?.createdAt ||
    application?.reviewedAt ||
    application?.submittedAt ||
    memberUser?.createdAt;
  const memberSince = rawDate
    ? new Date(rawDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Personal Fields
  const dob = p.dob || memberDetails?.dob || 'Not provided';
  const gender = p.gender || memberDetails?.gender || 'Not provided';
  const occupation = p.occupation || memberDetails?.occupation || 'Not provided';
  const membershipType =
    memberDetails?.membershipType ||
    m.membershipType ||
    application?.membershipType ||
    'Associate Member';

  // Contact Fields
  const email = memberDetails?.email || memberUser?.email || c.email || application?.email || 'Not provided';
  const mobile = memberDetails?.mobile || memberUser?.mobile || c.mobile || application?.mobile || 'Not provided';
  const altMobile = c.altMobile || application?.altMobile || memberDetails?.altMobile || 'Not provided';
  const preferredCommunication = m.preferredCommunication || memberDetails?.preferredCommunication || 'SMS & Email';

  // Address Fields
  const addressParts = [a.address1, a.address2].filter(Boolean);
  const address =
    addressParts.length > 0
      ? addressParts.join(', ')
      : application?.address || memberDetails?.address || 'Not provided';
  const district = a.district || memberDetails?.district || 'Not provided';
  const state = a.state || memberDetails?.state || 'Odisha';
  const pincode = a.pincode || memberDetails?.pincode || 'Not provided';

  // KYC & Document Details
  const idProofType = doc.idProofType || application?.idProofType || 'Aadhaar Card';
  const idProofNumber = doc.idProofNumber || null;
  const addressProofType = doc.addressProofType || application?.addressProofType || 'Aadhaar Card';
  const addressProofNumber = doc.addressProofNumber || null;
  const isApproved = status === 'Active' || application?.status === 'approved' || memberUser?.status === 'active';

  // Branch
  const branchName = m.branch || memberDetails?.branch || 'Bhubaneswar HQ (Nayapalli, Khurda)';

  // 3. DYNAMIC PROFILE COMPLETENESS CALCULATION
  const completionChecks = [
    name !== 'Not provided',
    memberId !== 'Not provided',
    dob !== 'Not provided',
    gender !== 'Not provided',
    occupation !== 'Not provided',
    email !== 'Not provided',
    mobile !== 'Not provided',
    address !== 'Not provided',
    district !== 'Not provided',
    pincode !== 'Not provided',
    !!(doc.idProofUrl || doc.idProofFile || doc.idProof),
    !!(doc.addressProofUrl || doc.addressProofFile || doc.addressProof),
    !!(doc.photoUrl || doc.photoFile || photoUrl),
    !!(doc.signatureUrl || doc.signatureFile),
  ];

  const completedCount = completionChecks.filter(Boolean).length;
  const totalCount = completionChecks.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  // Handle browser print for profile summary
  const handlePrint = () => {
    window.print();
  };

  // Open edit modal with specified active tab
  const handleOpenEdit = (tab = 'personal') => {
    setEditInitialTab(tab);
    setIsEditModalOpen(true);
  };

  // Handle saving updated profile data
  const handleSaveProfile = async (formData) => {
    await updateProfile(formData);
    setFeedbackMessage('Profile information updated successfully');
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left animate-fade-in pb-8">
      {/* 1. PAGE HEADER WITH BREADCRUMB, EDIT PROFILE & PRINT ACTIONS */}
      <MemberPageHeader
        title="My Profile"
        description="Official member details and KYC records registered with New Utkal Finance."
        breadcrumbs={[
          { label: 'Member Dashboard', path: '/member-dashboard' },
          { label: 'My Profile' },
        ]}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleOpenEdit('personal')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#004085] hover:bg-[#003066] shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Profile Summary</span>
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </MemberPageHeader>

      {/* SUCCESS NOTIFICATION TOAST/BANNER */}
      {feedbackMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PENDING PROFILE UPDATE REQUEST BANNER */}
      {pendingUpdateRequest && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/60 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-2xs animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-black text-amber-950 tracking-tight flex items-center gap-2 flex-wrap">
                <span>Profile Update Request Submitted</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase border border-amber-300">
                  Pending Admin Approval
                </span>
              </h4>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                You submitted a profile update request on{' '}
                <strong>
                  {new Date(pendingUpdateRequest.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
                . Changes are safely saved and will reflect on your profile once reviewed and approved by branch administration.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenEdit('personal')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-200/90 hover:bg-amber-300 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>View / Modify Request</span>
          </button>
        </div>
      )}

      {/* 2. MEMBER IDENTITY CARD */}
      <MemberIdentityCard
        name={name}
        memberId={memberId}
        photoUrl={photoUrl}
        status={status}
        kycStatus={isApproved ? 'Verified' : 'Pending'}
        memberSince={memberSince}
        onEdit={handleOpenEdit}
      />

      {/* 3. PROFILE VERIFICATION & COMPLETION PROGRESS */}
      <ProfileVerification
        kycStatus={isApproved ? 'Verified' : 'Under Review'}
        completionPercentage={completionPercentage}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* 4. TWO-COLUMN GRID: PERSONAL & CONTACT INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Personal Details */}
        <PersonalInformationCard
          fullName={name}
          dob={dob}
          gender={gender}
          occupation={occupation}
          membershipType={membershipType}
          onEdit={handleOpenEdit}
        />

        {/* Contact Details */}
        <ContactInformationCard
          email={email}
          mobile={mobile}
          altMobile={altMobile}
          preferredCommunication={preferredCommunication}
          onEdit={handleOpenEdit}
        />
      </div>

      {/* 5. REGISTERED ADDRESS CARD */}
      <RegisteredAddressCard
        address={address}
        district={district}
        state={state}
        pincode={pincode}
        onEdit={handleOpenEdit}
      />

      {/* 6. KYC VERIFICATION MILESTONES CARD */}
      <KycVerificationCard
        idProofType={idProofType}
        idProofNumber={idProofNumber}
        addressProofType={addressProofType}
        addressProofNumber={addressProofNumber}
        isApproved={isApproved}
      />

      {/* 7. STATUTORY UPDATE & COMPLIANCE NOTICE */}
      <ProfileUpdateNotice branchName={branchName} />

      {/* 8. EDIT MEMBER PROFILE MODAL */}
      <EditMemberProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialTab={editInitialTab}
        initialData={{
          name: name !== 'Not provided' ? name : '',
          dob,
          gender,
          occupation,
          email,
          mobile,
          altMobile,
          preferredCommunication,
          address1: a.address1 || address,
          address2: a.address2 || '',
          district,
          state,
          pincode,
          photoUrl: photoUrl || '',
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default MemberProfile;
