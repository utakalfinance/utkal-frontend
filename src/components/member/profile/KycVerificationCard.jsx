import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  FileCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

/**
 * KycVerificationCard Component
 * Displays statutory KYC verification milestones, submitted document types, and quick link to Documents vault.
 */
export function KycVerificationCard({
  idProofType = 'Aadhaar Card',
  idProofNumber = null,
  addressProofType = 'Aadhaar Card',
  addressProofNumber = null,
  isApproved = true,
}) {
  const cleanIdType = idProofType || 'Aadhaar Card';
  const cleanAddrType = addressProofType || 'Aadhaar Card';

  const items = [
    {
      title: 'Identity Verification',
      docType: cleanIdType,
      docNumber: idProofNumber,
      status: isApproved ? 'Verified' : 'Pending Verification',
      icon: ShieldCheck,
    },
    {
      title: 'Address Verification',
      docType: cleanAddrType,
      docNumber: addressProofNumber,
      status: isApproved ? 'Verified' : 'Pending Verification',
      icon: FileCheck,
    },
    {
      title: 'Document Verification',
      docType: 'Official Statutory KYC Attachments',
      status: isApproved ? 'Verified' : 'Pending Verification',
      icon: FileText,
    },
    {
      title: 'Overall KYC Status',
      docType: 'Branch & Compliance Approved',
      status: isApproved ? 'Verified' : 'Pending Verification',
      icon: CheckCircle2,
      highlight: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#004085] shrink-0">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              KYC Verification Milestones
            </h3>
            <p className="text-xs text-slate-500">
              Official statutory verification records registered in MongoDB.
            </p>
          </div>
        </div>

        {/* LINK TO EXISTING MEMBER DOCUMENTS PAGE */}
        <Link
          to="/member-dashboard/documents"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#004085] bg-blue-50 hover:bg-blue-100/80 border border-blue-200/70 transition-colors shadow-2xs cursor-pointer"
        >
          <span>View Documents</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 VERIFICATION ITEMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 text-xs">
        {items.map((it, idx) => {
          const Icon = it.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${
                it.highlight
                  ? 'border-emerald-200/90 bg-emerald-50/40'
                  : 'border-slate-100 bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-600 truncate">
                  {it.title}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  {it.status}
                </span>
              </div>

              <div>
                <p className="text-xs font-black text-slate-900 truncate">
                  {it.docType}
                </p>
                {it.docNumber && (
                  <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                    No: <span className="font-semibold text-slate-700">{it.docNumber}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
