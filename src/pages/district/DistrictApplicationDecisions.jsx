import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
  Scale,
  Send,
  XCircle,
  PauseCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  getAssignedLoanApplicationsApi,
  getAssignedLoanApplicationByIdApi,
  recordApplicationDecisionApi,
} from '../../services/districtAdminService';

export function DistrictApplicationDecisions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();

  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(searchParams.get('appId') || '');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingLoan, setLoadingLoan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Decision state
  const [selectedDecision, setSelectedDecision] = useState('verify_and_forward'); // 'verify_and_forward' | 'reject' | 'hold'
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Fetch applications list
  useEffect(() => {
    setLoadingList(true);
    getAssignedLoanApplicationsApi()
      .then((res) => {
        if (res && res.loans) {
          setLoans(res.loans);
          if (!selectedLoanId && res.loans.length > 0) {
            setSelectedLoanId(res.loans[0]._id);
          }
        }
      })
      .catch((err) => console.error('Failed to load loans:', err))
      .finally(() => setLoadingList(false));
  }, []);

  // Fetch selected loan
  useEffect(() => {
    if (!selectedLoanId) return;
    setLoadingLoan(true);
    setDecisionRemarks('');
    getAssignedLoanApplicationByIdApi(selectedLoanId)
      .then((data) => {
        const app = data?.loan || data;
        setSelectedLoan(app);
        if (app?.districtVerification?.districtRemarks) {
          setDecisionRemarks(app.districtVerification.districtRemarks);
        }
      })
      .catch((err) => console.error('Failed to load application:', err))
      .finally(() => setLoadingLoan(false));
  }, [selectedLoanId]);

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    if ((selectedDecision === 'reject' || selectedDecision === 'hold') && !decisionRemarks.trim()) {
      alert(`A detailed remark is required when setting application to ${selectedDecision}.`);
      return;
    }

    const targetId = selectedLoan._id || selectedLoan.loan?._id || selectedLoanId;
    if (!targetId || targetId === 'undefined') {
      setFeedback({
        type: 'error',
        text: 'Error: Cannot submit decision because the application ID is missing.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await recordApplicationDecisionApi(
        targetId,
        selectedDecision,
        decisionRemarks
      );

      const updated = res.loan || res;
      setSelectedLoan(updated);
      setFeedback({
        type: 'success',
        text: `Application ${updated.applicationId || selectedLoan.applicationId || ''} decision recorded: ${updated.status || 'Updated'}.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to submit application decision',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allDocsVerified =
    selectedLoan?.documents &&
    selectedLoan.documents.length > 0 &&
    selectedLoan.documents.every((d) => d.verificationStatus === 'Verified');

  const customerVerified = selectedLoan?.customerVerification?.status === 'Verified';

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Application Decisions & Super Admin Forwarding
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execute preliminary decisions and submit recommended dossiers to Super Admin
              </p>
            </div>
          </div>
        </div>

        {/* Application Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Application:</span>
          <select
            value={selectedLoanId}
            onChange={(e) => {
              setSelectedLoanId(e.target.value);
              setSearchParams({ appId: e.target.value });
            }}
            disabled={loadingList || loans.length === 0}
            className="w-full sm:w-72 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {loans.map((app) => (
              <option key={app._id} value={app._id}>
                {app.applicationId} - {app.applicantName} ({app.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {loadingLoan ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500">Loading loan application decision room...</p>
        </div>
      ) : !selectedLoan ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
          Please select an application to proceed.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Checklist & Verification Audit */}
          <div className="lg:col-span-2 space-y-6">
            {/* Verification Checklist Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Pre-Decision Compliance Checklist</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* KYC Documents Check */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    allDocsVerified
                      ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-amber-200 bg-amber-50/40 dark:bg-amber-950/20'
                  }`}
                >
                  {allDocsVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Document Verification
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {allDocsVerified
                        ? 'All uploaded KYC documents authenticated.'
                        : 'Some documents are still pending individual verification.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/district-dashboard/document-verification?appId=${selectedLoan._id}`)}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Inspect Documents &rarr;
                    </button>
                  </div>
                </div>

                {/* Customer Identity Check */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    customerVerified
                      ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-amber-200 bg-amber-50/40 dark:bg-amber-950/20'
                  }`}
                >
                  {customerVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Customer Verification
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {customerVerified
                        ? 'Customer identity & address verified.'
                        : `Status is currently ${selectedLoan.customerVerification?.status || 'Pending'}.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/district-dashboard/customer-verification?appId=${selectedLoan._id}`)}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Verify Customer &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Locked Financial Parameters (Per Business Rule) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Locked Financial Parameters (Non-Editable by District Admin)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400">Requested Amount:</span>
                    <p className="font-bold text-slate-900 dark:text-white">₹{(selectedLoan.requestedAmount || 10000).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Stated Interest Rate:</span>
                    <p className="font-bold text-slate-900 dark:text-white">5% p.a.*</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Repayment Term:</span>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedLoan.preferredTenureMonths} Months</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Final Sanction Authority:</span>
                    <p className="font-bold text-purple-600 dark:text-purple-400">Super Admin Only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Trail & Activity Log */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Application Audit Trail ({selectedLoan.applicationId})
              </h3>
              <div className="space-y-2">
                {!selectedLoan.verificationActivities || selectedLoan.verificationActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                ) : (
                  selectedLoan.verificationActivities.map((act, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{act.action}</span>
                        {act.notes && <p className="text-[11px] text-slate-400 mt-0.5">"{act.notes}"</p>}
                      </div>
                      <div className="text-right text-[10px] text-slate-400">
                        <p>{act.performedBy}</p>
                        <p>{new Date(act.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Decision Form */}
          <div className="space-y-6">
            <form
              onSubmit={handleSubmitDecision}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Record Preliminary Decision
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select decision and forward dossier
                </p>
              </div>

              {/* Decision Options */}
              <div className="space-y-2.5">
                {/* 1. Verify and Forward */}
                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedDecision === 'verify_and_forward'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="verify_and_forward"
                    checked={selectedDecision === 'verify_and_forward'}
                    onChange={(e) => setSelectedDecision(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      1. Verify & Forward to Super Admin
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sets status to <span className="font-semibold text-blue-600">Pending Final Approval</span> for final sanction by Super Admin.
                    </p>
                  </div>
                </label>

                {/* 2. On Hold */}
                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedDecision === 'hold'
                      ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="hold"
                    checked={selectedDecision === 'hold'}
                    onChange={(e) => setSelectedDecision(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-xs font-bold text-yellow-800 dark:text-yellow-300">
                      2. Put On Hold
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sets status to <span className="font-semibold text-yellow-600">On Hold</span> pending member document clarification.
                    </p>
                  </div>
                </label>

                {/* 3. Reject */}
                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedDecision === 'reject'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={selectedDecision === 'reject'}
                    onChange={(e) => setSelectedDecision(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-xs font-bold text-red-800 dark:text-red-300">
                      3. Reject Application
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sets status to <span className="font-semibold text-red-600">Rejected</span> at circle preliminary verification stage.
                    </p>
                  </div>
                </label>
              </div>

              {/* Remarks / Justification textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  District Verification Remarks {selectedDecision !== 'verify_and_forward' && <span className="text-red-500">*</span>}:
                </label>
                <textarea
                  rows={4}
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  placeholder={
                    selectedDecision === 'verify_and_forward'
                      ? 'e.g., Preliminary physical KYC inspection completed at circle office. Recommended for final sanction.'
                      : 'Provide mandatory detailed reasoning or required documentation list...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Submit Decision */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl text-white shadow-xs transition-colors disabled:opacity-50 ${
                  selectedDecision === 'verify_and_forward'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : selectedDecision === 'hold'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting ? (
                  <span>Recording Decision...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm & Execute Decision</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-xl text-[11px] text-purple-900 dark:text-purple-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <span>
                  Super Admin will receive immediate notification once marked "Pending Final Approval".
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DistrictApplicationDecisions;
