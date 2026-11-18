import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  ShieldCheck,
  CreditCard,
  Layers,
  BookOpen,
  ArrowDownRight,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Plus,
  RefreshCw,
  AlertTriangle,
  Upload,
  Lock,
  Unlock,
  TrendingUp,
  Receipt,
  RotateCcw,
  Check,
  Mail,
  MessageSquare,
  Send,
  Bell,
  Info,
  ExternalLink,
  Briefcase,
  PlusCircle,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import {
  getInvestorByIdApi,
  verifyKycApi,
  requestKycCorrectionApi,
  verifyPaymentApi,
  sendConfirmationEmailApi,
  sendInvestorNotificationApi,
  uploadAgreementApi,
  addLedgerAdjustmentApi,
  reverseLedgerEntryApi,
  activateInvestorPlanApi,
  verifyInvestmentPaymentApi,
} from '../../../services/investorService';
import { getBackendAssetUrl } from '../../../config/env';
import { RecordPaymentModal } from './RecordPaymentModal';
import { AssignPlanModal } from './AssignPlanModal';
import { RecordPayoutModal } from './RecordPayoutModal';
import { AddAdditionalInvestmentModal } from './AddAdditionalInvestmentModal';

export function InvestorDetailsModal({ isOpen, investorId, onClose, onUpdate, readOnly = false }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Active Tab state (7 specific tabs requested by user)
  const [activeTab, setActiveTab] = useState('personal');

  // Sub-modal states
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showAssignPlan, setShowAssignPlan] = useState(false);
  const [showRecordPayout, setShowRecordPayout] = useState(false);

  // Reject KYC modal
  const [showRejectKycModal, setShowRejectKycModal] = useState(false);
  const [rejectKycReason, setRejectKycReason] = useState('');
  const [processingKyc, setProcessingKyc] = useState(false);

  // Request Correction modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionInstructions, setCorrectionInstructions] = useState('');
  const [processingCorrection, setProcessingCorrection] = useState(false);

  // Sensitive data reveal toggle for authorized admin
  const [revealSensitive, setRevealSensitive] = useState(false);

  // Reject Payment modal
  const [rejectPaymentTarget, setRejectPaymentTarget] = useState(null);
  const [rejectPaymentReason, setRejectPaymentReason] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Manual Ledger Adjustment Modal
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'Credit',
    amount: '',
    category: 'Authorized Adjustment',
    description: '',
    reference: '',
    adminRemarks: '',
  });
  const [processingAdjustment, setProcessingAdjustment] = useState(false);

  // Audited Ledger Reversal Modal
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [reversalTarget, setReversalTarget] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [processingReversal, setProcessingReversal] = useState(false);

  // Agreement file upload state
  const [agreementFile, setAgreementFile] = useState(null);
  const [uploadingAgreement, setUploadingAgreement] = useState(false);

  // Document preview lightbox modal
  const [docPreview, setDocPreview] = useState(null); // { title: '', url: '' }

  // Email action state
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState(null);

  // Notification Center States
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    type: 'InvestmentConfirmation',
    channel: 'Both', // 'Email' | 'SMS' | 'Both'
    customSubject: '',
    customMessage: '',
    force: false,
  });
  const [dispatchingNotification, setDispatchingNotification] = useState(false);
  const [notificationStatusMsg, setNotificationStatusMsg] = useState(null);
  const [notificationFilterChannel, setNotificationFilterChannel] = useState('All');
  const [notificationFilterCategory, setNotificationFilterCategory] = useState('All');
  const [selectedLogForView, setSelectedLogForView] = useState(null);

  // Feedback / Notification banner state
  const [feedbackMessage, setFeedbackMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const showFeedback = useCallback((type, text) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  // Additional / Repeat Investments state
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [selectedInvestmentForView, setSelectedInvestmentForView] = useState(null);
  const [verifyingInvestmentId, setVerifyingInvestmentId] = useState(null);
  const [selected2xInvestmentId, setSelected2xInvestmentId] = useState('all');

  const fetchDetails = useCallback(async () => {
    if (!investorId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getInvestorByIdApi(investorId);
      setData(res);
    } catch (err) {
      console.error('Error fetching investor details:', err);
      setError(err.message || 'Unable to load investor details.');
    } finally {
      setLoading(false);
    }
  }, [investorId]);

  useEffect(() => {
    if (isOpen && investorId) {
      fetchDetails();
      setEmailStatusMessage(null);
      setFeedbackMessage(null);
      setActiveTab('personal'); // Default to personal details tab on opening
    }
  }, [isOpen, investorId, fetchDetails]);

  if (!isOpen) return null;

  const investor = data?.investor;
  const payments = data?.payments || [];
  const ledgerEntries = data?.ledgerEntries || [];
  const payouts = data?.payouts || [];
  const currentBalance = data?.currentBalance ?? (investor?.ledgerBalance || 0);

  // KYC Verification Handler (Direct 1-click verification)
  const handleVerifyKyc = async () => {
    try {
      setProcessingKyc(true);
      await verifyKycApi(investor._id, { status: 'Verified' });
      await fetchDetails();
      if (onUpdate) onUpdate();
      showFeedback('success', 'Investor KYC approved and marked as Verified.');
    } catch (err) {
      console.error('Failed to verify KYC:', err);
      showFeedback('error', err.message || 'Failed to verify KYC.');
    } finally {
      setProcessingKyc(false);
    }
  };

  const handleRequestCorrection = async (e) => {
    e.preventDefault();
    if (!correctionInstructions.trim()) {
      showFeedback('error', 'Please specify the instructions for document/detail correction.');
      return;
    }
    try {
      setProcessingCorrection(true);
      await requestKycCorrectionApi(investor._id, {
        instructions: correctionInstructions.trim(),
      });
      setShowCorrectionModal(false);
      setCorrectionInstructions('');
      await fetchDetails();
      if (onUpdate) onUpdate();
      showFeedback('success', 'Correction request sent successfully.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to submit correction request.');
    } finally {
      setProcessingCorrection(false);
    }
  };

  const handleRejectKyc = async (e) => {
    e.preventDefault();
    if (!rejectKycReason.trim()) {
      showFeedback('error', 'Please provide a reason for rejecting the KYC.');
      return;
    }
    try {
      setProcessingKyc(true);
      await verifyKycApi(investor._id, {
        status: 'Rejected',
        rejectionReason: rejectKycReason.trim(),
      });
      setShowRejectKycModal(false);
      setRejectKycReason('');
      await fetchDetails();
      if (onUpdate) onUpdate();
      showFeedback('success', 'Investor KYC marked as Rejected.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to reject KYC.');
    } finally {
      setProcessingKyc(false);
    }
  };

  // Payment Verification Handler (Direct 1-click Double-entry Credit creation)
  const handleVerifyPayment = async (paymentId) => {
    try {
      setProcessingPayment(true);
      await verifyPaymentApi(paymentId, {
        status: 'Verified',
        adminRemarks: 'Verified by Super Admin',
      });
      await fetchDetails();
      if (onUpdate) onUpdate();
      showFeedback('success', 'Payment verified successfully! Financial ledger credited.');
    } catch (err) {
      console.error('Failed to verify payment:', err);
      showFeedback('error', err.message || 'Failed to verify payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleRejectPayment = async (e) => {
    e.preventDefault();
    if (!rejectPaymentTarget) return;
    if (!rejectPaymentReason.trim()) {
      showFeedback('error', 'Please provide a reason for rejecting the payment.');
      return;
    }
    try {
      setProcessingPayment(true);
      await verifyPaymentApi(rejectPaymentTarget._id, {
        status: 'Rejected',
        adminRemarks: rejectPaymentReason.trim(),
      });
      setRejectPaymentTarget(null);
      setRejectPaymentReason('');
      await fetchDetails();
      if (onUpdate) onUpdate();
      showFeedback('success', 'Payment rejected.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to reject payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Additional Investment Payment Verification Handler (Direct 1-click verification)
  const handleVerifyInvestmentPayment = async (invRecord) => {
    try {
      setVerifyingInvestmentId(invRecord._id || invRecord.investmentId);
      await verifyInvestmentPaymentApi(
        investor._id,
        invRecord._id,
        'Bank credit verified & confirmed'
      );
      await fetchDetails();
      if (onUpdate) onUpdate();
      showFeedback(
        'success',
        `Investment ${invRecord.investmentId} verified successfully! Financial ledger credited.`
      );
    } catch (err) {
      console.error('Failed to verify investment payment:', err);
      showFeedback('error', err.message || 'Failed to verify investment payment.');
    } finally {
      setVerifyingInvestmentId(null);
    }
  };

  // Agreement upload handler
  const handleUploadAgreement = async (e) => {
    e.preventDefault();
    if (!agreementFile) {
      showFeedback('error', 'Please select an agreement document to upload.');
      return;
    }
    try {
      setUploadingAgreement(true);
      const formData = new FormData();
      formData.append('agreementFile', agreementFile);
      await uploadAgreementApi(investor._id, formData);
      setAgreementFile(null);
      await fetchDetails();
      if (onUpdate) onUpdate();
      showFeedback('success', 'Agreement document uploaded and recorded successfully!');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to upload agreement.');
    } finally {
      setUploadingAgreement(false);
    }
  };

  // Manual Adjustment Handler
  const handleAddAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustmentForm.amount || Number(adjustmentForm.amount) <= 0) {
      alert('Please enter a valid positive adjustment amount.');
      return;
    }
    if (!adjustmentForm.description.trim()) {
      alert('Please specify the adjustment description.');
      return;
    }

    try {
      setProcessingAdjustment(true);
      await addLedgerAdjustmentApi(investor._id, adjustmentForm);
      setShowAdjustmentModal(false);
      setAdjustmentForm({
        type: 'Credit',
        amount: '',
        category: 'Authorized Adjustment',
        description: '',
        reference: '',
        adminRemarks: '',
      });
      await fetchDetails();
      if (onUpdate) onUpdate();
      alert('Authorized ledger adjustment posted successfully.');
    } catch (err) {
      alert(err.message || 'Failed to post ledger adjustment.');
    } finally {
      setProcessingAdjustment(false);
    }
  };

  // Audited Ledger Reversal Handler (Never deletes - posts opposite entry)
  const handleReverseEntry = async (e) => {
    e.preventDefault();
    if (!reversalTarget) return;
    if (!reversalReason.trim()) {
      alert('Please specify the administrative reason for this reversal entry.');
      return;
    }

    try {
      setProcessingReversal(true);
      await reverseLedgerEntryApi(reversalTarget._id, { reason: reversalReason.trim() });
      setShowReversalModal(false);
      setReversalTarget(null);
      setReversalReason('');
      await fetchDetails();
      if (onUpdate) onUpdate();
      alert('Reversal entry posted successfully. Ledger running balance updated without overwriting history.');
    } catch (err) {
      alert(err.message || 'Failed to reverse ledger entry.');
    } finally {
      setProcessingReversal(false);
    }
  };

  // Email Notification Dispatcher (Direct)
  const handleSendEmail = async (type = 'InvestmentConfirmation') => {
    try {
      setSendingEmail(true);
      setEmailStatusMessage(null);
      const res = await sendConfirmationEmailApi(investor._id, { type });
      setEmailStatusMessage({
        type: 'success',
        text: res.message || 'Official investment confirmation dispatched successfully via Nodemailer.',
      });
      await fetchDetails();
    } catch (err) {
      setEmailStatusMessage({
        type: 'error',
        text: err.message || 'Failed to dispatch email.',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Comprehensive Multi-Channel Notification Dispatcher
  const handleDispatchNotification = async () => {
    try {
      setDispatchingNotification(true);
      setNotificationStatusMsg(null);

      const channelsToSend = notificationForm.channel === 'Both'
        ? ['Email', 'SMS']
        : [notificationForm.channel];

      const res = await sendInvestorNotificationApi(investor._id, {
        type: notificationForm.type,
        channels: channelsToSend,
        customSubject: notificationForm.customSubject,
        customMessage: notificationForm.customMessage,
        force: notificationForm.force,
      });

      setNotificationStatusMsg({
        type: res.success ? 'success' : 'error',
        text: res.message || 'Notification processed.',
        errors: res.errors,
      });

      await fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      setNotificationStatusMsg({
        type: 'error',
        text: err.message || 'Failed to dispatch notification.',
      });
    } finally {
      setDispatchingNotification(false);
    }
  };

  // Export Ledger CSV
  const handleExportLedgerCSV = () => {
    if (!ledgerEntries.length) {
      alert('No ledger entries recorded yet.');
      return;
    }
    const headers = [
      'Transaction ID',
      'Date',
      'Description',
      'Transaction Type',
      'Credit',
      'Debit',
      'UTR',
      'Verification Status',
      'Running Balance',
      'Remarks',
    ];
    const rows = ledgerEntries.map((e) => [
      e.transactionId || e._id,
      e.date ? new Date(e.date).toLocaleDateString('en-IN') : '',
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${(e.category || e.type || '').replace(/"/g, '""')}"`,
      e.credit || 0,
      e.debit || 0,
      e.utrNumber || e.reference || '',
      e.verificationStatus || 'Verified',
      e.runningBalance || 0,
      `"${(e.remarks || e.adminRemarks || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Ledger_${investor?.investorId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2X Contract Tracking Variables (12 Key Tracking Fields)
  const trk = investor?.tracking2x || {};
  const originalInvestment = Number(trk.originalInvestment || investor?.verifiedInvestment || investor?.totalInvestment || 0);
  const planMultiplier = Number(trk.multiplier || investor?.assignedPlan?.multiplier || 2);
  const contractualPercentage = trk.contractualPercentage ?? (investor?.assignedPlan?.contractualPercentage ?? 100);
  const percentageBasis = trk.percentageBasis || investor?.assignedPlan?.percentageBasis || 'Total Contractual Percentage';
  const targetAmount = Number(trk.targetAmount || (investor?.assignedPlan?.contractualTarget ? investor.assignedPlan.contractualTarget : originalInvestment * planMultiplier));
  const planDuration = Number(trk.durationMonths || investor?.assignedPlan?.durationMonths || 24);
  const startDate = trk.startDate || investor?.assignedPlan?.assignedDate || investor?.createdAt;
  const maturityDate = trk.maturityDate || investor?.assignedPlan?.maturityDate;
  const paidPayoutsList = payouts.filter((p) => ['Paid', 'Approved', 'Disbursed', 'Completed'].includes(p.status));
  const totalEligiblePayouts = Number(trk.totalEligiblePayouts ?? paidPayoutsList.reduce((sum, p) => sum + Number(p.amount || 0), 0));
  const remainingPayout = Number(trk.remainingPayout ?? Math.max(0, targetAmount - totalEligiblePayouts));
  const planStatus = trk.status || investor?.assignedPlan?.status || 'Pending';
  const canActivatePlan = (planStatus === 'Pending' || planStatus === 'Draft') && investor?.paymentStatus === 'Verified';

  const handleActivatePlan = async () => {
    if (!investor) return;
    try {
      setActionLoading(true);
      await activateInvestorPlanApi(investor._id, {
        auditReason: 'Activated via 2X Contract Tracking dashboard by Super Admin',
      });
      showToast('success', `Investment plan activated successfully with 2X target of ₹${targetAmount.toLocaleString('en-IN')}!`);
      await loadDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Plan activation error:', err);
      showToast('error', err.message || 'Failed to activate plan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Masking helpers
  const maskText = (txt = '', visibleEnd = 4) => {
    if (revealSensitive || !txt) return txt;
    const clean = String(txt).trim();
    if (clean.length <= visibleEnd) return clean;
    return `•••• •••• ${clean.slice(-visibleEnd)}`;
  };

  // Unified communication logs (supports both new communicationLogs and legacy emailLogs)
  const communicationLogs = (investor?.communicationLogs && investor.communicationLogs.length > 0)
    ? investor.communicationLogs
    : (investor?.emailLogs || []).map((e) => ({
        channel: 'Email',
        category: e.emailType === 'RegistrationAcknowledgement'
          ? 'Registration'
          : (e.emailType === 'InvestmentConfirmation' ? 'PaymentConfirmation' : 'General'),
        recipient: e.recipient,
        subject: e.emailType || 'Email Notification',
        messageSummary: e.details || '',
        status: e.status || 'Sent',
        sentAt: e.sentAt,
        sentBy: 'Super Admin',
        messageId: e.messageId,
      }));

  const filteredLogs = communicationLogs.filter((log) => {
    if (notificationFilterChannel !== 'All' && log.channel !== notificationFilterChannel) return false;
    if (notificationFilterCategory !== 'All' && log.category !== notificationFilterCategory) return false;
    return true;
  });

  // Investments Data & Summary for Multiple / Repeat Capital
  const investments = data?.investments || [];
  const investmentsSummary = data?.investmentsSummary || {
    totalInvestmentCount: investments.length,
    totalInvestmentAmount: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    totalVerifiedPayments: investments
      .filter((inv) => inv.paymentStatus === 'Verified')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0),
    totalPayouts: payouts
      .filter((p) => ['Paid', 'Approved', 'Disbursed', 'Completed'].includes(p.status))
      .reduce((sum, p) => sum + (p.amount || p.payoutAmount || 0), 0),
    totalOutstandingLiability: investments
      .filter((inv) => inv.paymentStatus === 'Verified')
      .reduce(
        (sum, inv) =>
          sum + (inv.tracking2x?.remainingPayout ?? ((inv.amount || 0) * (inv.multiplier || 2))),
        0
      ),
  };

  // 5 Tabs Configuration (Simplified)
  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'documents', label: 'Aadhaar & PAN Documents', icon: ShieldCheck },
    { id: 'investments', label: 'All Investments', icon: Briefcase, count: investments.length },
    { id: 'payments', label: 'Payment History', icon: CreditCard, count: payments.length },
    { id: 'plan', label: 'Investment Plan & Agreement', icon: Layers },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-5xl max-h-[94vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-fade-in">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-lg text-white shadow-md">
              {investor?.fullName?.charAt(0)?.toUpperCase() || 'I'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {investor?.fullName || 'Investor Profile'}
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-bold">
                  {investor?.investorId}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    investor?.kycStatus === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : investor?.kycStatus === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  KYC: {investor?.kycStatus || 'Pending'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    investor?.paymentStatus === 'Verified'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  Payment: {investor?.paymentStatus || 'Pending'}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {investor?.district || 'Odisha'} Circle • Registered:{' '}
                {investor?.createdAt ? new Date(investor.createdAt).toLocaleDateString('en-IN') : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && (
              <button
                type="button"
                onClick={() => setShowAddInvestmentModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-all cursor-pointer active:scale-95"
                title="Add an additional repeat investment under this investor profile"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Additional Investment</span>
              </button>
            )}

            {readOnly ? (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                View Only
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setRevealSensitive(!revealSensitive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  revealSensitive
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
                title="Toggle reveal for sensitive Aadhaar, PAN and Bank details"
              >
                {revealSensitive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{revealSensitive ? 'Mask Data' : 'Reveal Data'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-5 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status / Feedback notification banner */}
        {(feedbackMessage || emailStatusMessage) && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between shrink-0 transition-all ${
              (feedbackMessage?.type || emailStatusMessage?.type) === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {(feedbackMessage?.type || emailStatusMessage?.type) === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedbackMessage?.text || emailStatusMessage?.text}</span>
            </div>
            <button
              onClick={() => {
                setFeedbackMessage(null);
                setEmailStatusMessage(null);
              }}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Active Tab View Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-slate-50/50">
          {loading && !investor ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Loading comprehensive investor profile...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Failed to load investor profile</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* ============================================================== */}
              {/* TAB 1: PERSONAL DETAILS */}
              {/* ============================================================== */}
              {activeTab === 'personal' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Personal & Residential Information</h3>
                          <p className="text-[11px] text-slate-500">Contact details, registered residence, and enrollment metadata</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Status: {investor?.status || 'Active'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Full Name</span>
                        <span className="font-bold text-slate-900 text-sm">{investor?.fullName}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Mobile Number</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{investor?.mobile}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Email Address</span>
                        <span className="font-medium text-slate-900">{investor?.email || 'N/A'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                        <span className="font-medium text-slate-900">
                          {investor?.dateOfBirth ? new Date(investor.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">District / Region</span>
                        <span className="font-bold text-slate-900">{investor?.district || 'Odisha'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">State & PIN Code</span>
                        <span className="font-medium text-slate-900">
                          {investor?.state || 'Odisha'} - {investor?.pinCode || 'N/A'}
                        </span>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Full Residential Address</span>
                        <span className="font-medium text-slate-800">{investor?.address || 'Address not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Associate Member (Referral System) */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Assigned Associate Member (Referral Partner)</h3>
                          <p className="text-[11px] text-slate-500">Business Associate attributed for this investor&apos;s mobilization &amp; servicing</p>
                        </div>
                      </div>
                      {investor?.sourcedBy?.associateName ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                          Associate Assigned
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Direct Headquarter Sourcing
                        </span>
                      )}
                    </div>

                    {investor?.sourcedBy?.associateName ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Associate Name</span>
                          <span className="font-bold text-slate-900 text-sm">{investor.sourcedBy.associateName}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Associate Member ID</span>
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                            {investor.sourcedBy.associateMemberId || 'N/A'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Associate Mobile</span>
                          <span className="font-mono font-bold text-slate-900">{investor.sourcedBy.associateMobile || 'N/A'}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Associate Email</span>
                          <span className="font-medium text-slate-900 truncate block">{investor.sourcedBy.associateEmail || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                        <span>This investor was onboarded directly by the Headquarter administration without an assigned Associate Member.</span>
                      </div>
                    )}
                  </div>

                  {/* Banking Details */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Authorized Bank Account</h3>
                          <p className="text-[11px] text-slate-500">Official account recorded for disbursements and refunds</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Account Holder Name</span>
                        <span className="font-bold text-slate-900">
                          {investor?.bankDetails?.accountHolderName || investor?.fullName || 'N/A'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Bank Name</span>
                        <span className="font-bold text-slate-900">{investor?.bankDetails?.bankName || 'N/A'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Account Number</span>
                        <span className="font-mono font-bold text-slate-900">
                          {maskText(investor?.bankDetails?.accountNumber, 4) || 'Not provided'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">IFSC Code</span>
                        <span className="font-mono font-bold text-slate-900">
                          {investor?.bankDetails?.ifscCode || 'N/A'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Branch Name</span>
                        <span className="font-medium text-slate-900">
                          {investor?.bankDetails?.branchName || 'Main Branch'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: AADHAAR AND PAN DOCUMENTS */}
              {/* ============================================================== */}
              {activeTab === 'documents' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Government Identity Documents</h3>
                          <p className="text-[11px] text-slate-500">Secure preview and verification of Aadhaar and PAN documents</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${
                          investor?.kycStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : investor?.kycStatus === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Status: {investor?.kycStatus || 'Pending'}
                      </span>
                    </div>

                    {/* Masked IDs Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Aadhaar Number</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {maskText(investor?.aadhaarNumber, 4) || 'Not provided'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">12-Digit UID</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block mb-0.5">PAN Card Number</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {maskText(investor?.panNumber, 4) || 'Not provided'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">10-Digit Alpha</span>
                      </div>
                    </div>

                    {/* Document Previews Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {/* Aadhaar Front */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                        <span className="text-xs font-bold text-slate-800">Aadhaar Front Document</span>
                        <div className="h-44 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                          {investor?.aadhaarFrontUrl ? (
                            <img
                              src={getBackendAssetUrl(investor.aadhaarFrontUrl)}
                              alt="Aadhaar Front"
                              className="h-full w-full object-contain cursor-pointer hover:scale-105 transition-transform"
                              onClick={() =>
                                setDocPreview({
                                  title: 'Aadhaar Front',
                                  url: getBackendAssetUrl(investor.aadhaarFrontUrl),
                                  download: investor.aadhaarFrontUrl,
                                })
                              }
                            />
                          ) : (
                            <span className="text-xs text-slate-400">No front document uploaded</span>
                          )}
                        </div>
                        {investor?.aadhaarFrontUrl && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDocPreview({
                                  title: 'Aadhaar Front',
                                  url: getBackendAssetUrl(investor.aadhaarFrontUrl),
                                  download: investor.aadhaarFrontUrl,
                                })
                              }
                              className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                            <a
                              href={getBackendAssetUrl(investor.aadhaarFrontUrl)}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Aadhaar Back */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                        <span className="text-xs font-bold text-slate-800">Aadhaar Back Document</span>
                        <div className="h-44 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                          {investor?.aadhaarBackUrl ? (
                            <img
                              src={getBackendAssetUrl(investor.aadhaarBackUrl)}
                              alt="Aadhaar Back"
                              className="h-full w-full object-contain cursor-pointer hover:scale-105 transition-transform"
                              onClick={() =>
                                setDocPreview({
                                  title: 'Aadhaar Back',
                                  url: getBackendAssetUrl(investor.aadhaarBackUrl),
                                  download: investor.aadhaarBackUrl,
                                })
                              }
                            />
                          ) : (
                            <span className="text-xs text-slate-400">No back document uploaded</span>
                          )}
                        </div>
                        {investor?.aadhaarBackUrl && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDocPreview({
                                  title: 'Aadhaar Back',
                                  url: getBackendAssetUrl(investor.aadhaarBackUrl),
                                  download: investor.aadhaarBackUrl,
                                })
                              }
                              className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                            <a
                              href={getBackendAssetUrl(investor.aadhaarBackUrl)}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* PAN Card */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                        <span className="text-xs font-bold text-slate-800">PAN Card Document</span>
                        <div className="h-44 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                          {investor?.panCardUrl ? (
                            <img
                              src={getBackendAssetUrl(investor.panCardUrl)}
                              alt="PAN Card"
                              className="h-full w-full object-contain cursor-pointer hover:scale-105 transition-transform"
                              onClick={() =>
                                setDocPreview({
                                  title: 'PAN Card',
                                  url: getBackendAssetUrl(investor.panCardUrl),
                                  download: investor.panCardUrl,
                                })
                              }
                            />
                          ) : (
                            <span className="text-xs text-slate-400">No PAN card uploaded</span>
                          )}
                        </div>
                        {investor?.panCardUrl && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDocPreview({
                                  title: 'PAN Card',
                                  url: getBackendAssetUrl(investor.panCardUrl),
                                  download: investor.panCardUrl,
                                })
                              }
                              className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                            <a
                              href={getBackendAssetUrl(investor.panCardUrl)}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KYC Admin Actions Box */}
                    {!readOnly && (
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">KYC Decision Panel</span>
                          <p className="text-[11px] text-slate-500">
                            {investor?.kycStatus === 'Verified'
                              ? `Approved by ${investor?.kycVerifiedBy || 'Super Admin'} on ${
                                  investor?.kycVerifiedAt
                                    ? new Date(investor.kycVerifiedAt).toLocaleDateString('en-IN')
                                    : 'Record'
                                }`
                              : 'Perform KYC compliance review on submitted identity proofs'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {investor?.kycStatus !== 'Verified' && (
                            <button
                              type="button"
                              onClick={handleVerifyKyc}
                              disabled={processingKyc}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify KYC</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowCorrectionModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors cursor-pointer"
                          >
                            Request Correction
                          </button>
                          {investor?.kycStatus !== 'Rejected' && (
                            <button
                              type="button"
                              onClick={() => setShowRejectKycModal(true)}
                              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                            >
                              Reject KYC
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: ALL INVESTMENTS & REPEAT CAPITAL */}
              {/* ============================================================== */}
              {activeTab === 'investments' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Top 5 Profile Summary Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Investor Portfolio Profile Summary
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Cumulative financial positions across all primary and repeat investments under Investor ID: {investor?.investorId}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {investments.length} {investments.length === 1 ? 'Record' : 'Records'} Enrolled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                      {/* 1. Total Investment Count */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Total Investment Count
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                            <Briefcase className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                          {investmentsSummary.totalInvestmentCount || investments.length}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block">
                          Investments registered
                        </span>
                      </div>

                      {/* 2. Total Investment Amount */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Total Investment Amount
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-indigo-950 tracking-tight">
                          ₹{Number(investmentsSummary.totalInvestmentAmount || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block">
                          Gross capital committed
                        </span>
                      </div>

                      {/* 3. Total Verified Payments */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Total Verified Payments
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-700 tracking-tight">
                          ₹{Number(investmentsSummary.totalVerifiedPayments || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 block">
                          Bank cleared & ledger credited
                        </span>
                      </div>

                      {/* 4. Total Payouts */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Total Payouts
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                            <ArrowDownRight className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-purple-900 tracking-tight">
                          ₹{Number(investmentsSummary.totalPayouts || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block">
                          Completed returns / payouts
                        </span>
                      </div>

                      {/* 5. Total Outstanding Contractual Liability */}
                      <div className="p-4 rounded-2xl bg-white border border-rose-200/90 shadow-2xs bg-gradient-to-br from-rose-50/40 to-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">
                            Outstanding Liability
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-rose-700 tracking-tight">
                          ₹{Number(investmentsSummary.totalOutstandingLiability || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] font-semibold text-rose-600 mt-0.5 block">
                          Pending 2X obligations
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Investment History Table Section */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Layers className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Investment History & Discrete Contract Records
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Separate investment reference IDs, individual 2X tracking and verified receipts under Investor ID: {investor?.investorId}
                          </p>
                        </div>
                      </div>

                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setShowAddInvestmentModal(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Additional Investment</span>
                        </button>
                      )}
                    </div>

                    {investments.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 space-y-3">
                        <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No investment records registered yet.</p>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => setShowAddInvestmentModal(true)}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
                          >
                            Add First Investment
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-5 sm:mx-0">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                              <th className="py-3 px-3.5">Investment ID</th>
                              <th className="py-3 px-3.5">Date</th>
                              <th className="py-3 px-3.5">Amount</th>
                              <th className="py-3 px-3.5">Assigned Plan</th>
                              <th className="py-3 px-3.5">Percentage</th>
                              <th className="py-3 px-3.5">Duration</th>
                              <th className="py-3 px-3.5">Maturity Date</th>
                              <th className="py-3 px-3.5">Payment Status</th>
                              <th className="py-3 px-3.5">Agreement Status</th>
                              <th className="py-3 px-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {investments.map((inv, idx) => {
                              const isPendingPayment = inv.paymentStatus === 'Pending';
                              const isVerifying = verifyingInvestmentId === (inv._id || inv.investmentId);

                              return (
                                <tr key={inv._id || inv.investmentId || idx} className="hover:bg-slate-50/80 transition-colors">
                                  {/* Investment Reference ID */}
                                  <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900">
                                    <div className="flex items-center gap-1.5">
                                      <span>{inv.investmentId}</span>
                                      {idx === 0 && (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                          Initial
                                        </span>
                                      )}
                                      {idx > 0 && (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                          Repeat
                                        </span>
                                      )}
                                    </div>
                                    {inv.utrNumber && (
                                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                                        UTR: {maskText(inv.utrNumber, 6)}
                                      </span>
                                    )}
                                  </td>

                                  {/* Date */}
                                  <td className="py-3.5 px-3.5 text-slate-600 whitespace-nowrap">
                                    {inv.investmentDate
                                      ? new Date(inv.investmentDate).toLocaleDateString('en-IN')
                                      : 'N/A'}
                                  </td>

                                  {/* Investment Amount */}
                                  <td className="py-3.5 px-3.5 font-black text-slate-900 whitespace-nowrap">
                                    ₹{Number(inv.amount || 0).toLocaleString('en-IN')}
                                  </td>

                                  {/* Assigned Plan */}
                                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                                    <div className="font-bold text-slate-800">{inv.planName || 'Standard Plan'}</div>
                                    <div className="text-[10px] text-slate-400">{inv.planCode || 'PLAN-STD'}</div>
                                  </td>

                                  {/* Percentage & Basis */}
                                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                                    <div className="font-bold text-indigo-700">
                                      {inv.contractualPercentage ? `${inv.contractualPercentage}%` : `${inv.multiplier || 2}X`}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {inv.percentageBasis || 'Contractual Basis'}
                                    </div>
                                  </td>

                                  {/* Duration */}
                                  <td className="py-3.5 px-3.5 text-slate-700 whitespace-nowrap font-medium">
                                    {inv.durationMonths ? `${inv.durationMonths} Mo` : '—'}
                                  </td>

                                  {/* Maturity Date */}
                                  <td className="py-3.5 px-3.5 text-slate-700 whitespace-nowrap">
                                    {inv.maturityDate
                                      ? new Date(inv.maturityDate).toLocaleDateString('en-IN')
                                      : '—'}
                                  </td>

                                  {/* Payment Status */}
                                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                          inv.paymentStatus === 'Verified'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : inv.paymentStatus === 'Rejected'
                                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}
                                      >
                                        {inv.paymentStatus || 'Pending'}
                                      </span>
                                      {isPendingPayment && !readOnly && (
                                        <button
                                          type="button"
                                          onClick={() => handleVerifyInvestmentPayment(inv)}
                                          disabled={isVerifying}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                          title="Verify investment bank credit"
                                        >
                                          {isVerifying ? (
                                            <>
                                              <RefreshCw className="w-3 h-3 animate-spin" />
                                              <span>Verifying...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Check className="w-3 h-3" />
                                              <span>Verify</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </td>

                                  {/* Agreement Status */}
                                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                          inv.agreementStatus === 'Signed' || inv.agreementUrl
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}
                                      >
                                        {inv.agreementStatus === 'Signed' || inv.agreementUrl ? 'Signed' : 'Draft'}
                                      </span>
                                      {inv.agreementUrl && (
                                        <a
                                          href={getBackendAssetUrl(inv.agreementUrl)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 hover:text-blue-800"
                                          title="View Signed Agreement"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedInvestmentForView(inv)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer"
                                      title="Inspect complete investment record"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                                      <span>View Details</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: PAYMENT HISTORY */}
              {/* ============================================================== */}
              {activeTab === 'payments' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Payment History & Clearance</h3>
                          <p className="text-[11px] text-slate-500">
                            Capital contributions, UTR verification, and double-entry ledger integration
                          </p>
                        </div>
                      </div>

                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setShowRecordPayment(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Record Additional Payment</span>
                        </button>
                      )}
                    </div>

                    {/* Summary KPI Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Total Claimed Investment</span>
                        <span className="font-black text-slate-900 text-base">
                          ₹{Number(investor?.totalInvestment || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <span className="text-emerald-700 block mb-0.5 font-semibold">Total Verified Capital</span>
                        <span className="font-black text-emerald-950 text-base">
                          ₹{Number(investor?.verifiedInvestment || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Payment Verification Status</span>
                        <span
                          className={`font-bold ${
                            investor?.paymentStatus === 'Verified' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {investor?.paymentStatus || 'Pending Clearance'}
                        </span>
                      </div>
                    </div>

                    {/* Payments List Table */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">PAYMENT ID</th>
                            <th className="py-3 px-4">AMOUNT</th>
                            <th className="py-3 px-4">DATE</th>
                            <th className="py-3 px-4">METHOD</th>
                            <th className="py-3 px-4">UTR / REFERENCE</th>
                            <th className="py-3 px-4 text-center">SCREENSHOT</th>
                            <th className="py-3 px-4">STATUS</th>
                            <th className="py-3 px-4 text-center">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {payments.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="py-8 text-center text-slate-400">
                                No investment payment records found.
                              </td>
                            </tr>
                          ) : (
                            payments.map((pmt) => (
                              <tr key={pmt._id} className="hover:bg-slate-50/80">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{pmt.paymentId}</td>
                                <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                                  ₹{Number(pmt.amount).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                                  {pmt.paymentDate ? new Date(pmt.paymentDate).toLocaleDateString('en-IN') : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                    {pmt.paymentMethod || 'UPI'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{pmt.utrNumber}</td>
                                <td className="py-3 px-4 text-center">
                                  {pmt.receiptUrl ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDocPreview({
                                          title: `Receipt - ${pmt.utrNumber}`,
                                          url: getBackendAssetUrl(pmt.receiptUrl),
                                        })
                                      }
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px]"
                                    >
                                      <Eye className="w-3 h-3" /> View
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">None</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      pmt.status === 'Verified'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : pmt.status === 'Rejected'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {pmt.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {readOnly ? (
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      {pmt.status === 'Verified' ? '✓ Credited' : pmt.status === 'Rejected' ? '✕ Rejected' : 'Pending'}
                                    </span>
                                  ) : pmt.status === 'Pending' ? (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleVerifyPayment(pmt._id)}
                                        disabled={processingPayment}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                                        title="Verify and post double-entry credit to ledger"
                                      >
                                        Verify
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRejectPaymentTarget(pmt)}
                                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      {pmt.status === 'Verified' ? '✓ Credited' : '✕ Rejected'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: INVESTMENT PLAN AND AGREEMENT */}
              {/* ============================================================== */}
              {activeTab === 'plan' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Approved Investment Plan & Legal Agreement</h3>
                          <p className="text-[11px] text-slate-500">
                            Contract terms, maturity period, agreement documents, and email confirmation
                          </p>
                        </div>
                      </div>

                      {!readOnly && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAssignPlan(true)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                          >
                            Change / Reassign Plan
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNotificationForm((prev) => ({
                                ...prev,
                                type: 'InvestmentConfirmation',
                                channel: 'Both',
                              }));
                              setNotificationStatusMsg(null);
                              setShowNotificationModal(true);
                            }}
                            disabled={investor?.paymentStatus !== 'Verified'}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                            title="Dispatch official confirmation notice via Email & SMS"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Confirmation Notice</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Plan Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Assigned Plan Name</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {investor?.assignedPlan?.planName || 'Standard Mutual Term Plan'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Plan Code & Version</span>
                        <span className="font-mono font-bold text-blue-700">
                          {investor?.assignedPlan?.planCode || 'UF-TERM-DEFAULT'} (v
                          {investor?.assignedPlan?.version || '1.0'})
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Plan Duration</span>
                        <span className="font-bold text-slate-900">
                          {investor?.assignedPlan?.durationMonths || 12} Months
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Plan Status</span>
                        <span className="font-bold text-emerald-700">
                          {investor?.assignedPlan?.status || 'Active'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Plan Assignment Date</span>
                        <span className="font-medium text-slate-900">
                          {investor?.assignedPlan?.assignedDate
                            ? new Date(investor.assignedPlan.assignedDate).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Contractual Maturity Date</span>
                        <span className="font-bold text-slate-900">
                          {investor?.assignedPlan?.maturityDate
                            ? new Date(investor.assignedPlan.maturityDate).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Approved Return Terms</span>
                        <span className="font-medium text-slate-800">
                          {investor?.assignedPlan?.terms ||
                            investor?.agreedReturnTerms ||
                            'Terms as per approved company agreement'}
                        </span>
                      </div>
                    </div>

                    {/* Agreement Document Management */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Investment Agreement Document</span>
                          <span className="text-[11px] text-slate-500">
                            Agreement Number: {investor?.agreement?.agreementNumber || `UF-AGR-${investor?.investorId}`} •
                            Status: {investor?.agreement?.status || 'Draft'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {(investor?.assignedPlan?.agreementUrl || investor?.agreement?.agreementUrl) && (
                            <a
                              href={getBackendAssetUrl(
                                investor.assignedPlan?.agreementUrl || investor.agreement?.agreementUrl
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Agreement
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Upload New Agreement File */}
                      {!readOnly && (
                        <form onSubmit={handleUploadAgreement} className="flex items-center gap-2 flex-wrap pt-2">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => setAgreementFile(e.target.files[0])}
                            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                          />
                          <button
                            type="submit"
                            disabled={!agreementFile || uploadingAgreement}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs"
                          >
                            {uploadingAgreement ? 'Uploading...' : 'Upload Signed Agreement'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox / Document Preview Modal */}
      {docPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold">{docPreview.title}</span>
              <div className="flex items-center gap-2">
                <a
                  href={docPreview.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setDocPreview(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh] flex items-center justify-center bg-slate-100">
              <img src={docPreview.url} alt={docPreview.title} className="max-h-[75vh] w-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* KYC Reject Modal */}
      {showRejectKycModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 text-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Reject KYC Documents</h3>
            <textarea
              value={rejectKycReason}
              onChange={(e) => setRejectKycReason(e.target.value)}
              placeholder="State reason for rejecting KYC documents..."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectKycModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectKyc}
                disabled={processingKyc}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 text-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Request Document Correction</h3>
            <textarea
              value={correctionInstructions}
              onChange={(e) => setCorrectionInstructions(e.target.value)}
              placeholder="Specify instructions for investor (e.g. re-upload clearer Aadhaar back scan)..."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestCorrection}
                disabled={processingCorrection}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
              >
                Send Correction Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Reject Modal */}
      {rejectPaymentTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 text-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Reject Payment Record</h3>
            <p className="text-xs text-slate-500">UTR: {rejectPaymentTarget.utrNumber} • ₹{rejectPaymentTarget.amount}</p>
            <textarea
              value={rejectPaymentReason}
              onChange={(e) => setRejectPaymentReason(e.target.value)}
              placeholder="State reason for payment rejection (e.g. invalid UTR, not matching bank records)..."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectPaymentTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={processingPayment}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Ledger Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Manual Ledger Adjustment</h3>
              <button onClick={() => setShowAdjustmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Adjustment Type</label>
                <select
                  value={adjustmentForm.type}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="Credit">Credit (+) Inflow / Upward Adjustment</option>
                  <option value="Debit">Debit (-) Outflow / Downward Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={adjustmentForm.amount}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 5000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Category</label>
                <select
                  value={adjustmentForm.category}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="Authorized Adjustment">Authorized Adjustment</option>
                  <option value="Correction Entry">Correction Entry</option>
                  <option value="Bank Reconciliation Difference">Bank Reconciliation Difference</option>
                  <option value="Statutory Charge Refund">Statutory Charge Refund</option>
                  <option value="Fee Waiver">Fee Waiver</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={adjustmentForm.description}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, description: e.target.value })}
                  placeholder="e.g. Audit correction approved by Finance Director"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Audit Reference / Remarks</label>
                <input
                  type="text"
                  value={adjustmentForm.adminRemarks}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adminRemarks: e.target.value })}
                  placeholder="Official office order or audit memo ref"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingAdjustment}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black"
                >
                  {processingAdjustment ? 'Posting...' : 'Post Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audited Reversal Modal */}
      {showReversalModal && reversalTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Post Audited Reversal Entry</h3>
              <button onClick={() => setShowReversalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-500 font-semibold block">Target Transaction:</span>
              <span className="font-mono font-bold text-blue-700 block">{reversalTarget.transactionId}</span>
              <span className="text-slate-700 block font-medium">
                Amount: ₹{Number(reversalTarget.credit || reversalTarget.debit || 0).toLocaleString('en-IN')} (
                {reversalTarget.type})
              </span>
              <span className="text-slate-500 block text-[11px]">{reversalTarget.description}</span>
            </div>
            <form onSubmit={handleReverseEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Reason for Reversal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="State the formal accounting reason for reversing this entry (e.g. Duplicate bank entry corrected)..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                <strong>Notice:</strong> This action will not delete or overwrite the original record. A balancing opposite
                entry will be generated with a complete audit trail.
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReversalModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingReversal}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black"
                >
                  {processingReversal ? 'Processing...' : 'Confirm Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Sub-modal */}
      <RecordPaymentModal
        isOpen={showRecordPayment}
        investor={investor}
        onClose={() => setShowRecordPayment(false)}
        onSuccess={() => {
          fetchDetails();
          if (onUpdate) onUpdate();
        }}
      />

      {/* Assign Plan Sub-modal */}
      <AssignPlanModal
        isOpen={showAssignPlan}
        investor={investor}
        onClose={() => setShowAssignPlan(false)}
        onSuccess={() => {
          fetchDetails();
          if (onUpdate) onUpdate();
        }}
      />

      {/* Record Payout Sub-modal */}
      <RecordPayoutModal
        isOpen={showRecordPayout}
        investor={investor}
        currentBalance={currentBalance}
        onClose={() => setShowRecordPayout(false)}
        onSuccess={() => {
          fetchDetails();
          if (onUpdate) onUpdate();
        }}
      />

      {/* Investor Notification Dispatch Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 space-y-4 text-slate-800 shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dispatch Investor Notification</h3>
                  <p className="text-[11px] text-slate-500">Official dispatch to registered contact points</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification status banner */}
            {notificationStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex flex-col gap-1 ${
                  notificationStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {notificationStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{notificationStatusMsg.text}</span>
                </div>
                {notificationStatusMsg.errors && notificationStatusMsg.errors.length > 0 && (
                  <ul className="list-disc pl-5 text-[11px] text-rose-700 space-y-0.5 mt-1">
                    {notificationStatusMsg.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Form Controls */}
            <div className="space-y-3.5 text-xs">
              {/* Event / Purpose Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notification Event / Purpose</label>
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white"
                >
                  <option value="InvestmentConfirmation">Official Investment Confirmation & Plan Allotment</option>
                  <option value="Registration">Registration Acknowledgement Notice</option>
                  <option value="KycStatus">KYC Verification Status Notice</option>
                  <option value="PlanActivation">Investment Plan Activation Notice</option>
                  <option value="Agreement">Signed Investment Agreement Allotment</option>
                  <option value="MaturityReminder">Maturity Schedule Advance Notice</option>
                  <option value="Payout">Payout Disbursement Advice</option>
                  <option value="Refund">Refund Settlement Advice</option>
                  <option value="Custom">Custom Executive Message / Notice</option>
                </select>
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Both', label: 'Email + SMS', icon: Bell },
                    { id: 'Email', label: 'Email Only', icon: Mail },
                    { id: 'SMS', label: 'SMS Only', icon: MessageSquare },
                  ].map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNotificationForm({ ...notificationForm, channel: c.id })}
                        className={`p-2 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          notificationForm.channel === c.id
                            ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700 shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirmed Database Info Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirmed Profile Information</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div><span className="text-slate-500">Investor ID:</span> <span className="font-mono font-bold text-slate-900">{investor?.investorId}</span></div>
                  <div><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-900">{investor?.fullName}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-mono text-slate-800">{investor?.email}</span></div>
                  <div><span className="text-slate-500">Mobile:</span> <span className="font-mono text-slate-800">{investor?.mobile}</span></div>
                  <div><span className="text-slate-500">Verified Investment:</span> <span className="font-bold text-emerald-700">₹{Number(investor?.verifiedInvestment || 0).toLocaleString('en-IN')}</span></div>
                  <div><span className="text-slate-500">Assigned Plan:</span> <span className="font-semibold text-slate-800">{investor?.assignedPlan?.planName || 'None'}</span></div>
                  <div><span className="text-slate-500">Plan Multiplier:</span> <span className="font-bold text-slate-900">{investor?.assignedPlan?.multiplier || 2}X</span></div>
                  <div><span className="text-slate-500">KYC Status:</span> <span className="font-bold text-slate-900">{investor?.kycStatus}</span></div>
                </div>
              </div>

              {/* Custom Subject & Message if Custom event selected */}
              {notificationForm.type === 'Custom' && (
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject (for Email)</label>
                    <input
                      type="text"
                      value={notificationForm.customSubject}
                      onChange={(e) => setNotificationForm({ ...notificationForm, customSubject: e.target.value })}
                      placeholder="Official notice subject..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Message Content</label>
                    <textarea
                      value={notificationForm.customMessage}
                      onChange={(e) => setNotificationForm({ ...notificationForm, customMessage: e.target.value })}
                      placeholder="Enter official communication text..."
                      rows={4}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Force Re-send checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="forceResend"
                  checked={notificationForm.force}
                  onChange={(e) => setNotificationForm({ ...notificationForm, force: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="forceResend" className="text-[11px] font-semibold text-slate-600 cursor-pointer">
                  Bypass 5-minute duplicate prevention (Force re-send)
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDispatchNotification}
                disabled={dispatchingNotification}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${dispatchingNotification ? 'animate-spin' : ''}`} />
                <span>{dispatchingNotification ? 'Dispatching...' : 'Dispatch Notification'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Message Details Lightbox */}
      {selectedLogForView && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-4 text-slate-800 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Communication Audit Details</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Channel:</span>
                <span className="font-bold text-slate-900">{selectedLogForView.channel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Category:</span>
                <span className="font-bold text-slate-900">{selectedLogForView.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Recipient:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLogForView.recipient}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Status:</span>
                <span className="font-bold text-slate-900">{selectedLogForView.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Provider / Message ID:</span>
                <span className="font-mono text-slate-600 text-[11px]">{selectedLogForView.messageId || selectedLogForView.provider || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Dispatched At:</span>
                <span className="text-slate-800">{selectedLogForView.sentAt ? new Date(selectedLogForView.sentAt).toLocaleString('en-IN') : 'N/A'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-semibold mb-1">Message Summary / Content:</span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium whitespace-pre-wrap text-[11px] max-h-48 overflow-y-auto">
                  {selectedLogForView.messageSummary || selectedLogForView.subject || 'No summary text available.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLogForView(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional / Repeat Investment Registration Modal */}
      {showAddInvestmentModal && investor && (
        <AddAdditionalInvestmentModal
          isOpen={showAddInvestmentModal}
          investor={investor}
          onClose={() => setShowAddInvestmentModal(false)}
          onSuccess={async () => {
            setShowAddInvestmentModal(false);
            await fetchDetails();
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {/* Investment Record Details Lightbox */}
      {selectedInvestmentForView && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 space-y-5 text-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      {selectedInvestmentForView.investmentId}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        selectedInvestmentForView.paymentStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedInvestmentForView.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {investor?.fullName} ({investor?.investorId}) • Created {new Date(selectedInvestmentForView.createdAt || selectedInvestmentForView.investmentDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvestmentForView(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Investment Amount</span>
                <span className="text-base font-black text-slate-900">
                  ₹{Number(selectedInvestmentForView.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-600 uppercase block">Contract Multiplier</span>
                <span className="text-base font-black text-indigo-900">
                  {selectedInvestmentForView.multiplier || 2}X
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">2X Target Obligation</span>
                <span className="text-base font-black text-emerald-800">
                  ₹{Number(selectedInvestmentForView.tracking2x?.targetAmount || ((selectedInvestmentForView.amount || 0) * (selectedInvestmentForView.multiplier || 2))).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] font-bold text-rose-700 uppercase block">Remaining Payout</span>
                <span className="text-base font-black text-rose-800">
                  ₹{Number(selectedInvestmentForView.tracking2x?.remainingPayout ?? ((selectedInvestmentForView.amount || 0) * (selectedInvestmentForView.multiplier || 2))).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Payment & Clearance Voucher</span>
                </span>
                {selectedInvestmentForView.paymentStatus === 'Pending' && !readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      const cur = selectedInvestmentForView;
                      setSelectedInvestmentForView(null);
                      handleVerifyInvestmentPayment(cur);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Verify Payment
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>Payment Mode: <strong className="text-slate-900">{selectedInvestmentForView.paymentMode || 'Bank Transfer'}</strong></div>
                <div>UTR / Reference ID: <strong className="text-slate-900 font-mono">{selectedInvestmentForView.utrNumber || 'N/A'}</strong></div>
                <div>Payment Date: <strong className="text-slate-900">{selectedInvestmentForView.investmentDate ? new Date(selectedInvestmentForView.investmentDate).toLocaleDateString('en-IN') : 'N/A'}</strong></div>
                <div>Verification Status: <strong className="text-slate-900">{selectedInvestmentForView.paymentStatus}</strong></div>
                {selectedInvestmentForView.verifiedBy && (
                  <div className="sm:col-span-2">Verified By: <strong className="text-slate-900">{selectedInvestmentForView.verifiedBy}</strong> on {selectedInvestmentForView.verifiedAt ? new Date(selectedInvestmentForView.verifiedAt).toLocaleString('en-IN') : 'N/A'}</div>
                )}
                {selectedInvestmentForView.adminRemarks && (
                  <div className="sm:col-span-2">Remarks: <em className="text-slate-800">"{selectedInvestmentForView.adminRemarks}"</em></div>
                )}
                {selectedInvestmentForView.receiptUrl && (
                  <div className="sm:col-span-2 pt-2">
                    <a
                      href={getBackendAssetUrl(selectedInvestmentForView.receiptUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Payment Receipt / Screenshot</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Plan & Agreement Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Investment Plan & Legal Agreement</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>Assigned Plan: <strong className="text-slate-900">{selectedInvestmentForView.planName || 'Standard Plan'}</strong></div>
                <div>Plan Code: <strong className="text-slate-900">{selectedInvestmentForView.planCode || 'PLAN-STD'}</strong></div>
                <div>Approved Duration: <strong className="text-slate-900">{selectedInvestmentForView.durationMonths || '—'} Months</strong></div>
                <div>Contractual Percentage: <strong className="text-slate-900">{selectedInvestmentForView.contractualPercentage ? `${selectedInvestmentForView.contractualPercentage}%` : '2X Multiplier'} ({selectedInvestmentForView.percentageBasis || 'Contractual Basis'})</strong></div>
                <div>Assignment Date: <strong className="text-slate-900">{selectedInvestmentForView.assignedDate ? new Date(selectedInvestmentForView.assignedDate).toLocaleDateString('en-IN') : 'N/A'}</strong></div>
                <div>Calculated Maturity: <strong className="text-slate-900">{selectedInvestmentForView.maturityDate ? new Date(selectedInvestmentForView.maturityDate).toLocaleDateString('en-IN') : 'N/A'}</strong></div>
                <div>Agreement Number: <strong className="text-slate-900">{selectedInvestmentForView.agreementNumber || 'N/A'}</strong></div>
                <div>Agreement Status: <strong className="text-slate-900">{selectedInvestmentForView.agreementStatus || 'Draft'}</strong></div>
                {selectedInvestmentForView.agreementUrl && (
                  <div className="sm:col-span-2 pt-2">
                    <a
                      href={getBackendAssetUrl(selectedInvestmentForView.agreementUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Signed Investment Agreement</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Dedicated 2X Tracking Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
              <div className="font-bold text-indigo-950 flex items-center justify-between border-b border-indigo-200/80 pb-2">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Discrete 2X Arrangement Tracking</span>
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {selectedInvestmentForView.planStatus || 'Pending'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                This investment maintains its own separate 2X target and maturity date without commingling with other investment contracts.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-semibold text-slate-700">
                <div>Original Capital: <span className="text-slate-950 font-bold">₹{Number(selectedInvestmentForView.amount || 0).toLocaleString('en-IN')}</span></div>
                <div>Payouts Completed: <span className="text-emerald-700 font-bold">₹{Number(selectedInvestmentForView.tracking2x?.completedPayouts || 0).toLocaleString('en-IN')}</span></div>
                <div>Remaining Liability: <span className="text-rose-700 font-bold">₹{Number(selectedInvestmentForView.tracking2x?.remainingPayout ?? ((selectedInvestmentForView.amount || 0) * (selectedInvestmentForView.multiplier || 2))).toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedInvestmentForView(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default InvestorDetailsModal;
