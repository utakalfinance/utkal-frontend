import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  RefreshCw,
  X,
  MessageSquare,
} from 'lucide-react';
import {
  getAssignedLoanApplicationsApi,
  getAssignedLoanApplicationByIdApi,
  verifyDocumentItemApi,
} from '../../services/districtAdminService';
import { ZoomableImageViewer } from '../../components/common/ZoomableImageViewer';

export function DistrictDocumentVerification() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();

  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(searchParams.get('appId') || '');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingLoan, setLoadingLoan] = useState(false);
  const [updatingDocId, setUpdatingDocId] = useState(null);

  // Document modal preview & zoom state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Remarks state per document
  const [docRemarks, setDocRemarks] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Fetch available applications
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

  // Fetch single loan details when selectedLoanId changes
  useEffect(() => {
    if (!selectedLoanId) return;
    setLoadingLoan(true);
    getAssignedLoanApplicationByIdApi(selectedLoanId)
      .then((data) => {
        const app = data?.loan || data;
        setSelectedLoan(app);
        // Preload remarks
        const remarksMap = {};
        (app?.documents || []).forEach((d) => {
          remarksMap[d._id] = d.verificationRemarks || '';
        });
        setDocRemarks(remarksMap);
      })
      .catch((err) => console.error('Failed to load application details:', err))
      .finally(() => setLoadingLoan(false));
  }, [selectedLoanId]);

  const handleDocumentAction = async (docId, newStatus) => {
    if (!selectedLoan) return;
    const remark = docRemarks[docId] || '';

    if (newStatus === 'Rejected' && !remark.trim()) {
      alert('Please provide a remark or rejection reason before marking the document as Rejected.');
      return;
    }

    const targetId = selectedLoan._id || selectedLoan.loan?._id || selectedLoanId;
    if (!targetId || targetId === 'undefined') {
      alert('Error: Application ID is missing.');
      return;
    }

    setUpdatingDocId(docId);
    try {
      const res = await verifyDocumentItemApi(targetId, docId, newStatus, remark);
      // Update local state
      setSelectedLoan((prev) => {
        const docs = prev?.documents || [];
        const updatedDocs = docs.map((d) =>
          d._id === docId ? { ...d, verificationStatus: newStatus, verificationRemarks: remark } : d
        );
        return { ...prev, documents: updatedDocs, status: res.loan?.status || prev.status };
      });

      setFeedbackMessage({
        type: 'success',
        text: `Document status updated to ${newStatus}.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to update document status',
      });
    } finally {
      setUpdatingDocId(null);
    }
  };

  const isPdf = (url = '') => url.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                KYC Document Verification
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect applicant KYC documents and authenticate for {adminUser?.assignedDistrict} Circle
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
            className="w-full sm:w-72 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loans.length === 0 ? (
              <option value="">No applications found</option>
            ) : (
              loans.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.applicationId} - {app.applicantName} ({app.status})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 ${
            feedbackMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
          }`}
        >
          {feedbackMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {loadingLoan ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500">Loading applicant KYC dossier...</p>
        </div>
      ) : !selectedLoan ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
          Please select an application from the dropdown above to review its documents.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Applicant Summary Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 text-[11px]">Applicant Name</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedLoan.applicantName}
              </p>
              <p className="text-[11px] font-mono text-slate-500">{selectedLoan.memberId}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Requested Loan</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                ₹{(selectedLoan.requestedAmount || 10000).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500">{selectedLoan.preferredTenureMonths} Mo. Term</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Application Status</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {selectedLoan.status}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Fast Navigation</p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => navigate(`/district-dashboard/customer-verification?appId=${selectedLoan._id}`)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Verify Customer Details &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Document Review Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Uploaded Verification Files ({selectedLoan.documents?.length || 0})
              </h2>
              <span className="text-xs text-slate-500">
                Verify each document individually before finalizing application decision
              </span>
            </div>

            {!selectedLoan.documents || selectedLoan.documents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
                No KYC documents uploaded for this loan application.
              </div>
            ) : (
              selectedLoan.documents.map((doc) => {
                const isVerified = doc.verificationStatus === 'Verified';
                const isRejected = doc.verificationStatus === 'Rejected';
                const isPending = !isVerified && !isRejected;
                const isBusy = updatingDocId === doc._id;

                return (
                  <div
                    key={doc._id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 shadow-xs ${
                      isVerified
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10'
                        : isRejected
                        ? 'border-red-200 dark:border-red-900/60 bg-red-50/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      {/* Left Document Info */}
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`p-2 rounded-xl ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : isRejected
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            <FileText className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {doc.documentType}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              File: {doc.documentName}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span>
                            Uploaded:{' '}
                            {new Date(doc.uploadedAt || selectedLoan.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span>*</span>
                          <span>
                            Status:{' '}
                            <span
                              className={`font-bold ${
                                isVerified
                                  ? 'text-emerald-600'
                                  : isRejected
                                  ? 'text-red-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {doc.verificationStatus || 'Pending'}
                            </span>
                          </span>
                          {doc.verifiedBy && (
                            <>
                              <span>*</span>
                              <span>By: {doc.verifiedBy}</span>
                            </>
                          )}
                        </div>

                        {/* Remarks input field */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Verification Remarks / Reason for Rejection:
                          </label>
                          <input
                            type="text"
                            value={docRemarks[doc._id] || ''}
                            onChange={(e) =>
                              setDocRemarks({ ...docRemarks, [doc._id]: e.target.value })
                            }
                            placeholder="e.g., Aadhaar number matches applicant dossier, address verified"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex flex-wrap items-center lg:flex-col lg:items-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                        {/* Preview / View File */}
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewDoc(doc);
                            setZoomLevel(1);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>Preview Document</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Mark Verified */}
                          <button
                            type="button"
                            onClick={() => handleDocumentAction(doc._id, 'Verified')}
                            disabled={isBusy}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                              isVerified
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </button>

                          {/* Mark Rejected */}
                          <button
                            type="button"
                            onClick={() => handleDocumentAction(doc._id, 'Rejected')}
                            disabled={isBusy}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                              isRejected
                                ? 'bg-red-600 text-white ring-2 ring-red-400'
                                : 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white dark:bg-red-950/60 dark:text-red-300'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </button>

                          {/* Mark Pending */}
                          <button
                            type="button"
                            onClick={() => handleDocumentAction(doc._id, 'Pending')}
                            disabled={isBusy}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Reset to Pending"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Document Preview & Zoom Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-white bg-slate-950/90 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs">{previewDoc.documentType}</span>
                <span className="text-slate-500 text-xs">({previewDoc.documentName})</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF or Image */}
            <div className="flex-1 overflow-hidden bg-slate-950 p-0 flex items-center justify-center">
              {isPdf(previewDoc.documentUrl) ? (
                <iframe
                  src={previewDoc.documentUrl}
                  title={previewDoc.documentName}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <ZoomableImageViewer
                  src={previewDoc.documentUrl}
                  alt={previewDoc.documentName}
                  minZoom={0.5}
                  maxZoom={5.0}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DistrictDocumentVerification;
