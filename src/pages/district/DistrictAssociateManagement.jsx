import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Eye,
  RefreshCw,
  X,
  FileCheck2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  FileText,
  Download,
  Link2,
} from 'lucide-react';
import {
  getDistrictAssociatesApi,
  getDistrictAssociateByIdApi,
  updateAssociateStatusApi,
} from '../../services/districtAdminService';
import { ZoomableImageViewer } from '../../components/common/ZoomableImageViewer';
import { getBackendAssetUrl } from '../../config/env';

export function DistrictAssociateManagement() {
  const { adminUser } = useOutletContext();
  const [associates, setAssociates] = useState([]);
  const [summary, setSummary] = useState({ all: 0, active: 0, pending: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Associate Details Modal State
  const [selectedAssociateId, setSelectedAssociateId] = useState(null);
  const [associateDetails, setAssociateDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  const fetchAssociates = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      setRefreshing(true);
      try {
        const res = await getDistrictAssociatesApi({
          search,
          status: statusFilter,
          page: currentPage,
          limit: 10,
        });
        if (res && res.success) {
          setAssociates(res.associates || []);
          setTotalPages(res.totalPages || 1);
          if (res.summary) setSummary(res.summary);
        }
      } catch (err) {
        console.error('Error fetching associates:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, currentPage]
  );

  useEffect(() => {
    fetchAssociates();
  }, [fetchAssociates]);

  // Open Details Modal & Fetch Full Dossier
  const handleOpenDetails = async (associate) => {
    setSelectedAssociateId(associate._id || associate.memberId);
    setLoadingDetails(true);
    setStatusFeedback(null);
    try {
      const data = await getDistrictAssociateByIdApi(associate._id || associate.memberId);
      if (data && data.success) {
        setAssociateDetails(data);
      }
    } catch (err) {
      console.error('Failed to load associate details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Status Change Handler
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedAssociateId) return;
    setUpdatingStatus(true);
    setStatusFeedback(null);
    try {
      const res = await updateAssociateStatusApi(selectedAssociateId, newStatus);
      if (res && res.success) {
        setStatusFeedback({ type: 'success', text: `Status updated to ${newStatus}` });
        if (associateDetails?.associate) {
          setAssociateDetails((prev) => ({
            ...prev,
            associate: { ...prev.associate, status: newStatus },
          }));
        }
        fetchAssociates(true);
      }
    } catch (err) {
      setStatusFeedback({ type: 'error', text: err.message || 'Failed to update status' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'suspended':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'pending':
      case 'inactive':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const assignedDistrict = adminUser?.assignedDistrict || 'District';
  const circleLabel = assignedDistrict.toLowerCase().includes('circle')
    ? assignedDistrict
    : `${assignedDistrict} Circle`;

  return (
    <div className="space-y-6 text-left pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Associate Management
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {circleLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, inspect statutory dossiers, and manage membership statuses of circle associates.
          </p>
        </div>

        <button
          onClick={() => fetchAssociates(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* FILTER TABS & SEARCH TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {[
              { id: 'All', label: `All Associates (${summary.all})` },
              { id: 'active', label: `Active (${summary.active})` },
              { id: 'pending', label: `Pending (${summary.pending})` },
              { id: 'suspended', label: `Suspended (${summary.suspended})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Associate ID, Name, Mobile..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ASSOCIATES TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Retrieving associates from MongoDB...
            </p>
          </div>
        ) : associates.length === 0 ? (
          <div className="py-16 text-center space-y-3 p-6">
            <div className="w-14 h-14 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">No Associates Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No associate members match the active filters in {circleLabel}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Associate ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                  <th className="py-3.5 px-4">KYC Status</th>
                  <th className="py-3.5 px-4">Membership Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {associates.map((a) => {
                  const kycStatus =
                    a.documentDetails?.idProofUrl ||
                    a.documentDetails?.idProof ||
                    a.documentDetails?.doc2_govId ||
                    a.documentDetails?.photoUrl ||
                    a.documentDetails?.paymentReceiptUrl ||
                    a.idProofUrl ||
                    a.photoUrl
                      ? 'Verified'
                      : 'Pending';
                  return (
                    <tr key={a._id} className="hover:bg-slate-50/70:bg-slate-800/50 transition-colors">
                      {/* Associate ID */}
                      <td className="py-4 px-5 font-mono font-black text-blue-700">
                        {a.memberId}
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        {a.name}
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-4 text-slate-600 font-mono">
                        {a.mobile || '—'}
                      </td>

                      {/* Membership Category */}
                      <td className="py-4 px-4">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {a.membershipType || 'Associate Member'}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{a.joiningDate ? new Date(a.joiningDate).toLocaleDateString('en-GB') : '—'}</span>
                        </div>
                      </td>

                      {/* KYC Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            kycStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {kycStatus}
                        </span>
                      </td>

                      {/* Membership Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                            a.status
                          )}`}
                        >
                          {a.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(a)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-bold text-xs border border-blue-200/80 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ASSOCIATE DOSSIER DETAILS MODAL */}
      {selectedAssociateId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  UF
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Associate Member Dossier: {associateDetails?.associate?.name || 'Loading...'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {associateDetails?.associate?.memberId || selectedAssociateId} • Statutory Class: Associate Member
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAssociateId(null);
                  setAssociateDetails(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-bold">Loading statutory records...</p>
              </div>
            ) : associateDetails ? (
              <div className="space-y-6">
                {/* Status Updater Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Membership Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(associateDetails.associate?.status)}`}>
                        {associateDetails.associate?.status || 'Active'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Joined: {associateDetails.associate?.joiningDate ? new Date(associateDetails.associate.joiningDate).toLocaleDateString('en-GB') : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Set Status:</span>
                    {['active', 'pending', 'suspended'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={updatingStatus || associateDetails.associate?.status === st}
                        onClick={() => handleUpdateStatus(st)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          associateDetails.associate?.status === st
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {statusFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${
                    statusFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {statusFeedback.text}
                  </div>
                )}

                {(() => {
                  const associate = associateDetails.associate || {};
                  const application = associateDetails.application || {};
                  const personal = associate.personalDetails || {};
                  const appPersonal = application.personalDetails || {};
                  const contact = associate.contactDetails || {};
                  const appContact = application.contactDetails || {};
                  const address = associate.addressDetails || application.addressDetails || {};

                  const legalName =
                    associate.name ||
                    [personal.title, personal.firstName, personal.middleName, personal.lastName].filter(Boolean).join(' ') ||
                    [appPersonal.title, appPersonal.firstName, appPersonal.middleName, appPersonal.lastName].filter(Boolean).join(' ') ||
                    'Associate Member';

                  const fatherGuardian =
                    personal.fatherLegalName ||
                    personal.fatherName ||
                    personal.guardianName ||
                    appPersonal.fatherLegalName ||
                    appPersonal.fatherName ||
                    appPersonal.guardianName ||
                    associate.fatherLegalName ||
                    associate.fatherName ||
                    '—';

                  const dob = personal.dob || personal.dateOfBirth || appPersonal.dob || appPersonal.dateOfBirth || '';
                  const age = personal.age || appPersonal.age || '';
                  const dobAgeDisplay = dob
                    ? `${dob}${age ? ` (${age} yrs)` : ''}`
                    : (age ? `${age} yrs` : '—');

                  const gender = personal.gender || personal.sex || appPersonal.gender || '';
                  const marital = personal.maritalStatus || appPersonal.maritalStatus || '';
                  const genderMaritalDisplay = [gender, marital].filter(Boolean).join(' • ') || '—';

                  const pan =
                    personal.pan ||
                    personal.panNumber ||
                    personal.panCard ||
                    associate.pan ||
                    appPersonal.pan ||
                    appPersonal.panNumber ||
                    '—';

                  const mobile = associate.mobile || contact.mobile || appContact.mobile || '—';
                  const email = associate.email || contact.email || appContact.email || '—';
                  const districtName = address.district || associate.district || circleLabel;
                  const fullAddress = [
                    address.address1,
                    address.address2,
                    address.villageTown,
                    address.district,
                    address.state,
                    address.pincode,
                  ].filter(Boolean).join(', ') || 'Address on file';

                  // Documents extraction
                  const rawDocs = associate.documentDetails || {};
                  const appDocs = application.documentDetails || application.documents || {};
                  const paymentReceiptUrl =
                    rawDocs.paymentReceiptUrl ||
                    associate.paymentDetails?.receiptUrl ||
                    appDocs.paymentReceiptUrl ||
                    application.paymentDetails?.receiptUrl ||
                    associateDetails.payments?.[0]?.receiptUrl ||
                    associateDetails.payments?.[0]?.receiptFile ||
                    '';

                  const idProofUrl =
                    rawDocs.idProofUrl ||
                    rawDocs.idProof ||
                    rawDocs.idProofFile ||
                    rawDocs.doc2_govId ||
                    associate.idProofUrl ||
                    appDocs.idProofUrl ||
                    appDocs.idProof ||
                    appDocs.idProofFile ||
                    appDocs.doc2_govId ||
                    '';

                  const addressProofUrl =
                    rawDocs.addressProofUrl ||
                    rawDocs.addressProof ||
                    rawDocs.addressProofFile ||
                    rawDocs.doc3_addressProof ||
                    associate.addressProofUrl ||
                    appDocs.addressProofUrl ||
                    appDocs.addressProof ||
                    appDocs.addressProofFile ||
                    appDocs.doc3_addressProof ||
                    '';

                  const photoUrl =
                    rawDocs.photoUrl ||
                    rawDocs.photo ||
                    rawDocs.photoFile ||
                    rawDocs.doc1_photo ||
                    associate.photoUrl ||
                    appDocs.photoUrl ||
                    appDocs.photo ||
                    appDocs.photoFile ||
                    appDocs.doc1_photo ||
                    '';

                  const signatureUrl =
                    rawDocs.signatureUrl ||
                    rawDocs.signature ||
                    rawDocs.signatureFile ||
                    rawDocs.doc4_signature ||
                    associate.signatureUrl ||
                    appDocs.signatureUrl ||
                    appDocs.signature ||
                    appDocs.signatureFile ||
                    appDocs.doc4_signature ||
                    '';

                  const eduCertUrl =
                    rawDocs.doc3_eduCert ||
                    rawDocs.doc3_eduCertFile ||
                    rawDocs.educationCertUrl ||
                    appDocs.doc3_eduCert ||
                    appDocs.doc3_eduCertFile ||
                    appDocs.educationCertUrl ||
                    '';

                  const birthCertUrl =
                    rawDocs.doc4_birthCert ||
                    rawDocs.doc4_birthCertFile ||
                    rawDocs.birthCertUrl ||
                    appDocs.doc4_birthCert ||
                    appDocs.doc4_birthCertFile ||
                    appDocs.birthCertUrl ||
                    '';

                  const utilityUrl =
                    rawDocs.doc5_utility ||
                    rawDocs.doc5_utilityFile ||
                    rawDocs.utilityBillUrl ||
                    appDocs.doc5_utility ||
                    appDocs.doc5_utilityFile ||
                    appDocs.utilityBillUrl ||
                    '';

                  const panDocUrl =
                    rawDocs.panCard ||
                    rawDocs.panDoc ||
                    rawDocs.doc_pan ||
                    rawDocs.panFile ||
                    appDocs.panCard ||
                    appDocs.panDoc ||
                    appDocs.doc_pan ||
                    appDocs.panFile ||
                    '';

                  const additionalDocs = [
                    ...(Array.isArray(rawDocs.additionalDocuments) ? rawDocs.additionalDocuments : []),
                    ...(Array.isArray(appDocs.additionalDocuments) ? appDocs.additionalDocuments : []),
                    ...(Array.isArray(associate.documents) ? associate.documents : []),
                  ];

                  const canonicalDocs = [
                    {
                      key: 'photo',
                      name: 'Passport Photograph',
                      type: 'Photograph',
                      url: photoUrl,
                    },
                    {
                      key: 'idproof',
                      name: `${rawDocs.idProofType || appDocs.idProofType || 'Aadhaar / Gov ID'} Proof`,
                      type: 'Identity Proof',
                      url: idProofUrl,
                    },
                    {
                      key: 'addressproof',
                      name: `${rawDocs.addressProofType || appDocs.addressProofType || 'Address Document'} Proof`,
                      type: 'Address Proof',
                      url: addressProofUrl || (idProofUrl.toLowerCase().includes('aadhaar') ? idProofUrl : ''),
                      isDerived: !addressProofUrl && idProofUrl.toLowerCase().includes('aadhaar'),
                    },
                    {
                      key: 'signature',
                      name: 'Specimen Digital Signature',
                      type: 'Signature',
                      url: signatureUrl,
                    },
                    {
                      key: 'paymentReceipt',
                      name: '₹200 Statutory Membership Receipt',
                      type: 'Payment Proof',
                      url: paymentReceiptUrl,
                    },
                    ...(eduCertUrl ? [{
                      key: 'educert',
                      name: 'Educational Degree / Certificate',
                      type: 'Educational Proof',
                      url: eduCertUrl,
                    }] : []),
                    ...(birthCertUrl ? [{
                      key: 'birthcert',
                      name: 'Birth / Age / Identity Certificate',
                      type: 'Birth / Age Proof',
                      url: birthCertUrl,
                    }] : []),
                    ...(utilityUrl ? [{
                      key: 'utility',
                      name: 'Electricity / Utility Bill / Bank Passbook',
                      type: 'Utility Document',
                      url: utilityUrl,
                    }] : []),
                    ...(panDocUrl ? [{
                      key: 'pandoc',
                      name: 'Permanent Account Number (PAN) Card',
                      type: 'Tax Document',
                      url: panDocUrl,
                    }] : []),
                  ];

                  additionalDocs.forEach((add, idx) => {
                    const rawUrl = add?.documentUrl || add?.url || add?.file || '';
                    if (rawUrl && !canonicalDocs.some((c) => c.url === rawUrl)) {
                      canonicalDocs.push({
                        key: `additional-${idx}`,
                        name: add.documentName || add.name || add.documentType || `Supporting Document ${idx + 1}`,
                        type: add.documentType || add.type || 'Supporting Document',
                        url: rawUrl,
                      });
                    }
                  });

                  const uploadedCount = canonicalDocs.filter((d) => d.url).length;

                  return (
                    <div className="space-y-6">
                      {/* 1. Personal & Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                          <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            Personal Information
                          </h4>
                          <div className="space-y-1.5 text-slate-600">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span>Legal Name:</span>
                              <strong className="text-slate-900">{legalName}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span>Father/Guardian:</span>
                              <span>{fatherGuardian}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span>DOB / Age:</span>
                              <span>{dobAgeDisplay}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span>Gender / Marital:</span>
                              <span>{genderMaritalDisplay}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>PAN Card:</span>
                              <span className="font-mono font-bold text-slate-800">{pan}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                          <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            Address &amp; Circle Jurisdiction
                          </h4>
                          <div className="space-y-1.5 text-slate-600">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span>Primary Mobile:</span>
                              <strong className="font-mono">{mobile}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span>Email Address:</span>
                              <span className="font-mono truncate">{email}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span>District:</span>
                              <strong className="text-blue-600">{districtName}</strong>
                            </div>
                            <div className="py-1">
                              <span className="block text-[10px] text-slate-400">Residential Address:</span>
                              <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">{fullAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Membership Share Capital & Statutory Allotment */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                        <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                          <Receipt className="w-3.5 h-3.5 text-teal-600" />
                          Statutory Share Capital &amp; ₹200 Payment Details
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Allotted Shares</span>
                            <span className="text-base font-black text-slate-900">
                              {associate.numberOfShares || 10} Shares
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Share Face Value</span>
                            <span className="text-base font-black text-slate-900">₹10 / unit</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Capital</span>
                            <span className="text-base font-black text-teal-600">₹{associate.totalContribution || 200}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">INC-33 Bylaws</span>
                            <span className="text-xs font-bold text-blue-600">Compliant</span>
                          </div>
                        </div>

                        {/* Payment Records */}
                        {associateDetails.payments && associateDetails.payments.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <span className="text-[11px] font-bold text-slate-500 block">Verified Payment Transaction:</span>
                            {associateDetails.payments.map((p, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-mono font-bold text-slate-900">UTR: {p.utrNo || 'Awaiting UTR'}</span>
                                  <span className="text-[11px] text-slate-400 block">{p.purpose}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-emerald-600">₹{p.amount || 200}</span>
                                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-2">
                                    {p.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. KYC Documents Attached */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                            KYC Documents Attached
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {uploadedCount} of {canonicalDocs.length} Uploaded
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {canonicalDocs.map((doc) => {
                            const assetUrl = doc.url ? getBackendAssetUrl(doc.url) : '';
                            const hasUploaded = Boolean(assetUrl);
                            const isPdf = assetUrl.toLowerCase().includes('.pdf');

                            return (
                              <div
                                key={doc.key}
                                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                  hasUploaded
                                    ? 'bg-slate-50/80 border-slate-200 hover:border-blue-300 hover:shadow-xs'
                                    : 'bg-amber-50/40 border-dashed border-amber-200'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 space-y-1">
                                    <span
                                      className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                        hasUploaded
                                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}
                                    >
                                      {doc.type}
                                    </span>
                                    <h5 className="font-bold text-slate-900 text-xs truncate" title={doc.name}>
                                      {doc.name}
                                    </h5>
                                    {doc.isDerived && (
                                      <span className="text-[10px] text-blue-600 block">Covered via Aadhaar ID</span>
                                    )}
                                  </div>

                                  <span
                                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      hasUploaded
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {hasUploaded ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        Verified
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-3 h-3 text-amber-600" />
                                        Pending
                                      </>
                                    )}
                                  </span>
                                </div>

                                {/* Action Toolbar */}
                                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5">
                                  {hasUploaded ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedPreviewDoc({
                                            title: doc.name,
                                            type: doc.type,
                                            url: assetUrl,
                                            isPdf,
                                          })
                                        }
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                                        title="Preview document modal"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        Preview
                                      </button>

                                      <div className="flex items-center gap-1">
                                        <a
                                          href={assetUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                          title="Open in new window"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                        <a
                                          href={assetUrl}
                                          download
                                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                          title="Download file"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </a>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-amber-700 font-medium italic">
                                      Awaiting upload by member
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4. Associate-wise Performance */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                        <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                          Associate-Wise Performance Summary
                        </h4>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 bg-purple-50/60 rounded-xl">
                            <span className="text-[10px] text-purple-800 font-bold block">Referrals Generated</span>
                            <span className="text-lg font-black text-purple-900">
                              {associateDetails.performance?.totalReferrals || 0}
                            </span>
                          </div>
                          <div className="p-3 bg-emerald-50/60 rounded-xl">
                            <span className="text-[10px] text-emerald-800 font-bold block">Converted Candidates</span>
                            <span className="text-lg font-black text-emerald-900">
                              {associateDetails.performance?.convertedReferrals || 0}
                            </span>
                          </div>
                          <div className="p-3 bg-amber-50/60 rounded-xl">
                            <span className="text-[10px] text-amber-800 font-bold block">Investor Submissions</span>
                            <span className="text-lg font-black text-amber-900">
                              {associateDetails.performance?.investorSubmissions || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 5. Associate Unique Referral Tools & QR Code */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                            <Link2 className="w-3.5 h-3.5 text-blue-600" />
                            Associate Referral Tools &amp; Circle Attribution
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            Unique ID: {associate.memberId || '—'}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">
                              Official Associate Referral Link:
                            </span>
                            <span className="font-mono text-xs text-blue-700 truncate block mt-0.5">
                              {`${window.location.origin}/membership-form?ref=${associate.memberId || ''}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/membership-form?ref=${associate.memberId || ''}`
                                );
                                setStatusFeedback({ type: 'success', text: 'Associate referral link copied to clipboard!' });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                            >
                              Copy Link
                            </button>
                            <a
                              href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                                `${window.location.origin}/membership-form?ref=${associate.memberId || ''}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                            >
                              View QR
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 5. DOCUMENT PREVIEW MODAL */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                  {selectedPreviewDoc.type}
                </span>
                <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1 truncate">
                  {selectedPreviewDoc.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedPreviewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </a>
                <a
                  href={selectedPreviewDoc.url}
                  download
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-0 overflow-hidden flex-1 flex items-center justify-center bg-slate-950 min-h-[350px]">
              {selectedPreviewDoc.isPdf ? (
                <iframe
                  src={selectedPreviewDoc.url}
                  title={selectedPreviewDoc.title}
                  className="w-full h-[65vh] rounded-2xl border border-slate-200 bg-white shadow-xs"
                />
              ) : (
                <ZoomableImageViewer
                  src={selectedPreviewDoc.url}
                  alt={selectedPreviewDoc.title}
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

export default DistrictAssociateManagement;

