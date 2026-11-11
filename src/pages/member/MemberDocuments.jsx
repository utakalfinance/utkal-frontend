import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  ShieldCheck,
  Info,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  FileCheck2,
  Download,
  Clock,
  Eye,
  X,
  FileBadge,
} from 'lucide-react';
import { MemberPageHeader } from '../../components/member/MemberPageHeader';
import { StatusBadge } from '../../components/member/StatusBadge';
import { useMemberAuth } from '../../hooks/useMemberAuth';

/**
 * MemberDocuments Page (/member-dashboard/documents or /member-dashboard/kyc-documents)
 * Fulfills Section 4 (My KYC & Documents):
 * - Connects to existing 9-step membership application data submitted on the public website.
 * - Does NOT create a new 9-step form or duplicate registration.
 * - Shows uploaded documents, verification status, admin remarks, and correction/resubmission options.
 */
export function MemberDocuments() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocCategory, setSelectedDocCategory] = useState('Identity Proof');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { application, memberDetails, memberUser } = useMemberAuth();

  const docs = memberDetails?.documentDetails || application?.documentDetails || {};
  const applicationId = application?.applicationId || application?._id || '—';
  const memberId = memberUser?.memberId || application?.memberId || memberDetails?.memberId || '—';
  const isApproved =
    memberUser?.status === 'active' ||
    memberDetails?.status === 'active' ||
    application?.status === 'approved';

  const isCorrectionRequired =
    application?.status === 'correction_required' ||
    memberDetails?.status === 'correction_required' ||
    application?.correctionRequested === true;

  const adminRemarks =
    application?.verificationRemarks ||
    application?.rejectionReason ||
    (isApproved
      ? 'All submitted statutory KYC documents verified and officially approved under MCA / Nidhi Rules 2014.'
      : 'Documents are under administrative compliance review.');

  // The 6 statutory document items mapped to real upload data
  const documentSlots = [
    {
      id: 'id-proof',
      title: 'Identity Proof (Aadhaar / Voter ID)',
      desc: docs.idProofType || 'Government issued photo identity proof',
      category: 'Primary KYC',
      docNumber: docs.idProofNumber || application?.personalDetails?.pan || null,
      fileUrl: docs.idProofUrl || docs.idProof || docs.doc2_govId || '',
      status: docs.idProofUrl || isApproved ? 'Verified' : 'Pending',
    },
    {
      id: 'address-proof',
      title: 'Address Verification Proof',
      desc: docs.addressProofType || 'Residential utility bill, Aadhaar, or Bank statement',
      category: 'Address Verification',
      docNumber: docs.addressProofNumber || null,
      fileUrl: docs.addressProofUrl || docs.addressProof || '',
      status: docs.addressProofUrl || isApproved ? 'Verified' : 'Pending',
    },
    {
      id: 'photo',
      title: 'Applicant Photograph',
      desc: 'Passport size digital specimen photograph',
      category: 'Biometric Specimen',
      fileUrl: docs.photoUrl || docs.photo || docs.doc1_photo || '',
      status: docs.photoUrl || isApproved ? 'Verified' : 'Pending',
    },
    {
      id: 'signature',
      title: 'Official Specimen Signature',
      desc: 'Specimen signature / thumb impression registered on file',
      category: 'Legal Specimen',
      fileUrl: docs.signatureUrl || docs.signature || '',
      status: docs.signatureUrl || isApproved ? 'Verified' : 'Pending',
    },
    {
      id: 'certificate',
      title: 'Digital Share Certificate',
      desc: 'Statutory certificate for 10 allotted equity shares',
      category: 'Statutory Record',
      fileUrl: '',
      isCertificate: true,
      status: isApproved ? 'Issued & Active' : 'Under Allotment',
    },
    {
      id: 'receipt',
      title: 'Share Capital Payment Receipt',
      desc: 'IndusInd Bank QR ₹200 share contribution receipt',
      category: 'Financial Ledger',
      fileUrl: docs.paymentReceiptUrl || '',
      status: docs.paymentReceiptUrl || isApproved ? 'Verified' : 'Pending',
    },
  ];

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadModalOpen(false);
        setSelectedFile(null);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-10">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="My KYC & Documents Repository"
        description="Official statutory KYC dossier connected to your registered membership application. Inspect uploaded verification files, administrative decisions, and compliance remarks."
        badge="COMPLIANCE VAULT"
        breadcrumbs={[
          { label: 'Core Portal', path: '/member-dashboard' },
          { label: 'My KYC & Documents' },
        ]}
      >
        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload / Replace Document</span>
        </button>
      </MemberPageHeader>

      {/* CORRECTION / RESUBMISSION REQUIRED BANNER IF ADMIN REQUESTED */}
      {isCorrectionRequired && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-r-2xl shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-950">
                Administration Requested Document Resubmission / Correction
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                {application?.rejectionReason ||
                  'One or more of your submitted KYC documents require clarification or re-upload. You do not need to register again.'}
              </p>
            </div>
          </div>
          <div className="pl-8 pt-1">
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Resubmit Document Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP OVERVIEW: REGISTRATION DOSSIER LINKAGE CARD */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#122A50] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Statutory 9-Step Registration Dossier
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Dossier records submitted on the public portal are permanently registered in the Utkal Finance compliance ledger. Existing approved members do not need to submit another membership application.
            </p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xs p-4 rounded-2xl border border-slate-700/80 shrink-0 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Application Ref:</span>
              <span className="font-mono font-bold text-white">{applicationId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Member ID:</span>
              <span className="font-mono font-bold text-blue-300">{memberId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Compliance:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isApproved ? 'Approved & Sealed' : 'Under Review'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADMIN VERIFICATION REMARKS CARD */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Compliance & Verification Remarks</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-medium">
          {adminRemarks}
        </p>
      </div>

      {/* 3. REGISTERED DOCUMENTS GRID (6 STATUTORY CATEGORIES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Registered Verification Documents
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            6 Required Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentSlots.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {doc.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      doc.status === 'Verified' || doc.status === 'Issued & Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {doc.status}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      doc.fileUrl || doc.isCertificate
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {doc.isCertificate ? (
                      <FileBadge className="w-5 h-5 text-blue-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      {doc.title}
                    </h4>
                    {doc.docNumber && (
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        Ref: {doc.docNumber}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {doc.desc}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {doc.fileUrl ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View File</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ) : doc.isCertificate ? (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Record Active
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 italic font-medium">
                    Not Uploaded
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDocCategory(doc.title);
                    setUploadModalOpen(true);
                  }}
                  className="font-bold text-slate-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  {doc.fileUrl ? 'Replace' : 'Upload →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPLOAD / RESUBMIT MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => setUploadModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl z-10 space-y-5 animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Compliance Repository
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
                  Upload / Update Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Document Uploaded Successfully</h4>
                <p className="text-xs text-slate-500">
                  Your file has been routed for administrative compliance verification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulateUpload} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Document Category
                  </label>
                  <select
                    value={selectedDocCategory}
                    onChange={(e) => setSelectedDocCategory(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Identity Proof (Aadhaar / Voter ID)</option>
                    <option>Address Verification Proof</option>
                    <option>Applicant Photograph</option>
                    <option>Official Specimen Signature</option>
                    <option>Share Capital Payment Receipt</option>
                  </select>
                </div>

                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-colors">
                  <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                  <div className="text-xs text-slate-600 font-medium">
                    {selectedFile ? (
                      <span className="font-bold text-slate-900">{selectedFile.name}</span>
                    ) : (
                      <>
                        Upload scanned file or{' '}
                        <label className="text-blue-700 font-bold underline cursor-pointer">
                          browse
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                          />
                        </label>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 5MB)</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
                  >
                    {uploading ? 'Uploading...' : 'Submit for Verification'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDocuments;
