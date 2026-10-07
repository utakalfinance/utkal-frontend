/**
 * LocalStorage utility for Payment Management in New Utkal Finance.
 * Key: "utkal_finance_payments".
 * NO sample or fake dummy data is seeded automatically.
 * Fallback derives payments from actual Applications & Deposits if key is empty.
 */

import { getApplications } from './storage';
import { getDeposits } from './depositStorage';

const PAYMENTS_KEY = 'utkal_finance_payments';

const MOCK_APP_IDS = new Set(['NUF-10231', 'NUF-10230', 'NUF-10229', 'NUF-10228', 'NUF-10227']);
const MOCK_PAYMENT_IDS = new Set(['PAY-10231', 'PAY-10230', 'PAY-10229', 'PAY-10228', 'PAY-10227', 'TXN-9812401', 'TXN-9812400', 'TXN-9812399', 'TXN-9812398', 'TXN-9812397']);
const MOCK_NAMES = new Set(['Mr. Rahul Kumar Das', 'Ms. Priya Rout', 'Mr. Amit Kumar Swain', 'Mrs. Sneha Mohanty', 'Mr. Priyabrata Kumar Mohapatra', 'Rahul Kumar Das', 'Priya Rout', 'Amit Kumar Swain', 'Sneha Mohanty', 'Priyabrata Kumar Mohapatra']);

function isMockPayment(p) {
  if (!p) return true;
  if (MOCK_PAYMENT_IDS.has(p.paymentId) || MOCK_PAYMENT_IDS.has(p.id) || MOCK_PAYMENT_IDS.has(p.transactionId) || MOCK_PAYMENT_IDS.has(p.txnId)) return true;
  if (MOCK_APP_IDS.has(p.applicationId) || MOCK_APP_IDS.has(p.appId)) return true;
  if (MOCK_NAMES.has(p.memberName) || MOCK_NAMES.has(p.member)) return true;
  return false;
}

/**
 * Safely parse JSON from localStorage
 */
function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

/**
 * Safely save JSON to localStorage
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

/**
 * Derive real payment records from live submitted applications
 * STRICT RULE: ONLY applications that have been APPROVED by Admin appear in the Payments ledger.
 */
export function derivePaymentsFromApplications(apps = []) {
  if (!Array.isArray(apps)) return [];
  return apps
    .filter((app) => {
      if (!app || isMockPayment(app) || MOCK_APP_IDS.has(app.id) || MOCK_APP_IDS.has(app.applicationId)) {
        return false;
      }
      const statusLower = (app.status || '').trim().toLowerCase();
      // Only include if Admin has officially APPROVED the application
      return statusLower === 'approved';
    })
    .map((app) => {
      const p = app.personalDetails || app.personal || {};
      const applicantName =
        app.applicantName ||
        [p.title || app.title, p.firstName || app.firstName, p.middleName || app.middleName, p.lastName || app.lastName]
          .filter(Boolean)
          .join(' ') ||
        'Valued Member';

      const appId = app.applicationId || app.id || app._id || '';
      const cleanDigits = appId.replace(/\D/g, '') || '1001';
      const memberId =
        app.memberId ||
        app.account?.memberId ||
        `NUF-M-${cleanDigits.slice(-4).padStart(4, '0')}`;

      const amt = Number(app.totalPaid || app.paymentDetails?.amount || app.membershipDetails?.totalContribution || 200);
      const payMethod = app.paymentMethod || app.paymentDetails?.method || 'UPI (IndusInd Bank QR)';
      const utr = app.paymentDetails?.utrNumber || app.utrNo || `UPI_VERIFIED`;
      const txnId = app.transactionId || app.receiptNo || (utr !== 'UPI_VERIFIED' ? utr : `TXN-${cleanDigits}`);

      const payDate =
        app.approvalDate ||
        app.date ||
        (app.submittedAt
          ? new Date(app.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));

      return {
        id: `PAY-${cleanDigits}`,
        paymentId: `PAY-${cleanDigits}`,
        memberId: memberId,
        memberName: applicantName,
        applicationId: appId,
        depositId: '',
        purpose: 'Statutory Membership & Share Capital (10 Shares)',
        amount: amt,
        paymentMethod: payMethod,
        utrNo: utr,
        transactionId: txnId,
        date: payDate,
        rawDate: app.submittedAt || app.createdAt || new Date().toISOString(),
        status: 'Paid',
        receiptUrl: app.paymentReceiptUrl || app.paymentDetails?.receiptUrl || '',
        receiptFileName: app.paymentReceiptName || app.paymentDetails?.receiptFileName || 'Statutory_Payment_Receipt.png',
        notes: `Statutory membership subscription for ${applicantName}. Application ${appId} approved by Admin.`,
        history: [
          {
            field: 'Payment Status',
            oldValue: 'Pending Approval',
            newValue: 'Paid',
            changedAt: payDate,
            changedBy: 'Admin (Approval)',
          },
        ],
        createdAt: app.submittedAt || app.createdAt || new Date().toISOString(),
      };
    });
}

/**
 * Get all payment records stored in localStorage and derived from applications.
 * All dummy mock data is permanently excluded.
 */
export function getPayments(liveApplications = null) {
  const rawStored = getItem(PAYMENTS_KEY, []);
  const validStored = Array.isArray(rawStored) ? rawStored.filter((p) => !isMockPayment(p)) : [];

  if (Array.isArray(rawStored) && rawStored.length !== validStored.length) {
    setItem(PAYMENTS_KEY, validStored);
  }

  const appsSource = Array.isArray(liveApplications) && liveApplications.length > 0
    ? liveApplications
    : getApplications();

  const derived = derivePaymentsFromApplications(appsSource);

  // Merge unique user-created manual payments with live application payments
  const combined = [...derived];
  validStored.forEach((storedP) => {
    // If the stored payment is linked to an unapproved application, do NOT display it
    if (storedP.applicationId) {
      const linkedApp = appsSource.find(
        (a) => a.applicationId === storedP.applicationId || a.id === storedP.applicationId || a._id === storedP.applicationId
      );
      if (linkedApp && (linkedApp.status || '').trim().toLowerCase() !== 'approved') {
        return; // Skip unapproved application payments
      }
    }

    const exists = combined.some(
      (c) => (c.paymentId && c.paymentId === storedP.paymentId) || (c.applicationId && storedP.applicationId && c.applicationId === storedP.applicationId)
    );
    if (!exists) {
      combined.unshift(storedP);
    }
  });

  return combined;
}

/**
 * Save payments array to localStorage
 */
export function savePayments(payments) {
  setItem(PAYMENTS_KEY, payments);
}

/**
 * Generate a unique Payment ID (e.g. PAY-2026-1001)
 */
export function generatePaymentId() {
  const payments = getPayments();
  let maxNum = 1000;

  payments.forEach((p) => {
    const rawId = p.paymentId || p.id || '';
    const match = rawId.match(/PAY-(?:\d+-)?(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  return `PAY-2026-${maxNum + 1}`;
}

/**
 * Add a new payment record to localStorage.
 */
export function addPayment(paymentData = {}) {
  const payments = getPayments();
  const paymentId = paymentData.paymentId || paymentData.id || generatePaymentId();

  const newPayment = {
    id: paymentId,
    paymentId,
    memberId: paymentData.memberId || '',
    memberName: paymentData.memberName || paymentData.applicantName || '',
    applicationId: paymentData.applicationId || '',
    depositId: paymentData.depositId || '',
    purpose: paymentData.purpose || paymentData.paymentPurpose || 'Membership Fee',
    amount: Number(paymentData.amount) || 0,
    paymentMethod: paymentData.paymentMethod || 'UPI (Google Pay)',
    utrNo: paymentData.utrNo || paymentData.transactionId || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    transactionId: paymentData.transactionId || paymentData.utrNo || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    date: paymentData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    rawDate: paymentData.rawDate || new Date().toISOString(),
    status: paymentData.status || 'Paid',
    notes: paymentData.notes || '',
    history: [
      {
        field: 'Payment Account',
        oldValue: 'Created',
        newValue: paymentData.status || 'Paid',
        changedAt: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        changedBy: 'Admin',
      },
    ],
    createdAt: new Date().toISOString(),
    ...paymentData,
  };

  payments.unshift(newPayment);
  savePayments(payments);
  return newPayment;
}

/**
 * Update an existing payment record with audit logging
 */
export function updatePayment(paymentId, updatedFields = {}) {
  const payments = getPayments();
  let updatedRecord = null;

  const updatedPayments = payments.map((p) => {
    if (p.id === paymentId || p.paymentId === paymentId) {
      const history = Array.isArray(p.history) ? [...p.history] : [];

      const fieldLabels = {
        purpose: 'Payment Purpose',
        amount: 'Payment Amount',
        paymentMethod: 'Payment Method',
        utrNo: 'UTR / Reference Number',
        date: 'Payment Date',
        status: 'Payment Status',
        notes: 'Admin Notes',
      };

      const nowFormatted = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      Object.keys(updatedFields).forEach((key) => {
        if (
          fieldLabels[key] &&
          p[key] !== undefined &&
          String(p[key]).trim() !== String(updatedFields[key]).trim()
        ) {
          history.unshift({
            field: fieldLabels[key],
            oldValue: key === 'amount' ? `₹${Number(p[key]).toLocaleString('en-IN')}` : String(p[key] || 'Empty'),
            newValue: key === 'amount' ? `₹${Number(updatedFields[key]).toLocaleString('en-IN')}` : String(updatedFields[key] || 'Empty'),
            changedAt: nowFormatted,
            changedBy: 'Admin',
          });
        }
      });

      updatedRecord = {
        ...p,
        ...updatedFields,
        history,
        updatedAt: new Date().toISOString(),
      };
      return updatedRecord;
    }
    return p;
  });

  savePayments(updatedPayments);
  return updatedRecord;
}

/**
 * Verify payment helper (sets status to 'Paid')
 */
export function verifyPayment(paymentId) {
  return updatePayment(paymentId, { status: 'Paid' });
}

/**
 * Refund payment helper (sets status to 'Refunded')
 */
export function refundPayment(paymentId) {
  return updatePayment(paymentId, { status: 'Refunded' });
}

/**
 * Export actual payments as CSV download
 */
export function exportPaymentsCSV(paymentsList = []) {
  if (paymentsList.length === 0) return;

  const headers = ['Payment ID', 'Member ID', 'Member Name', 'Purpose', 'Amount (INR)', 'Payment Method', 'UTR / Ref No', 'Date', 'Status'];
  const rows = paymentsList.map((p) => [
    `"${p.paymentId || p.id}"`,
    `"${p.memberId || 'N/A'}"`,
    `"${p.memberName || 'N/A'}"`,
    `"${p.purpose || 'Membership Fee'}"`,
    `"${p.amount || 0}"`,
    `"${p.paymentMethod || 'UPI'}"`,
    `"${p.utrNo || 'N/A'}"`,
    `"${p.date || 'N/A'}"`,
    `"${p.status || 'Paid'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Utkal_Finance_Payments_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
