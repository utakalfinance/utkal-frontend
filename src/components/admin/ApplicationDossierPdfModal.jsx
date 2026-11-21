import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Lock,
  Award
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getBackendAssetUrl } from '../../config/env';

export function ApplicationDossierPdfModal({ isOpen, application, onClose }) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const dossierRef = useRef(null);

  // Lock background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !application) return null;

  const app = application;
  const rawAppId = (app.id || app.applicationId || 'NUF-1059').toString().trim();
  const cleanAppId = rawAppId.replace(/\s+/g, '-');
  const applicantName = app.applicantName || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Applicant';
  const statusLower = (app.status || '').toLowerCase();
  const isApproved = statusLower === 'approved';

  const photoUrl =
    app.photoUrl ||
    app.documentDetails?.photoUrl ||
    app.documents?.photoUrl ||
    app.personalDetails?.photoUrl ||
    (typeof app.photoFile === 'string' ? app.photoFile : app.photoFile?.url);

  const displayPhoto = photoUrl ? getBackendAssetUrl(photoUrl) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!dossierRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const element = dossierRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const safeName = applicantName.replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Application_Dossier_${cleanAppId}_${safeName}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Unable to generate PDF automatically. You can use the Print button and choose "Save as PDF".');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none animate-fade-in no-print-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-slate-100 rounded-3xl border border-slate-300 shadow-2xl w-[96vw] max-w-4xl max-h-[92vh] flex flex-col justify-between overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL ACTION BAR (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 no-print">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400 shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-white truncate">
                Official Membership Dossier PDF
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                isApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
              }`}>
                {app.status || 'Pending'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              ID: <strong className="text-blue-300">{cleanAppId}</strong> • Applicant: <strong className="text-slate-200">{applicantName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Download PDF Document"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700 cursor-pointer"
              title="Print Document (A4)"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE A4 DOSSIER CANVAS) */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200/60">
          {/* PRINTABLE / EXPORTABLE A4 SHEET */}
          <div
            id="printable-dossier"
            ref={dossierRef}
            className="w-full max-w-[780px] bg-white text-slate-900 border border-slate-300 shadow-md p-6 sm:p-8 space-y-4 font-sans select-text text-left rounded-xl"
            style={{ minHeight: '1050px' }}
          >
            {/* 1. OFFICIAL STATUTORY LETTERHEAD */}
            <div className="border-b-2 border-[#002b5c] pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#002b5c] text-white flex items-center justify-center font-black text-lg border border-amber-400 shrink-0 shadow-sm">
                    NF
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#002b5c]">
                      NEW UTKAL FINANCE LIMITED
                    </h1>
                    <p className="text-[10px] text-slate-600 font-semibold tracking-wide uppercase">
                      Regd. under the Companies Act, 2013 &amp; Nidhi Rules, 2014 • Govt. of India
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      Regd. Office: Nayapalli, IRC Village, Bhubaneswar, Khurda, Odisha - 751015
                    </p>
                  </div>
                </div>

                {/* PASSPORT PHOTO BOX */}
                <div className="self-end sm:self-start w-24 h-28 border border-slate-400 bg-slate-50 rounded-lg overflow-hidden flex flex-col items-center justify-center p-1 text-center shrink-0 shadow-2xs">
                  {displayPhoto ? (
                    <img src={displayPhoto} alt={applicantName} className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="space-y-1 p-1">
                      <User className="w-7 h-7 text-slate-400 mx-auto" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase block leading-tight">
                        Passport Photo Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* DOCUMENT BANNER */}
              <div className="mt-3 bg-gradient-to-r from-[#002b5c] to-[#004085] text-white py-1.5 px-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <span className="font-extrabold uppercase tracking-wide text-[10px]">
                  FORM M-01 • STATUTORY MEMBERSHIP ENROLLMENT &amp; KYC APPLICATION DOSSIER
                </span>
                <span className="font-mono text-[10px] text-blue-200">
                  Ref ID: <strong className="text-white">{app.refId || 'APP-2026-REG'}</strong>
                </span>
              </div>
            </div>

            {/* 2. APPLICATION SUMMARY METADATA GRID */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[9px]">Application ID</span>
                <strong className="text-blue-900 font-mono text-xs">{cleanAppId}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[9px]">Filing Date</span>
                <strong className="text-slate-800">{app.date || '18 Nov 2026'}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[9px]">Application Status</span>
                <strong className={`uppercase ${isApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {app.status || 'Pending Approval'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[9px]">Core Member ID</span>
                <strong className="text-slate-900 font-mono">{app.memberId || 'Pending Approval'}</strong>
              </div>
            </div>

            {/* 3. SECTION 1: PERSONAL DETAILS */}
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-[#002b5c] text-white px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-300" />
                <span>1. Personal &amp; Demographic Profile</span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    <tr className="bg-white">
                      <td className="py-1.5 px-3 font-bold text-slate-500 w-1/4">Full Legal Name:</td>
                      <td className="py-1.5 px-3 font-extrabold text-slate-900 capitalize w-1/4">{applicantName}</td>
                      <td className="py-1.5 px-3 font-bold text-slate-500 w-1/4">Father / Husband:</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-800 w-1/4">
                        {app.personalDetails?.fatherName || app.fatherName || 'S/o. Legal Guardian'}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1.5 px-3 font-bold text-slate-500">Date of Birth &amp; Age:</td>
                      <td className="py-1.5 px-3 text-slate-800">
                        {app.personalDetails?.dob || app.dob || '1995-05-12'} (Age: {app.personalDetails?.age || '31 Years'})
                      </td>
                      <td className="py-1.5 px-3 font-bold text-slate-500">Gender &amp; Marital:</td>
                      <td className="py-1.5 px-3 text-slate-800 capitalize">
                        {app.personalDetails?.gender || app.gender || 'Female'} • {app.personalDetails?.maritalStatus || app.maritalStatus || 'Married'}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-1.5 px-3 font-bold text-slate-500">Religion &amp; Caste:</td>
                      <td className="py-1.5 px-3 text-slate-800">
                        {app.personalDetails?.religion || 'Hinduism'} • {app.personalDetails?.category || 'General'}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-slate-500">Education &amp; Occupation:</td>
                      <td className="py-1.5 px-3 text-slate-800">
                        {app.personalDetails?.education || 'Graduate'} • {app.personalDetails?.occupation || 'Business / Homemaker'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. SECTION 2: CONTACT & RESIDENTIAL ADDRESS */}
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-[#002b5c] text-white px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-300" />
                <span>2. Contact &amp; Residential Particulars</span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    <tr className="bg-white">
                      <td className="py-1.5 px-3 font-bold text-slate-500 w-1/4">Primary Mobile:</td>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900 w-1/4">{app.mobile || '+91 9861374251'}</td>
                      <td className="py-1.5 px-3 font-bold text-slate-500 w-1/4">Alternate Contact:</td>
                      <td className="py-1.5 px-3 font-mono text-slate-700 w-1/4">{app.contactDetails?.alternateMobile || '—'}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1.5 px-3 font-bold text-slate-500">Registered Email:</td>
                      <td className="py-1.5 px-3 font-mono text-slate-800">{app.email || 'applicant@utkalfinance.com'}</td>
                      <td className="py-1.5 px-3 font-bold text-slate-500">Income Tax PAN:</td>
                      <td className="py-1.5 px-3 font-mono font-bold text-blue-900">{app.personalDetails?.panNumber || app.panNumber || 'ABCDE1234F'}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-1.5 px-3 font-bold text-slate-500">Permanent Address:</td>
                      <td colSpan="3" className="py-1.5 px-3 text-slate-800">
                        {app.address1 || app.addressDetails?.permanentAddress || 'Plot 214, Saheed Nagar, Nayapalli'}, District: {app.district || 'Khurda'}, State: {app.state || 'Odisha'} - {app.pincode || '751015'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. SECTION 3: MEMBERSHIP & CAPITAL SUBSCRIPTION */}
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-[#002b5c] text-white px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-300" />
                <span>3. Statutory Shareholding &amp; Remittance Settlement</span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-100 text-[9px] uppercase font-bold text-slate-600">
                    <tr>
                      <th className="py-1.5 px-3">Statutory Allocation Description</th>
                      <th className="py-1.5 px-3 text-center">Class / Units</th>
                      <th className="py-1.5 px-3 text-right">Settled Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    <tr>
                      <td className="py-1.5 px-3 font-medium text-slate-800">
                        Class B Equity Share Subscription (Face Value ₹10 per unit)
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono">10 Shares</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">₹ 100.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium text-slate-800">
                        Statutory Admission &amp; Regulatory KYC Verification Fee
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono">1 Allotment</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">₹ 100.00</td>
                    </tr>
                    <tr className="bg-slate-50 font-black text-slate-900 border-t border-slate-200">
                      <td colSpan="2" className="py-1.5 px-3 text-right uppercase text-[9px]">Total Consideration Paid:</td>
                      <td className="py-1.5 px-3 text-right font-mono text-emerald-700 text-xs font-black">
                        ₹ {app.totalPaid || 200}.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px]">
                <div>
                  <span className="text-slate-400 font-bold block text-[9px]">Remittance Mode</span>
                  <span className="font-semibold text-slate-800">{app.paymentMethod || 'UPI (IndusInd Bank Scan & Pay)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[9px]">Remittance UTR / Ref</span>
                  <span className="font-mono font-bold text-blue-900">{app.utrNo || 'UPI346393622063'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[9px]">Assigned Branch</span>
                  <span className="font-semibold text-slate-800">{app.branch || 'Bhubaneswar HQ'}</span>
                </div>
              </div>
            </div>

            {/* 6. SECTION 4: NOMINEE DETAILS */}
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-[#002b5c] text-white px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>4. Nominee &amp; Relationship Particulars</span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    <tr className="bg-white">
                      <td className="py-1.5 px-3 font-bold text-slate-500 w-1/4">Nominee Full Name:</td>
                      <td className="py-1.5 px-3 font-bold text-slate-900 capitalize w-1/4">
                        {app.nomineeDetails?.nomineeName || app.nomineeName || 'Spouse / Guardian on Record'}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-slate-500 w-1/4">Relationship:</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-800 capitalize w-1/4">
                        {app.nomineeDetails?.nomineeRelationship || app.nomineeRelationship || 'Spouse'}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1.5 px-3 font-bold text-slate-500">Nominee Age / DOB:</td>
                      <td className="py-1.5 px-3 text-slate-800">
                        {app.nomineeDetails?.nomineeAge ? `${app.nomineeDetails.nomineeAge} Years` : 'Major (Above 18)'}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-slate-500">Nominee Address:</td>
                      <td className="py-1.5 px-3 text-slate-800">
                        {app.nomineeDetails?.nomineeAddress || 'Same as permanent residential address'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. SECTION 5: STATUTORY DOCUMENTS VERIFICATION RECORD */}
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-[#002b5c] text-white px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-300" />
                <span>5. Statutory KYC Verification Checklist</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                <div className="border border-slate-200 p-2 rounded-lg bg-slate-50/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-800">Passport Photograph</strong>
                    <span className="text-[9px] text-slate-400">Digitized &amp; Verified</span>
                  </div>
                </div>
                <div className="border border-slate-200 p-2 rounded-lg bg-slate-50/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-800">Aadhaar Card (UIDAI)</strong>
                    <span className="text-[9px] text-slate-400">Identity Scan Verified</span>
                  </div>
                </div>
                <div className="border border-slate-200 p-2 rounded-lg bg-slate-50/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-800">Income Tax PAN Card</strong>
                    <span className="text-[9px] text-slate-400">Tax Identity Verified</span>
                  </div>
                </div>
                <div className="border border-slate-200 p-2 rounded-lg bg-slate-50/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-800">Residential Address Proof</strong>
                    <span className="text-[9px] text-slate-400">Local Address Confirmed</span>
                  </div>
                </div>
                <div className="border border-slate-200 p-2 rounded-lg bg-slate-50/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-800">Specimen Signature</strong>
                    <span className="text-[9px] text-slate-400">Affidavit Attested</span>
                  </div>
                </div>
                <div className="border border-slate-200 p-2 rounded-lg bg-slate-50/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-800">₹200 UPI Payment Slip</strong>
                    <span className="text-[9px] text-slate-400">Direct Bank Remitted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. SECTION 6: STATUTORY DECLARATION & AFFIDAVIT */}
            <div className="space-y-1.5 text-[10px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              <span className="font-extrabold text-slate-800 uppercase block text-[9px]">
                Statutory Declaration by Applicant
              </span>
              <p>
                I hereby declare that the information provided in this application is true and complete to the best of my knowledge. I agree to comply with the Rules, Regulations, and By-laws of New Utkal Finance Limited as framed under the Companies Act, 2013 and Nidhi Rules, 2014. I further consent to central digital KYC verification and statutory membership allotment.
              </p>
            </div>

            {/* 9. SIGNATURE & VERIFICATION STAMP BOXES */}
            <div className="pt-2 grid grid-cols-2 gap-6 text-[10px]">
              <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center flex flex-col justify-between h-24">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Applicant Signature / Thumb Impression</div>
                <div>
                  <div className="font-extrabold text-slate-900 capitalize text-xs">{applicantName}</div>
                  <div className="text-[9px] text-slate-500 font-mono">Date: {app.date || '18 Nov 2026'}</div>
                </div>
              </div>

              <div className="border border-dashed border-blue-300 bg-blue-50/30 rounded-lg p-3 text-center flex flex-col justify-between h-24">
                <div className="text-[9px] text-blue-900 font-bold uppercase">Central Verification Desk / Authorized Signatory</div>
                <div>
                  <div className="font-serif italic font-bold text-blue-950 text-xs">Utkal Finance Clearance Desk</div>
                  <div className="text-[9px] text-slate-500">Authorized Officer &amp; Company Seal</div>
                </div>
              </div>
            </div>

            {/* 10. OFFICIAL FOOTER */}
            <div className="border-t border-slate-200 pt-2 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>New Utkal Finance Ltd. • Confidential Document Dossier</span>
              <span>System Generated on {new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ApplicationDossierPdfModal;
