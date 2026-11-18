import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  UserCheck,
  BarChart3,
  FileText,
  CreditCard,
  UserX,
  ExternalLink,
  Eye,
  Download,
  Wallet,
  Receipt,
  ArrowRightLeft,
  FolderOpen,
  X,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { MemberDetailsCard } from '../../components/admin/MemberDetailsCard';
import { MemberStatusBadge } from '../../components/admin/MemberStatusBadge';
import { ZoomableImageViewer } from '../../components/common/ZoomableImageViewer';
import { getBackendAssetUrl as getFileUrl } from '../../config/env';

export function MemberDetails() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { members, applications, updateMemberStatus } = useAdmin();
  const [noticeMessage, setNoticeMessage] = useState('');
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  // 1. Find member from real members array
  const member = members.find(
    (m) =>
      m.memberId === memberId ||
      m.id === memberId ||
      m.applicationId === memberId ||
      m._id === memberId
  );

  // 2. Fallback to applications array if needed
  const app = applications.find(
    (a) =>
      a.memberId === memberId ||
      a.id === memberId ||
      a._id === memberId ||
      a.applicationId === memberId
  );

  const targetData = member || app;

  if (!targetData) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
        <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Approved Member Not Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No approved member record matched ID "{memberId}".
        </p>
        <button
          onClick={() => navigate('/admin-dashboard/members')}
          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Back to Members Repository
        </button>
      </div>
    );
  }

  const currentMemberId = targetData.memberId || targetData.id || memberId;
  const currentAppId = targetData.applicationId || targetData.appId || targetData.id;
  const currentStatus = targetData.membershipStatus || (targetData.status === 'inactive' ? 'Inactive' : 'Active');
  const joiningDate = targetData.joiningDate || (targetData.createdAt ? new Date(targetData.createdAt).toLocaleDateString('en-GB') : 'N/A');

  const handleToggleStatus = (newStatus) => {
    updateMemberStatus(currentMemberId, newStatus);
    setNoticeMessage(`Member status updated to "${newStatus}"`);
    setTimeout(() => setNoticeMessage(''), 3000);
  };

  // Extract sections
  const p = targetData.personalDetails || targetData.personal || {};
  const c = targetData.contactDetails || {};
  const a = targetData.addressDetails || targetData.address || {};
  const n = targetData.nomineeDetails || targetData.nominee || {};
  const m = targetData.membershipDetails || targetData.shares || {};
  const doc = targetData.documentDetails || {};

  const nameParts = [p.title, p.firstName, p.middleName, p.lastName].filter(Boolean);
  const applicantName = nameParts.length > 0 ? nameParts.join(' ') : (targetData.name || targetData.applicantName || 'Applicant');

  // Extract real uploaded document items
  const sanitizeDocsList = (rawList) => {
    if (!Array.isArray(rawList)) return [];
    const result = [];
    const seenUrls = new Set();
    let hasAadhaar = false;

    rawList.forEach((d) => {
      if (!d || !d.documentUrl) return;
      const name = (d.documentName || '').toLowerCase();
      const type = (d.documentType || '').toLowerCase();
      const isAadhaar = name.includes('aadhaar') || type.includes('aadhaar');

      if (seenUrls.has(d.documentUrl)) return;
      if (isAadhaar) {
        if (hasAadhaar) return;
        hasAadhaar = true;
      }
      seenUrls.add(d.documentUrl);
      result.push(d);
    });

    return result;
  };

  const realDocs = sanitizeDocsList(
    Array.isArray(targetData.documents) && targetData.documents.length > 0
      ? targetData.documents
      : (() => {
          const list = [];
          const idType = (doc.idProofType || 'Aadhaar Card').trim();
          const addrType = (doc.addressProofType || 'Aadhaar Card').trim();
          const isIdAadhaar = idType.toLowerCase().includes('aadhaar');
          const isAddrAadhaar = addrType.toLowerCase().includes('aadhaar');
          const isSameUrl = doc.idProofUrl && doc.addressProofUrl && doc.idProofUrl === doc.addressProofUrl;

          if (doc.idProofUrl) {
            const isCombined = (isIdAadhaar && isAddrAadhaar) || isSameUrl;
            list.push({
              id: 'idproof',
              documentType: isCombined ? 'Identity & Address Proof' : 'Identity Proof',
              documentName: isCombined ? `${idType} (Identity & Address Proof)` : (doc.idProofType || 'Aadhaar Card'),
              documentUrl: doc.idProofUrl,
            });
          }
          if (doc.addressProofUrl) {
            const isDuplicateAadhaar = isAddrAadhaar && (isIdAadhaar || isSameUrl);
            if (!doc.idProofUrl) {
              list.push({
                id: 'addressproof',
                documentType: 'Address Proof',
                documentName: doc.addressProofType || 'Address Document',
                documentUrl: doc.addressProofUrl,
              });
            } else if (!isDuplicateAadhaar && doc.addressProofUrl !== doc.idProofUrl) {
              list.push({
                id: 'addressproof',
                documentType: 'Address Proof',
                documentName: doc.addressProofType || 'Address Document',
                documentUrl: doc.addressProofUrl,
              });
            }
          }
          if (doc.photoUrl) {
            list.push({
              id: 'photo',
              documentType: 'Photograph',
              documentName: 'Passport Photograph',
              documentUrl: doc.photoUrl,
            });
          }
          if (doc.signatureUrl) {
            list.push({
              id: 'signature',
              documentType: 'Signature',
              documentName: 'Digital Signature Specimen',
              documentUrl: doc.signatureUrl,
            });
          }
          if (Array.isArray(doc.additionalDocuments)) {
            doc.additionalDocuments.forEach((addDoc, idx) => {
              if (addDoc.documentUrl) {
                list.push({
                  id: `add-${idx}`,
                  documentType: addDoc.documentType || 'Additional Document',
                  documentName: addDoc.documentName || addDoc.documentType || 'Supporting Document',
                  documentUrl: addDoc.documentUrl,
                });
              }
            });
          }
          return list;
        })()
  );

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* BACK BUTTON & TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/members')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Back to Members List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Member Profile</h1>
              <MemberStatusBadge status={currentStatus} />
              {(m?.isAssociate || m?.role === 'associate' || targetData?.role === 'associate') ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Associate Member
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200">
                  Regular Member
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Member ID: <strong className="text-slate-900">{currentMemberId}</strong> • Application ID:{' '}
              <strong className="text-blue-700">{currentAppId}</strong> • Enrolled: {joiningDate}
            </p>
          </div>
        </div>

        {/* TOP ACTION TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2">
          {/* VIEW ORIGINAL APPLICATION */}
          <button
            type="button"
            onClick={() => navigate(`/admin-dashboard/applications/${currentAppId}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-300 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-blue-700" />
            <span>View Original Application</span>
          </button>

          {/* TOGGLE ACTIVE / INACTIVE */}
          <button
            type="button"
            onClick={() => handleToggleStatus(currentStatus === 'Active' ? 'Inactive' : 'Active')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
              currentStatus === 'Active'
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            {currentStatus === 'Active' ? (
              <>
                <UserX className="w-4 h-4" />
                <span>Deactivate Member</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Activate Member</span>
              </>
            )}
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* MEMBER DETAILS SECTIONS GRID */}
      <div className="space-y-5">
        {/* 1. PERSONAL INFORMATION */}
        <MemberDetailsCard title="Personal Details" icon={User} sectionNo="Section 01">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">FULL LEGAL NAME</strong>
              <span className="font-extrabold text-slate-900 text-sm">{applicantName}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">DATE OF BIRTH</strong>
              <span className="font-bold text-slate-800">{p.dob || targetData.dob || 'N/A'} ({p.age || targetData.age || 'N/A'} Yrs)</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">GENDER / MARITAL STATUS</strong>
              <span className="font-bold text-slate-800">{p.gender || targetData.gender || 'Male'} • {p.maritalStatus || targetData.maritalStatus || 'Married'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">OCCUPATION</strong>
              <span className="font-bold text-slate-800">{p.occupation || targetData.occupation || 'N/A'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">MOBILE NUMBER</strong>
              <span className="font-mono font-bold text-slate-900">{targetData.mobile || c.mobile || 'N/A'}</span>
            </div>
            <div className="sm:col-span-2">
              <strong className="block text-[10px] text-slate-400 uppercase">EMAIL ADDRESS</strong>
              <span className="font-mono font-bold text-slate-900">{targetData.email || c.email || 'N/A'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">FATHER / GUARDIAN NAME</strong>
              <span className="font-bold text-slate-800">{p.fatherLegalName || 'N/A'}</span>
            </div>
          </div>
        </MemberDetailsCard>

        {/* 2. ADDRESS DETAILS */}
        <MemberDetailsCard title="Residential Address" icon={MapPin} sectionNo="Section 02">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <strong className="block text-[10px] text-slate-500 uppercase">PRIMARY ADDRESS LINE</strong>
              <p className="font-bold text-slate-900">{a.address1 || targetData.address1 || 'N/A'}</p>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">VILLAGE / TOWN</strong>
              <span className="font-bold text-slate-800">{a.villageTown || targetData.villageTown || 'N/A'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">DISTRICT</strong>
              <span className="font-bold text-slate-800">{a.district || targetData.district || 'N/A'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">STATE</strong>
              <span className="font-bold text-slate-800">{a.state || targetData.state || 'Odisha'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">PIN CODE</strong>
              <span className="font-mono font-bold text-slate-900">{a.pincode || targetData.pincode || 'N/A'}</span>
            </div>
          </div>
        </MemberDetailsCard>

        {/* 3. NOMINEE DETAILS */}
        <MemberDetailsCard title="Nominee Information" icon={UserCheck} sectionNo="Section 03">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">NOMINEE NAME</strong>
              <span className="font-extrabold text-slate-900">{n.fullName || targetData.nomineeName || 'N/A'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">RELATIONSHIP</strong>
              <span className="font-bold text-slate-800">{n.relationship || targetData.nomineeRel || 'N/A'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">DATE OF BIRTH</strong>
              <span className="font-bold text-slate-800">{n.dob || targetData.nomineeDob || 'N/A'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">MOBILE</strong>
              <span className="font-mono font-bold text-slate-800">{n.mobile || 'N/A'}</span>
            </div>
          </div>
        </MemberDetailsCard>

        {/* 4. MEMBERSHIP & SHARES */}
        <MemberDetailsCard title="Membership Contribution & Shares" icon={BarChart3} sectionNo="Section 04">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">MEMBERSHIP TYPE</strong>
              <span className="font-extrabold text-slate-900">{m.membershipType || targetData.membershipType || 'Associate Member'}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">NUMBER OF SHARES</strong>
              <span className="font-bold text-slate-900">{m.numberOfShares || targetData.numberOfShares || 10} Equity Shares</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">SHARE VALUE</strong>
              <span className="font-bold text-slate-900">₹ {m.shareValue || targetData.shareValue || 10}.00 / Share</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">PROCESSING FEE</strong>
              <span className="font-bold text-slate-900">₹ {m.processingFee || targetData.processingFee || 100}.00</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">TOTAL CONTRIBUTION</strong>
              <span className="font-black text-emerald-700 font-mono text-sm">₹ {m.totalContribution || targetData.totalContribution || 200}.00</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">APPLICATION STATUS</strong>
              <span className="font-bold text-emerald-700 uppercase">Approved</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">MEMBER STATUS</strong>
              <span className={`font-extrabold ${currentStatus === 'Active' ? 'text-emerald-700' : 'text-rose-600'}`}>{currentStatus}</span>
            </div>
            <div>
              <strong className="block text-[10px] text-slate-400 uppercase">JOINED DATE</strong>
              <span className="font-bold text-slate-800">{joiningDate}</span>
            </div>
          </div>
        </MemberDetailsCard>

        {/* 5. ATTACHED STATUTORY DOCUMENTS */}
        <MemberDetailsCard title="Attached Statutory Documents" icon={FileText} sectionNo="Section 05">
          {realDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {realDocs.map((d, idx) => {
                const fullUrl = getFileUrl(d.documentUrl);

                return (
                  <div key={idx} className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex items-center justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <span className="block text-[10px] font-extrabold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200 w-max">
                        {d.documentType}
                      </span>
                      <span className="font-bold text-slate-900 block truncate">{d.documentName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {fullUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPreviewDoc({
                                title: d.documentName,
                                type: d.documentType,
                                applicant: applicantName,
                                memberId: currentMemberId,
                                url: fullUrl,
                              })
                            }
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs cursor-pointer"
                            title="View Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            title="Open in new window"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={fullUrl}
                            download
                            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Not uploaded</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              No statutory documents attached for this member.
            </div>
          )}
        </MemberDetailsCard>

        {/* 6. MEMBER DEPOSITS */}
        <MemberDetailsCard title="Member Deposits" icon={Wallet} sectionNo="Section 06">
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-xl border border-slate-200">
            <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">No deposits available</p>
            <p className="text-[11px] text-slate-400">This member has no active fixed, recurring, or savings deposits.</p>
          </div>
        </MemberDetailsCard>

        {/* 7. MEMBER PAYMENTS */}
        <MemberDetailsCard title="Member Payments" icon={Receipt} sectionNo="Section 07">
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-xl border border-slate-200">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">No payments available</p>
            <p className="text-[11px] text-slate-400">No fee or contribution payment records found for this member.</p>
          </div>
        </MemberDetailsCard>

        {/* 8. MEMBER TRANSACTIONS */}
        <MemberDetailsCard title="Member Transactions" icon={ArrowRightLeft} sectionNo="Section 08">
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-xl border border-slate-200">
            <ArrowRightLeft className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">No transactions available</p>
            <p className="text-[11px] text-slate-400">No transaction logs available for Member ID {currentMemberId}.</p>
          </div>
        </MemberDetailsCard>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
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
                    Member: <span className="font-bold text-slate-800">{selectedPreviewDoc.applicant}</span> • Member ID:{' '}
                    <span className="font-bold text-blue-700">{selectedPreviewDoc.memberId}</span>
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
                {(() => {
                  const url = selectedPreviewDoc.url;
                  const clean = url.toLowerCase();
                  const isPdf = clean.startsWith('data:application/pdf') || /\.pdf($|\?)/i.test(clean) || selectedPreviewDoc.type?.toLowerCase().includes('pdf');

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
                    <ZoomableImageViewer
                      src={url}
                      alt={selectedPreviewDoc.title}
                      minZoom={0.5}
                      maxZoom={5.0}
                    />
                  );
                })()}
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

export default MemberDetails;
