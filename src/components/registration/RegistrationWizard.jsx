import React, { useState } from 'react';
import { RegistrationProgress } from './RegistrationProgress';
import { StepNavigation } from './StepNavigation';
import { StepPersonal } from './StepPersonal';
import { StepAddress } from './StepAddress';
import { StepAccount } from './StepAccount';
import { StepNominee } from './StepNominee';
import { StepShares } from './StepShares';
import { StepDocuments } from './StepDocuments';
import { StepWitness } from './StepWitness';
import { StepDeclaration } from './StepDeclaration';
import { StepReview } from './StepReview';
import { SubmissionSuccess } from './SubmissionSuccess';
import { DEMO_QUICKFILL_DATA } from '../../data/registrationOptions';
import { validateEmail, validatePhone } from '../../utils/validators';
import { saveApplication } from '../../utils/storage';
import { uploadDocumentsApi, createApplicationApi } from '../../services/applicationService';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export function RegistrationWizard({ activeStep = 1, onQuickFillTrigger }) {
  const [currentStep, setCurrentStep] = useState(activeStep);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');


  const [formData, setFormData] = useState({
    personal: {
      title: '',
      firstName: '',
      middleName: '',
      lastName: '',
      relationshipPrefix: '',
      fatherLegalName: '',
      dob: '',
      age: '',
      gender: '',
      maritalStatus: '',
      education: '',
      religion: 'Hinduism',
      category: '',
      occupation: '',
    },
    address: {
      address1: '',
      address2: '',
      villageTown: '',
      district: '',
      state: 'Odisha',
      pincode: '',
      country: 'India',
      sameAsResidential: true,
      commAddress1: '',
      commAddress2: '',
      commVillageTown: '',
      commDistrict: '',
      commState: 'Odisha',
      commPincode: '',
      commCountry: 'India',
      mobile: '9861374251',
      email: 'applicant@utkalfinance.com',
    },
    account: {
      mobile: '9861374251',
      email: 'applicant@utkalfinance.com',
      password: '',
      confirmPassword: '',
      membershipType: 'Associate Member',
      membershipAmount: '200',
      preferredCommunication: 'Both',
    },
    nominee: {
      fullName: '',
      relationship: '',
      dob: '',
      mobile: '',
      address: '',
      sameAsApplicant: true,
      isMinor: false,
      guardianName: '',
      guardianRelationship: '',
    },
    shares: {
      numberOfShares: 10,
      shareValue: 10,
      processingFee: 100,
      totalContribution: 200,
    },
    documents: {
      idProofType: 'Aadhaar Card',
      idProofFile: null,
      addressProofType: 'Aadhaar Card',
      addressProofFile: null,
      photoFile: null,
      signatureFile: null,
    },
    witness: {
      witness1Name: '',
      witness1Mobile: '',
      witness1Address: '',
      witness1Occupation: '',
      witness1Relationship: '',
      witness2Name: '',
      witness2Mobile: '',
      witness2Address: '',
      witness2Occupation: '',
      witness2Relationship: '',
    },
    declaration: {
      confirmInfoTrue: false,
      agreeTerms: false,
      consentProcessing: false,
      signatureName: '',
      declarationDate: new Date().toISOString().split('T')[0],
    },
    payment: {
      method: 'upi',
      receiptFile: null,
      utr: '',
    },
  });

  const [errors, setErrors] = useState({});

  // Central handle change for any step
  const handleStepDataChange = (stepKey, field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [stepKey]: {
          ...prev[stepKey],
          [field]: value,
        },
      };

      if (field === 'mobile' || field === 'email') {
        updated.address = { ...updated.address, [field]: value };
        updated.account = { ...updated.account, [field]: value };
      }

      return updated;
    });

    // Clear error for field
    if (errors[stepKey]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [stepKey]: {
          ...prev[stepKey],
          [field]: null,
        },
      }));
    }
  };

  // Document file select handler
  const handleDocumentSelect = (fileName, fileObj, errorMsg) => {
    if (errorMsg) {
      setErrors((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [fileName]: errorMsg,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [fileName]: fileObj,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [fileName]: null,
      },
    }));
  };

  const handleDocumentRemove = (fileName) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [fileName]: null,
      },
    }));
  };

  // Quick fill handler
  const handleQuickFill = () => {
    setFormData(DEMO_QUICKFILL_DATA);
    setErrors({});
  };

  // Validate step before moving forward
  const validateStep = (step) => {
    let isValid = true;
    const newErrors = {};

    if (step === 1) {
      const personal = formData.personal || {};
      const personalErrors = {};
      if (!personal.firstName || !personal.firstName.trim()) {
        personalErrors.firstName = 'First Name is required.';
        isValid = false;
      }
      if (!personal.lastName || !personal.lastName.trim()) {
        personalErrors.lastName = 'Last Name is required.';
        isValid = false;
      }
      if (!isValid) {
        newErrors.personal = personalErrors;
      }
    }

    if (step === 2) {
      const address = formData.address || {};
      const addressErrors = {};
      const cleanMobile = (address.mobile || '').replace(/\D/g, '');
      if (!address.mobile || !address.mobile.trim()) {
        addressErrors.mobile = 'Mobile Number is required.';
        isValid = false;
      } else if (cleanMobile.length !== 10) {
        addressErrors.mobile = 'Please enter a valid 10-digit Indian mobile number.';
        isValid = false;
      }
      if (!isValid) {
        newErrors.address = addressErrors;
      }
    }

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        ...newErrors,
      }));
    }

    return isValid;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    if (currentStep < 9) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepId) => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitApplication = async (customPaymentData) => {
    if (isSubmitting) return;

    // 1. Validate Personal Information (First Name and Last Name)
    const personal = formData.personal || {};
    if (!personal.firstName?.trim() || !personal.lastName?.trim()) {
      setErrors((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          ...(!personal.firstName?.trim() ? { firstName: 'First Name is required.' } : {}),
          ...(!personal.lastName?.trim() ? { lastName: 'Last Name is required.' } : {}),
        },
      }));
      setSubmitError("Please fill in applicant's First Name and Last Name in Step 1.");
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Validate Contact Mobile Number
    const address = formData.address || {};
    const cleanMobile = (address.mobile || '').replace(/\D/g, '');
    if (!address.mobile?.trim() || cleanMobile.length !== 10) {
      setErrors((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          mobile: !address.mobile?.trim()
            ? 'Mobile Number is required.'
            : 'Please enter a valid 10-digit mobile number.',
        },
      }));
      setSubmitError('Please provide a valid 10-digit Mobile Number in Step 2.');
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const docs = formData.documents || {};
    const getRawFile = (val) => {
      if (!val) return null;
      if (val instanceof File || val instanceof Blob) return val;
      if (val.rawFile instanceof File || val.rawFile instanceof Blob) return val.rawFile;
      if (val.file instanceof File || val.file instanceof Blob) return val.file;
      return null;
    };

    // 3. Extract and Validate payment receipt screenshot
    const paymentInfo = (customPaymentData && typeof customPaymentData === 'object' && customPaymentData.receiptFile !== undefined)
      ? customPaymentData
      : (formData.payment?.data || formData.payment || {});
    const receiptFileObj = paymentInfo.receiptFile || formData.payment?.data?.receiptFile || formData.payment?.receiptFile;
    const receiptRaw = getRawFile(receiptFileObj);

    const hasReceipt = Boolean(
      receiptRaw ||
      receiptFileObj?.dataUrl ||
      receiptFileObj?.previewUrl ||
      (typeof receiptFileObj === 'string' && receiptFileObj.trim())
    );

    if (!hasReceipt) {
      setSubmitError('Payment receipt screenshot is required. Please upload your ₹200 UPI payment receipt screenshot before submitting.');
      setErrors((prev) => ({
        ...prev,
        payment: 'Payment receipt screenshot is required.',
      }));
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const idRaw = getRawFile(docs.idProofFile) || getRawFile(docs.idProof) || getRawFile(docs.doc2_govId);
      const addressRaw = getRawFile(docs.addressProofFile) || getRawFile(docs.addressProof);
      const photoRaw = getRawFile(docs.photoFile) || getRawFile(docs.photo) || getRawFile(docs.doc1_photo);
      const signatureRaw = getRawFile(docs.signatureFile) || getRawFile(docs.signature);
      const doc3Raw = getRawFile(docs.doc3_eduCert);
      const doc4Raw = getRawFile(docs.doc4_birthCert);
      const doc5Raw = getRawFile(docs.doc5_utility);

      const fileFormData = new FormData();
      let hasFiles = false;

      if (idRaw) {
        fileFormData.append('idProof', idRaw);
        fileFormData.append('doc2_govId', idRaw);
        hasFiles = true;
      }
      if (addressRaw) {
        fileFormData.append('addressProof', addressRaw);
        hasFiles = true;
      }
      if (photoRaw) {
        fileFormData.append('photo', photoRaw);
        fileFormData.append('doc1_photo', photoRaw);
        hasFiles = true;
      }
      if (signatureRaw) {
        fileFormData.append('signature', signatureRaw);
        hasFiles = true;
      }
      if (doc3Raw) {
        fileFormData.append('doc3_eduCert', doc3Raw);
        hasFiles = true;
      }
      if (doc4Raw) {
        fileFormData.append('doc4_birthCert', doc4Raw);
        hasFiles = true;
      }
      if (doc5Raw) {
        fileFormData.append('doc5_utility', doc5Raw);
        hasFiles = true;
      }
      if (receiptRaw) {
        fileFormData.append('paymentReceipt', receiptRaw);
        fileFormData.append('receiptFile', receiptRaw);
        hasFiles = true;
      }

      if (Array.isArray(docs.additionalDocuments)) {
        docs.additionalDocuments.forEach((addDoc, idx) => {
          const rawAdd = getRawFile(addDoc?.file) || getRawFile(addDoc?.rawFile);
          if (rawAdd) {
            fileFormData.append(`addDoc_${idx}`, rawAdd);
            hasFiles = true;
          }
        });
      }

      let uploadedFileUrls = {};
      if (hasFiles) {
        try {
          uploadedFileUrls = await uploadDocumentsApi(fileFormData);
        } catch (uploadErr) {
          console.warn('File upload warning:', uploadErr.message);
        }
      }

      const fileToBase64 = (file) =>
        new Promise((resolve) => {
          if (!file || !(file instanceof File || file instanceof Blob)) return resolve('');
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

      const idProofFallback = idRaw ? await fileToBase64(idRaw) : '';
      const addressProofFallback = addressRaw ? await fileToBase64(addressRaw) : '';
      const photoFallback = photoRaw ? await fileToBase64(photoRaw) : '';
      const signatureFallback = signatureRaw ? await fileToBase64(signatureRaw) : '';
      const doc3Fallback = doc3Raw ? await fileToBase64(doc3Raw) : '';
      const doc4Fallback = doc4Raw ? await fileToBase64(doc4Raw) : '';
      const doc5Fallback = doc5Raw ? await fileToBase64(doc5Raw) : '';
      const receiptFallback = receiptRaw ? await fileToBase64(receiptRaw) : '';

      const finalIdProofUrl =
        uploadedFileUrls.idProof ||
        uploadedFileUrls.doc2_govId ||
        idProofFallback ||
        docs.idProofUrl ||
        docs.doc2_govId ||
        (typeof docs.idProof === 'string' ? docs.idProof : '') ||
        (typeof docs.idProofFile === 'string' ? docs.idProofFile : '') ||
        (typeof docs.idProofFile?.previewUrl === 'string' ? docs.idProofFile.previewUrl : '') ||
        (typeof docs.idProofFile?.dataUrl === 'string' ? docs.idProofFile.dataUrl : '');

      const finalAddressProofUrl =
        uploadedFileUrls.addressProof ||
        addressProofFallback ||
        docs.addressProofUrl ||
        (typeof docs.addressProof === 'string' ? docs.addressProof : '') ||
        (typeof docs.addressProofFile === 'string' ? docs.addressProofFile : '') ||
        (typeof docs.addressProofFile?.previewUrl === 'string' ? docs.addressProofFile.previewUrl : '') ||
        (typeof docs.addressProofFile?.dataUrl === 'string' ? docs.addressProofFile.dataUrl : '');

      const finalPhotoUrl =
        uploadedFileUrls.photo ||
        uploadedFileUrls.doc1_photo ||
        photoFallback ||
        docs.photoUrl ||
        (typeof docs.photo === 'string' ? docs.photo : '') ||
        (typeof docs.photoFile === 'string' ? docs.photoFile : '') ||
        (typeof docs.photoFile?.previewUrl === 'string' ? docs.photoFile.previewUrl : '') ||
        (typeof docs.photoFile?.dataUrl === 'string' ? docs.photoFile.dataUrl : '');

      const finalSignatureUrl =
        uploadedFileUrls.signature ||
        signatureFallback ||
        docs.signatureUrl ||
        (typeof docs.signature === 'string' ? docs.signature : '') ||
        (typeof docs.signatureFile === 'string' ? docs.signatureFile : '') ||
        (typeof docs.signatureFile?.previewUrl === 'string' ? docs.signatureFile.previewUrl : '') ||
        (typeof docs.signatureFile?.dataUrl === 'string' ? docs.signatureFile.dataUrl : '');

      const additionalDocs = Array.isArray(docs.additionalDocuments)
        ? docs.additionalDocuments.map((addDoc, idx) => {
          const uploadedUrl = uploadedFileUrls[`addDoc_${idx}`];
          if (uploadedUrl) {
            return { ...addDoc, documentUrl: uploadedUrl };
          }
          return addDoc;
        })
        : [];

      const doc3Url =
        uploadedFileUrls.doc3_eduCert ||
        doc3Fallback ||
        (typeof docs.doc3_eduCert === 'string' ? docs.doc3_eduCert : '') ||
        (typeof docs.doc3_eduCert?.previewUrl === 'string' ? docs.doc3_eduCert.previewUrl : '');

      const doc4Url =
        uploadedFileUrls.doc4_birthCert ||
        doc4Fallback ||
        (typeof docs.doc4_birthCert === 'string' ? docs.doc4_birthCert : '') ||
        (typeof docs.doc4_birthCert?.previewUrl === 'string' ? docs.doc4_birthCert.previewUrl : '');

      const doc5Url =
        uploadedFileUrls.doc5_utility ||
        doc5Fallback ||
        (typeof docs.doc5_utility === 'string' ? docs.doc5_utility : '') ||
        (typeof docs.doc5_utility?.previewUrl === 'string' ? docs.doc5_utility.previewUrl : '');

      const paymentReceiptUrl =
        uploadedFileUrls.paymentReceipt ||
        uploadedFileUrls.receiptFile ||
        receiptFallback ||
        receiptFileObj?.dataUrl ||
        receiptFileObj?.previewUrl ||
        (typeof receiptFileObj === 'string' ? receiptFileObj : '');

      const payload = {
        ...formData,
        payment: {
          method: paymentInfo.method || 'UPI (IndusInd Bank QR)',
          amount: 200,
          receiptUrl: paymentReceiptUrl,
          receiptFileName: receiptFileObj?.name || 'UPI_Payment_Receipt.png',
          utrNumber: paymentInfo.utr || 'UPI_PAYMENT_VERIFIED',
          paidAt: new Date(),
        },
        paymentDetails: {
          method: paymentInfo.method || 'UPI (IndusInd Bank QR)',
          amount: 200,
          receiptUrl: paymentReceiptUrl,
          receiptFileName: receiptFileObj?.name || 'UPI_Payment_Receipt.png',
          utrNumber: paymentInfo.utr || 'UPI_PAYMENT_VERIFIED',
          paidAt: new Date(),
        },
        documents: {
          idProofType: docs.idProofType || 'Aadhaar Card',
          idProofUrl: finalIdProofUrl,
          idProofFile: finalIdProofUrl,
          idProof: finalIdProofUrl,
          doc2_govId: finalIdProofUrl,
          addressProofType: docs.addressProofType || 'Aadhaar Card',
          addressProofUrl: finalAddressProofUrl,
          addressProofFile: finalAddressProofUrl,
          addressProof: finalAddressProofUrl,
          photoUrl: finalPhotoUrl,
          photoFile: finalPhotoUrl,
          photo: finalPhotoUrl,
          signatureUrl: finalSignatureUrl,
          signatureFile: finalSignatureUrl,
          signature: finalSignatureUrl,
          doc3_eduCert: doc3Url,
          doc4_birthCert: doc4Url,
          doc5_utility: doc5Url,
          paymentReceiptUrl: paymentReceiptUrl,
          additionalDocuments: additionalDocs,
        },
        documentDetails: {
          idProofType: docs.idProofType || 'Aadhaar Card',
          idProofUrl: finalIdProofUrl,
          idProofFile: finalIdProofUrl,
          idProof: finalIdProofUrl,
          doc2_govId: finalIdProofUrl,
          addressProofType: docs.addressProofType || 'Aadhaar Card',
          addressProofUrl: finalAddressProofUrl,
          addressProofFile: finalAddressProofUrl,
          addressProof: finalAddressProofUrl,
          photoUrl: finalPhotoUrl,
          photoFile: finalPhotoUrl,
          photo: finalPhotoUrl,
          signatureUrl: finalSignatureUrl,
          signatureFile: finalSignatureUrl,
          signature: finalSignatureUrl,
          doc3_eduCert: doc3Url,
          doc4_birthCert: doc4Url,
          doc5_utility: doc5Url,
          paymentReceiptUrl: paymentReceiptUrl,
          additionalDocuments: additionalDocs,
        },
      };

      console.log("Submitting application payload to backend:", payload);

      const data = await createApplicationApi(payload);
      console.log("Application API response:", data);

      if (data?.success && data?.application?.applicationId) {
        const generatedAppId = data.application.applicationId;
        saveApplication({
          ...payload,
          applicationId: generatedAppId,
        });

        // Trigger live refresh for admin dashboard
        window.dispatchEvent(new Event('storage'));

        setReferenceNo(generatedAppId);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(data.message || 'Validation or server error occurred. Please check details and try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Unable to submit application. Please check your server connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isSubmitted) {
    return (
      <SubmissionSuccess
        referenceNo={referenceNo}
        formData={formData}
        onReset={() => {
          setIsSubmitted(false);
          setCurrentStep(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-[1020px] mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden my-3 sm:my-5">
      {/* Wizard Header Progress Bar */}
      <RegistrationProgress currentStep={currentStep} />

      {/* 9-Step Horizontal Navigation Bar */}
      <StepNavigation
        currentStep={currentStep}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />

      {/* STEP CONTENT BODY */}
      <div className="p-4 sm:p-6 md:p-8 min-h-[360px]">
        {submitError && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <span>{submitError}</span>
          </div>
        )}

        {currentStep === 1 && (
          <StepPersonal
            data={formData.personal}
            errors={errors.personal || {}}
            onChange={(field, val) => handleStepDataChange('personal', field, val)}
          />
        )}

        {currentStep === 2 && (
          <StepAddress
            data={formData.address}
            errors={errors.address || {}}
            onChange={(field, val) => handleStepDataChange('address', field, val)}
          />
        )}

        {currentStep === 3 && (
          <StepAccount
            data={formData.account}
            errors={errors.account || {}}
            onChange={(field, val) => handleStepDataChange('account', field, val)}
          />
        )}

        {currentStep === 4 && (
          <StepNominee
            data={formData.nominee}
            errors={errors.nominee || {}}
            onChange={(field, val) => handleStepDataChange('nominee', field, val)}
          />
        )}

        {currentStep === 5 && (
          <StepShares
            data={formData.shares}
            errors={errors.shares || {}}
            onChange={(field, val) => handleStepDataChange('shares', field, val)}
            onGoToStep={handleStepClick}
          />
        )}

        {currentStep === 6 && (
          <StepDocuments
            data={formData.documents}
            errors={errors.documents || {}}
            onFileSelect={handleDocumentSelect}
            onFileRemove={handleDocumentRemove}
            onChange={(field, val) => handleStepDataChange('documents', field, val)}
          />
        )}

        {currentStep === 7 && (
          <StepWitness
            data={formData.witness}
            errors={errors.witness || {}}
            onChange={(field, val) => handleStepDataChange('witness', field, val)}
          />
        )}

        {currentStep === 8 && (
          <StepDeclaration
            data={formData.declaration}
            errors={errors.declaration || {}}
            onChange={(field, val) => handleStepDataChange('declaration', field, val)}
          />
        )}

        {currentStep === 9 && (
          <StepReview
            formData={formData}
            onGoToStep={handleStepClick}
            onSubmit={handleSubmitApplication}
            onPaymentChange={(val) => {
              handleStepDataChange('payment', 'data', val);
              if (errors.payment) {
                setErrors((prev) => ({ ...prev, payment: null }));
              }
            }}
            errors={errors}
          />
        )}
      </div>

      {/* BOTTOM WIZARD NAVIGATION BAR */}
      <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentStep === 1 || isSubmitting}
          onClick={handlePrevious}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border
            ${currentStep === 1 || isSubmitting
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
            }
          `}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <div className="flex items-center gap-3 ml-auto">
          {/* Continue to Next Step / Submit */}
          {currentStep < 9 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004085] hover:bg-blue-900 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-900/20 transition-all"
            >
              <span>CONTINUE TO STEP {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitApplication}
              className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#00C853] hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT MEMBERSHIP APPLICATION'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

