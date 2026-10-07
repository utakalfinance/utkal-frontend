import { INITIAL_APPLICATIONS } from '../data/adminMockData';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const APPLICATIONS_KEY = 'applications';
const ADMIN_SESSION_KEY = 'adminSession';

/**
 * Utility helper to safely parse JSON from localStorage
 */
function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

/**
 * Utility helper to save JSON to localStorage
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// ==========================================
// 1. USER MANAGEMENT
// ==========================================

export function getUsers() {
  return getItem(USERS_KEY, []);
}

export function registerUser({ name, email, password }) {
  const users = getUsers();
  const existingUser = users.find(
    (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    // If user already exists with matching credentials, log them in
    if (existingUser.password === password) {
      return loginUser(email, password);
    }
    throw new Error('An account with this email address already exists. Please log in.');
  }

  const nextNum = users.length + 1;
  const id = `user-${String(nextNum).padStart(3, '0')}`;

  const newUser = {
    id,
    name: name || email.split('@')[0],
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setItem(USERS_KEY, users);

  // Set currentUser session
  const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email };
  setItem(CURRENT_USER_KEY, sessionUser);

  return sessionUser;
}

export function loginUser(email, password) {
  const users = getUsers();
  let user = users.find(
    (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    // Auto-create user for demo convenience if registering via login form
    return registerUser({ name: email.split('@')[0], email, password });
  }

  if (user.password && user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email };
  setItem(CURRENT_USER_KEY, sessionUser);
  return sessionUser;
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  return getItem(CURRENT_USER_KEY, null);
}

// ==========================================
// 2. APPLICATION MANAGEMENT
// ==========================================

export function getApplications() {
  const apps = getItem(APPLICATIONS_KEY, []);
  const mockIds = new Set(['NUF-10231', 'NUF-10230', 'NUF-10229', 'NUF-10228', 'NUF-10227']);
  const validApps = Array.isArray(apps) ? apps.filter((a) => !mockIds.has(a.id) && !mockIds.has(a.applicationId)) : [];
  if (Array.isArray(apps) && apps.length !== validApps.length) {
    setItem(APPLICATIONS_KEY, validApps);
  }
  return validApps;
}

export function generateApplicationId() {
  const apps = getApplications();
  let maxIdNum = 1000;

  apps.forEach((app) => {
    const rawId = app.applicationId || app.id || '';
    const match = rawId.match(/NUF-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });

  return `NUF-${maxIdNum + 1}`;
}

export function saveApplication(formData = {}) {
  const apps = getApplications();
  const currentUser = getCurrentUser();

  const appId = generateApplicationId();
  const randomRefDigits = Math.floor(1000 + Math.random() * 9000);
  const refId = `APP-2026-${randomRefDigits}`;
  const memberId = `UF-2026-${Math.floor(6000 + Math.random() * 1000)}`;
  const empId = `EMP-2026-${Math.floor(6000 + Math.random() * 1000)}`;

  const personal = formData.personal || {};
  const address = formData.address || {};
  const account = formData.account || {};
  const nominee = formData.nominee || {};
  const shares = formData.shares || {};
  const documents = formData.documents || {};
  const witness = formData.witness || {};
  const declaration = formData.declaration || {};

  // Title & Name
  const title = personal.title || 'Mr.';
  const firstName = personal.firstName || currentUser?.name?.split(' ')[0] || 'Applicant';
  const middleName = personal.middleName ? personal.middleName.trim() + ' ' : '';
  const lastName = personal.lastName || '';
  const applicantName = `${title} ${firstName} ${middleName}${lastName}`.trim();

  // Address text
  const resAddrText = [address.address1, address.address2, address.villageTown]
    .filter(Boolean)
    .join(', ');

  const newApplication = {
    id: appId,
    applicationId: appId,
    refId,
    memberId,
    empId,
    userId: currentUser ? currentUser.id : `user-guest-${Date.now()}`,
    applicantName,
    email: account.email || address.email || currentUser?.email || 'applicant@utkalfinance.com',
    mobile: account.mobile || address.mobile || personal.mobile || '9861374251',
    altMobile: account.alternateMobile || address.alternateMobile || '9437112233',
    title: personal.title || 'Mr.',
    firstName: personal.firstName || '',
    middleName: personal.middleName || '',
    lastName: personal.lastName || '',
    relationshipPrefix: personal.relationshipPrefix || 'S/o.',
    fatherLegalName: personal.fatherLegalName || 'Legal Guardian',
    dob: personal.dob || '1996-06-20',
    age: personal.age || '30',
    gender: personal.gender || 'Male',
    maritalStatus: personal.maritalStatus || 'Married',
    religion: personal.religion || 'Hindu',
    category: personal.category || 'General',
    education: personal.education || 'Graduate / P.G.',
    occupation: personal.occupation || 'Business',
    pan: personal.pan || documents.docRefNo || 'ABCDE1234F',
    address1: resAddrText || 'Plot 214, Saheed Nagar',
    villageTown: address.villageTown || 'Bhubaneswar',
    district: address.district || 'Khurda',
    state: address.state || 'Odisha',
    pincode: address.pincode || '751007',
    sameAsResidential: address.sameAsResidential !== false,
    branch: account.registeredBranch || account.branch || 'Bhubaneswar HQ (Nayapalli, IRC Village)',
    introducer: account.introducer || account.agent || 'Pradeep Kumar Jena',
    nomineeName: nominee.fullName || nominee.firstName || 'Nominee Beneficiary',
    nomineeRel: nominee.relationship || 'Spouse',
    nomineeDob: nominee.dob || '1998-04-15',
    nomineeAddr: nominee.address || 'Same as Applicant Address',
    numberOfShares: shares.numberOfShares ? parseInt(shares.numberOfShares, 10) : 10,
    shareValue: shares.shareValue ? parseInt(shares.shareValue, 10) : 10,
    processingFee: shares.processingFee ? parseInt(shares.processingFee, 10) : 100,
    totalPaid: (shares.numberOfShares ? parseInt(shares.numberOfShares, 10) * (shares.shareValue ? parseInt(shares.shareValue, 10) : 10) : 100) + (shares.processingFee ? parseInt(shares.processingFee, 10) : 100),
    idProofType: documents.idProofType || 'Aadhaar Card',
    idProofUrl: documents.idProofUrl || documents.idProof || documents.doc2_govId || (typeof documents.idProofFile === 'string' ? documents.idProofFile : '') || '',
    addressProofType: documents.addressProofType || 'Aadhaar Card',
    addressProofUrl: documents.addressProofUrl || documents.addressProof || (typeof documents.addressProofFile === 'string' ? documents.addressProofFile : '') || '',
    photoUrl: documents.photoUrl || documents.photo || documents.doc1_photo || (typeof documents.photoFile === 'string' ? documents.photoFile : '') || '',
    signatureUrl: documents.signatureUrl || documents.signature || (typeof documents.signatureFile === 'string' ? documents.signatureFile : '') || '',
    paymentReceiptUrl: formData.payment?.receiptUrl || formData.paymentDetails?.receiptUrl || documents.paymentReceiptUrl || '',
    additionalDocuments: Array.isArray(documents.additionalDocuments) ? documents.additionalDocuments : [],
    documentDetails: {
      idProofType: documents.idProofType || 'Aadhaar Card',
      idProofUrl: documents.idProofUrl || documents.idProof || documents.doc2_govId || (typeof documents.idProofFile === 'string' ? documents.idProofFile : '') || '',
      addressProofType: documents.addressProofType || 'Aadhaar Card',
      addressProofUrl: documents.addressProofUrl || documents.addressProof || (typeof documents.addressProofFile === 'string' ? documents.addressProofFile : '') || '',
      photoUrl: documents.photoUrl || documents.photo || documents.doc1_photo || (typeof documents.photoFile === 'string' ? documents.photoFile : '') || '',
      signatureUrl: documents.signatureUrl || documents.signature || (typeof documents.signatureFile === 'string' ? documents.signatureFile : '') || '',
      paymentReceiptUrl: formData.payment?.receiptUrl || formData.paymentDetails?.receiptUrl || documents.paymentReceiptUrl || '',
      additionalDocuments: Array.isArray(documents.additionalDocuments) ? documents.additionalDocuments : [],
    },
    witness1Name: witness.witness1Name || 'Rajesh Kumar Swain',
    witness1Mobile: witness.witness1Mobile || '9861001122',
    witness1Address: witness.witness1Address || 'Bhubaneswar, Odisha',
    witness2Name: witness.witness2Name || 'Manas Ranjan Rout',
    witness2Mobile: witness.witness2Mobile || '9437889900',
    witness2Address: witness.witness2Address || 'Cuttack, Odisha',
    sigName: declaration.signatureName || applicantName,
    declarationDate: declaration.declarationDate || new Date().toISOString().split('T')[0],
    paymentMethod: formData.payment?.method || formData.paymentDetails?.method || 'UPI (IndusInd Bank QR)',
    utrNo: formData.payment?.utrNumber || formData.paymentDetails?.utrNumber || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Pending',
    createdAt: new Date().toISOString(),
    // Raw original section objects
    personal,
    address,
    account,
    nominee,
    shares,
    documents,
    payment: formData.payment || formData.paymentDetails || {},
    paymentDetails: formData.paymentDetails || formData.payment || {},
    witness,
    declaration,
  };

  apps.unshift(newApplication);
  setItem(APPLICATIONS_KEY, apps);
  return newApplication;
}

export function getUserApplications() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  const apps = getApplications();
  return apps.filter((app) => app.userId === currentUser.id);
}

export function getApplicationById(id) {
  const apps = getApplications();
  return apps.find((app) => app.id === id || app.applicationId === id) || null;
}

export function generateMemberId(apps = []) {
  let maxIdNum = 0;
  apps.forEach((app) => {
    const rawId = app.memberId || '';
    const match = rawId.match(/NUF-M-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });
  return `NUF-M-${String(maxIdNum + 1).padStart(4, '0')}`;
}

export function updateApplicationStatus(id, newStatus) {
  const apps = getApplications();
  const updatedApps = apps.map((app) => {
    if (app.id === id || app.applicationId === id) {
      const isNewlyApproved = newStatus === 'Approved' && app.status !== 'Approved';
      let memberId = app.memberId;

      if (newStatus === 'Approved') {
        if (!memberId || !memberId.startsWith('NUF-M-')) {
          memberId = generateMemberId(apps);
        }
      }

      return {
        ...app,
        status: newStatus,
        memberId: memberId || app.memberId,
        membershipStatus: app.membershipStatus || 'Active',
        approvalDate: app.approvalDate || (newStatus === 'Approved' ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : app.date),
      };
    }
    return app;
  });

  setItem(APPLICATIONS_KEY, updatedApps);
  return updatedApps;
}

export function updateApplicationRecord(id, updatedFields = {}) {
  const apps = getApplications();
  let updatedItem = null;

  const updatedApps = apps.map((app) => {
    if (app.id === id || app.applicationId === id || app._id === id) {
      const mergedPersonal = {
        ...(app.personal || {}),
        ...(app.personalDetails || {}),
        ...(updatedFields.personalDetails || {}),
      };
      const mergedContact = {
        ...(app.contactDetails || {}),
        ...(updatedFields.contactDetails || {}),
      };
      const mergedAddress = {
        ...(app.address || {}),
        ...(app.addressDetails || {}),
        ...(updatedFields.addressDetails || {}),
      };
      const mergedNominee = {
        ...(app.nominee || {}),
        ...(app.nomineeDetails || {}),
        ...(updatedFields.nomineeDetails || {}),
      };
      const mergedMembership = {
        ...(app.membershipDetails || {}),
        ...(updatedFields.membershipDetails || {}),
      };

      const title = mergedPersonal.title || app.title || 'Mr.';
      const firstName = mergedPersonal.firstName !== undefined ? mergedPersonal.firstName : app.firstName;
      const middleName = mergedPersonal.middleName !== undefined ? mergedPersonal.middleName : app.middleName;
      const lastName = mergedPersonal.lastName !== undefined ? mergedPersonal.lastName : app.lastName;
      const nameParts = [title, firstName, middleName, lastName].filter(Boolean);
      const applicantName = nameParts.length > 0 ? nameParts.join(' ') : (updatedFields.applicantName || app.applicantName);

      updatedItem = {
        ...app,
        ...updatedFields,
        personalDetails: mergedPersonal,
        contactDetails: mergedContact,
        addressDetails: mergedAddress,
        nomineeDetails: mergedNominee,
        membershipDetails: mergedMembership,
        applicantName,
        title,
        firstName,
        middleName,
        lastName,
        fatherLegalName: mergedPersonal.fatherLegalName || updatedFields.fatherLegalName || app.fatherLegalName,
        relationshipPrefix: mergedPersonal.relationshipPrefix || updatedFields.relationshipPrefix || app.relationshipPrefix,
        dob: mergedPersonal.dob || updatedFields.dob || app.dob,
        age: mergedPersonal.age || updatedFields.age || app.age,
        gender: mergedPersonal.gender || updatedFields.gender || app.gender,
        maritalStatus: mergedPersonal.maritalStatus || updatedFields.maritalStatus || app.maritalStatus,
        religion: mergedPersonal.religion || updatedFields.religion || app.religion,
        category: mergedPersonal.category || updatedFields.category || app.category,
        education: mergedPersonal.education || updatedFields.education || app.education,
        occupation: mergedPersonal.occupation || updatedFields.occupation || app.occupation,
        email: mergedContact.email || updatedFields.email || app.email,
        mobile: mergedContact.mobile || updatedFields.mobile || app.mobile,
        altMobile: mergedContact.altMobile || updatedFields.altMobile || app.altMobile,
        pan: mergedPersonal.pan || updatedFields.pan || app.pan,
        address1: mergedAddress.address1 || updatedFields.address1 || app.address1,
        villageTown: mergedAddress.villageTown || updatedFields.villageTown || app.villageTown,
        district: mergedAddress.district || updatedFields.district || app.district,
        state: mergedAddress.state || updatedFields.state || app.state,
        pincode: mergedAddress.pincode || updatedFields.pincode || app.pincode,
        branch: mergedMembership.branch || updatedFields.branch || app.branch,
        introducer: mergedMembership.introducer || updatedFields.introducer || app.introducer,
        empId: mergedMembership.empId || updatedFields.empId || app.empId,
        nomineeName: mergedNominee.fullName || updatedFields.nomineeName || app.nomineeName,
        nomineeRel: mergedNominee.relationship || updatedFields.nomineeRel || app.nomineeRel,
        nomineeDob: mergedNominee.dob || updatedFields.nomineeDob || app.nomineeDob,
        nomineeAddr: mergedNominee.address || updatedFields.nomineeAddr || app.nomineeAddr,
        status: updatedFields.status || app.status,
      };

      return updatedItem;
    }
    return app;
  });

  setItem(APPLICATIONS_KEY, updatedApps);
  return updatedItem || updatedApps.find((a) => a.id === id || a.applicationId === id);
}

export function updateMemberStatus(memberId, newStatus) {
  const apps = getApplications();
  const updatedApps = apps.map((app) => {
    if (app.memberId === memberId || app.id === memberId) {
      return {
        ...app,
        membershipStatus: newStatus,
      };
    }
    return app;
  });
  setItem(APPLICATIONS_KEY, updatedApps);
  return updatedApps;
}

// ==========================================
// 3. ADMIN SESSION MANAGEMENT
// ==========================================

export function getAdminSession() {
  return getItem(ADMIN_SESSION_KEY, null);
}

export function loginAdminSession() {
  const session = {
    email: 'admin@newutkalfinance.com',
    role: 'Administrator',
    loggedInAt: new Date().toISOString(),
  };
  setItem(ADMIN_SESSION_KEY, session);
  return session;
}

export function logoutAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

// ==========================================
// 4. DERIVED MEMBERS, PAYMENTS & DOCUMENTS
// ==========================================

export function getMembers() {
  const apps = getApplications();
  const approvedApps = apps.filter((app) => app.status === 'Approved');

  let mutated = false;
  const members = approvedApps.map((app) => {
    let memberId = app.memberId;
    if (!memberId || !memberId.startsWith('NUF-M-')) {
      memberId = generateMemberId(apps);
      app.memberId = memberId;
      app.membershipStatus = app.membershipStatus || 'Active';
      mutated = true;
    }

    return {
      memberId: app.memberId,
      id: app.memberId,
      applicationId: app.id || app.applicationId,
      applicantName: app.applicantName,
      name: app.applicantName,
      email: app.email,
      mobile: app.mobile,
      joiningDate: app.approvalDate || app.date,
      membershipStatus: app.membershipStatus || 'Active',
      status: app.membershipStatus || 'Active',
      membershipType: 'Associate Member',
      branch: app.branch,
      app: app,
    };
  });

  if (mutated) {
    setItem(APPLICATIONS_KEY, apps);
  }

  return members;
}

export function getMemberById(memberId) {
  const members = getMembers();
  return members.find((m) => m.memberId === memberId || m.id === memberId || m.applicationId === memberId) || null;
}

export function getPayments() {
  const apps = getApplications();
  return apps.map((app) => ({
    txnId: `TXN-${app.id.replace('NUF-', '')}`,
    appId: app.id,
    member: app.applicantName,
    amount: app.totalPaid || 200,
    method: app.paymentMethod || 'UPI',
    date: app.date,
    utr: app.utrNo || 'UTR426774469795',
    status: app.status === 'Approved' ? 'Successful' : app.status === 'Rejected' ? 'Failed' : 'Pending Verification',
  }));
}

export function getDocuments() {
  const apps = getApplications();
  const documentRecords = [];

  apps.forEach((app) => {
    const doc = app.documentDetails || app.documents || {};
    const p = app.personalDetails || app.personal || {};
    const c = app.contactDetails || app.account || app.address || {};

    const nameParts = [p.title || app.title, p.firstName || app.firstName, p.middleName || app.middleName, p.lastName || app.lastName].filter(Boolean);
    const applicantName = nameParts.length > 0 ? nameParts.join(' ') : (app.applicantName || 'Applicant');

    const record = {
      _id: app._id || app.id,
      applicationId: app.applicationId || app.id,
      memberId: app.memberId && app.memberId.startsWith('NUF-M-') ? app.memberId : null,
      applicantName,
      email: c.email || app.email || '',
      mobile: c.mobile || app.mobile || '',
      status: (app.status || 'pending').toLowerCase(),
      submittedAt: app.submittedAt || app.createdAt || app.date || new Date().toISOString(),

      idProof: {
        type: doc.idProofType || app.idProofType || '',
        url: doc.idProofUrl || doc.idProofFile || app.idProofUrl || '',
        status: (doc.idProofUrl || doc.idProofFile || app.idProofUrl) ? 'uploaded' : 'not_uploaded',
      },

      addressProof: {
        type: doc.addressProofType || app.addressProofType || '',
        url: doc.addressProofUrl || doc.addressProofFile || app.addressProofUrl || '',
        status: (doc.addressProofUrl || doc.addressProofFile || app.addressProofUrl) ? 'uploaded' : 'not_uploaded',
      },

      photo: {
        url: doc.photoUrl || doc.photoFile || app.photoUrl || '',
        status: (doc.photoUrl || doc.photoFile || app.photoUrl) ? 'uploaded' : 'not_uploaded',
      },

      signature: {
        url: doc.signatureUrl || doc.signatureFile || app.signatureUrl || '',
        status: (doc.signatureUrl || doc.signatureFile || app.signatureUrl) ? 'uploaded' : 'not_uploaded',
      },
    };

    documentRecords.push(record);
  });

  return documentRecords;
}
