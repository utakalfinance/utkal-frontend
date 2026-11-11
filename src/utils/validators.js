/**
 * Validation utilities for forms
 */

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/; // Indian 10-digit mobile number pattern
  return re.test(String(phone).replace(/\s+/g, ''));
}

export function validateLoanEnquiryForm(formData) {
  const errors = {};

  if (!formData.fullName || formData.fullName.trim().length < 2) {
    errors.fullName = 'Full Name is required (minimum 2 characters).';
  }

  const cleanPhone = String(formData.mobileNumber || formData.phone || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length !== 10) {
    errors.mobileNumber = 'Please provide a valid 10-digit mobile number.';
  }

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please provide a valid email address.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoanForm(formData) {
  return validateLoanEnquiryForm(formData);
}

export function validateContactForm(formData) {
  const errors = {};

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name is required.';
  }

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Valid email is required.';
  }

  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
