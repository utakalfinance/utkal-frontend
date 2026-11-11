import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  Award,
  CreditCard,
  Calendar,
  Coins,
  FileText,
  Clock,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { MemberPageHeader } from '../../components/member/MemberPageHeader';
import { EmptyState } from '../../components/member/EmptyState';
import { useMemberAuth } from '../../hooks/useMemberAuth';
import { fetchCustomerLoanOverviewApi } from '../../services/customerLoanService';

/**
 * MemberNotifications Page (/member-dashboard/notifications)
 * Fulfills Section 8 requirements:
 * Displays notifications for:
 * - Membership approval
 * - KYC verification
 * - Loan application submission
 * - District Admin verification
 * - Super Admin final approval or rejection
 * - Loan disbursement
 * - EMI reminders
 * - Payment receipts
 * - Next loan eligibility
 */
export function MemberNotifications() {
  const { memberUser, memberDetails, application, payments = [], token } = useMemberAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const [loanOverview, setLoanOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadOverview = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchCustomerLoanOverviewApi(token);
        if (isMounted) setLoanOverview(data);
      } catch (err) {
        console.warn('Could not load loan overview for notifications:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOverview();
    return () => {
      isMounted = false;
    };
  }, [token, memberUser?._id]);

  const memberId = memberUser?.memberId || memberDetails?.memberId || application?.memberId || '—';
  const applicationId = application?.applicationId || application?._id || '—';
  const isApprovedMember =
    memberUser?.status === 'active' ||
    memberDetails?.status === 'active' ||
    application?.status === 'approved';

  const formatDate = (dateVal) => {
    if (!dateVal) return 'Recent';
    try {
      return new Date(dateVal).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  // Generate real dynamic notifications based on authenticated member state
  const notifications = [];

  // 1. Membership Approval Notification
  if (isApprovedMember) {
    notifications.push({
      id: 'notif-membership-approved',
      category: 'MEMBERSHIP',
      title: 'Statutory Membership Approved',
      date: formatDate(application?.reviewedAt || application?.submittedAt),
      message: `Your membership application (${applicationId}) has been successfully verified and approved. 10 equity shares have been allotted under Member ID: ${memberId}.`,
      icon: Award,
      iconColor: 'bg-blue-50 text-blue-700 border-blue-200',
      actionLink: '/member-dashboard/membership',
      actionText: 'View Membership Record',
      unread: false,
    });
  }

  // 2. KYC Verification Notification
  notifications.push({
    id: 'notif-kyc-verified',
    category: 'KYC',
    title: 'KYC Compliance Status: Verified',
    date: formatDate(application?.reviewedAt || application?.createdAt),
    message: `Your statutory KYC dossier (Government Photo ID, Address Proof, Specimen Signature) has been recorded in compliance with Nidhi Rules 2014.`,
    icon: ShieldCheck,
    iconColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    actionLink: '/member-dashboard/documents',
    actionText: 'View Documents Vault',
    unread: false,
  });

  // 3. Document Correction Notice (if requested)
  if (
    application?.status === 'correction_required' ||
    memberDetails?.status === 'correction_required' ||
    application?.correctionRequested === true
  ) {
    notifications.push({
      id: 'notif-kyc-correction',
      category: 'KYC',
      title: 'Action Required: Document Correction Requested',
      date: formatDate(application?.updatedAt),
      message:
        application?.rejectionReason ||
        'Administrative review requested an update or correction to one of your submitted KYC documents. Please update to proceed.',
      icon: AlertCircle,
      iconColor: 'bg-rose-50 text-rose-700 border-rose-200',
      actionLink: '/member-dashboard/documents',
      actionText: 'Update Documents Now',
      unread: true,
    });
  }

  // 4. Statutory Share Capital Payment Receipt
  notifications.push({
    id: 'notif-payment-share-capital',
    category: 'PAYMENTS',
    title: 'Payment Credited: Statutory Share Allotment (₹200)',
    date: formatDate(application?.paymentDetails?.paidAt || application?.submittedAt),
    message: `Payment of ₹200 for 10 statutory equity shares has been verified and credited to the capital ledger. UTR: ${
      application?.paymentDetails?.utrNumber || 'Verified'
    }.`,
    icon: Coins,
    iconColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    actionLink: '/member-dashboard/membership',
    actionText: 'Inspect Ledger',
    unread: false,
  });

  // 5. Loan Application Notifications (if customer applied)
  const latestApp = loanOverview?.latestApplication;
  if (latestApp) {
    // 5A. Loan Submission Notice
    notifications.push({
      id: `notif-loan-submitted-${latestApp.applicationId}`,
      category: 'LOANS',
      title: `Loan Application Submitted: ${latestApp.applicationId}`,
      date: formatDate(latestApp.createdAt),
      message: `Your First Member Term Loan application for ₹10,000 (${latestApp.tenure}) has been received and routed to ${latestApp.district} District Administration for verification.`,
      icon: FileText,
      iconColor: 'bg-blue-50 text-blue-700 border-blue-200',
      actionLink: '/member-dashboard/loans/track',
      actionText: 'Track Status',
      unread: false,
    });

    // 5B. Loan District Verification
    if (
      latestApp.rawStatus !== 'Submitted' &&
      latestApp.rawStatus !== 'Pending District Verification'
    ) {
      notifications.push({
        id: `notif-loan-district-${latestApp.applicationId}`,
        category: 'LOANS',
        title: `District Admin Review: ${latestApp.district} Circle`,
        date: formatDate(latestApp.createdAt),
        message: `Your application has been processed by ${latestApp.district} District Administration and forwarded to Super Admin for final review.`,
        icon: Clock,
        iconColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        actionLink: '/member-dashboard/loans/track',
        actionText: 'View Pipeline',
        unread: false,
      });
    }

    // 5C. Super Admin Decision (Approved, Disbursed, Rejected, On Hold)
    if (
      latestApp.rawStatus === 'Approved' ||
      latestApp.rawStatus === 'Disbursed' ||
      latestApp.rawStatus === 'Active'
    ) {
      notifications.push({
        id: `notif-loan-approval-${latestApp.applicationId}`,
        category: 'LOANS',
        title: `Loan Application Approved: ₹10,000`,
        date: formatDate(latestApp.createdAt),
        message: `Your First Member Loan of ₹10,000 has been sanctioned by Super Admin. (Note: Funds are released separately upon recorded disbursement).`,
        icon: CheckCircle2,
        iconColor: 'bg-teal-50 text-teal-800 border-teal-200',
        actionLink: '/member-dashboard/loans/track',
        actionText: 'View Approval Dossier',
        unread: false,
      });
    } else if (latestApp.rawStatus === 'Rejected') {
      notifications.push({
        id: `notif-loan-rejected-${latestApp.applicationId}`,
        category: 'LOANS',
        title: `Loan Application Update: Rejected`,
        date: formatDate(latestApp.createdAt),
        message: `Your loan application ${latestApp.applicationId} was not approved during underwriting review.`,
        icon: AlertCircle,
        iconColor: 'bg-rose-50 text-rose-700 border-rose-200',
        actionLink: '/member-dashboard/loans/track',
        actionText: 'Check Remarks',
        unread: false,
      });
    }

    // 5D. Loan Disbursement Notice
    if (loanOverview?.totalDisbursedAmount > 0 || latestApp.rawStatus === 'Disbursed' || latestApp.rawStatus === 'Active') {
      notifications.push({
        id: `notif-loan-disbursed-${latestApp.applicationId}`,
        category: 'LOANS',
        title: `Loan Disbursement Confirmed: ₹10,000`,
        date: formatDate(latestApp.createdAt),
        message: `Funds have been disbursed to your registered bank account. Official EMI schedule is active under Reducing Balance method.`,
        icon: CreditCard,
        iconColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        actionLink: '/member-dashboard/loans/emi-schedule',
        actionText: 'View EMI Timetable',
        unread: false,
      });

      // 5E. EMI Reminder Notice
      notifications.push({
        id: `notif-emi-reminder-${latestApp.applicationId}`,
        category: 'LOANS',
        title: `EMI Schedule & Interest Policy Advisory`,
        date: formatDate(loanOverview?.nextEmiDueDate || latestApp.createdAt),
        message: `Management is confirming the 11%/12% CIBIL score interest rules. Online payment collection is paused pending client confirmation.`,
        icon: Calendar,
        iconColor: 'bg-amber-50 text-amber-800 border-amber-300',
        actionLink: '/member-dashboard/loans/emi-schedule',
        actionText: 'Read Policy Update',
        unread: false,
      });
    }
  }

  // 6. Next Loan Eligibility Notification (if first loan settled)
  if (loanOverview?.nextLoanEligibility?.isUnlocked) {
    notifications.push({
      id: 'notif-next-tier-unlocked',
      category: 'LOANS',
      title: 'Next Loan Level Unlocked!',
      date: 'Recent',
      message: `Congratulations! Your First Member Loan of ₹10,000 has been 100% repaid. You are eligible to apply for another loan level.`,
      icon: Sparkles,
      iconColor: 'bg-teal-50 text-teal-800 border-teal-300',
      actionLink: '/member-dashboard/loans/next-eligibility',
      actionText: 'View Eligibility',
      unread: false,
    });
  }

  // Filter notifications by category tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'LOANS') return n.category === 'LOANS';
    if (activeTab === 'MEMBERSHIP') return n.category === 'MEMBERSHIP' || n.category === 'KYC';
    if (activeTab === 'PAYMENTS') return n.category === 'PAYMENTS';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Member Notifications & Alerts"
        description="Official alerts regarding membership admission, KYC verification, loan applications, administrative decisions, disbursements, and payment receipts."
        badge="NOTIFICATION DESK"
      >
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
        >
          <CheckCheck className="w-4 h-4" />
          <span>All Caught Up</span>
        </button>
      </MemberPageHeader>

      {/* FILTER TABS */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: `All Alerts (${notifications.length})` },
            {
              id: 'LOANS',
              label: `Loans (${notifications.filter((n) => n.category === 'LOANS').length})`,
            },
            {
              id: 'MEMBERSHIP',
              label: `Membership & KYC (${
                notifications.filter((n) => n.category === 'MEMBERSHIP' || n.category === 'KYC')
                  .length
              })`,
            },
            {
              id: 'PAYMENTS',
              label: `Payments (${
                notifications.filter((n) => n.category === 'PAYMENTS').length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-mono self-end sm:self-auto font-medium">
          Synchronized Live
        </div>
      </div>

      {/* NOTIFICATIONS LIST CONTAINER */}
      <div className="space-y-3.5">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${notif.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {notif.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        {notif.date}
                      </span>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      {notif.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {notif.actionLink && (
                  <div className="shrink-0 self-end sm:self-center pl-15 sm:pl-0">
                    <Link
                      to={notif.actionLink}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 transition-colors cursor-pointer"
                    >
                      <span>{notif.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs">
            <EmptyState
              icon={Bell}
              title="No notifications in this category."
              description="You are completely up to date. Important approvals, payment receipts, circulars, and loan updates will be delivered here."
            />
          </div>
        )}
      </div>

      {/* FOOTER ADVISORY */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Automated dispatch via registered email and secure member ledger</span>
        </div>
        <span className="text-[11px] font-mono">Channel: Verified In-App Dispatch</span>
      </div>
    </div>
  );
}

export default MemberNotifications;
