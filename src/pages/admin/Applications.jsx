import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Download, CheckCircle2, XCircle, FileText, UserPlus, Filter } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ApplicationTable } from '../../components/admin/ApplicationTable';
import { EditApplicationModal } from '../../components/admin/EditApplicationModal';
import { PaymentReceiptModal } from '../../components/admin/PaymentReceiptModal';

export function Applications() {
  const { applications, updateApplicationStatus, updateApplication, refreshData, markAllApplicationsAsSeen } = useAdmin();

  useEffect(() => {
    if (typeof refreshData === 'function') {
      refreshData();
    }
    if (typeof markAllApplicationsAsSeen === 'function') {
      markAllApplicationsAsSeen();
    }
  }, [refreshData, markAllApplicationsAsSeen]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedReceiptApp, setSelectedReceiptApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [actionType, setActionType] = useState(null); // 'Approve' or 'Reject'
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  // Calculate Stat Counts (case-insensitive & distinct)
  const totalCount = applications.length;
  const submittedCount = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    return s === 'pending' || s === 'submitted';
  }).length;
  const pendingCount = submittedCount;
  
  const paymentVerificationCount = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    const isPending = s === 'pending' || s === 'submitted';
    const payStatus = (a.paymentDetails?.paymentStatus || a.paymentStatus || '').toLowerCase();
    const hasReceipt = Boolean(a.paymentReceiptUrl || a.paymentDetails?.receiptUrl);
    return isPending && (hasReceipt || payStatus === 'pending' || payStatus === 'unverified');
  }).length;

  const pendingDocsCount = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    const isCorrection = s === 'correction required' || s === 'correction_required';
    const hasMissingDocs = !a.idProofUrl || !a.photoUrl || !a.signatureUrl;
    return isCorrection || (s === 'pending' && hasMissingDocs);
  }).length;
  const pendingKycCount = pendingDocsCount;

  const approvedCount = applications.filter((a) => (a.status || '').toLowerCase() === 'approved').length;
  const rejectedCount = applications.filter((a) => (a.status || '').toLowerCase() === 'rejected').length;

  const filtered = applications.filter((app) => {
    const matchesSearch =
      (app.applicantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.mobile || '').includes(search) ||
      (app.email || '').toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    const currentStatusLower = (app.status || '').toLowerCase();
    if (filterStatus === 'Submitted') {
      matchesStatus = currentStatusLower === 'pending' || currentStatusLower === 'submitted';
    } else if (filterStatus === 'Payment') {
      const payStatus = (app.paymentDetails?.paymentStatus || app.paymentStatus || '').toLowerCase();
      const hasReceipt = Boolean(app.paymentReceiptUrl || app.paymentDetails?.receiptUrl);
      matchesStatus = (currentStatusLower === 'pending' || currentStatusLower === 'submitted') && (hasReceipt || payStatus === 'pending');
    } else if (filterStatus === 'PendingDocs') {
      const isCorrection = currentStatusLower === 'correction required' || currentStatusLower === 'correction_required';
      const hasMissingDocs = !app.idProofUrl || !app.photoUrl || !app.signatureUrl;
      matchesStatus = isCorrection || (currentStatusLower === 'pending' && hasMissingDocs);
    } else if (filterStatus === 'Approved') {
      matchesStatus = currentStatusLower === 'approved';
    } else if (filterStatus === 'Rejected') {
      matchesStatus = currentStatusLower === 'rejected';
    } else if (filterStatus !== 'All') {
      matchesStatus = currentStatusLower === filterStatus.toLowerCase();
    }

    let matchesBranch = true;
    if (selectedBranch !== 'All Branches') {
      matchesBranch = (app.branch || '').toLowerCase().includes(selectedBranch.toLowerCase());
    }

    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleOpenModal = (app, type) => {
    setSelectedApp(app);
    setActionType(type);
    setErrorMessage('');
  };

  const handleConfirmAction = async () => {
    if (!selectedApp || !actionType) return;

    try {
      setIsProcessing(true);
      setErrorMessage('');

      // Use MongoDB document _id
      const mongoId = selectedApp._id || selectedApp.id;
      const targetStatus = actionType === 'Approve' ? 'approved' : 'rejected';

      await updateApplicationStatus(mongoId, targetStatus);

      if (actionType === 'Approve') {
        setSuccessMessage('Application approved successfully.');
      } else {
        setSuccessMessage(`Application ${actionType.toLowerCase()}d successfully.`);
      }

      setSelectedApp(null);
      setActionType(null);

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setErrorMessage(err.message || 'Failed to update application status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceiptApprove = async (app) => {
    if (!app) return;
    try {
      setIsProcessing(true);
      setErrorMessage('');
      const mongoId = app._id || app.id;
      await updateApplicationStatus(mongoId, 'approved');
      setSuccessMessage(`Application for ${app.applicantName} approved successfully.`);
      setSelectedReceiptApp(null);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to approve application from receipt:', err);
      setErrorMessage(err.message || 'Failed to approve application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceiptReject = async (app) => {
    if (!app) return;
    try {
      setIsProcessing(true);
      setErrorMessage('');
      const mongoId = app._id || app.id;
      await updateApplicationStatus(mongoId, 'rejected');
      setSuccessMessage(`Application for ${app.applicantName} rejected.`);
      setSelectedReceiptApp(null);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to reject application from receipt:', err);
      setErrorMessage(err.message || 'Failed to reject application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async (appId, payload) => {
    try {
      await updateApplication(appId, payload);
      setSuccessMessage(`Application ${payload.applicantName || appId} updated successfully.`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to save application edit:', err);
      setErrorMessage(err.message || 'Failed to update application');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleExportCSV = () => {
    if (!applications || applications.length === 0) {
      alert('No application records to export.');
      return;
    }

    const headers = [
      'Application ID',
      'Member ID',
      'Application Status',
      'Submission Date',
      // Step 1: Personal Details
      'Title',
      'First Name',
      'Middle Name',
      'Last Name',
      'Full Applicant Name',
      'Relationship Prefix',
      'Father / Husband / Guardian Name',
      'Date of Birth',
      'Age',
      'Gender',
      'Marital Status',
      'Education Qualification',
      'Religion',
      'Social Category',
      'Occupation',
      'PAN Number',
      // Step 2: Contact & Address Details
      'Primary Mobile',
      'Alternate Mobile',
      'Email Address',
      'Residential Address Line 1',
      'Residential Address Line 2',
      'Residential Village / Town',
      'Residential District',
      'Residential State',
      'Residential PIN Code',
      'Country',
      'Communication Address Same As Residential',
      'Communication Address Line 1',
      'Communication Address Line 2',
      'Communication Village / Town',
      'Communication District',
      'Communication State',
      'Communication PIN Code',
      // Step 3: Company & Account
      'Assigned Branch',
      'Introducer Name',
      'Employee ID',
      'Membership Type',
      'Preferred Communication',
      // Step 4: Nominee Details
      'Nominee Full Name',
      'Nominee Relationship',
      'Nominee Date of Birth',
      'Nominee Mobile',
      'Nominee Address',
      'Nominee Is Minor',
      'Guardian Name',
      'Guardian Relationship',
      // Step 5: Shares & Contribution
      'Number of Shares',
      'Share Value (INR)',
      'Total Share Capital (INR)',
      'Processing Fee (INR)',
      'Total Statutory Contribution (INR)',
      // Step 6: Verification Documents
      'Primary ID Proof Type',
      'ID Proof File / Status',
      'Address Proof Type',
      'Address Proof File / Status',
      'Applicant Photo File / Status',
      'Signature File / Status',
      'Educational Certificate File / Status',
      'Birth / PAN Certificate File / Status',
      'Utility Document File / Status',
      // Step 7: Witnesses
      'Witness 1 Name',
      'Witness 1 Mobile',
      'Witness 1 Occupation',
      'Witness 1 Address',
      'Witness 1 Relationship',
      'Witness 2 Name',
      'Witness 2 Mobile',
      'Witness 2 Occupation',
      'Witness 2 Address',
      'Witness 2 Relationship',
      // Step 8: Declaration
      'Confirmed Info True',
      'Agreed Terms & Conditions',
      'Consent For Data Processing',
      'Declaration Signer Name',
      'Declaration Date',
      // Step 9: Joining Fee Payment
      'Payment Method',
      'Payable Fee (INR)',
      'Payment UTR / Reference',
      'Payment Status',
      'Payment Receipt File / Status',
      'Payment Date'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val)
        .replace(/[\r\n]+/g, ' ')
        .replace(/"/g, '""')
        .trim();
      return `"${str}"`;
    };

    const formatDate = (val) => {
      if (!val) return '';
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
          return trimmed.slice(0, 10);
        }
      }
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      } catch (e) {}
      return String(val);
    };

    const formatDocField = (val) => {
      if (!val) return 'Not Attached';
      if (typeof val === 'object') {
        return val.name || val.fileName || (val.previewUrl?.startsWith('data:') ? 'Attached (Image Document)' : val.previewUrl) || 'Attached';
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('data:')) {
          return 'Attached (Image Document)';
        }
        return trimmed;
      }
      return 'Attached';
    };

    const rows = applications.map((app) => {
      const p = app.personalDetails || app.personal || {};
      const c = app.contactDetails || app.account || {};
      const a = app.addressDetails || app.address || {};
      const n = app.nomineeDetails || app.nominee || {};
      const m = app.membershipDetails || app.shares || {};
      const doc = app.documentDetails || app.documents || {};
      const w = app.witnessDetails || app.witness || {};
      const d = app.declarationDetails || app.declaration || {};
      const pay = app.paymentDetails || app.payment || {};

      const fullName = [
        p.title || app.title,
        p.firstName || app.firstName,
        p.middleName || app.middleName,
        p.lastName || app.lastName,
      ].filter(Boolean).join(' ') || app.applicantName || '';

      const totalShareCap = Number(m.numberOfShares || app.numberOfShares || 10) * Number(m.shareValue || app.shareValue || 10);
      const totalFee = pay.amount || m.totalContribution || app.totalPaid || 200;

      return [
        escapeCsv(app.applicationId || app.id || app._id || ''),
        escapeCsv(app.memberId || ''),
        escapeCsv(app.status || 'Pending'),
        escapeCsv(formatDate(app.submittedAt || app.createdAt || app.date || '')),
        // Step 1: Personal
        escapeCsv(p.title || app.title || ''),
        escapeCsv(p.firstName || app.firstName || ''),
        escapeCsv(p.middleName || app.middleName || ''),
        escapeCsv(p.lastName || app.lastName || ''),
        escapeCsv(fullName),
        escapeCsv(p.relationshipPrefix || app.relationshipPrefix || ''),
        escapeCsv(p.fatherLegalName || app.fatherLegalName || ''),
        escapeCsv(formatDate(p.dob || app.dob || '')),
        escapeCsv(p.age || app.age || ''),
        escapeCsv(p.gender || app.gender || ''),
        escapeCsv(p.maritalStatus || app.maritalStatus || ''),
        escapeCsv(p.education || app.education || ''),
        escapeCsv(p.religion || app.religion || ''),
        escapeCsv(p.category || app.category || ''),
        escapeCsv(p.occupation || app.occupation || ''),
        escapeCsv(p.pan || app.pan || ''),
        // Step 2: Contact & Address
        escapeCsv(c.mobile || app.mobile || ''),
        escapeCsv(c.altMobile || app.altMobile || ''),
        escapeCsv(c.email || app.email || ''),
        escapeCsv(a.address1 || app.address1 || ''),
        escapeCsv(a.address2 || app.address2 || ''),
        escapeCsv(a.villageTown || app.villageTown || ''),
        escapeCsv(a.district || app.district || ''),
        escapeCsv(a.state || app.state || 'Odisha'),
        escapeCsv(a.pincode || app.pincode || ''),
        escapeCsv(a.country || app.country || 'India'),
        escapeCsv(a.sameAsResidential !== false ? 'Yes' : 'No'),
        escapeCsv(a.commAddress1 || app.commAddress1 || ''),
        escapeCsv(a.commAddress2 || app.commAddress2 || ''),
        escapeCsv(a.commVillageTown || app.commVillageTown || ''),
        escapeCsv(a.commDistrict || app.commDistrict || ''),
        escapeCsv(a.commState || app.commState || ''),
        escapeCsv(a.commPincode || app.commPincode || ''),
        // Step 3: Company & Account
        escapeCsv(m.branch || app.branch || 'Bhubaneswar HQ (Nayapalli, IRC Village)'),
        escapeCsv(m.introducer || app.introducer || ''),
        escapeCsv(m.empId || app.empId || ''),
        escapeCsv(m.membershipType || app.membershipType || 'Statutory Associate Member'),
        escapeCsv(m.preferredCommunication || app.preferredCommunication || 'Email & SMS'),
        // Step 4: Nominee
        escapeCsv(n.fullName || app.nomineeName || ''),
        escapeCsv(n.relationship || app.nomineeRel || ''),
        escapeCsv(formatDate(n.dob || app.nomineeDob || '')),
        escapeCsv(n.mobile || app.nomineeMobile || ''),
        escapeCsv(n.address || app.nomineeAddr || ''),
        escapeCsv(n.isMinor ? 'Yes' : 'No'),
        escapeCsv(n.guardianName || app.guardianName || ''),
        escapeCsv(n.guardianRelationship || app.guardianRelationship || ''),
        // Step 5: Shares
        escapeCsv(m.numberOfShares || app.numberOfShares || 10),
        escapeCsv(m.shareValue || app.shareValue || 10),
        escapeCsv(totalShareCap),
        escapeCsv(m.processingFee || app.processingFee || 100),
        escapeCsv(totalFee),
        // Step 6: Documents
        escapeCsv(doc.idProofType || app.idProofType || 'Aadhaar Card'),
        escapeCsv(formatDocField(doc.idProofUrl || doc.doc2_govId || app.idProofUrl || app.idProof)),
        escapeCsv(doc.addressProofType || app.addressProofType || 'Aadhaar Card'),
        escapeCsv(formatDocField(doc.addressProofUrl || app.addressProofUrl || app.addressProof)),
        escapeCsv(formatDocField(doc.photoUrl || doc.doc1_photo || app.photoUrl || app.photo)),
        escapeCsv(formatDocField(doc.signatureUrl || app.signatureUrl || app.signature)),
        escapeCsv(formatDocField(doc.doc3_eduCert || app.doc3_eduCert)),
        escapeCsv(formatDocField(doc.doc4_birthCert || app.doc4_birthCert)),
        escapeCsv(formatDocField(doc.doc5_utility || app.doc5_utility)),
        // Step 7: Witnesses
        escapeCsv(w.witness1Name || app.witness1Name || ''),
        escapeCsv(w.witness1Mobile || app.witness1Mobile || ''),
        escapeCsv(w.witness1Occupation || app.witness1Occupation || ''),
        escapeCsv(w.witness1Address || app.witness1Address || ''),
        escapeCsv(w.witness1Relationship || app.witness1Relationship || ''),
        escapeCsv(w.witness2Name || app.witness2Name || ''),
        escapeCsv(w.witness2Mobile || app.witness2Mobile || ''),
        escapeCsv(w.witness2Occupation || app.witness2Occupation || ''),
        escapeCsv(w.witness2Address || app.witness2Address || ''),
        escapeCsv(w.witness2Relationship || app.witness2Relationship || ''),
        // Step 8: Declaration
        escapeCsv(d.confirmInfoTrue !== false ? 'Yes' : 'No'),
        escapeCsv(d.agreeTerms !== false ? 'Yes' : 'No'),
        escapeCsv(d.consentProcessing !== false ? 'Yes' : 'No'),
        escapeCsv(d.signatureName || app.declarationSignature || fullName),
        escapeCsv(formatDate(d.declarationDate || app.declarationDate || '')),
        // Step 9: Payment
        escapeCsv(pay.method || app.paymentMethod || 'UPI (IndusInd Bank QR)'),
        escapeCsv(totalFee),
        escapeCsv(pay.utrNumber || pay.utr || app.utrNo || 'UPI_VERIFIED'),
        escapeCsv(pay.paymentStatus || (app.status === 'approved' ? 'Verified' : 'Pending Verification')),
        escapeCsv(formatDocField(pay.receiptUrl || doc.paymentReceiptUrl || app.paymentReceiptUrl)),
        escapeCsv(formatDate(pay.paidAt || app.submittedAt || app.createdAt || ''))
      ].join(',');
    });

    // \uFEFF ensures Excel recognizes UTF-8 properly for symbols and names
    const csvData = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Utkal_Finance_All_Membership_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Membership Applications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
              {pendingCount} Pending Review
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Administer statutory associate membership applications, verify KYC proofs, and allocate Member &amp; EMP IDs
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 5 SUMMARY STAT CARDS GRID (CLICKABLE FILTERS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* CARD 1: TOTAL APPLICATIONS */}
        <div
          onClick={() => setFilterStatus('All')}
          className={`bg-white rounded-2xl border p-4 shadow-xs text-left space-y-1 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            filterStatus === 'All' ? 'border-slate-400 ring-2 ring-slate-800 shadow-md bg-slate-50/50' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
              TOTAL APPLICATIONS
            </span>
            {filterStatus === 'All' && <span className="w-2 h-2 rounded-full bg-slate-800 animate-pulse" />}
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalCount}</div>
          <p className="text-[11px] text-slate-400 font-medium">All recorded dossiers</p>
        </div>

        {/* CARD 2: SUBMITTED / REVIEW */}
        <div
          onClick={() => setFilterStatus('Submitted')}
          className={`rounded-2xl border p-4 shadow-xs text-left space-y-1 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            filterStatus === 'Submitted'
              ? 'bg-amber-100/60 border-amber-400 ring-2 ring-amber-500 shadow-md'
              : 'bg-amber-50/40 border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-700">
              SUBMITTED / REVIEW
            </span>
            {filterStatus === 'Submitted' && <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />}
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">{submittedCount}</div>
          <p className="text-[11px] text-amber-700 font-medium">Awaiting decision</p>
        </div>

        {/* CARD 3: PENDING KYC CHECK */}
        <div
          onClick={() => setFilterStatus('PendingDocs')}
          className={`rounded-2xl border p-4 shadow-xs text-left space-y-1 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            filterStatus === 'PendingDocs'
              ? 'bg-indigo-100/60 border-indigo-400 ring-2 ring-indigo-500 shadow-md'
              : 'bg-indigo-50/30 border-indigo-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-indigo-700">
              PENDING KYC CHECK
            </span>
            {filterStatus === 'PendingDocs' && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />}
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono">{pendingDocsCount}</div>
          <p className="text-[11px] text-indigo-600 font-medium">Unverified document cards</p>
        </div>

        {/* CARD 4: APPROVED MEMBERS */}
        <div
          onClick={() => setFilterStatus('Approved')}
          className={`rounded-2xl border p-4 shadow-xs text-left space-y-1 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            filterStatus === 'Approved'
              ? 'bg-emerald-100/60 border-emerald-400 ring-2 ring-emerald-500 shadow-md'
              : 'bg-emerald-50/30 border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-700">
              APPROVED MEMBERS
            </span>
            {filterStatus === 'Approved' && <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />}
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">{approvedCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium">Allocated UF-2026 IDs</p>
        </div>

        {/* CARD 5: REJECTED */}
        <div
          onClick={() => setFilterStatus('Rejected')}
          className={`rounded-2xl border p-4 shadow-xs text-left space-y-1 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            filterStatus === 'Rejected'
              ? 'bg-rose-100/60 border-rose-400 ring-2 ring-rose-500 shadow-md'
              : 'bg-rose-50/30 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-rose-700">
              REJECTED
            </span>
            {filterStatus === 'Rejected' && <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />}
          </div>
          <div className="text-2xl font-black text-rose-800 font-mono">{rejectedCount}</div>
          <p className="text-[11px] text-rose-600 font-medium">With recorded grounds</p>
        </div>
      </div>

      {/* FILTER TABS & CONTROLS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* FILTER PILLS */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setFilterStatus('All')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'All'
                  ? 'bg-[#0b1c3d] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>All Applications</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${filterStatus === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('Payment')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'Payment'
                  ? 'bg-[#0b1c3d] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Payment Verification</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${filterStatus === 'Payment' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                {paymentVerificationCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('Submitted')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'Submitted'
                  ? 'bg-[#0b1c3d] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>New / Submitted</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${filterStatus === 'Submitted' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                {submittedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('PendingDocs')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'PendingDocs'
                  ? 'bg-[#0b1c3d] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Pending Docs</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${filterStatus === 'PendingDocs' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                {pendingDocsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('Approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'Approved'
                  ? 'bg-[#0b1c3d] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Approved Members</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${filterStatus === 'Approved' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                {approvedCount}
              </span>
            </button>

            {rejectedCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterStatus('Rejected')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'Rejected'
                    ? 'bg-[#0b1c3d] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>Rejected</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${filterStatus === 'Rejected' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  {rejectedCount}
                </span>
              </button>
            )}
          </div>

          {/* SEARCH & BRANCH SELECTOR */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications..."
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All Branches">All Branches</option>
              <option value="Bhubaneswar">Bhubaneswar HQ</option>
              <option value="Cuttack">Cuttack Branch</option>
              <option value="Berhampur">Berhampur Branch</option>
              <option value="Rourkela">Rourkela Branch</option>
              <option value="Sambalpur">Sambalpur Branch</option>
            </select>
          </div>
        </div>

        {/* APPLICATION TABLE */}
        <ApplicationTable
          applications={filtered}
          onApprove={(app) => handleOpenModal(app, 'Approve')}
          onReject={(app) => handleOpenModal(app, 'Reject')}
          onEdit={(app) => setEditingApp(app)}
          onViewReceipt={(app) => setSelectedReceiptApp(app)}
        />
      </div>

      {/* NOTIFICATION BANNERS */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {selectedApp && actionType && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-fade-in text-left">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  actionType === 'Approve'
                    ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                    : 'bg-rose-100 text-rose-600 border border-rose-200'
                }`}
              >
                {actionType === 'Approve' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {actionType} Application?
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedApp.id} • {selectedApp.applicantName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Are you sure you want to <strong>{actionType.toLowerCase()}</strong> this statutory application? This will update member enrollment status immediately.
            </p>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setSelectedApp(null);
                  setActionType(null);
                  setErrorMessage('');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 ${
                  actionType === 'Approve'
                    ? 'bg-[#00C853] hover:bg-emerald-600'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm {actionType}</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* PAYMENT RECEIPT & 1-CLICK APPROVAL MODAL */}
      <PaymentReceiptModal
        isOpen={!!selectedReceiptApp}
        application={selectedReceiptApp}
        onClose={() => setSelectedReceiptApp(null)}
        onApprove={handleReceiptApprove}
        onReject={handleReceiptReject}
        isProcessing={isProcessing}
      />

      {/* EDIT APPLICATION MODAL */}
      <EditApplicationModal
        isOpen={!!editingApp}
        application={editingApp}
        onClose={() => setEditingApp(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

export default Applications;

