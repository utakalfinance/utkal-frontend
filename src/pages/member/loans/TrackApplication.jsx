import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
  IndianRupee,
  Building,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  User,
  MapPin,
  Lock,
  Info,
  Check,
  Send,
  Building2,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import { fetchTrackApplicationStatusApi } from '../../../services/customerLoanService';

/**
 * TrackApplication Page (/member-dashboard/loans/track)
 * Visual Redesign: Modern Fintech Banking Portal
 *
 * Implements Section 4 & 6:
 * - Application ID, Customer name, Requested loan amount (₹10,000), Selected tenure
 * - Submission date, Current status, District Admin verification status & remarks
 * - Forwarded to Super Admin status, Super Admin final approval status & remarks
 * - Distinct 5-stage visual timeline stepper:
 *   1. Application Submitted
 *   2. District Admin Verification
 *   3. Forwarded to Super Admin
 *   4. Final Approval or Rejection
 *   5. Loan Disbursement
 * - Clear Governance Clarification: Super Admin Approval sanctions the loan;
 *   Loan Disbursement is the actual release of funds.
 */
export function TrackApplication() {
  const navigate = useNavigate();
  const { memberUser, memberDetails, token } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    hasApplications: false,
    latestApplication: null,
    applications: [],
  });

  const [selectedAppId, setSelectedAppId] = useState(null);

  const initialTrackState = {
    hasApplications: false,
    latestApplication: null,
    applications: [],
  };

  const loadTrackData = async () => {
    if (!token || !memberUser?._id) return;
    setLoading(true);
    setError(null);
    setData(initialTrackState);
    setSelectedAppId(null);
    try {
      const res = await fetchTrackApplicationStatusApi(token);
      setData(res);
      if (res.applications && res.applications.length > 0) {
        setSelectedAppId(res.applications[0].applicationId);
      }
    } catch (err) {
      console.warn('Error fetching application tracking data:', err);
      setError(err.message || 'Unable to load tracking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackData();
  }, [token, memberUser?._id]);

  const activeApp =
    data.applications.find((a) => a.applicationId === selectedAppId) ||
    data.latestApplication ||
    null;

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = status || 'Submitted';
    switch (s) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending District Verification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Verification':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Verified by District Admin – Pending Final Approval':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300 font-bold';
      case 'Forwarded to Super Admin':
      case 'Pending Final Approval':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Disbursed':
        return 'bg-teal-50 text-teal-800 border-teal-300 font-black';
      case 'On Hold':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Determine stage states for the 5-step visual timeline
  const getTimelineSteps = (app) => {
    if (!app) return [];

    const isSubmitted = true;
    const districtStatus = app.districtAdminVerificationStatus;
    const isDistrictVerified = districtStatus === 'Verified';
    const isDistrictRejected = districtStatus === 'Rejected';
    const isDistrictUnderway = districtStatus === 'Under Verification' || districtStatus === 'Pending';

    const isForwarded =
      app.districtVerification?.isForwardedToSuperAdmin ||
      isDistrictVerified;

    const superAdminStatus = app.superAdminFinalApprovalStatus;
    const isApproved = superAdminStatus === 'Approved';
    const isRejected = superAdminStatus === 'Rejected';
    const isSuperAdminPending = isForwarded && !isApproved && !isRejected;

    const isDisbursed = Boolean(app.disbursement?.isDisbursed);

    return [
      {
        id: 1,
        title: 'Application Submitted',
        sub: formatDate(app.submissionDate),
        status: 'completed',
        icon: CheckCircle2,
      },
      {
        id: 2,
        title: 'District Admin Verification',
        sub: `${app.district || 'Branch'} Jurisdiction`,
        status: isDistrictVerified
          ? 'completed'
          : isDistrictRejected
          ? 'rejected'
          : isDistrictUnderway
          ? 'active'
          : 'pending',
        icon: isDistrictVerified ? CheckCircle2 : isDistrictRejected ? XCircle : Building2,
        remarks: app.districtAdminRemarks,
      },
      {
        id: 3,
        title: 'Forwarded to Super Admin',
        sub: isForwarded ? 'Forwarded for Sanction' : 'Awaiting District Sign-off',
        status: isForwarded
          ? 'completed'
          : isDistrictRejected
          ? 'skipped'
          : 'pending',
        icon: isForwarded ? CheckCircle2 : Send,
      },
      {
        id: 4,
        title: 'Super Admin Final Approval',
        sub: isApproved ? 'Sanctioned' : isRejected ? 'Rejected' : 'Under Review',
        status: isApproved
          ? 'completed'
          : isRejected
          ? 'rejected'
          : isSuperAdminPending
          ? 'active'
          : 'pending',
        icon: isApproved ? CheckCircle2 : isRejected ? XCircle : ShieldCheck,
        remarks: app.finalDecisionRemarks,
      },
      {
        id: 5,
        title: 'Loan Disbursement',
        sub: isDisbursed ? 'Funds Disbursed to Bank' : 'Pending Sanction & Release',
        status: isDisbursed
          ? 'completed'
          : isApproved
          ? 'active'
          : 'pending',
        icon: isDisbursed ? CheckCircle2 : CreditCard,
      },
    ];
  };

  const steps = activeApp ? getTimelineSteps(activeApp) : [];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Track Application Status"
        description="Monitor statutory member loan applications through the two-tier verification hierarchy: District Administration review followed by Super Admin sanction."
        badge="APPLICATION TRACKER"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'Track Application Status' },
        ]}
      >
        <button
          onClick={loadTrackData}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          title="Refresh Status"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Status</span>
        </button>
      </MemberPageHeader>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Fetching application status from MongoDB...
          </p>
        </div>
      ) : !data.hasApplications ? (
        /* EMPTY STATE */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 sm:p-14 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 border border-blue-100 shadow-xs">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              No Loan Applications on File
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You have not submitted any loan applications yet. All admitted members are eligible
              for the First Member Loan of ₹10,000 with 3, 6, or 9 months repayment tenure.
            </p>
          </div>
          <button
            onClick={() => navigate('/member-dashboard/loans/apply')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md shadow-blue-600/25 transition-all"
          >
            Apply for First Loan (₹10,000)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Multiple applications selector if customer has more than 1 */}
          {data.applications.length > 1 && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-2 shrink-0">
                Select Application:
              </span>
              {data.applications.map((app) => (
                <button
                  key={app.applicationId}
                  onClick={() => setSelectedAppId(app.applicationId)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeApp?.applicationId === app.applicationId
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="font-mono">{app.applicationId}</span>
                  <span className="text-[10px] opacity-80">({app.currentApplicationStatus})</span>
                </button>
              ))}
            </div>
          )}

          {activeApp && (
            <div className="space-y-6">
              {/* TOP HERO BANNER */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Application Identification */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/80">
                        {activeApp.applicationId}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusBadgeStyle(
                          activeApp.currentApplicationStatus
                        )}`}
                      >
                        {activeApp.currentApplicationStatus}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {activeApp.loanType || 'First Member Loan'}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Statutory Loan Application Dossier
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Applicant: <strong className="text-slate-800">{activeApp.customerName}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        Jurisdiction: <strong className="text-blue-700">{activeApp.district} District Branch</strong>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Submitted: <strong className="text-slate-800">{formatDate(activeApp.submissionDate)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right: Key Financial Metrics Highlight */}
                  <div className="flex items-center gap-3 bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200 self-start lg:self-auto shrink-0">
                    <div className="px-3 border-r border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Requested
                      </span>
                      <span className="text-lg font-black text-blue-700">
                        ₹{Number(activeApp.requestedLoanAmount || 10000).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {activeApp.selectedTenure || '3-9 Mo'}
                      </span>
                    </div>
                    <div className="px-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Sanctioned
                      </span>
                      <span className="text-lg font-black text-emerald-700">
                        {activeApp.sanctionedAmount
                          ? `₹${Number(activeApp.sanctionedAmount).toLocaleString('en-IN')}`
                          : 'Pending'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {activeApp.superAdminFinalApprovalStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-STAGE PROFESSIONAL VISUAL TIMELINE */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Two-Tier Underwriting & Approval Pipeline
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard multi-tier governance procedure mandated by Utkal Finance bylaws.
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                    LIVE BACKEND AUDIT
                  </span>
                </div>

                {/* Timeline Stepper Container */}
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                    {steps.map((step, idx) => {
                      const IconComponent = step.icon;
                      const isCompleted = step.status === 'completed';
                      const isActive = step.status === 'active';
                      const isRejected = step.status === 'rejected';

                      let circleBg = 'bg-slate-100 text-slate-400 border-slate-200';
                      let cardBg = 'bg-white border-slate-200/80';
                      let statusText = 'Pending';
                      let statusBadge = 'bg-slate-100 text-slate-500';

                      if (isCompleted) {
                        circleBg = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                        cardBg = 'bg-emerald-50/20 border-emerald-200/70';
                        statusText = 'Completed';
                        statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      } else if (isActive) {
                        circleBg = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 animate-pulse';
                        cardBg = 'bg-blue-50/30 border-blue-200 shadow-xs';
                        statusText = 'In Progress';
                        statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                      } else if (isRejected) {
                        circleBg = 'bg-rose-600 text-white border-rose-600';
                        cardBg = 'bg-rose-50/30 border-rose-200';
                        statusText = 'Declined';
                        statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                      }

                      return (
                        <div
                          key={step.id}
                          className={`p-4 rounded-2xl border transition-all ${cardBg} flex flex-col justify-between space-y-3 relative`}
                        >
                          {/* Step Header */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Stage {step.id}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge}`}
                            >
                              {statusText}
                            </span>
                          </div>

                          {/* Icon & Title */}
                          <div className="space-y-2">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${circleBg}`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 leading-snug">
                                {step.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                {step.sub}
                              </p>
                            </div>
                          </div>

                          {/* Remarks preview if present */}
                          {step.remarks && (
                            <div className="p-2 bg-white/80 rounded-lg border border-slate-200/60 text-[10px] text-slate-600 italic line-clamp-2">
                              "{step.remarks}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statutory Governance Note: Approval vs Disbursement */}
                <div className="p-4 rounded-2xl bg-linear-to-r from-blue-50/90 to-indigo-50/80 border border-blue-200/70 flex items-start gap-3 text-xs text-blue-950">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-blue-900 text-xs">
                      Statutory Policy Notice: Final Approval vs. Loan Disbursement
                    </h5>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Super Admin sanction grants official administrative approval of your credit facility.
                      <strong> Loan Disbursement</strong> is the separate operational transfer of sanctioned funds to your registered bank account. In accordance with client repayment policy, the official EMI repayment schedule activates strictly upon recorded disbursement.
                    </p>
                  </div>
                </div>
              </div>

              {/* DETAILED VERIFICATION ACCORDIONS & REMARKS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 1. District Admin Verification Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          District Administration Review
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {activeApp.district} District Branch
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        activeApp.districtAdminVerificationStatus === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : activeApp.districtAdminVerificationStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {activeApp.districtAdminVerificationStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        District Admin Official Remarks:
                      </span>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                        {activeApp.districtAdminRemarks || 'Awaiting initial review by the assigned District Administration.'}
                      </div>
                    </div>

                    {activeApp.districtRejectionReason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                        <strong>Rejection Reason:</strong> {activeApp.districtRejectionReason}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Assigned District: <strong className="text-slate-800">{activeApp.district}</strong></span>
                      <span>Forwarded to HQ: <strong className="text-slate-800">{activeApp.districtVerification?.isForwardedToSuperAdmin ? 'Yes' : 'Pending'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* 2. Super Admin Final Sanction Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Super Admin Sanction Decision
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          Headquarters Executive Review
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        activeApp.superAdminFinalApprovalStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : activeApp.superAdminFinalApprovalStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {activeApp.superAdminFinalApprovalStatus || 'Under Review'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Executive Remarks:
                      </span>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                        {activeApp.finalDecisionRemarks || 'Pending final sanction review following District verification.'}
                      </div>
                    </div>

                    {activeApp.superAdminRejectionReason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                        <strong>Reason for Rejection:</strong> {activeApp.superAdminRejectionReason}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Sanctioned Limit: <strong className="text-emerald-700 font-black">{activeApp.sanctionedAmount ? `₹${Number(activeApp.sanctionedAmount).toLocaleString('en-IN')}` : 'Pending'}</strong></span>
                      <span>Disbursement Status: <strong className="text-slate-800">{activeApp.disbursement?.isDisbursed ? 'Disbursed' : 'Awaiting Release'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* APPLICANT PARAMETERS & DOCUMENTS SUMMARY */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Loan Parameters & Attached Verification Dossier
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Requested Principal
                    </span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      ₹{Number(activeApp.requestedLoanAmount || 10000).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Selected Tenure
                    </span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      {activeApp.selectedTenure || '3 Months'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Declared Purpose
                    </span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate" title={activeApp.loanPurpose}>
                      {activeApp.loanPurpose || 'Personal / Business'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      CIBIL Score Category
                    </span>
                    <span className="text-xs font-bold text-blue-700 block mt-0.5">
                      {activeApp.cibilScore ? `${activeApp.cibilScore} (${activeApp.cibilScore > 600 ? '11% Tier' : '12% Tier'})` : '11% / 12% Policy'}
                    </span>
                  </div>
                </div>

                {/* Attached Documents Grid */}
                {activeApp.documents && activeApp.documents.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Attached KYC & Verification Documents ({activeApp.documents.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activeApp.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50/70 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate text-slate-800 font-bold text-[11px]">
                              {doc.documentType || doc.documentName || `Document ${idx + 1}`}
                            </span>
                          </div>
                          {doc.documentUrl && (
                            <a
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors shrink-0"
                              title="Open Document"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TrackApplication;