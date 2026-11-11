import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  User,
  Phone,
  MapPin,
  Building2,
  UserCheck,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  FileCheck,
  FolderOpen,
  Upload,
  Eye,
  Trash2,
  CreditCard,
  PenTool,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { getBackendAssetUrl } from '../../config/env';
import { uploadDocumentsApi } from '../../services/applicationService';
import { ZoomableImageViewer } from '../common/ZoomableImageViewer';

export function EditApplicationModal({ isOpen, application, onClose, onSave }) {
  const [activeSection, setActiveSection] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFields, setUploadingFields] = useState({});
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const scrollContainerRef = useRef(null);
  const lastLoadedAppIdRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    // Personal Details
    title: 'Mr.',
    firstName: '',
    middleName: '',
    lastName: '',
    relationshipPrefix: 'S/o.',
    fatherLegalName: '',
    dob: '',
    age: '',
    gender: 'Male',
    maritalStatus: 'Married',
    religion: 'Hindu',
    category: 'General',
    education: 'Graduate / P.G.',
    occupation: 'Business',
    pan: '',

    // Contact Details
    mobile: '',
    altMobile: '',
    email: '',

    // Address Details
    address1: '',
    villageTown: '',
    district: 'Khurda',
    state: 'Odisha',
    pincode: '',

    // Branch & Introducer
    branch: 'Bhubaneswar HQ (Nayapalli, IRC Village)',
    introducer: '',
    empId: '',

    // Nominee Details
    nomineeName: '',
    nomineeRel: 'Spouse',
    nomineeDob: '',
    nomineeMobile: '',
    nomineeAddr: '',

    // Share & Fees
    numberOfShares: 10,
    shareValue: 10,
    processingFee: 100,

    // Document Details
    idProofType: 'Aadhaar Card',
    idProofUrl: '',
    addressProofType: 'Aadhaar Card',
    addressProofUrl: '',
    photoUrl: '',
    signatureUrl: '',
    doc3_eduCert: '',
    doc4_birthCert: '',
    doc5_utility: '',
    paymentReceiptUrl: '',
    additionalDocuments: [],

    // Status
    status: 'pending',
  });

  // Load existing application data ONLY when modal freshly opens or target application changes
  useEffect(() => {
    if (!isOpen || !application) {
      lastLoadedAppIdRef.current = null;
      return;
    }

    const currentAppId = String(application._id || application.id || application.applicationId || '');

    // Prevent background polling or window re-focus from overwriting active form edits while modal is open
    if (lastLoadedAppIdRef.current === currentAppId) {
      return;
    }

    lastLoadedAppIdRef.current = currentAppId;

    if (application) {
      const p = application.personalDetails || application.personal || {};
      const c = application.contactDetails || application.account || {};
      const a = application.addressDetails || application.address || {};
      const n = application.nomineeDetails || application.nominee || {};
      const m = application.membershipDetails || application.shares || {};
      const d = application.documentDetails || application.documents || {};
      const pay = application.paymentDetails || application.payment || {};

      let initialFirstName = application.firstName || p.firstName || '';
      let initialMiddleName = application.middleName || p.middleName || '';
      let initialLastName = application.lastName || p.lastName || '';
      let initialTitle = application.title || p.title || 'Mr.';

      if (!initialFirstName && application.applicantName) {
        const cleaned = application.applicantName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, '');
        const parts = cleaned.split(' ');
        initialFirstName = parts[0] || '';
        if (parts.length > 2) {
          initialMiddleName = parts.slice(1, -1).join(' ');
          initialLastName = parts[parts.length - 1];
        } else if (parts.length === 2) {
          initialLastName = parts[1];
        }
      }

      const idProofVal =
        d.idProofUrl ||
        d.idProof ||
        d.doc2_govId ||
        application.idProofUrl ||
        application.idProof ||
        application.doc2_govId ||
        (typeof d.idProofFile === 'string' ? d.idProofFile : '') ||
        (typeof application.idProofFile === 'string' ? application.idProofFile : '') ||
        (typeof d.idProofFile?.previewUrl === 'string' ? d.idProofFile.previewUrl : '') ||
        (typeof application.idProofFile?.previewUrl === 'string' ? application.idProofFile.previewUrl : '') ||
        (typeof d.idProofFile?.dataUrl === 'string' ? d.idProofFile.dataUrl : '') ||
        (typeof application.idProofFile?.dataUrl === 'string' ? application.idProofFile.dataUrl : '') ||
        '';

      const addrProofVal =
        d.addressProofUrl ||
        d.addressProof ||
        application.addressProofUrl ||
        application.addressProof ||
        (typeof d.addressProofFile === 'string' ? d.addressProofFile : '') ||
        (typeof application.addressProofFile === 'string' ? application.addressProofFile : '') ||
        (typeof d.addressProofFile?.previewUrl === 'string' ? d.addressProofFile.previewUrl : '') ||
        (typeof application.addressProofFile?.previewUrl === 'string' ? application.addressProofFile.previewUrl : '') ||
        (typeof d.addressProofFile?.dataUrl === 'string' ? d.addressProofFile.dataUrl : '') ||
        (typeof application.addressProofFile?.dataUrl === 'string' ? application.addressProofFile.dataUrl : '') ||
        '';

      const photoVal =
        d.photoUrl ||
        d.photo ||
        d.doc1_photo ||
        application.photoUrl ||
        application.photo ||
        application.doc1_photo ||
        (typeof d.photoFile === 'string' ? d.photoFile : '') ||
        (typeof application.photoFile === 'string' ? application.photoFile : '') ||
        (typeof d.photoFile?.previewUrl === 'string' ? d.photoFile.previewUrl : '') ||
        (typeof application.photoFile?.previewUrl === 'string' ? application.photoFile.previewUrl : '') ||
        (typeof d.photoFile?.dataUrl === 'string' ? d.photoFile.dataUrl : '') ||
        (typeof application.photoFile?.dataUrl === 'string' ? application.photoFile.dataUrl : '') ||
        '';

      const sigVal =
        d.signatureUrl ||
        d.signature ||
        application.signatureUrl ||
        application.signature ||
        (typeof d.signatureFile === 'string' ? d.signatureFile : '') ||
        (typeof application.signatureFile === 'string' ? application.signatureFile : '') ||
        (typeof d.signatureFile?.previewUrl === 'string' ? d.signatureFile.previewUrl : '') ||
        (typeof application.signatureFile?.previewUrl === 'string' ? application.signatureFile.previewUrl : '') ||
        (typeof d.signatureFile?.dataUrl === 'string' ? d.signatureFile.dataUrl : '') ||
        (typeof application.signatureFile?.dataUrl === 'string' ? application.signatureFile.dataUrl : '') ||
        '';

      const doc3Val =
        d.doc3_eduCert ||
        application.doc3_eduCert ||
        (typeof d.doc3_eduCert === 'string' ? d.doc3_eduCert : '') ||
        (typeof application.doc3_eduCert === 'string' ? application.doc3_eduCert : '') ||
        (Array.isArray(d.additionalDocuments)
          ? d.additionalDocuments.find((x) => x.documentType === 'Educational Certificate')?.documentUrl
          : '') ||
        (Array.isArray(application.additionalDocuments)
          ? application.additionalDocuments.find((x) => x.documentType === 'Educational Certificate')?.documentUrl
          : '') ||
        '';

      const doc4Val =
        d.doc4_birthCert ||
        application.doc4_birthCert ||
        (typeof d.doc4_birthCert === 'string' ? d.doc4_birthCert : '') ||
        (typeof application.doc4_birthCert === 'string' ? application.doc4_birthCert : '') ||
        (Array.isArray(d.additionalDocuments)
          ? d.additionalDocuments.find((x) => x.documentType === 'Birth / PAN Certificate' || x.documentType === 'Birth Certificate')?.documentUrl
          : '') ||
        (Array.isArray(application.additionalDocuments)
          ? application.additionalDocuments.find((x) => x.documentType === 'Birth / PAN Certificate' || x.documentType === 'Birth Certificate')?.documentUrl
          : '') ||
        '';

      const doc5Val =
        d.doc5_utility ||
        application.doc5_utility ||
        (typeof d.doc5_utility === 'string' ? d.doc5_utility : '') ||
        (typeof application.doc5_utility === 'string' ? application.doc5_utility : '') ||
        (Array.isArray(d.additionalDocuments)
          ? d.additionalDocuments.find((x) => x.documentType === 'Financial / Utility Document' || x.documentType === 'Utility Bill')?.documentUrl
          : '') ||
        (Array.isArray(application.additionalDocuments)
          ? application.additionalDocuments.find((x) => x.documentType === 'Financial / Utility Document' || x.documentType === 'Utility Bill')?.documentUrl
          : '') ||
        '';

      const receiptVal =
        pay.receiptUrl ||
        d.paymentReceiptUrl ||
        application.paymentReceiptUrl ||
        application.payment?.receiptUrl ||
        (Array.isArray(d.additionalDocuments)
          ? d.additionalDocuments.find((x) => x.documentType === 'Payment Receipt')?.documentUrl
          : '') ||
        (Array.isArray(application.additionalDocuments)
          ? application.additionalDocuments.find((x) => x.documentType === 'Payment Receipt')?.documentUrl
          : '') ||
        '';

      setFormData({
        title: initialTitle,
        firstName: initialFirstName,
        middleName: initialMiddleName,
        lastName: initialLastName,
        relationshipPrefix: application.relationshipPrefix || p.relationshipPrefix || 'S/o.',
        fatherLegalName: application.fatherLegalName || p.fatherLegalName || p.guardianName || '',
        dob: application.dob || p.dob || '',
        age: application.age || p.age || '',
        gender: application.gender || p.gender || 'Male',
        maritalStatus: application.maritalStatus || p.maritalStatus || 'Married',
        religion: application.religion || p.religion || 'Hindu',
        category: application.category || p.category || 'General',
        education: application.education || p.education || 'Graduate / P.G.',
        occupation: application.occupation || p.occupation || 'Business',
        pan: application.pan || p.pan || d.docRefNo || '',

        mobile: application.mobile || c.mobile || a.mobile || '',
        altMobile: application.altMobile || c.altMobile || c.alternateMobile || a.alternateMobile || '',
        email: application.email || c.email || a.email || '',

        address1: application.address1 || a.address1 || '',
        villageTown: application.villageTown || a.villageTown || '',
        district: application.district || a.district || 'Khurda',
        state: application.state || a.state || 'Odisha',
        pincode: application.pincode || a.pincode || '',

        branch: application.branch || m.branch || c.registeredBranch || 'Bhubaneswar HQ (Nayapalli, IRC Village)',
        introducer: application.introducer || m.introducer || c.introducer || '',
        empId: application.empId || m.empId || c.empId || '',

        nomineeName: application.nomineeName || n.fullName || n.nomineeName || n.name || '',
        nomineeRel: application.nomineeRel || n.relationship || 'Spouse',
        nomineeDob: application.nomineeDob || n.dob || '',
        nomineeMobile: application.nomineeMobile || n.mobile || '',
        nomineeAddr: application.nomineeAddr || n.address || '',

        numberOfShares: Number(application.numberOfShares || m.numberOfShares) || 10,
        shareValue: Number(application.shareValue || m.shareValue) || 10,
        processingFee: Number(application.processingFee || m.processingFee) || 100,

        // Documents
        idProofType: d.idProofType || application.idProofType || 'Aadhaar Card',
        idProofUrl: idProofVal,
        addressProofType: d.addressProofType || application.addressProofType || 'Aadhaar Card',
        addressProofUrl: addrProofVal,
        photoUrl: photoVal,
        signatureUrl: sigVal,
        doc3_eduCert: doc3Val,
        doc4_birthCert: doc4Val,
        doc5_utility: doc5Val,
        paymentReceiptUrl: receiptVal,
        additionalDocuments: Array.isArray(d.additionalDocuments) ? [...d.additionalDocuments] : (Array.isArray(application.additionalDocuments) ? [...application.additionalDocuments] : []),

        status: (application.status || 'pending').toLowerCase(),
      });
      setError('');
      setActiveSection('personal');
    }
  }, [isOpen, application]);

  // Ensure scroll resets to top whenever modal opens & lock body scrolling
  useEffect(() => {
    if (isOpen) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !application) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'dob' && value) {
        const birthDate = new Date(value);
        if (!isNaN(birthDate.getTime())) {
          const diff = Date.now() - birthDate.getTime();
          const ageDate = new Date(diff);
          const computedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
          if (computedAge > 0 && computedAge < 120) {
            updated.age = String(computedAge);
          }
        }
      }
      return updated;
    });
  };

  const handleFileUpload = async (docField, file) => {
    if (!file) return;
    setError('');
    setUploadingFields((prev) => ({ ...prev, [docField]: true }));

    // Create an immediate local preview
    try {
      const localPreviewUrl = URL.createObjectURL(file);
      handleChange(docField, localPreviewUrl);
    } catch (e) {}

    try {
      const fd = new FormData();
      let slotName = docField;
      if (docField === 'idProofUrl') slotName = 'idProof';
      else if (docField === 'addressProofUrl') slotName = 'addressProof';
      else if (docField === 'photoUrl') slotName = 'photo';
      else if (docField === 'signatureUrl') slotName = 'signature';
      else if (docField === 'paymentReceiptUrl') slotName = 'paymentReceipt';

      fd.append(slotName, file);
      if (slotName !== docField) {
        fd.append(docField, file);
      }

      const uploadedFiles = await uploadDocumentsApi(fd);
      const serverUrl =
        uploadedFiles[slotName] ||
        uploadedFiles[docField] ||
        (docField === 'idProofUrl' ? uploadedFiles.idProof || uploadedFiles.doc2_govId : '') ||
        (docField === 'addressProofUrl' ? uploadedFiles.addressProof : '') ||
        (docField === 'photoUrl' ? uploadedFiles.photo || uploadedFiles.doc1_photo : '') ||
        (docField === 'signatureUrl' ? uploadedFiles.signature : '') ||
        (docField === 'paymentReceiptUrl' ? uploadedFiles.paymentReceipt || uploadedFiles.receiptFile : '') ||
        Object.values(uploadedFiles)[0];

      if (serverUrl) {
        handleChange(docField, serverUrl);
      }
    } catch (err) {
      console.warn('Direct upload error, falling back to base64 DataURL:', err.message);
      // Fallback: Read as base64 data URL if direct upload fails
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          handleChange(docField, reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFields((prev) => ({ ...prev, [docField]: false }));
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`edit-section-${sectionId}`);
    if (element && scrollContainerRef.current) {
      const parentTop = scrollContainerRef.current.getBoundingClientRect().top;
      const elemTop = element.getBoundingClientRect().top;
      const currentScroll = scrollContainerRef.current.scrollTop;
      const targetScroll = currentScroll + (elemTop - parentTop) - 10;
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      setError('Applicant first name is required.');
      scrollToSection('personal');
      return;
    }
    if (!formData.mobile.trim()) {
      setError('Applicant primary mobile number is required.');
      scrollToSection('contact');
      return;
    }
    if (!formData.email.trim()) {
      setError('Applicant email address is required.');
      scrollToSection('contact');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const nameParts = [
        formData.title,
        formData.firstName.trim(),
        formData.middleName.trim(),
        formData.lastName.trim(),
      ].filter(Boolean);
      const applicantName = nameParts.join(' ');

      const totalContribution =
        Number(formData.numberOfShares) * Number(formData.shareValue) +
        Number(formData.processingFee);

      const extraDocs = Array.isArray(formData.additionalDocuments) ? [...formData.additionalDocuments] : [];
      if (formData.doc3_eduCert && !extraDocs.some((d) => d.documentType === 'Educational Certificate' || d.documentUrl === formData.doc3_eduCert)) {
        extraDocs.push({
          documentType: 'Educational Certificate',
          documentName: 'Educational Degree / Certificate',
          documentUrl: formData.doc3_eduCert,
          uploadedAt: new Date(),
        });
      }
      if (formData.doc4_birthCert && !extraDocs.some((d) => d.documentType === 'Birth / PAN Certificate' || d.documentUrl === formData.doc4_birthCert)) {
        extraDocs.push({
          documentType: 'Birth / PAN Certificate',
          documentName: 'Birth / PAN / Identity Certificate',
          documentUrl: formData.doc4_birthCert,
          uploadedAt: new Date(),
        });
      }
      if (formData.doc5_utility && !extraDocs.some((d) => d.documentType === 'Financial / Utility Document' || d.documentUrl === formData.doc5_utility)) {
        extraDocs.push({
          documentType: 'Financial / Utility Document',
          documentName: 'Electricity Bill / Bank Passbook',
          documentUrl: formData.doc5_utility,
          uploadedAt: new Date(),
        });
      }
      if (formData.paymentReceiptUrl && !extraDocs.some((d) => d.documentType === 'Payment Receipt' || d.documentUrl === formData.paymentReceiptUrl)) {
        extraDocs.push({
          documentType: 'Payment Receipt',
          documentName: '₹200 Statutory Membership Payment Screenshot',
          documentUrl: formData.paymentReceiptUrl,
          uploadedAt: new Date(),
        });
      }

      const documentPayload = {
        idProofType: formData.idProofType,
        idProofUrl: formData.idProofUrl,
        idProof: formData.idProofUrl,
        idProofFile: formData.idProofUrl,
        doc2_govId: formData.idProofUrl,
        addressProofType: formData.addressProofType,
        addressProofUrl: formData.addressProofUrl,
        addressProof: formData.addressProofUrl,
        addressProofFile: formData.addressProofUrl,
        photoUrl: formData.photoUrl,
        photo: formData.photoUrl,
        photoFile: formData.photoUrl,
        doc1_photo: formData.photoUrl,
        signatureUrl: formData.signatureUrl,
        signature: formData.signatureUrl,
        signatureFile: formData.signatureUrl,
        doc3_eduCert: formData.doc3_eduCert,
        doc4_birthCert: formData.doc4_birthCert,
        doc5_utility: formData.doc5_utility,
        paymentReceiptUrl: formData.paymentReceiptUrl,
        additionalDocuments: extraDocs,
      };

      const payload = {
        applicantName,
        title: formData.title,
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        relationshipPrefix: formData.relationshipPrefix,
        fatherLegalName: formData.fatherLegalName.trim(),
        dob: formData.dob,
        age: formData.age,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        category: formData.category,
        education: formData.education,
        occupation: formData.occupation,
        pan: formData.pan.toUpperCase().trim(),
        mobile: formData.mobile.trim(),
        altMobile: formData.altMobile.trim(),
        email: formData.email.toLowerCase().trim(),
        address1: formData.address1.trim(),
        villageTown: formData.villageTown.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        branch: formData.branch,
        introducer: formData.introducer.trim(),
        empId: formData.empId.trim(),
        nomineeName: formData.nomineeName.trim(),
        nomineeRel: formData.nomineeRel,
        nomineeDob: formData.nomineeDob,
        nomineeMobile: formData.nomineeMobile.trim(),
        nomineeAddr: formData.nomineeAddr.trim(),
        numberOfShares: Number(formData.numberOfShares),
        shareValue: Number(formData.shareValue),
        processingFee: Number(formData.processingFee),
        totalPaid: totalContribution,
        status: formData.status,

        // Direct top-level synchronized document fields
        idProofUrl: formData.idProofUrl,
        idProof: formData.idProofUrl,
        doc2_govId: formData.idProofUrl,
        idProofType: formData.idProofType,
        addressProofUrl: formData.addressProofUrl,
        addressProof: formData.addressProofUrl,
        addressProofType: formData.addressProofType,
        photoUrl: formData.photoUrl,
        photo: formData.photoUrl,
        doc1_photo: formData.photoUrl,
        signatureUrl: formData.signatureUrl,
        signature: formData.signatureUrl,
        doc3_eduCert: formData.doc3_eduCert,
        doc4_birthCert: formData.doc4_birthCert,
        doc5_utility: formData.doc5_utility,
        paymentReceiptUrl: formData.paymentReceiptUrl,

        // Synchronized Document & Payment structures
        documentDetails: documentPayload,
        documents: documentPayload,
        paymentDetails: {
          method: 'UPI (IndusInd Bank QR)',
          amount: 200,
          receiptUrl: formData.paymentReceiptUrl,
          receiptFileName: 'Payment_Receipt.png',
          utrNumber: 'UPI_PAYMENT_VERIFIED',
          paidAt: new Date(),
        },
        payment: {
          method: 'UPI (IndusInd Bank QR)',
          amount: 200,
          receiptUrl: formData.paymentReceiptUrl,
          receiptFileName: 'Payment_Receipt.png',
          utrNumber: 'UPI_PAYMENT_VERIFIED',
          paidAt: new Date(),
        },

        personalDetails: {
          title: formData.title,
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim(),
          lastName: formData.lastName.trim(),
          relationshipPrefix: formData.relationshipPrefix,
          fatherLegalName: formData.fatherLegalName.trim(),
          dob: formData.dob,
          age: formData.age,
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
          religion: formData.religion,
          category: formData.category,
          education: formData.education,
          occupation: formData.occupation,
          pan: formData.pan.toUpperCase().trim(),
        },
        contactDetails: {
          mobile: formData.mobile.trim(),
          altMobile: formData.altMobile.trim(),
          email: formData.email.toLowerCase().trim(),
        },
        addressDetails: {
          address1: formData.address1.trim(),
          villageTown: formData.villageTown.trim(),
          district: formData.district.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        nomineeDetails: {
          fullName: formData.nomineeName.trim(),
          relationship: formData.nomineeRel,
          dob: formData.nomineeDob,
          mobile: formData.nomineeMobile.trim(),
          address: formData.nomineeAddr.trim(),
        },
        membershipDetails: {
          branch: formData.branch,
          introducer: formData.introducer.trim(),
          empId: formData.empId.trim(),
          numberOfShares: Number(formData.numberOfShares),
          shareValue: Number(formData.shareValue),
          processingFee: Number(formData.processingFee),
          totalContribution: totalContribution,
        },
      };

      await onSave(application._id || application.id, payload);
      lastLoadedAppIdRef.current = null;
      onClose();
    } catch (err) {
      console.error('Error saving application:', err);
      setError(err.message || 'Failed to save application changes');
    } finally {
      setIsSaving(false);
    }
  };

  const renderDocumentCard = (title, typeKey, urlKey, allowedTypes, iconComponent, fallbackName) => {
    const rawUrl = formData[urlKey];
    const fullUrl = rawUrl ? getBackendAssetUrl(rawUrl) : '';
    const hasDoc = Boolean(fullUrl);
    const isUploading = Boolean(uploadingFields[urlKey]);
    const isPdf = typeof fullUrl === 'string' && (fullUrl.includes('.pdf') || fullUrl.startsWith('data:application/pdf'));

    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              {iconComponent}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase block truncate">
                {title}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {isUploading ? 'Uploading to server...' : hasDoc ? 'Document attached' : 'No document uploaded'}
              </span>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${
              isUploading
                ? 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse'
                : hasDoc
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-200/70 text-slate-500 border-slate-300'
            }`}
          >
            {isUploading ? 'Uploading...' : hasDoc ? 'Uploaded' : 'Empty'}
          </span>
        </div>

        {/* DOCUMENT TYPE SELECTOR (IF APPLICABLE) */}
        {allowedTypes && allowedTypes.length > 0 && (
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase">
              Statutory Proof Type
            </label>
            <select
              value={formData[typeKey] || allowedTypes[0]}
              onChange={(e) => handleChange(typeKey, e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:border-blue-600 focus:outline-none"
            >
              {allowedTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* THUMBNAIL / PREVIEW BOX */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 h-36 flex items-center justify-center overflow-hidden relative group">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center text-center space-y-2 p-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-[11px] font-bold text-blue-700">Uploading to server...</span>
              <span className="text-[9px] text-slate-400">Saving file to storage</span>
            </div>
          ) : hasDoc ? (
            isPdf ? (
              <div className="flex flex-col items-center justify-center text-center space-y-1 p-2">
                <FileText className="w-10 h-10 text-rose-500" />
                <span className="text-[11px] font-bold text-slate-700">PDF Document</span>
                <span className="text-[9px] text-slate-400 font-mono">Ready to view / download</span>
              </div>
            ) : (
              <img
                src={fullUrl}
                alt={title}
                className="max-h-full max-w-full object-contain rounded-lg transition-transform group-hover:scale-105"
              />
            )
          ) : (
            <div className="text-center space-y-1 text-slate-400">
              <Upload className="w-7 h-7 mx-auto opacity-40" />
              <span className="text-[10px] font-medium block">No file attached</span>
            </div>
          )}

          {hasDoc && !isUploading && (
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => setPreviewDoc({ title, url: fullUrl, type: title })}
                className="p-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                title="View Full Document"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 font-bold text-xs shadow-md transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS: UPLOAD / REPLACE & REMOVE */}
        <div className="flex items-center gap-2 pt-1">
          <label
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-bold text-xs transition-colors border ${
              isUploading
                ? 'bg-blue-100 text-blue-500 border-blue-200 cursor-not-allowed'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer border-blue-200'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>{hasDoc ? 'Replace File' : 'Upload File'}</span>
              </>
            )}
            <input
              type="file"
              accept="image/*,.pdf"
              disabled={isUploading}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(urlKey, e.target.files[0]);
                }
                e.target.value = '';
              }}
            />
          </label>

          {hasDoc && !isUploading && (
            <button
              type="button"
              onClick={() => handleChange(urlKey, '')}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors border border-slate-200 cursor-pointer"
              title="Remove document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleClose = () => {
    lastLoadedAppIdRef.current = null;
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[88vh] sm:max-h-[90vh] flex flex-col text-left overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. FIXED MODAL HEADER - ALWAYS AT THE VERY TOP */}
        <div className="bg-[#0b1c3d] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-blue-900/60 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-black text-blue-200 shrink-0">
              <User className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Edit Application Details
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {application.id || application.applicationId}
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Modify statutory member dossier particulars, review and replace uploaded documents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. FIXED STICKY QUICK-SECTION NAV BAR - ALWAYS UNDER HEADER */}
        <div className="bg-slate-50 border-b border-slate-200/90 px-4 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-xs z-10">
          <button
            type="button"
            onClick={() => scrollToSection('personal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'personal'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Personal</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('contact')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'contact'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>2. Contact</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('address')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'address'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>3. Address</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('branch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'branch'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>4. Branch</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('nominee')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'nominee'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>5. Nominee</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('shares')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'shares'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>6. Shares &amp; Fees</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('documents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'documents'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>7. Documents &amp; Uploads</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('status')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'status'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>8. Status</span>
          </button>
        </div>

        {/* ERROR NOTIFICATION BAR */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 3. SCROLLABLE FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 text-slate-800"
          >
            {/* SECTION 1: PERSONAL PARTICULARS */}
            <div id="edit-section-personal" className="space-y-3.5 scroll-mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-700" />
                <span>1. Personal &amp; Demographic Particulars</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Title
                  </label>
                  <select
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => handleChange('middleName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Relationship Type
                  </label>
                  <select
                    value={formData.relationshipPrefix}
                    onChange={(e) => handleChange('relationshipPrefix', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="S/o.">Son of (S/o.)</option>
                    <option value="D/o.">Daughter of (D/o.)</option>
                    <option value="W/o.">Wife of (W/o.)</option>
                    <option value="C/o.">Care of (C/o.)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Father / Husband / Guardian Legal Name
                  </label>
                  <input
                    type="text"
                    value={formData.fatherLegalName}
                    onChange={(e) => handleChange('fatherLegalName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Marital Status
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Married">Married</option>
                    <option value="Single">Single / Unmarried</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Religion
                  </label>
                  <select
                    value={formData.religion}
                    onChange={(e) => handleChange('religion', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Caste Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SEBC">SEBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Education
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CONTACT & PAN */}
            <div id="edit-section-contact" className="space-y-3.5 pt-4 border-t border-slate-200 scroll-mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Phone className="w-4 h-4 text-blue-700" />
                <span>2. Contact Particulars &amp; Income Tax PAN</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Primary Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Alternate Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.altMobile}
                    onChange={(e) => handleChange('altMobile', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Registered Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  Income Tax PAN Card Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.pan}
                  onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                  className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-700 uppercase focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* SECTION 3: RESIDENTIAL ADDRESS */}
            <div id="edit-section-address" className="space-y-3.5 pt-4 border-t border-slate-200 scroll-mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>3. Residential Address Particulars</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Address Line (House / Plot / Street)
                  </label>
                  <input
                    type="text"
                    value={formData.address1}
                    onChange={(e) => handleChange('address1', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Village / Town / City
                  </label>
                  <input
                    type="text"
                    value={formData.villageTown}
                    onChange={(e) => handleChange('villageTown', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Postal Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: BRANCH & INTRODUCER */}
            <div id="edit-section-branch" className="space-y-3.5 pt-4 border-t border-slate-200 scroll-mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>4. Registered Branch &amp; Associate Allocation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Assigned Branch
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => handleChange('branch', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Bhubaneswar HQ (Nayapalli, IRC Village)">Bhubaneswar HQ (Nayapalli, IRC Village)</option>
                    <option value="Cuttack Main Branch (Badambadi)">Cuttack Main Branch (Badambadi)</option>
                    <option value="Berhampur Regional Branch">Berhampur Regional Branch</option>
                    <option value="Rourkela Steel City Branch">Rourkela Steel City Branch</option>
                    <option value="Sambalpur Branch">Sambalpur Branch</option>
                    <option value="Balasore Branch">Balasore Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Associate / Introducer Name
                  </label>
                  <input
                    type="text"
                    value={formData.introducer}
                    onChange={(e) => handleChange('introducer', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Employee / Agent ID
                  </label>
                  <input
                    type="text"
                    value={formData.empId}
                    onChange={(e) => handleChange('empId', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: NOMINEE BENEFICIARY */}
            <div id="edit-section-nominee" className="space-y-3.5 pt-4 border-t border-slate-200 scroll-mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <span>5. Nominee Beneficiary Particulars</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Nominee Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeName}
                    onChange={(e) => handleChange('nomineeName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Relationship
                  </label>
                  <select
                    value={formData.nomineeRel}
                    onChange={(e) => handleChange('nomineeRel', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Spouse">Spouse (Wife / Husband)</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Nominee DOB
                  </label>
                  <input
                    type="date"
                    value={formData.nomineeDob}
                    onChange={(e) => handleChange('nomineeDob', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Nominee Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.nomineeMobile}
                    onChange={(e) => handleChange('nomineeMobile', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Nominee Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeAddr}
                    onChange={(e) => handleChange('nomineeAddr', e.target.value)}
                    placeholder="Same as applicant address or enter full address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: SHARE CAPITAL & FEES */}
            <div id="edit-section-shares" className="space-y-3.5 pt-4 border-t border-slate-200 scroll-mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <span>6. Statutory Equity Shareholding &amp; Fees</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Equity Shares Allotted
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={formData.numberOfShares}
                    onChange={(e) => handleChange('numberOfShares', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Face Value per Share (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.shareValue}
                    onChange={(e) => handleChange('shareValue', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Admission / Processing Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.processingFee}
                    onChange={(e) => handleChange('processingFee', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 flex flex-col justify-center">
                  <span className="block text-[10px] font-extrabold text-emerald-800 uppercase">
                    Total Consideration
                  </span>
                  <div className="text-base font-black text-emerald-900 font-mono mt-0.5">
                    ₹{Number(formData.numberOfShares) * Number(formData.shareValue) + Number(formData.processingFee)}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Admission Consideration</span>
                </div>
              </div>
            </div>

            {/* SECTION 7: UPLOADED DOCUMENTS & REVIEWS */}
            <div id="edit-section-documents" className="space-y-4 pt-4 border-t border-slate-200 scroll-mt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>7. Statutory Uploaded Documents &amp; Verification</span>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Review &amp; Replace Files
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Identity Proof */}
                {renderDocumentCard(
                  '1. Primary Govt ID Proof',
                  'idProofType',
                  'idProofUrl',
                  ['Aadhaar Card', 'PAN Card', 'Voter ID Card', 'Passport', 'Driving License'],
                  <UserCheck className="w-4 h-4" />
                )}

                {/* 2. Address Proof */}
                {renderDocumentCard(
                  '2. Address Proof Document',
                  'addressProofType',
                  'addressProofUrl',
                  ['Aadhaar Card', 'Electricity / Utility Bill', 'Bank Passbook / Statement', 'Ration Card', 'Rent Agreement', 'Passport'],
                  <MapPin className="w-4 h-4" />
                )}

                {/* 3. Applicant Photograph */}
                {renderDocumentCard(
                  '3. Applicant Photograph',
                  null,
                  'photoUrl',
                  null,
                  <ImageIcon className="w-4 h-4" />
                )}

                {/* 4. Signature Specimen */}
                {renderDocumentCard(
                  '4. Signature Specimen',
                  null,
                  'signatureUrl',
                  null,
                  <PenTool className="w-4 h-4" />
                )}

                {/* 5. Educational Certificate */}
                {renderDocumentCard(
                  '5. Educational Certificate',
                  null,
                  'doc3_eduCert',
                  null,
                  <FileText className="w-4 h-4" />
                )}

                {/* 6. Birth / PAN Certificate */}
                {renderDocumentCard(
                  '6. Birth / PAN Certificate',
                  null,
                  'doc4_birthCert',
                  null,
                  <FileCheck className="w-4 h-4" />
                )}

                {/* 7. Utility Bill / Passbook */}
                {renderDocumentCard(
                  '7. Electricity / Utility Bill',
                  null,
                  'doc5_utility',
                  null,
                  <Building2 className="w-4 h-4" />
                )}

                {/* 8. Payment Receipt Screenshot */}
                {renderDocumentCard(
                  '8. Payment Receipt (₹200)',
                  null,
                  'paymentReceiptUrl',
                  null,
                  <CreditCard className="w-4 h-4" />
                )}
              </div>

              {/* ADDITIONAL SUPPORTING ATTACHMENTS LIST IF PRESENT */}
              {Array.isArray(formData.additionalDocuments) && formData.additionalDocuments.length > 0 && (
                <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                  <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-700" />
                    <span>Other Supporting Uploaded Files ({formData.additionalDocuments.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formData.additionalDocuments.map((docItem, idx) => {
                      const rawUrl = docItem.documentUrl;
                      const fullUrl = rawUrl ? getBackendAssetUrl(rawUrl) : '';
                      return (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">{docItem.documentName || docItem.documentType || `Attachment #${idx + 1}`}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{docItem.documentType || 'Supporting Document'}</span>
                          </div>
                          {fullUrl && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewDoc({ title: docItem.documentName || 'Attachment', url: fullUrl, type: docItem.documentType })}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                title="View document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                title="Open original file"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 8: APPLICATION STATUS */}
            <div id="edit-section-status" className="space-y-3.5 pt-4 border-t border-slate-200 scroll-mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span>8. Application Review Status</span>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-2">
                  Select Statutory Decision Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleChange('status', 'pending')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formData.status === 'pending'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-black shadow-xs ring-2 ring-amber-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pending Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('status', 'approved')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formData.status === 'approved'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-black shadow-xs ring-2 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Approved</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('status', 'rejected')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formData.status === 'rejected'
                        ? 'bg-rose-100 border-rose-400 text-rose-900 font-black shadow-xs ring-2 ring-rose-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-700" />
                    <span>Rejected</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('status', 'correction_required')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formData.status === 'correction_required'
                        ? 'bg-blue-100 border-blue-400 text-blue-900 font-black shadow-xs ring-2 ring-blue-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-blue-700" />
                    <span>Correction Req.</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PINNED MODAL ACTIONS FOOTER - ALWAYS VISIBLE AT BOTTOM */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0 shadow-xs z-10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">
                {application.id || application.applicationId}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-extrabold uppercase text-slate-600">
                Status: <span className="font-bold text-slate-900 capitalize">{formData.status.replace('_', ' ')}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || Object.values(uploadingFields).some(Boolean)}
                className="px-6 py-2 rounded-xl bg-[#0b1c3d] hover:bg-blue-900 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving Changes...</span>
                  </>
                ) : Object.values(uploadingFields).some(Boolean) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>UPLOADING FILES...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SAVE CHANGES</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 5. LIGHTBOX MODAL FOR PREVIEWING DOCUMENTS FULLSCREEN */}
        {previewDoc && (
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none"
            onClick={() => setPreviewDoc(null)}
          >
            <div
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-5 w-[92vw] max-w-4xl h-[82vh] max-h-[85vh] flex flex-col justify-between space-y-3 text-left overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div>
                  <h3 className="text-base font-black text-slate-900">{previewDoc.title}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Applicant: {formData.firstName} {formData.lastName} ({application.applicationId || application.id})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewDoc.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl flex-1 flex items-center justify-center p-2 overflow-hidden">
                {previewDoc.url.startsWith('data:application/pdf') || previewDoc.url.includes('.pdf') ? (
                  <iframe
                    src={`${previewDoc.url}#toolbar=0`}
                    title="Document PDF"
                    className="w-full h-full rounded-xl bg-white"
                  />
                ) : (
                  <ZoomableImageViewer
                    src={previewDoc.url}
                    alt={previewDoc.title}
                    minZoom={0.5}
                    maxZoom={5.0}
                  />
                )}
              </div>

              <div className="flex items-center justify-end pt-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default EditApplicationModal;
