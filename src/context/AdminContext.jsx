import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { playNotificationSound } from '../utils/sound';
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
  deleteApplicationApi,
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
  ensureAdminToken,
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
    altMobile: c.alternateMobile || c.altMobile || app.altMobile || '',
    title: p.title || app.title || '',
    firstName: p.firstName || app.firstName || '',
    middleName: p.middleName || app.middleName || '',
    lastName: p.lastName || app.lastName || '',
    relationshipPrefix: p.relationshipPrefix || app.relationshipPrefix || '',
    fatherLegalName: p.fatherLegalName || p.guardianName || app.fatherLegalName || '',
    dob: p.dob || app.dob || '',
    age: p.age || app.age || '',
    gender: p.gender || app.gender || '',
    maritalStatus: p.maritalStatus || app.maritalStatus || '',
    religion: p.religion || app.religion || '',
    category: p.category || app.category || '',
    education: p.education || app.education || '',
    occupation: p.occupation || app.occupation || '',
    address1: a.address1 || app.address1 || '',
    address2: a.address2 || app.address2 || '',
    villageTown: a.villageTown || app.villageTown || '',
    district: a.district || app.district || 'Khurda',
    state: a.state || app.state || 'Odisha',
    pincode: a.pincode || app.pincode || '',
    sameAsResidential: a.sameAsResidential !== false,
    branch: a.district ? `${a.district} Branch` : app.branch || 'Bhubaneswar HQ (Nayapalli, IRC Village)',
    introducer: app.introducer || '',
    nomineeName: n.fullName || app.nomineeName || '',
    nomineeRel: n.relationship || app.nomineeRel || '',
    nomineeDob: n.dob || app.nomineeDob || '',
    nomineeAddr: n.address || app.nomineeAddr || '',
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
    photo: photoUrl,
    doc1_photo: photoUrl,
    signatureUrl,
    signatureFile: signatureUrl,
    signature: signatureUrl,
    doc3_eduCert,
    doc4_birthCert,
    doc5_utility,
    additionalDocuments,
    documentDetails: sanitizedDocDetails,
    documents: sanitizedDocDetails,
    witness1Name: w.witness1Name || app.witness1Name || '',
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep NUF-1035 unread so recently submitted user application shows notification
          return parsed.filter(
            (id) => id !== 'NUF-1035' && id !== '6acdc36075a70ae63beb0a27'
          );
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [newApplicationAlert, setNewApplicationAlert] = useState(null);
  const prevAppIdsRef = useRef(null);

  // Seed baseline application IDs on first run ONLY for pre-existing historical records (before NUF-1035)
  useEffect(() => {
    try {
      const isInitialized = localStorage.getItem('admin_seen_apps_seeded_v3');
      if (!isInitialized && applications.length > 0) {
        const historicalIds = [];
        applications.forEach((a) => {
          // Do NOT mark NUF-1035 as seen - it is a brand new application submitted by user!
          if (
            a.applicationId === 'NUF-1035' ||
            a._id === '6acdc36075a70ae63beb0a27' ||
            a.id === 'NUF-1035'
          ) {
            return;
          }
          if (a._id) historicalIds.push(String(a._id));
          if (a.id) historicalIds.push(String(a.id));
          if (a.applicationId) historicalIds.push(String(a.applicationId));
        });
        const uniqueIds = Array.from(new Set(historicalIds));
        setSeenApplicationIds(uniqueIds);
        localStorage.setItem('admin_seen_application_ids', JSON.stringify(uniqueIds));
        localStorage.setItem('admin_seen_apps_seeded_v3', 'true');
      }
    } catch (e) {}
  }, [applications]);

  const clearNewApplicationAlert = useCallback(() => {
    setNewApplicationAlert(null);
  }, []);

  // Detect newly submitted applications in real time and trigger notification
  useEffect(() => {
    if (!applications || applications.length === 0) return;

    const currentIds = new Set(
      applications.map((a) => String(a._id || a.id || a.applicationId))
    );

    // Initial mount - record baseline IDs without firing toast
    if (prevAppIdsRef.current === null) {
      prevAppIdsRef.current = currentIds;
      return;
    }

    // Check for newly added applications
    const newlyAdded = applications.filter((a) => {
      const id = String(a._id || a.id || a.applicationId);
      return !prevAppIdsRef.current.has(id);
    });

    if (newlyAdded.length > 0) {
      const latest = newlyAdded[0];
      const s = (latest.status || '').toLowerCase();
      if (s === 'pending' || s === 'submitted' || !s) {
        setNewApplicationAlert({
          id: latest._id || latest.id || latest.applicationId,
          applicationId: latest.applicationId || latest.id,
          applicantName: latest.applicantName || 'New Applicant',
          mobile: latest.mobile || '',
          email: latest.email || '',
          amount: latest.totalPaid || latest.paymentDetails?.amount || 200,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Play gentle audio chime
        playNotificationSound();
      }
    }

    prevAppIdsRef.current = currentIds;
  }, [applications]);

  const markAllApplicationsAsSeen = useCallback(() => {
    const allIds = [];
    applications.forEach((a) => {
      if (a._id) allIds.push(String(a._id));
      if (a.id) allIds.push(String(a.id));
      if (a.applicationId) allIds.push(String(a.applicationId));
    });

    setSeenApplicationIds((prev) => {
      const prevStrings = prev.map(String);
      const combined = Array.from(new Set([...prevStrings, ...allIds]));
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

  const pendingAppsCount = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    return s === 'pending' || s === 'submitted' || s === 'payment' || s === 'correction required' || s === 'correction_required' || s === 'under review' || s === 'under_review';
  }).length;

  // Counts strictly genuine newly submitted applications that haven't been opened by admin yet
  const unreadPendingAppsCount = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    const isPending = s === 'pending' || s === 'submitted' || !s;
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

  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);

  const refreshData = useCallback(async (force = false) => {
    // Prevent overlapping simultaneous requests
    if (isRefreshingRef.current) return;
    const now = Date.now();
    if (!force && now - lastRefreshTimeRef.current < 10000) return;

    isRefreshingRef.current = true;
    lastRefreshTimeRef.current = now;

    try {
      const [appsRes, membersRes, paymentsRes] = await Promise.allSettled([
        getApplicationsApi(),
        getMembersApi(),
        getPaymentsApi(),
      ]);

      let currentApps = [];
      if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value)) {
        currentApps = appsRes.value.map(normalizeApplication);
        setApplications(currentApps);
      } else {
        currentApps = getApplications().map(normalizeApplication);
        setApplications(currentApps);
      }

      if (membersRes.status === 'fulfilled' && Array.isArray(membersRes.value)) {
        setMembers(membersRes.value);
      } else {
        setMembers(getMembers());
      }

      if (paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value)) {
        setPayments(paymentsRes.value);
      } else {
        setPayments(getPayments(currentApps));
      }
    } catch (err) {
      console.warn('Concurrent refresh error:', err?.message);
    } finally {
      isRefreshingRef.current = false;
    }

    setDeposits(getDeposits());
    setTransactions(getTransactions());
    setNotices(getNotices());
  }, []);

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await getDocumentsApi();
      if (Array.isArray(docs)) {
        setDocuments(docs);
        try {
          sessionStorage.setItem('admin_documents_cache', JSON.stringify(docs));
        } catch (e) {}
        return docs;
      }
    } catch (err) {
      console.warn('Documents refresh notice:', err?.message);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshData(true);

    const handleStorageChange = () => {
      refreshData();
      setIsAuthenticated(isAdminAuthenticated());
      try {
        const saved = localStorage.getItem('admin_seen_application_ids');
        if (saved) setSeenApplicationIds(JSON.parse(saved));
      } catch (e) {}
    };

    const handleWindowFocus = () => {
      // Throttle window focus refresh to at most once per 20 seconds
      if (Date.now() - lastRefreshTimeRef.current > 20000) {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);

    // Auto poll backend every 30 seconds for new submissions (sensible interval)
    const pollInterval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(pollInterval);
    };
  }, [refreshData]);

  // Ensure admin JWT token is active whenever admin session is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      ensureAdminToken().catch(() => {});
    }
  }, [isAuthenticated]);

  const loginAdmin = (email, password, token = null) => {
    const res = authAdminLogin(email, password, token);
    if (res.success) {
      setIsAuthenticated(true);
    }
    return res;
  };

  const logoutAdmin = () => {
    authAdminLogout();
    setIsAuthenticated(false);
  };

  const updateApplicationStatus = async (idOrMongoId, newStatus, role = null) => {
    const target = applications.find(
      (a) => a._id === idOrMongoId || a.id === idOrMongoId || a.applicationId === idOrMongoId
    );

    const mongoId = target?._id || idOrMongoId;
    const targetStatus = newStatus.toLowerCase();

    // Call API: PATCH http://localhost:5000/api/applications/${mongoId}/status
    const apiResult = await updateApplicationStatusApi(mongoId, targetStatus, role);

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

    // Refresh data in background without blocking the UI approval modal
    refreshData().catch((err) => console.warn('Background refresh error:', err?.message));
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

  const deleteApplication = async (idOrMongoId) => {
    const target = applications.find(
      (a) => a._id === idOrMongoId || a.id === idOrMongoId || a.applicationId === idOrMongoId
    );
    const mongoId = target?._id || idOrMongoId;

    const apiResult = await deleteApplicationApi(mongoId);

    // Remove from in-memory state immediately
    setApplications((prev) =>
      prev.filter((app) => app._id !== mongoId && app.id !== idOrMongoId && app.applicationId !== idOrMongoId)
    );

    // Refresh remaining state in background
    refreshData().catch((err) => console.warn('Background refresh error after deletion:', err?.message));
    return apiResult;
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
        deleteApplication,
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
        refreshDocuments,
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
        newApplicationAlert,
        clearNewApplicationAlert,
        seenApplicationIds,
        pendingAppsCount,
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

