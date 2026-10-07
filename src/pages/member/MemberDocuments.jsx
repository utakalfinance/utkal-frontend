import React, { useState } from 'react';
import {
  FolderLock,
  FileText,
  UploadCloud,
  ShieldCheck,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { MemberPageHeader } from '../../components/member/MemberPageHeader';
import { StatusBadge } from '../../components/member/StatusBadge';
import { useMemberAuth } from '../../hooks/useMemberAuth';

/**
 * MemberDocuments Page (/member-dashboard/documents)
 * Repository for official KYC proofs, statutory certificates, and receipts.
 */
export function MemberDocuments() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { application, memberDetails, memberUser } = useMemberAuth();

  const docs = memberDetails?.documentDetails || application?.documentDetails || {};

  // The 6 required document items mapped to real upload data
  const documentSlots = [
    {
      title: 'Identity Proof',
      desc: docs.idProofType || 'Government photo ID (Aadhaar / Voter ID / PAN / Passport)',
      category: 'KYC Document',
      fileUrl: docs.idProofUrl || '',
      status: docs.idProofUrl ? 'Verified' : 'Not Uploaded',
    },
    {
      title: 'Address Proof',
      desc: docs.addressProofType || 'Residential verification proof (Utility Bill / Aadhaar / Bank Statement)',
      category: 'KYC Document',
      fileUrl: docs.addressProofUrl || '',
      status: docs.addressProofUrl ? 'Verified' : 'Not Uploaded',
    },
    {
      title: 'Photograph',
      desc: 'Recent passport-size photograph of applicant',
      category: 'Identity',
      fileUrl: docs.photoUrl || '',
      status: docs.photoUrl ? 'Verified' : 'Not Uploaded',
    },
    {
      title: 'Signature',
      desc: 'Specimen signature / thumb impression for record validation',
      category: 'Specimen',
      fileUrl: docs.signatureUrl || '',
      status: docs.signatureUrl ? 'Verified' : 'Not Uploaded',
    },
    {
      title: 'Membership Certificate',
      desc: 'Statutory certificate of membership issued by the Company',
      category: 'Statutory',
      fileUrl: '',
      isCertificate: true,
      status: 'Active',
    },
    {
      title: 'Payment Receipt',
      desc: 'Official acknowledgement receipt for share contribution & admission fee',
      category: 'Receipt',
      fileUrl: docs.paymentReceiptUrl || '',
      status: docs.paymentReceiptUrl || application?.status === 'approved' ? 'Verified' : 'Not Uploaded',
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="My Documents"
        description="Statutory KYC repository and official issued membership certificates."
        badge="SECURE REPOSITORY"
      >
        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-blue-700 hover:bg-blue-800 active:scale-95 transition-all shadow-md shadow-blue-700/20 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </MemberPageHeader>

      {/* TOP REPOSITORY STATUS BANNER */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">
              KYC & Compliance Repository
            </h2>
            <p className="text-xs text-slate-500">
              Digital copies maintained in accordance with MCA Record Retention norms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Storage</span>
        </div>
      </div>

      {/* DOCUMENT CARDS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Registered Documents
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            6 Required Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentSlots.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {doc.category}
                  </span>
                  <StatusBadge status={doc.status} size="xs" />
                </div>

                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    doc.fileUrl || doc.isCertificate
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {doc.fileUrl || doc.isCertificate ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {doc.title}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {doc.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {doc.fileUrl ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    <span>View Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : doc.isCertificate ? (
                  <span className="text-[11px] font-bold text-emerald-700">
                    Certificate Issued & Active
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 italic">
                    Not Uploaded
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {doc.fileUrl ? 'Replace' : 'Upload →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENT GUIDELINES NOTICE */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-900">Upload Guidelines:</span> Accepted file formats include PDF, JPEG, and PNG up to 5 MB per document. Ensure all four corners and official seal/watermarks are legibly visible to avoid verification delays.
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL PLACEHOLDER */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setUploadModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Upload Verification Document
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select the document category and upload a scanned copy for administrative verification.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Document Category
                </label>
                <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                  <option>Identity Proof</option>
                  <option>Address Proof</option>
                  <option>Photograph</option>
                  <option>Signature</option>
                  <option>Payment Receipt</option>
                </select>
              </div>

              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50/50">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-600 font-medium">
                  Drag and drop file here, or{' '}
                  <span className="text-blue-700 font-bold underline cursor-pointer">
                    browse
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  PDF, JPG, PNG (Max 5MB)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-blue-700 hover:bg-blue-800"
              >
                Submit for Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDocuments;
