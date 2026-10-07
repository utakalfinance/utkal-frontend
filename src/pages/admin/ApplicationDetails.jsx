import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Edit,
  Printer,
  AlertCircle,
  User,
  MapPin,
  Building2,
  UserCheck,
  BarChart3,
  FileText,
  PenTool,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Download,
  Maximize2,
  Image as ImageIcon,
  Mail,
  Eye,
  X,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { EditApplicationModal } from '../../components/admin/EditApplicationModal';
import { PaymentReceiptModal } from '../../components/admin/PaymentReceiptModal';
import { getBackendAssetUrl } from '../../config/env';
import indusIndQr from '../../assets/image copy 23.png';

export function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, updateApplicationStatus, updateApplication, resendCredentials, markApplicationAsSeen } = useAdmin();

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [docZoom, setDocZoom] = useState(1);
  const [docRotation, setDocRotation] = useState(0);

  useEffect(() => {
    if (id && typeof markApplicationAsSeen === 'function') {
      markApplicationAsSeen(id);
    }
  }, [id, markApplicationAsSeen]);

  // Keyboard shortcut: ESC to close preview modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedDocPreview(null);
      }
    };
    if (selectedDocPreview) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedDocPreview]);

  const app = applications.find((a) => a._id === id || a.id === id || a.applicationId === id);

  const handleStatusChange = async (newStatus) => {
    if (!app) return;
    try {
      setIsProcessing(true);
      setErrorMessage('');
      const mongoId = app._id || app.id;
      const targetStatus = newStatus.toLowerCase();
      await updateApplicationStatus(mongoId, targetStatus);
      if (targetStatus === 'approved') {
        setMessage('Application approved successfully.');
      } else {
        setMessage(`Application status updated to "${newStatus}"`);
      }
      setIsReceiptModalOpen(false);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Error updating status:', err);
      setErrorMessage(err.message || 'Failed to update application status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveEdit = async (appId, payload) => {
    try {
      await updateApplication(appId, payload);
      setMessage('Application details updated successfully.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Error saving application edit:', err);
      setErrorMessage(err.message || 'Failed to update application');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (!app) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Application not found.</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">No application record matched ID "{id}".</p>
        <button
          onClick={() => navigate('/admin-dashboard/applications')}
          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const statusLower = (app.status || '').toLowerCase();
  const isPending = statusLower === 'pending';

  let receiptUrl =
    app.paymentReceiptUrl ||
    app.paymentDetails?.receiptUrl ||
    app.payment?.receiptUrl ||
    app.documentDetails?.paymentReceiptUrl ||
    app.documents?.paymentReceiptUrl;

  if (!receiptUrl && Array.isArray(app.documentDetails?.additionalDocuments)) {
    const found = app.documentDetails.additionalDocuments.find(
      (d) => d.documentType === 'Payment Receipt' || d.documentName?.toLowerCase().includes('payment') || d.documentName?.toLowerCase().includes('receipt')
    );
    if (found) receiptUrl = found.documentUrl;
  }
  if (!receiptUrl && Array.isArray(app.documents?.additionalDocuments)) {
    const found = app.documents.additionalDocuments.find(
      (d) => d.documentType === 'Payment Receipt' || d.documentName?.toLowerCase().includes('payment') || d.documentName?.toLowerCase().includes('receipt')
    );
    if (found) receiptUrl = found.documentUrl;
  }
  const displayReceiptUrl = receiptUrl ? getBackendAssetUrl(receiptUrl) : null;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* BACK BUTTON & TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/applications')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Back to Applications"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{app.applicantName}</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Ref ID: {app.refId} • Member ID: {app.memberId} • ID: {app.id}
            </p>
          </div>
        </div>

        {/* TOP ACTIONS TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsReceiptModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors border border-indigo-300 cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-indigo-700" />
            <span>View Payment Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors border border-amber-300 cursor-pointer shadow-xs"
          >
            <Edit className="w-4 h-4 text-amber-700" />
            <span>Edit Application</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-300 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Download / Print Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('Correction Required')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors border border-amber-200 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Request Correction</span>
          </button>

          {app.status?.toLowerCase() === 'approved' && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={async () => {
                try {
                  setIsProcessing(true);
                  setErrorMessage('');
                  const mongoId = app._id || app.id;
                  await resendCredentials(mongoId);
                  setMessage(`Credentials email resent successfully to ${app.contactDetails?.email || app.email}`);
                  setTimeout(() => setMessage(''), 5000);
                } catch (err) {
                  setErrorMessage(err.message || 'Failed to resend credentials email');
                  setTimeout(() => setErrorMessage(''), 5000);
                } finally {
                  setIsProcessing(false);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors border border-blue-300 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Mail className="w-4 h-4 text-blue-700" />
              <span>Resend Credentials Email</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleStatusChange('Approved')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00C853] hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Application</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('Rejected')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Application</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* 9 STATUTORY SECTIONS GRID */}
      <div className="space-y-5">
        {/* SECTION 1: PERSONAL DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <User className="w-4 h-4 text-blue-700" />
              <span>1. PERSONAL DETAILS</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 01</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div><strong className="block text-[10px] text-slate-400 uppercase">FULL LEGAL NAME</strong><span className="font-extrabold text-slate-900">{app.applicantName}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">FATHER / HUSBAND / GUARDIAN</strong><span className="font-bold text-slate-800">{app.relationshipPrefix} {app.fatherLegalName}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">DATE OF BIRTH &amp; AGE</strong><span className="font-bold text-slate-800">{app.dob} ({app.age} Years)</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">GENDER &amp; MARITAL STATUS</strong><span className="font-bold text-slate-800">{app.gender} • {app.maritalStatus}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">RELIGION &amp; CASTE CATEGORY</strong><span className="font-bold text-slate-800">{app.religion} • {app.category}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">EDUCATION &amp; OCCUPATION</strong><span className="font-bold text-slate-800">{app.education} • {app.occupation}</span></div>
          </div>
        </div>

        {/* SECTION 2: ADDRESS & CONTACT */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>2. ADDRESS &amp; CONTACT DETAILS</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 02</span>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-100 pb-3">
              <div><strong className="block text-[10px] text-slate-400 uppercase">PRIMARY MOBILE</strong><span className="font-mono font-bold text-slate-900">+91 {app.mobile}</span></div>
              <div><strong className="block text-[10px] text-slate-400 uppercase">ALTERNATE CONTACT</strong><span className="font-mono text-slate-700">+91 {app.altMobile}</span></div>
              <div><strong className="block text-[10px] text-slate-400 uppercase">REGISTERED EMAIL</strong><span className="font-mono font-bold text-slate-900 truncate block">{app.email}</span></div>
              <div><strong className="block text-[10px] text-slate-400 uppercase">INCOME TAX PAN</strong><span className="font-mono font-bold text-amber-600">{app.pan}</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <strong className="block text-[10px] text-slate-500 uppercase">PERMANENT RESIDENTIAL ADDRESS</strong>
                <p className="font-bold text-slate-900">{app.address1}</p>
                <p className="text-[11px] text-slate-600">Taluka: {app.villageTown} | District: {app.district} | State: {app.state} | PIN: {app.pincode}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <strong className="block text-[10px] text-slate-500 uppercase">MAILING ADDRESS</strong>
                <p className="font-bold text-slate-900">{app.address1}</p>
                <p className="text-[11px] text-slate-600">District: {app.district} | State: {app.state} | PIN: {app.pincode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: ACCOUNT & BRANCH ALLOCATION */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>3. ACCOUNT &amp; BRANCH DETAILS</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 03</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div><strong className="block text-[10px] text-slate-400 uppercase">REGISTERED BRANCH</strong><span className="font-extrabold text-slate-900">{app.branch}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">INTRODUCER / ASSOCIATE</strong><span className="font-extrabold text-slate-900">{app.introducer}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">EMPLOYEE (EMP) ID</strong><span className="font-mono font-bold text-slate-900">{app.empId}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">REGISTRY ACT</strong><span className="font-bold text-slate-800">Companies Act 2013 &amp; Nidhi Rules 2014</span></div>
          </div>
        </div>

        {/* SECTION 4: NOMINEE DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>4. NOMINEE DETAILS</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 04</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div><strong className="block text-[10px] text-slate-400 uppercase">NOMINEE NAME</strong><span className="font-extrabold text-slate-900">{app.nomineeName}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">RELATIONSHIP</strong><span className="font-bold text-slate-800">{app.nomineeRel}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">NOMINEE DOB</strong><span className="font-bold text-slate-800">{app.nomineeDob}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">ADDRESS</strong><span className="font-bold text-slate-800">{app.nomineeAddr}</span></div>
          </div>
        </div>

        {/* SECTION 5: MEMBERSHIP & EQUITY DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-blue-700" />
              <span>5. MEMBERSHIP &amp; EQUITY DETAILS</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 05</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div><strong className="block text-[10px] text-slate-400 uppercase">EQUITY SHARES ALLOTTED</strong><span className="font-bold text-slate-900">{app.numberOfShares} Shares @ ₹{app.shareValue}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">SHARE CAPITAL VALUE</strong><span className="font-bold text-slate-900">₹ {app.numberOfShares * app.shareValue}.00</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">ADMISSION FEE</strong><span className="font-bold text-slate-900">₹ {app.processingFee}.00</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">TOTAL PAID CONSIDERATION</strong><span className="font-black text-emerald-700 font-mono text-sm">₹ {app.totalPaid}.00 (Settled)</span></div>
          </div>
        </div>

        {/* SECTION 6: DOCUMENTS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>6. IDENTIFICATION DOCUMENTS &amp; UPLOADED ATTACHMENTS</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 06</span>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-b border-slate-100 pb-4">
              <div><strong className="block text-[10px] text-slate-400 uppercase">PRIMARY ID PROOF TYPE</strong><span className="font-bold text-slate-900">{app.idProofType || 'Aadhaar Card'}</span></div>
              <div><strong className="block text-[10px] text-slate-400 uppercase">ADDRESS PROOF TYPE</strong><span className="font-bold text-slate-900">{app.addressProofType || 'Aadhaar Card'}</span></div>
              <div><strong className="block text-[10px] text-slate-400 uppercase">DIGITAL ARCHIVE STATUS</strong><span className="font-bold text-emerald-700">Verified &amp; Cloud Archived</span></div>
            </div>

            {/* ATTACHED DOCUMENTS GRID */}
            {(() => {
              const doc = app.documentDetails || app.documents || {};
              const attachedDocs = [];
              const seenIds = new Set();
              const seenTypes = new Set();

              const addDoc = (id, type, title, rawUrl) => {
                if (!rawUrl || typeof rawUrl !== 'string') return;
                const formattedUrl = getBackendAssetUrl(rawUrl);
                const normType = (type || '').trim().toLowerCase();
                if (!formattedUrl || seenIds.has(id) || (normType && seenTypes.has(normType))) return;
                seenIds.add(id);
                if (normType) seenTypes.add(normType);
                attachedDocs.push({
                  id,
                  type,
                  title,
                  url: formattedUrl,
                  rawUrl,
                });
              };

              // 1. Identity Proof & Combined Address Proof
              const idType = (app.idProofType || doc.idProofType || 'Aadhaar Card').trim();
              const addrType = (app.addressProofType || doc.addressProofType || 'Aadhaar Card').trim();
              const isIdAadhaar = idType.toLowerCase().includes('aadhaar');
              const isAddrAadhaar = addrType.toLowerCase().includes('aadhaar');

              const idUrl =
                app.idProofUrl ||
                doc.idProofUrl ||
                doc.idProof ||
                doc.doc2_govId ||
                app.doc2_govId ||
                app.idProof ||
                (typeof doc.idProofFile === 'string' ? doc.idProofFile : '') ||
                (typeof app.idProofFile === 'string' ? app.idProofFile : '') ||
                (typeof doc.idProofFile?.previewUrl === 'string' ? doc.idProofFile.previewUrl : '') ||
                (typeof doc.idProofFile?.dataUrl === 'string' ? doc.idProofFile.dataUrl : '');

              const addrUrl =
                app.addressProofUrl ||
                doc.addressProofUrl ||
                doc.addressProof ||
                app.addressProof ||
                (typeof doc.addressProofFile === 'string' ? doc.addressProofFile : '') ||
                (typeof app.addressProofFile === 'string' ? app.addressProofFile : '') ||
                (typeof doc.addressProofFile?.previewUrl === 'string' ? doc.addressProofFile.previewUrl : '') ||
                (typeof doc.addressProofFile?.dataUrl === 'string' ? doc.addressProofFile.dataUrl : '');

              // 1. Primary Government ID Proof
              addDoc(
                'idproof',
                'Primary Government ID Proof',
                `${idType} (Primary Government ID Proof)`,
                idUrl
              );

              // 2. Address Proof Document
              addDoc(
                'addressproof',
                'Address Proof Document',
                `${addrType} (Address Proof Document)`,
                addrUrl || idUrl
              );

              // 3. Passport Photo
              const photoUrl =
                app.photoUrl ||
                doc.photoUrl ||
                doc.photo ||
                doc.doc1_photo ||
                app.doc1_photo ||
                (typeof doc.photoFile === 'string' ? doc.photoFile : '') ||
                (typeof app.photoFile === 'string' ? app.photoFile : '') ||
                (typeof doc.photoFile?.previewUrl === 'string' ? doc.photoFile.previewUrl : '') ||
                (typeof doc.photoFile?.dataUrl === 'string' ? doc.photoFile.dataUrl : '');
              addDoc(
                'photo',
                'Passport Photograph',
                'Applicant Passport Photograph',
                photoUrl
              );

              // 4. Digital Signature
              const sigUrl =
                app.signatureUrl ||
                doc.signatureUrl ||
                doc.signature ||
                (typeof doc.signatureFile === 'string' ? doc.signatureFile : '') ||
                (typeof app.signatureFile === 'string' ? app.signatureFile : '') ||
                (typeof doc.signatureFile?.previewUrl === 'string' ? doc.signatureFile.previewUrl : '') ||
                (typeof doc.signatureFile?.dataUrl === 'string' ? doc.signatureFile.dataUrl : '');
              addDoc(
                'signature',
                'Signature Specimen',
                'Digital Signature Specimen',
                sigUrl
              );

              // 5. Direct named slots for additional documents if present
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
              if (doc3Url) {
                addDoc(
                  'doc3-edu',
                  'Educational Certificate',
                  'Educational Degree / Certificate',
                  typeof doc3Url === 'string' ? doc3Url : doc3Url?.previewUrl
                );
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
              if (doc4Url) {
                addDoc(
                  'doc4-birth',
                  'Birth / PAN Certificate',
                  'Birth / PAN / Identity Certificate',
                  typeof doc4Url === 'string' ? doc4Url : doc4Url?.previewUrl
                );
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
              if (doc5Url) {
                addDoc(
                  'doc5-utility',
                  'Financial / Utility Document',
                  'Electricity Bill / Bank Passbook',
                  typeof doc5Url === 'string' ? doc5Url : doc5Url?.previewUrl
                );
              }

              // 6. Payment Receipt
              const receiptUrl =
                app.paymentReceiptUrl ||
                doc.paymentReceiptUrl ||
                app.paymentDetails?.receiptUrl ||
                app.payment?.receiptUrl ||
                (typeof app.receiptFile === 'string' ? app.receiptFile : app.receiptFile?.previewUrl);
              if (receiptUrl) {
                addDoc(
                  'paymentreceipt',
                  'Payment Receipt',
                  '₹200 Statutory Membership Payment Screenshot',
                  receiptUrl
                );
              }

              // 7. Additional / Supporting Documents Array (only non-duplicates)
              if (Array.isArray(doc.additionalDocuments)) {
                doc.additionalDocuments.forEach((item, idx) => {
                  if (item?.documentUrl && !attachedDocs.some(d => d.type === item.documentType || d.rawUrl === item.documentUrl)) {
                    addDoc(
                      `add-${idx}`,
                      item.documentType || 'Supporting Document',
                      item.documentName || item.documentType || `Additional Document #${idx + 1}`,
                      item.documentUrl
                    );
                  }
                });
              }

              if (attachedDocs.length === 0) {
                return (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-1">
                    <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="font-bold text-slate-700">No document files attached</p>
                    <p className="text-[11px] text-slate-400">No digital document scans were uploaded with this application.</p>
                  </div>
                );
              }

              const isPdfUrl = (url, type = '') => {
                if (!url || typeof url !== 'string') return false;
                const clean = url.trim().toLowerCase();
                if (clean.startsWith('data:application/pdf')) return true;
                if (/\.pdf($|\?)/i.test(clean)) return true;
                if (type.toLowerCase().includes('pdf')) return true;
                return false;
              };

              const isImageUrl = (url, type = '') => {
                if (!url || typeof url !== 'string') return false;
                const clean = url.trim().toLowerCase();
                if (isPdfUrl(clean, type)) return false;
                if (clean.startsWith('data:image/') || clean.startsWith('blob:')) return true;
                if (/\.(jpeg|jpg|png|gif|webp|svg|bmp|jfif)($|\?)/i.test(clean)) return true;
                return true;
              };

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attachedDocs.map((item) => {
                    const isPdf = isPdfUrl(item.url, item.type);
                    const isImg = isImageUrl(item.url, item.type);

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all text-left"
                      >
                        {/* CARD HEADER */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200/80 truncate">
                            {item.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                            isPdf ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isPdf ? 'PDF SCAN' : 'IMAGE FILE'}
                          </span>
                        </div>

                        {/* HIGH CLARITY PREVIEW THUMBNAIL BOX */}
                        <div
                          onClick={() => {
                            setSelectedDocPreview(item);
                            setDocZoom(1);
                            setDocRotation(0);
                          }}
                          className="relative w-full h-44 sm:h-48 bg-slate-900 rounded-xl overflow-hidden cursor-pointer group flex items-center justify-center border border-slate-200/80 shadow-inner"
                          title="Click to view full size"
                        >
                          {isImg ? (
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : isPdf ? (
                            <div className="flex flex-col items-center justify-center space-y-2 text-white p-4">
                              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-rose-400" />
                              </div>
                              <span className="text-xs font-bold text-slate-200">PDF Document Scan</span>
                              <span className="text-[10px] text-slate-400 font-mono">Click to inspect</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center space-y-2 text-white p-4">
                              <FileText className="w-10 h-10 text-blue-400" />
                              <span className="text-xs font-bold text-slate-200">Attached Scan</span>
                            </div>
                          )}

                          <div className="hidden flex-col items-center justify-center space-y-2 text-white p-4">
                            <FileText className="w-10 h-10 text-blue-400" />
                            <span className="text-xs font-bold text-slate-200">Document Scan</span>
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <span className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5 text-blue-700" />
                              <span>Inspect Document</span>
                            </span>
                          </div>
                        </div>

                        {/* TITLE & METADATA */}
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1" title={item.title}>
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Status: <span className="font-bold text-emerald-700">Digital Archive Verified</span>
                          </p>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDocPreview(item);
                              setDocZoom(1);
                              setDocRotation(0);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View / Inspect</span>
                          </button>

                          <a
                            href={item.url}
                            download={`${item.title.replace(/\s+/g, '_')}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                            title="Download Original File"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* SECTION 7: WITNESS DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <PenTool className="w-4 h-4 text-blue-700" />
              <span>7. WITNESS DETAILS</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 07</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <strong className="block text-[10px] text-slate-500 uppercase">WITNESS 1</strong>
              <div className="font-extrabold text-slate-900">{app.witness1Name}</div>
              <div className="text-[11px] text-slate-600 font-mono">Mobile: +91 {app.witness1Mobile}</div>
              <div className="text-[11px] text-slate-600">{app.witness1Address}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
              <strong className="block text-[10px] text-slate-500 uppercase">WITNESS 2</strong>
              <div className="font-extrabold text-slate-900">{app.witness2Name}</div>
              <div className="text-[11px] text-slate-600 font-mono">Mobile: +91 {app.witness2Mobile}</div>
              <div className="text-[11px] text-slate-600">{app.witness2Address}</div>
            </div>
          </div>
        </div>

        {/* SECTION 8: DECLARATION */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>8. STATUTORY DECLARATION</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 08</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div><strong className="block text-[10px] text-slate-400 uppercase">DIGITAL SIGNATURE</strong><span className="font-serif italic font-extrabold text-slate-900 text-sm">{app.sigName}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">EXECUTION DATE</strong><span className="font-bold text-slate-800 font-mono">{app.declarationDate}</span></div>
            <div><strong className="block text-[10px] text-slate-400 uppercase">COMPLIANCE AFFIRMED</strong><span className="font-bold text-emerald-700">Nidhi Rules 2014 &amp; 2022 Accepted</span></div>
          </div>
        </div>

        {/* SECTION 9: PAYMENT */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-blue-700" />
              <span>9. PAYMENT CLEARANCE &amp; RECEIPT VERIFICATION</span>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">Section 09</span>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-b border-slate-100 pb-4">
              <div><strong className="block text-[10px] text-slate-400 uppercase">PAYMENT METHOD</strong><span className="font-extrabold text-slate-900">{app.paymentMethod}</span></div>
              <div><strong className="block text-[10px] text-slate-400 uppercase">TRANSACTION UTR</strong><span className="font-mono font-black text-blue-700">{app.utrNo}</span></div>
              <div><strong className="block text-[10px] text-slate-400 uppercase">TOTAL PAID CONSIDERATION</strong><span className="font-mono font-black text-emerald-700">₹{app.totalPaid || 200}.00 (Settled)</span></div>
            </div>

            {/* RECEIPT SCREENSHOT PREVIEW CARD */}
            <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-blue-600/40 p-1 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 shadow-md group relative hover:scale-105 transition-transform"
                >
                  {displayReceiptUrl ? (
                    <img
                      src={displayReceiptUrl}
                      alt="Payment Screenshot Preview"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                    <Maximize2 className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 text-sm">
                      Uploaded Payment Receipt Screenshot
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ₹{app.totalPaid || 200} Attached
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    UPI payment confirmation uploaded by applicant for statutory admission fee.
                  </p>
                  <div className="pt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsReceiptModalOpen(true)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect Full Screenshot</span>
                    </button>
                    <span>•</span>
                    <a
                      href={displayReceiptUrl}
                      download={`Payment_Receipt_${app.id || 'NUF'}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* DIRECT APPROVAL BUTTON IN SECTION 9 */}
              <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
                {isPending ? (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleStatusChange('Approved')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#00C853] hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        <span>APPROVE APPLICATION</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment &amp; Membership Cleared</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT RECEIPT MODAL */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        application={app}
        onClose={() => setIsReceiptModalOpen(false)}
        onApprove={() => handleStatusChange('Approved')}
        onReject={() => handleStatusChange('Rejected')}
        isProcessing={isProcessing}
      />

      {/* EDIT APPLICATION MODAL */}
      <EditApplicationModal
        isOpen={isEditModalOpen}
        application={app}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* HIGH DEFINITION DOCUMENT PREVIEW MODAL */}
      {selectedDocPreview &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in"
            onClick={() => setSelectedDocPreview(null)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-[95vw] max-w-5xl h-[88vh] max-h-[92vh] flex flex-col justify-between overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {selectedDocPreview.type}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white truncate">
                      {selectedDocPreview.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    Applicant: <span className="font-bold text-slate-200">{app.applicantName}</span> • App ID:{' '}
                    <span className="font-bold text-blue-400">{app.applicationId || app.refId}</span>
                  </p>
                </div>

                {/* HEADER ACTIONS */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <a
                    href={selectedDocPreview.url}
                    download={`${selectedDocPreview.title.replace(/\s+/g, '_')}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>

                  <a
                    href={selectedDocPreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedDocPreview(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Close preview (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* INTERACTIVE VIEWER CANVAS */}
              <div className="bg-slate-950 overflow-hidden flex-1 w-full min-h-0 flex items-center justify-center relative p-2 sm:p-4">
                {(() => {
                  const url = selectedDocPreview.url || '';
                  const clean = url.toLowerCase();
                  const isPdf = clean.startsWith('data:application/pdf') || /\.pdf($|\?)/i.test(clean) || clean.includes('.pdf');

                  if (isPdf) {
                    return (
                      <object
                        data={`${url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                        type="application/pdf"
                        className="w-full h-full border-0 rounded-2xl bg-white"
                      >
                        <iframe
                          src={`${url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                          title="PDF Document Preview"
                          className="w-full h-full border-0 rounded-2xl bg-white"
                        />
                      </object>
                    );
                  }

                  return (
                    <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                      <img
                        src={url}
                        alt={selectedDocPreview.title}
                        style={{
                          transform: `scale(${docZoom}) rotate(${docRotation}deg)`,
                          transition: 'transform 0.2s ease-in-out',
                        }}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center text-center text-slate-300 p-8 space-y-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                        <FileText className="w-12 h-12 text-blue-400 mx-auto" />
                        <p className="font-bold text-sm">Unable to render preview directly</p>
                        <p className="text-xs text-slate-400">Click below to open or download the document.</p>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                        >
                          <span>Open File</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* FLOATING ZOOM & ROTATION TOOLBAR FOR IMAGES */}
                {!(
                  selectedDocPreview.url.toLowerCase().startsWith('data:application/pdf') ||
                  /\.pdf($|\?)/i.test(selectedDocPreview.url.toLowerCase())
                ) && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white border border-slate-700 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => setDocZoom((prev) => Math.min(prev + 0.25, 3))}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-slate-300 w-12 text-center">
                      {Math.round(docZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setDocZoom((prev) => Math.max(prev - 0.25, 0.5))}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="w-px h-4 bg-slate-700" />
                    <button
                      type="button"
                      onClick={() => setDocRotation((prev) => (prev + 90) % 360)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDocZoom(1);
                        setDocRotation(0);
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                      title="Reset View"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="bg-slate-900/95 border-t border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 text-xs">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified Scanned Statutory Document</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedDocPreview(null)}
                  className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default ApplicationDetails;

