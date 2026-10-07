import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getApplications,
  getMembers,
  getDocuments,
  updateApplicationStatus as storageUpdateApplicationStatus,
  updateApplicationRecord as storageUpdateApplicationRecord,
  updateMemberStatus as storageUpdateMemberStatus,
} from '../utils/storage';
import {
  getApplicationsApi,
  getDocumentsApi,
  updateApplicationStatusApi,
  updateApplicationApi,
  resendCredentialsApi,
} from '../services/applicationService';
import {
  getMembersApi,
  updateMemberStatusApi,
} from '../services/memberService';
import {
  getPaymentsApi,
  createPaymentApi,
  updatePaymentApi,
  verifyPaymentApi,
  refundPaymentApi,
} from '../services/paymentService';
import {
  isAdminAuthenticated,
  adminLogin as authAdminLogin,
  adminLogout as authAdminLogout,
} from '../auth/adminAuth';
import {
  getDeposits,
  addDeposit as storageAddDeposit,
  updateDeposit as storageUpdateDeposit,
  updateDepositStatus as storageUpdateDepositStatus,
} from '../utils/depositStorage';
import {
  getPayments,
  addPayment as storageAddPayment,
  updatePayment as storageUpdatePayment,
  verifyPayment as storageVerifyPayment,
  refundPayment as storageRefundPayment,
} from '../utils/paymentStorage';
import {
  getTransactions,
  addTransaction as storageAddTransaction,
  updateTransaction as storageUpdateTransaction,
} from '../utils/transactionStorage';
import {
  getNotices,
  addNotice as storageAddNotice,
  updateNotice as storageUpdateNotice,
  publishNotice as storagePublishNotice,
  archiveNotice as storageArchiveNotice,
  deleteNotice as storageDeleteNotice,
} from '../utils/noticeStorage';
import {
  INITIAL_GALLERY,
  INITIAL_TEAM,
} from '../data/adminMockData';

const AdminContext = createContext();

function normalizeApplication(app) {
  const p = app.personalDetails || app.personal || {};
  const c = app.contactDetails || app.account || {};
  const a = app.addressDetails || app.address || {};
  const n = app.nomineeDetails || app.nominee || {};
  const m = app.membershipDetails || app.shares || {};
  const doc = app.documentDetails || app.documents || {};
  const w = app.witnessDetails || app.witness || {};
  const d = app.declarationDetails || app.declaration || {};

  const nameParts = [p.title || app.title, p.firstName || app.firstName, p.middleName || app.middleName, p.lastName || app.lastName].filter(Boolean);
  const applicantName = nameParts.length > 0
    ? nameParts.join(' ')
    : app.applicantName || 'Applicant';

  const pay = app.paymentDetails || app.payment || {};
  const paymentReceiptUrl =
    pay.receiptUrl ||
    doc.paymentReceiptUrl ||
    app.paymentReceiptUrl ||
    (Array.isArray(doc.additionalDocuments)
      ? doc.additionalDocuments.find((d) => d.documentType === 'Payment Receipt')?.documentUrl
      : '') ||
    '';

  const paymentReceiptName =
    pay.receiptFileName ||
    (paymentReceiptUrl ? 'UPI_Payment_Receipt.png' : '');

  const paymentMethod =
    pay.method ||
    app.paymentMethod ||
    'UPI (IndusInd Bank Scan & Pay)';

  const utrNo =
    pay.utrNumber ||
    pay.utr ||
    app.utrNo ||
    'UPI_VERIFIED';

  const idProofUrl =
    app.idProofUrl ||
    doc.idProofUrl ||
    doc.idProof ||
    doc.doc2_govId ||
    app.doc2_govId ||
    app.idProof ||
    (typeof doc.idProofFile === 'string' ? doc.idProofFile : '') ||
    (typeof app.idProofFile === 'string' ? app.idProofFile : '') ||
    (typeof doc.idProofFile?.previewUrl === 'string' ? doc.idProofFile.previewUrl : '') ||
    (typeof doc.idProofFile?.dataUrl === 'string' ? doc.idProofFile.dataUrl : '') ||
    '';

  const addressProofUrl =
    app.addressProofUrl ||
    doc.addressProofUrl ||
    doc.addressProof ||
    app.addressProof ||
    (typeof doc.addressProofFile === 'string' ? doc.addressProofFile : '') ||
    (typeof app.addressProofFile === 'string' ? app.addressProofFile : '') ||
    (typeof doc.addressProofFile?.previewUrl === 'string' ? doc.addressProofFile.previewUrl : '') ||
    (typeof doc.addressProofFile?.dataUrl === 'string' ? doc.addressProofFile.dataUrl : '') ||
    '';

  const photoUrl =
    app.photoUrl ||
    doc.photoUrl ||
    doc.photo ||
    doc.doc1_photo ||
    app.doc1_photo ||
    (typeof doc.photoFile === 'string' ? doc.photoFile : '') ||
    (typeof app.photoFile === 'string' ? app.photoFile : '') ||
    (typeof doc.photoFile?.previewUrl === 'string' ? doc.photoFile.previewUrl : '') ||
    (typeof doc.photoFile?.dataUrl === 'string' ? doc.photoFile.dataUrl : '') ||
    '';

  const signatureUrl =
    app.signatureUrl ||
    doc.signatureUrl ||
    doc.signature ||
    (typeof doc.signatureFile === 'string' ? doc.signatureFile : '') ||
    (typeof app.signatureFile === 'string' ? app.signatureFile : '') ||
    (typeof doc.signatureFile?.previewUrl === 'string' ? doc.signatureFile.previewUrl : '') ||
    (typeof doc.signatureFile?.dataUrl === 'string' ? doc.signatureFile.dataUrl : '') ||
    '';

  const doc3_eduCert =
    doc.doc3_eduCert ||
    app.doc3_eduCert ||
    (Array.isArray(doc.additionalDocuments)
      ? doc.additionalDocuments.find((d) => d.documentType === 'Educational Certificate')?.documentUrl
      : '') ||
    '';

  const doc4_birthCert =
    doc.doc4_birthCert ||
    app.doc4_birthCert ||
    (Array.isArray(doc.additionalDocuments)
      ? doc.additionalDocuments.find((d) => d.documentType === 'Birth / PAN Certificate' || d.documentType === 'Birth Certificate')?.documentUrl
      : '') ||
    '';

  const doc5_utility =
    doc.doc5_utility ||
    app.doc5_utility ||
    (Array.isArray(doc.additionalDocuments)
      ? doc.additionalDocuments.find((d) => d.documentType === 'Financial / Utility Document' || d.documentType === 'Utility Bill')?.documentUrl
      : '') ||
    '';

  const additionalDocuments = Array.isArray(doc.additionalDocuments)
    ? doc.additionalDocuments
    : (Array.isArray(app.additionalDocuments) ? app.additionalDocuments : []);

  const sanitizedDocDetails = {
    ...doc,
    idProofType: doc.idProofType || app.idProofType || 'Aadhaar Card',
    idProofUrl: idProofUrl,
    idProofFile: idProofUrl,
    idProof: idProofUrl,
    doc2_govId: idProofUrl,
    addressProofType: doc.addressProofType || app.addressProofType || 'Aadhaar Card',
    addressProofUrl: addressProofUrl,
    addressProofFile: addressProofUrl,
    addressProof: addressProofUrl,
    photoUrl: photoUrl,
    photoFile: photoUrl,
    signatureUrl: signatureUrl,
    signatureFile: signatureUrl,
    doc3_eduCert: doc3_eduCert,
    doc4_birthCert: doc4_birthCert,
    doc5_utility: doc5_utility,
    paymentReceiptUrl: paymentReceiptUrl,
    additionalDocuments: additionalDocuments,
  };

  return {
    ...app,
    _id: app._id || app.id,
    id: app.applicationId || app.id || app._id,
    applicationId: app.applicationId || app.id,
    refId: app.refId || `APP-2026-${app._id ? app._id.slice(-4) : '1001'}`,
    memberId: app.memberId || (app.status === 'approved' || app.status === 'Approved' ? `UF-2026-${app._id ? app._id.slice(-4) : '6001'}` : ''),
    empId: app.empId || `EMP-2026-${app._id ? app._id.slice(-4) : '6001'}`,
    applicantName,
    email: c.email || app.email || '',
    mobile: c.mobile || app.mobile || '',
    altMobile: app.altMobile || '9437112233',
    title: p.title || app.title || 'Mr.',
    firstName: p.firstName || app.firstName || '',
    middleName: p.middleName || app.middleName || '',
    lastName: p.lastName || app.lastName || '',
    relationshipPrefix: p.relationshipPrefix || app.relationshipPrefix || 'S/o.',
    fatherLegalName: p.fatherLegalName || app.fatherLegalName || 'Legal Guardian',
    dob: p.dob || app.dob || '1996-06-20',
    age: p.age || app.age || '30',
    gender: p.gender || app.gender || 'Male',
    maritalStatus: p.maritalStatus || app.maritalStatus || 'Married',
    religion: p.religion || app.religion || 'Hindu',
    category: p.category || app.category || 'General',
    education: p.education || app.education || 'Graduate / P.G.',
    occupation: p.occupation || app.occupation || 'Business',
    address1: a.address1 || app.address1 || 'Plot 214, Saheed Nagar',
    villageTown: a.villageTown || app.villageTown || 'Bhubaneswar',
    district: a.district || app.district || 'Khurda',
    state: a.state || app.state || 'Odisha',
    pincode: a.pincode || app.pincode || '751007',
    sameAsResidential: a.sameAsResidential !== false,
    branch: a.district ? `${a.district} Branch` : app.branch || 'Bhubaneswar HQ (Nayapalli, IRC Village)',
    introducer: app.introducer || 'Pradeep Kumar Jena',
    nomineeName: n.fullName || app.nomineeName || 'Nominee Beneficiary',
    nomineeRel: n.relationship || app.nomineeRel || 'Spouse',
    nomineeDob: n.dob || app.nomineeDob || '1998-04-15',
    nomineeAddr: n.address || app.nomineeAddr || 'Same as Applicant Address',
    numberOfShares: m.numberOfShares || app.numberOfShares || 10,
    shareValue: m.shareValue || app.shareValue || 10,
    processingFee: m.processingFee || app.processingFee || 100,
    totalPaid: pay.amount || m.totalContribution || app.totalPaid || 200,
    idProofType: doc.idProofType || app.idProofType || 'Aadhaar Card',
    addressProofType: doc.addressProofType || app.addressProofType || 'Aadhaar Card',
    idProofUrl,
    idProofFile: idProofUrl,
    idProof: idProofUrl,
    doc2_govId: idProofUrl,
    addressProofUrl,
    addressProofFile: addressProofUrl,
    addressProof: addressProofUrl,
    photoUrl,
    photoFile: photoUrl,
    signatureUrl,
    signatureFile: signatureUrl,
    doc3_eduCert,
    doc4_birthCert,
    doc5_utility,
    additionalDocuments,
    documentDetails: sanitizedDocDetails,
    documents: sanitizedDocDetails,
    witness1Name: w.witness1Name || app.witness1Name || 'Rajesh Kumar Swain',
    witness1Mobile: w.witness1Mobile || app.witness1Mobile || '9861001122',
    witness1Address: w.witness1Address || app.witness1Address || 'Bhubaneswar, Odisha',
    witness2Name: w.witness2Name || app.witness2Name || 'Manas Ranjan Rout',
    witness2Mobile: w.witness2Mobile || app.witness2Mobile || '9437889900',
    witness2Address: w.witness2Address || app.witness2Address || 'Cuttack, Odisha',
    sigName: d.signatureName || app.sigName || applicantName,
    declarationDate: d.declarationDate || app.declarationDate || new Date().toISOString().split('T')[0],
    paymentMethod,
    utrNo,
    receiptNo: app.receiptNo || 'REC-2026-1001',
    paymentReceiptUrl,
    paymentReceiptName,
    paymentDetails: {
      ...pay,
      receiptUrl: paymentReceiptUrl,
      receiptFileName: paymentReceiptName,
      method: paymentMethod,
      utrNumber: utrNo,
      amount: pay.amount || m.totalContribution || app.totalPaid || 200,
    },
    date: app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : app.date || 'Today',
    status: app.status || 'pending',
    createdAt: app.createdAt || new Date().toISOString(),
  };
}

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return isAdminAuthenticated();
  });

  const [adminUser, setAdminUser] = useState({
    name: 'Administrator',
    email: 'admin@newutkalfinance.com',
    phone: '+91 98610 00000',
    role: 'Chief Administrator',
    branch: 'Bhubaneswar HQ (Nayapalli, IRC Village)',
    lastLogin: 'Today at 10:45 AM',
  });

  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notices, setNotices] = useState([]);
  const [galleryItems, setGalleryItems] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_gallery_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load gallery items from storage:', e);
    }
    return INITIAL_GALLERY;
  });

  // Sync galleryItems to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('admin_gallery_items', JSON.stringify(galleryItems));
    } catch (e) {
      console.warn('Failed to save gallery items to storage:', e);
    }
  }, [galleryItems]);
  const [teamMembers, setTeamMembers] = useState(INITIAL_TEAM);
  const [seenApplicationIds, setSeenApplicationIds] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_seen_application_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const markAllApplicationsAsSeen = useCallback(() => {
    const allPendingIds = [];
    applications.forEach((a) => {
      const s = (a.status || '').toLowerCase();
      if (s === 'pending' || s === 'submitted' || s === 'correction required' || s === 'correction_required') {
        if (a._id) allPendingIds.push(String(a._id));
        if (a.id) allPendingIds.push(String(a.id));
        if (a.applicationId) allPendingIds.push(String(a.applicationId));
      }
    });

    setSeenApplicationIds((prev) => {
      const prevStrings = prev.map(String);
      const combined = Array.from(new Set([...prevStrings, ...allPendingIds]));
      try {
        localStorage.setItem('admin_seen_application_ids', JSON.stringify(combined));
      } catch (e) { }
      return combined;
    });
  }, [applications]);

  const markApplicationAsSeen = useCallback((appId) => {
    if (!appId) return;
    const strId = String(appId);
    setSeenApplicationIds((prev) => {
      if (prev.map(String).includes(strId)) return prev;
      const updated = [...prev, strId];
      try {
        localStorage.setItem('admin_seen_application_ids', JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  }, []);

  const unreadPendingAppsCount = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    const isPending = s === 'pending' || s === 'submitted' || s === 'correction required' || s === 'correction_required';
    if (!isPending) return false;

    const ids = [a._id, a.id, a.applicationId].filter(Boolean).map(String);
    if (ids.length === 0) return false;
    const hasBeenSeen = ids.some((id) => seenApplicationIds.map(String).includes(id));
    return !hasBeenSeen;
  }).length;

  const [seenNoticeIds, setSeenNoticeIds] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_seen_notice_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const markAllNoticesAsSeen = useCallback(() => {
    const allNoticeIds = [];
    notices.forEach((n) => {
      const s = (n.status || '').toLowerCase();
      if (s === 'published' || s === 'active') {
        if (n._id) allNoticeIds.push(String(n._id));
        if (n.id) allNoticeIds.push(String(n.id));
      }
    });

    setSeenNoticeIds((prev) => {
      const prevStrings = prev.map(String);
      const combined = Array.from(new Set([...prevStrings, ...allNoticeIds]));
      try {
        localStorage.setItem('admin_seen_notice_ids', JSON.stringify(combined));
      } catch (e) { }
      return combined;
    });
  }, [notices]);

  const markNoticeAsSeen = useCallback((noticeId) => {
    if (!noticeId) return;
    const strId = String(noticeId);
    setSeenNoticeIds((prev) => {
      if (prev.map(String).includes(strId)) return prev;
      const updated = [...prev, strId];
      try {
        localStorage.setItem('admin_seen_notice_ids', JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  }, []);

  const unreadNoticesCount = notices.filter((n) => {
    const s = (n.status || '').toLowerCase();
    const isActive = s === 'published' || s === 'active';
    if (!isActive) return false;

    const ids = [n._id, n.id].filter(Boolean).map(String);
    if (ids.length === 0) return false;
    const hasBeenSeen = ids.some((id) => seenNoticeIds.map(String).includes(id));
    return !hasBeenSeen;
  }).length;

  const refreshData = useCallback(async () => {
    let currentApps = [];
    try {
      const apiApps = await getApplicationsApi();
      if (Array.isArray(apiApps)) {
        currentApps = apiApps.map(normalizeApplication);
        setApplications(currentApps);
      } else {
        currentApps = getApplications().map(normalizeApplication);
        setApplications(currentApps);
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to local storage:', err.message);
      currentApps = getApplications().map(normalizeApplication);
      setApplications(currentApps);
    }

    try {
      const apiDocs = await getDocumentsApi();
      if (Array.isArray(apiDocs)) {
        setDocuments(apiDocs);
      } else {
        setDocuments(getDocuments());
      }
    } catch (err) {
      console.warn('API documents fetch failed, falling back to local storage:', err.message);
      setDocuments(getDocuments());
    }

    try {
      const apiMembers = await getMembersApi();
      if (Array.isArray(apiMembers)) {
        setMembers(apiMembers);
      } else {
        setMembers(getMembers());
      }
    } catch (err) {
      console.warn('API members fetch failed, falling back to local storage:', err.message);
      setMembers(getMembers());
    }

    try {
      const apiPayments = await getPaymentsApi();
      if (Array.isArray(apiPayments)) {
        setPayments(apiPayments);
      } else {
        setPayments(getPayments(currentApps));
      }
    } catch (err) {
      console.warn('API payments fetch failed, falling back to local storage:', err.message);
      setPayments(getPayments(currentApps));
    }

    setDeposits(getDeposits());
    setTransactions(getTransactions());
    setNotices(getNotices());
  }, []);

  useEffect(() => {
    refreshData();

    const handleStorageChange = () => {
      refreshData();
      setIsAuthenticated(isAdminAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', refreshData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', refreshData);
    };
  }, [refreshData]);

  const loginAdmin = (email, password) => {
    const res = authAdminLogin(email, password);
    if (res.success) {
      setIsAuthenticated(true);
    }
    return res;
  };

  const logoutAdmin = () => {
    authAdminLogout();
    setIsAuthenticated(false);
  };

  const updateApplicationStatus = async (idOrMongoId, newStatus) => {
    const target = applications.find(
      (a) => a._id === idOrMongoId || a.id === idOrMongoId || a.applicationId === idOrMongoId
    );

    const mongoId = target?._id || idOrMongoId;
    const targetStatus = newStatus.toLowerCase();

    // Call API: PATCH http://localhost:5000/api/applications/${mongoId}/status
    const apiResult = await updateApplicationStatusApi(mongoId, targetStatus);

    // Update local state without full page reload
    const updatedDoc = apiResult.application || {};
    const updatedApps = applications.map((app) => {
      if (app._id === mongoId || app.id === idOrMongoId || app.applicationId === idOrMongoId) {
        return normalizeApplication({
          ...app,
          ...updatedDoc,
          status: updatedDoc.status || targetStatus,
        });
      }
      return app;
    });

    setApplications(updatedApps);
    storageUpdateApplicationStatus(target?.id || idOrMongoId, newStatus);

    // Sync payments so the newly approved application immediately appears in the Admin Payments Page
    const freshPayments = getPayments(updatedApps);
    setPayments(freshPayments);

    await refreshData();
    window.dispatchEvent(new Event('storage'));
    return apiResult;
  };

  const updateApplication = async (idOrMongoId, updatedData) => {
    const target = applications.find(
      (a) => a._id === idOrMongoId || a.id === idOrMongoId || a.applicationId === idOrMongoId
    );

    const mongoId = target?._id || idOrMongoId;

    let apiResult = null;
    try {
      apiResult = await updateApplicationApi(mongoId, updatedData);
    } catch (err) {
      console.warn('API update failed, applying storage fallback:', err.message);
    }

    const updatedDoc = apiResult?.application || {};

    // Update local state without full page reload
    setApplications((prev) =>
      prev.map((app) => {
        if (app._id === mongoId || app.id === idOrMongoId || app.applicationId === idOrMongoId) {
          return normalizeApplication({
            ...app,
            ...updatedData,
            ...updatedDoc,
          });
        }
        return app;
      })
    );

    const storageResult = storageUpdateApplicationRecord(target?.id || idOrMongoId, updatedData);
    await refreshData();
    return apiResult || { success: true, application: storageResult };
  };

  const updateMemberStatus = async (id, newStatus) => {
    try {
      await updateMemberStatusApi(id, newStatus);
    } catch (err) {
      console.warn('API member status update failed:', err.message);
    }
    storageUpdateMemberStatus(id, newStatus);
    await refreshData();
  };

  const resendCredentials = async (idOrMongoId) => {
    const target = applications.find(
      (a) => a._id === idOrMongoId || a.id === idOrMongoId || a.applicationId === idOrMongoId
    );
    const mongoId = target?._id || idOrMongoId;
    const apiResult = await resendCredentialsApi(mongoId);
    await refreshData();
    return apiResult;
  };

  const createNewDeposit = (depositData) => {
    const created = storageAddDeposit(depositData);
    refreshData();
    return created;
  };

  const updateDepositRecord = (id, updatedFields) => {
    const updated = storageUpdateDeposit(id, updatedFields);
    refreshData();
    return updated;
  };

  const updateDepositStatus = (id, newStatus) => {
    storageUpdateDepositStatus(id, newStatus);
    refreshData();
  };

  const createNewPayment = async (paymentData) => {
    let created = null;
    try {
      created = await createPaymentApi(paymentData);
    } catch (err) {
      console.warn('API create payment failed, applying storage fallback:', err.message);
      created = storageAddPayment(paymentData);
    }
    await refreshData();
    return created;
  };

  const updatePaymentRecord = async (id, updatedFields) => {
    let updated = null;
    try {
      updated = await updatePaymentApi(id, updatedFields);
    } catch (err) {
      console.warn('API update payment failed, applying storage fallback:', err.message);
      updated = storageUpdatePayment(id, updatedFields);
    }
    await refreshData();
    return updated;
  };

  const verifyPaymentRecord = async (id) => {
    let updated = null;
    try {
      updated = await verifyPaymentApi(id);
    } catch (err) {
      console.warn('API verify payment failed, applying storage fallback:', err.message);
      updated = storageVerifyPayment(id);
    }
    await refreshData();
    return updated;
  };

  const refundPaymentRecord = async (id) => {
    let updated = null;
    try {
      updated = await refundPaymentApi(id);
    } catch (err) {
      console.warn('API refund payment failed, applying storage fallback:', err.message);
      updated = storageRefundPayment(id);
    }
    await refreshData();
    return updated;
  };

  const createNewTransaction = (transactionData) => {
    const created = storageAddTransaction(transactionData);
    refreshData();
    return created;
  };

  const updateTransactionRecord = (id, updatedFields) => {
    const updated = storageUpdateTransaction(id, updatedFields);
    refreshData();
    return updated;
  };

  const verifyDocument = (id, newStatus) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: newStatus } : doc))
    );
  };

  // Notices CRUD
  const createNewNotice = (noticeData) => {
    const created = storageAddNotice(noticeData);
    refreshData();
    return created;
  };

  const updateNoticeRecord = (id, updatedFields) => {
    const updated = storageUpdateNotice(id, updatedFields);
    refreshData();
    return updated;
  };

  const publishNoticeRecord = (id) => {
    const updated = storagePublishNotice(id);
    refreshData();
    return updated;
  };

  const archiveNoticeRecord = (id) => {
    const updated = storageArchiveNotice(id);
    refreshData();
    return updated;
  };

  const deleteNoticeRecord = (id) => {
    const res = storageDeleteNotice(id);
    refreshData();
    return res;
  };

  const addNotice = (notice) => createNewNotice(notice);
  const updateNotice = (id, updated) => updateNoticeRecord(id, updated);
  const deleteNotice = (id) => deleteNoticeRecord(id);

  // Gallery CRUD
  const addGalleryItem = (item) => {
    const newItem = {
      ...item,
      id: `GAL-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setGalleryItems((prev) => [newItem, ...prev]);
  };

  const updateGalleryItem = (id, updated) => {
    setGalleryItems((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGalleryItem = (id) => {
    setGalleryItems((prev) => prev.filter((g) => g.id !== id));
  };

  // Team CRUD
  const addTeamMember = (member) => {
    const newMember = {
      ...member,
      id: `TM-${Date.now()}`,
    };
    setTeamMembers((prev) => [newMember, ...prev]);
  };

  const updateTeamMember = (id, updated) => {
    setTeamMembers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTeamMember = (id) => {
    setTeamMembers((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        setAdminUser,
        loginAdmin,
        logoutAdmin,
        applications,
        members,
        payments,
        documents,
        deposits,
        transactions,
        notices,
        galleryItems,
        teamMembers,
        updateApplication,
        updateApplicationStatus,
        resendCredentials,
        updateMemberStatus,
        createNewDeposit,
        updateDepositRecord,
        updateDepositStatus,
        createNewPayment,
        updatePaymentRecord,
        verifyPaymentRecord,
        refundPaymentRecord,
        createNewTransaction,
        updateTransactionRecord,
        refreshData,
        verifyDocument,
        createNewNotice,
        updateNoticeRecord,
        publishNoticeRecord,
        archiveNoticeRecord,
        deleteNoticeRecord,
        addNotice,
        updateNotice,
        deleteNotice,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        seenApplicationIds,
        unreadPendingAppsCount,
        markAllApplicationsAsSeen,
        markApplicationAsSeen,
        seenNoticeIds,
        unreadNoticesCount,
        markAllNoticesAsSeen,
        markNoticeAsSeen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

