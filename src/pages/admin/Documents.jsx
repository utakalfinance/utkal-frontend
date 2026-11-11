import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  FileText,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  UserCheck,
  ExternalLink,
  Layers,
  ShieldCheck,
  FileCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Grid,
  List,
  X,
} from 'lucide-react';
import { getDocumentsApi } from '../../services/applicationService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ZoomableImageViewer } from '../../components/common/ZoomableImageViewer';
import { getBackendAssetUrl as getFileUrl } from '../../config/env';
import { useAdmin } from '../../context/AdminContext';

export function Documents() {
  const { documents: contextDocs, refreshDocuments } = useAdmin();

  const [applicationsWithDocs, setApplicationsWithDocs] = useState(() => {
    try {
      const cached = sessionStorage.getItem('admin_documents_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return Array.isArray(contextDocs) && contextDocs.length > 0 ? contextDocs : [];
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('admin_documents_cache');
      if (cached && JSON.parse(cached)?.length > 0) return false;
    } catch (e) {}
    return !contextDocs || contextDocs.length === 0;
  });

  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING_VERIFICATION, VERIFIED, NOT_UPLOADED
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' (default) or 'table'

  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  // Fetch real applications and complete documentDetails from backend API with background revalidation
  const fetchDocuments = useCallback(async (isSilent = false) => {
    if (!isSilent && applicationsWithDocs.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const docsData = await (refreshDocuments ? refreshDocuments() : getDocumentsApi());
      if (Array.isArray(docsData)) {
        setApplicationsWithDocs(docsData);
        try {
          sessionStorage.setItem('admin_documents_cache', JSON.stringify(docsData));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching backend documents:', err);
      if (applicationsWithDocs.length === 0) {
        setError('Unable to load documents from database. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [applicationsWithDocs.length, refreshDocuments]);

  useEffect(() => {
    const hasExistingData = applicationsWithDocs.length > 0;
    fetchDocuments(hasExistingData);
  }, []); // Run on mount

  // Lock background, html, & main container scroll when document preview modal is active
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (selectedPreviewDoc) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (mainEl) mainEl.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (mainEl) mainEl.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (mainEl) mainEl.style.overflow = '';
    };
  }, [selectedPreviewDoc]);

  // Helper function to extract and sanitize valid uploaded documents for a single application
  const getApplicantDocuments = (app) => {
    if (!app) return [];

    const sanitizeDocsList = (rawList) => {
      if (!Array.isArray(rawList)) return [];
      const result = [];
      const seenSlots = new Set();

      rawList.forEach((d) => {
        if (!d || !d.documentUrl) return;
        const slotKey = d.id || `${d.documentType}-${d.documentName}`;
        if (seenSlots.has(slotKey)) {
          return;
        }

        seenSlots.add(slotKey);
        result.push(d);
      });

      return result;
    };

    const doc = app.documentDetails || app.documents || {};
    const defaultVerification =
      app.status === 'approved'
        ? 'Verified'
        : app.status === 'rejected'
        ? 'Rejected'
        : 'Pending Verification';

    const list = [];
    const idType = (doc.idProofType || app.idProofType || 'Aadhaar Card').trim();
    const addrType = (doc.addressProofType || app.addressProofType || 'Aadhaar Card').trim();

    const idUrl =
      doc.idProofUrl ||
      app.idProofUrl ||
      doc.idProof ||
      doc.doc2_govId ||
      app.doc2_govId ||
      app.idProof ||
      (typeof doc.idProofFile === 'string' ? doc.idProofFile : '') ||
      (typeof app.idProofFile === 'string' ? app.idProofFile : '') ||
      (typeof doc.idProofFile?.previewUrl === 'string' ? doc.idProofFile.previewUrl : '') ||
      (typeof doc.idProofFile?.dataUrl === 'string' ? doc.idProofFile.dataUrl : '');

    const addrUrl =
      doc.addressProofUrl ||
      app.addressProofUrl ||
      doc.addressProof ||
      app.addressProof ||
      (typeof doc.addressProofFile === 'string' ? doc.addressProofFile : '') ||
      (typeof app.addressProofFile === 'string' ? app.addressProofFile : '') ||
      (typeof doc.addressProofFile?.previewUrl === 'string' ? doc.addressProofFile.previewUrl : '') ||
      (typeof doc.addressProofFile?.dataUrl === 'string' ? doc.addressProofFile.dataUrl : '');

    // 1. Primary Government ID Proof
    if (idUrl) {
      list.push({
        id: `${app._id || app.id}-idproof`,
        documentType: 'Primary Government ID Proof',
        documentName: `${idType} (Primary Government ID Proof)`,
        documentUrl: idUrl,
        uploadedAt: app.submittedAt || app.createdAt,
        verificationStatus: defaultVerification,
      });
    }

    // 2. Address Proof Document
    if (addrUrl || idUrl) {
      list.push({
        id: `${app._id || app.id}-addressproof`,
        documentType: 'Address Proof Document',
        documentName: `${addrType} (Address Proof Document)`,
        documentUrl: addrUrl || idUrl,
        uploadedAt: app.submittedAt || app.createdAt,
        verificationStatus: defaultVerification,
      });
    }

    const photoUrl =
      doc.photoUrl ||
      app.photoUrl ||
      doc.photo ||
      doc.doc1_photo ||
      app.doc1_photo ||
      (typeof doc.photoFile === 'string' ? doc.photoFile : '') ||
      (typeof app.photoFile === 'string' ? app.photoFile : '') ||
      (typeof doc.photoFile?.previewUrl === 'string' ? doc.photoFile.previewUrl : '') ||
      (typeof doc.photoFile?.dataUrl === 'string' ? doc.photoFile.dataUrl : '');

    if (photoUrl) {
      list.push({
        id: `${app._id || app.id}-photo`,
        documentType: 'Passport Photograph',
        documentName: 'Applicant Passport Photograph',
        documentUrl: photoUrl,
        uploadedAt: app.submittedAt || app.createdAt,
        verificationStatus: defaultVerification,
      });
    }

    const sigUrl =
      doc.signatureUrl ||
      app.signatureUrl ||
      doc.signature ||
      (typeof doc.signatureFile === 'string' ? doc.signatureFile : '') ||
      (typeof app.signatureFile === 'string' ? app.signatureFile : '') ||
      (typeof doc.signatureFile?.previewUrl === 'string' ? doc.signatureFile.previewUrl : '') ||
      (typeof doc.signatureFile?.dataUrl === 'string' ? doc.signatureFile.dataUrl : '');

    if (sigUrl) {
      list.push({
        id: `${app._id || app.id}-signature`,
        documentType: 'Signature',
        documentName: 'Digital Signature Specimen',
        documentUrl: sigUrl,
        uploadedAt: app.submittedAt || app.createdAt,
        verificationStatus: defaultVerification,
      });
    }

    const doc3Url =
      doc.doc3_eduCert ||
      app.doc3_eduCert ||
      (Array.isArray(doc.additionalDocuments)
        ? doc.additionalDocuments.find(d => d.documentType === 'Educational Certificate')?.documentUrl
        : '') ||
      (Array.isArray(app.additionalDocuments)
        ? app.additionalDocuments.find(d => d.documentType === 'Educational Certificate')?.documentUrl
        : '') ||
      '';

    if (doc3Url && !list.some(d => d.documentType === 'Educational Certificate')) {
      list.push({
        id: `${app._id || app.id}-edu`,
        documentType: 'Educational Certificate',
        documentName: 'Educational Degree / Certificate',
        documentUrl: doc3Url,
        uploadedAt: app.submittedAt || app.createdAt,
        verificationStatus: defaultVerification,
      });
    }

    const doc4Url =
      doc.doc4_birthCert ||
      app.doc4_birthCert ||
      (Array.isArray(doc.additionalDocuments)
        ? doc.additionalDocuments.find(d => d.documentType === 'Birth / PAN Certificate' || d.documentType === 'Birth Certificate')?.documentUrl
        : '') ||
      (Array.isArray(app.additionalDocuments)
        ? app.additionalDocuments.find(d => d.documentType === 'Birth / PAN Certificate' || d.documentType === 'Birth Certificate')?.documentUrl
        : '') ||
      '';

    if (doc4Url && !list.some(d => d.documentType === 'Birth / PAN Certificate' || d.documentType === 'Birth Certificate')) {
      list.push({
        id: `${app._id || app.id}-birth`,
        documentType: 'Birth / PAN Certificate',
        documentName: 'Birth / PAN / Identity Certificate',
        documentUrl: doc4Url,
        uploadedAt: app.submittedAt || app.createdAt,
        verificationStatus: defaultVerification,
      });
    }

    const doc5Url =
      doc.doc5_utility ||
      app.doc5_utility ||
      (Array.isArray(doc.additionalDocuments)
        ? doc.additionalDocuments.find(d => d.documentType === 'Financial / Utility Document' || d.documentType === 'Utility Bill')?.documentUrl
        : '') ||
      (Array.isArray(app.additionalDocuments)
        ? app.additionalDocuments.find(d => d.documentType === 'Financial / Utility Document' || d.documentType === 'Utility Bill')?.documentUrl
        : '') ||
      '';

    if (doc5Url && !list.some(d => d.documentType === 'Financial / Utility Document' || d.documentType === 'Utility Bill')) {
      list.push({
        id: `${app._id || app.id}-utility`,
        documentType: 'Financial / Utility Document',
        documentName: 'Electricity Bill / Bank Passbook',
        documentUrl: doc5Url,
        uploadedAt: app.submittedAt || app.createdAt,
        verificationStatus: defaultVerification,
      });
    }

    const receiptUrl = doc.paymentReceiptUrl || app.paymentReceiptUrl || app.paymentDetails?.receiptUrl || app.payment?.receiptUrl;
    if (receiptUrl && !list.some(d => d.documentType === 'Payment Receipt')) {
      list.push({
        id: `${app._id || app.id}-paymentreceipt`,
        documentType: 'Payment Receipt',
        documentName: '₹200 Statutory Membership Payment Screenshot',
        documentUrl: receiptUrl,
        uploadedAt: app.submittedAt || app.createdAt,
        verificationStatus: defaultVerification,
      });
    }

    // Merge any non-duplicate items from app.documents or additionalDocuments
    const additionalDocs = Array.isArray(doc.additionalDocuments) ? doc.additionalDocuments : (Array.isArray(app.additionalDocuments) ? app.additionalDocuments : []);
    additionalDocs.forEach((addDoc, idx) => {
      if (addDoc && addDoc.documentUrl && !list.some(d => d.documentType === addDoc.documentType || d.documentUrl === addDoc.documentUrl)) {
        list.push({
          id: addDoc._id ? addDoc._id.toString() : `${app._id || app.id}-add-${idx}`,
          documentType: addDoc.documentType || 'Additional Document',
          documentName: addDoc.documentName || addDoc.documentType || `Supporting Document #${idx + 1}`,
          documentUrl: addDoc.documentUrl,
          uploadedAt: addDoc.uploadedAt || app.submittedAt || app.createdAt,
          verificationStatus: defaultVerification,
        });
      }
    });

    return sanitizeDocsList(list);
  };

  // Filter applications by search string & status filter
  const filteredApplications = applicationsWithDocs.filter((app) => {
    const s = search.toLowerCase().trim();
    const appDocs = getApplicantDocuments(app);

    const matchesSearch =
      !s ||
      (app.applicantName && app.applicantName.toLowerCase().includes(s)) ||
      (app.applicationId && app.applicationId.toLowerCase().includes(s)) ||
      (app.memberId && app.memberId.toLowerCase().includes(s)) ||
      (app.email && app.email.toLowerCase().includes(s)) ||
      (app.mobile && app.mobile.toLowerCase().includes(s)) ||
      appDocs.some(
        (d) =>
          (d.documentType && d.documentType.toLowerCase().includes(s)) ||
          (d.documentName && d.documentName.toLowerCase().includes(s))
      );

    let matchesFilter = true;
    if (statusFilter === 'PENDING_VERIFICATION') {
      matchesFilter = appDocs.some((d) => d.verificationStatus === 'Pending Verification');
    } else if (statusFilter === 'VERIFIED') {
      matchesFilter = appDocs.length > 0 && appDocs.every((d) => d.verificationStatus === 'Verified');
    } else if (statusFilter === 'NOT_UPLOADED') {
      matchesFilter = appDocs.length === 0;
    }

    return matchesSearch && matchesFilter;
  });

  // Calculate real metric counts
  const totalAppsCount = applicationsWithDocs.length;
  const totalDocsCount = applicationsWithDocs.reduce(
    (acc, app) => acc + getApplicantDocuments(app).length,
    0
  );
  const totalVerifiedDocs = applicationsWithDocs.reduce((acc, app) => {
    return acc + getApplicantDocuments(app).filter((d) => d.verificationStatus === 'Verified').length;
  }, 0);
  const totalPendingDocs = applicationsWithDocs.reduce((acc, app) => {
    return acc + getApplicantDocuments(app).filter((d) => d.verificationStatus === 'Pending Verification').length;
  }, 0);

  // Flattened array for table view option
  const allFlattenedDocs = [];
  filteredApplications.forEach((app) => {
    const docs = getApplicantDocuments(app);
    if (docs.length === 0) {
      allFlattenedDocs.push({
        id: `${app._id}-none`,
        app,
        docItem: null,
      });
    } else {
      docs.forEach((d) => {
        allFlattenedDocs.push({
          id: d.id,
          app,
          docItem: d,
        });
      });
    }
  });

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Documents Repository</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              MongoDB Live
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Grouped applicant audit portal for all uploaded statutory identity proof, address proof, photos, signatures, and additional documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* VIEW MODE TOGGLE */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grouped'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grouped by Applicant</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchDocuments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applicants</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : totalAppsCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Documents</p>
            <h3 className="text-2xl font-black text-blue-700 mt-1">{loading ? '...' : totalDocsCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Verification</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">{loading ? '...' : totalPendingDocs}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Documents</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{loading ? '...' : totalVerifiedDocs}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Applicant, App ID, Member ID, Document Type..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* FILTER DROPDOWN */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Applicants</option>
              <option value="PENDING_VERIFICATION">Has Pending Verification</option>
              <option value="VERIFIED">All Documents Verified</option>
              <option value="NOT_UPLOADED">No Documents Uploaded</option>
            </select>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchDocuments}
              className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading applicant documents from database...</p>
          </div>
        )}

        {/* MAIN GROUPED APPLICANTS VIEW (DEFAULT) */}
        {!loading && !error && viewMode === 'grouped' && (
          <div className="space-y-6 pt-2">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => {
                const docs = getApplicantDocuments(app);
                const submittedFormatted = app.submittedAt
                  ? new Date(app.submittedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A';

                return (
                  <div
                    key={app._id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                  >
                    {/* APPLICANT CARD HEADER */}
                    <div className="bg-slate-50/80 border-b border-slate-200/80 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <User className="w-4.5 h-4.5 text-blue-600" />
                            <span>{app.applicantName}</span>
                          </h3>

                          <StatusBadge status={app.status} />

                          <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            {docs.length} {docs.length === 1 ? 'Document' : 'Documents'} Attached
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-slate-700">App ID:</span>
                            <span className="font-mono text-blue-700 font-bold">{app.applicationId}</span>
                          </span>

                          <span className="flex items-center gap-1">
                            <span className="font-bold text-slate-700">Member ID:</span>
                            {app.memberId ? (
                              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {app.memberId}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Not assigned</span>
                            )}
                          </span>

                          {app.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{app.email}</span>
                            </span>
                          )}

                          {app.mobile && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{app.mobile}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Submitted: {submittedFormatted}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* APPLICANT DOCUMENTS LIST */}
                    <div className="p-4 sm:p-5">
                      {docs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {docs.map((document) => {
                            const fullUrl = getFileUrl(document.documentUrl);

                            return (
                              <div
                                key={document.id}
                                className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-between space-y-3 hover:bg-slate-100/60 transition-colors"
                              >
                                <div className="space-y-1.5">
                                  {/* Document Type Badge */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-extrabold border border-blue-200 uppercase tracking-wider">
                                      {document.documentType}
                                    </span>

                                    {document.verificationStatus === 'Verified' ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Verified</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                        <Clock className="w-3 h-3 text-amber-600" />
                                        <span>Pending</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Document Title / Name */}
                                  <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2">
                                    {document.documentName}
                                  </h4>

                                  <p className="text-[10px] font-mono text-slate-400">
                                    Uploaded: {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString('en-GB') : 'N/A'}
                                  </p>
                                </div>

                                {/* Action Buttons: View & Download */}
                                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-2">
                                  {fullUrl ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedPreviewDoc({
                                            title: document.documentName,
                                            type: document.documentType,
                                            applicant: app.applicantName,
                                            appId: app.applicationId,
                                            url: fullUrl,
                                          })
                                        }
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>View</span>
                                      </button>

                                      <a
                                        href={fullUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
                                        title="Download File"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                      </a>
                                    </>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic font-normal">No file link</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                          <FolderOpen className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                          <p className="text-xs font-bold text-slate-600">No documents uploaded</p>
                          <p className="text-[11px] text-slate-400">This applicant has not uploaded any statutory documents yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No applicants match filter criteria</p>
                <p className="text-xs text-slate-400">Try broadening your search term or status filter.</p>
              </div>
            )}
          </div>
        )}

        {/* ALTERNATE TABLE LIST VIEW */}
        {!loading && !error && viewMode === 'table' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">APPLICANT &amp; APP ID</th>
                  <th className="py-3.5 px-4">MEMBER ID</th>
                  <th className="py-3.5 px-4">DOCUMENT TYPE</th>
                  <th className="py-3.5 px-4">DOCUMENT NAME</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {allFlattenedDocs.map((row) => {
                  const { app, docItem } = row;
                  const fullUrl = docItem ? getFileUrl(docItem.documentUrl) : '';

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-extrabold text-slate-900 text-xs">{app.applicantName}</div>
                        <div className="font-mono text-blue-700 font-bold text-[11px]">{app.applicationId}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {app.memberId ? (
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                            {app.memberId}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not assigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {docItem ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                            {docItem.documentType}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {docItem ? docItem.documentName : <span className="text-slate-400 italic">No documents uploaded</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        {docItem ? (
                          docItem.verificationStatus === 'Verified' ? (
                            <span className="text-emerald-700 font-bold text-[11px]">Verified</span>
                          ) : (
                            <span className="text-amber-700 font-bold text-[11px]">Pending Verification</span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not Uploaded</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {fullUrl ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPreviewDoc({
                                  title: docItem.documentName,
                                  type: docItem.documentType,
                                  applicant: app.applicantName,
                                  appId: app.applicationId,
                                  url: fullUrl,
                                })
                              }
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px]"
                            >
                              View
                            </button>
                            <a
                              href={fullUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                            >
                              Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW SINGLE DOCUMENT PREVIEW MODAL (RENDERED VIA PORTAL TO BODY) */}
      {selectedPreviewDoc &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md select-none animate-fade-in"
            onClick={() => setSelectedPreviewDoc(null)}
          >
            <div
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl p-4 sm:p-5 w-[92vw] max-w-4xl h-[82vh] max-h-[84vh] flex flex-col justify-between space-y-3 text-left overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div className="pr-4 min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {selectedPreviewDoc.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                    Applicant: <span className="font-bold text-slate-800">{selectedPreviewDoc.applicant}</span> • App ID:{' '}
                    <span className="font-bold text-blue-700">{selectedPreviewDoc.appId}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={selectedPreviewDoc.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
                    title="Download Original File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download File</span>
                  </a>
                  <a
                    href={selectedPreviewDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewDoc(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Close preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PREVIEW CONTAINER */}
              <div className="bg-slate-900 rounded-2xl overflow-hidden flex-1 w-full min-h-0 flex items-center justify-center relative border border-slate-800 p-0">
                {selectedPreviewDoc.url.startsWith('data:image') ||
                selectedPreviewDoc.url.match(/\.(jpeg|jpg|png|gif|webp|svg)($|\?)/i) ||
                selectedPreviewDoc.type?.toLowerCase().includes('photo') ||
                selectedPreviewDoc.type?.toLowerCase().includes('signature') ? (
                  <ZoomableImageViewer
                    src={selectedPreviewDoc.url}
                    alt={selectedPreviewDoc.title}
                    minZoom={0.5}
                    maxZoom={5.0}
                  />
                ) : selectedPreviewDoc.url.startsWith('data:application/pdf') || selectedPreviewDoc.url.match(/\.pdf($|\?)/i) ? (
                  <object
                    data={`${selectedPreviewDoc.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    type="application/pdf"
                    className="w-full h-full border-0 rounded-2xl bg-white"
                  >
                    <iframe
                      src={`${selectedPreviewDoc.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      title="PDF Document Preview"
                      className="w-full h-full border-0 rounded-2xl bg-white"
                    />
                  </object>
                ) : (
                  <div className="text-center text-white space-y-3 p-8">
                    <FileText className="w-14 h-14 text-blue-400 mx-auto" />
                    <p className="font-bold text-sm">{selectedPreviewDoc.title}</p>
                    <p className="text-xs text-slate-400 font-mono">{selectedPreviewDoc.url}</p>
                    <a
                      href={selectedPreviewDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                    >
                      <span>Open / Download File</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-between shrink-0 pt-1">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {selectedPreviewDoc.type || 'Document Preview'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default Documents;
