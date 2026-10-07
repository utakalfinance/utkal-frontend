import React, { useRef } from 'react';
import { FormSection } from './FormSection';
import { FormSelect } from './FormSelect';
import { FormInput } from './FormInput';
import { ID_PROOF_TYPES } from '../../data/registrationOptions';
import { FileText, Upload, CheckCircle2, Trash2, AlertCircle, Hash, CreditCard } from 'lucide-react';

export function StepDocuments({ data = {}, errors = {}, onFileSelect, onFileRemove, onChange }) {
  const fileInputRefs = {
    idProofFile: useRef(null),
    addressProofFile: useRef(null),
    photoFile: useRef(null),
    signatureFile: useRef(null),
    doc3_eduCert: useRef(null),
    doc4_birthCert: useRef(null),
    doc5_utility: useRef(null),
  };

  const DOCUMENT_ITEMS = [
    {
      key: 'idProofFile',
      id: 1,
      title: 'Primary Government ID Proof',
      accept: '.pdf,.jpg,.jpeg,.png',
    },
    {
      key: 'addressProofFile',
      id: 2,
      title: 'Address Proof Document',
      accept: '.pdf,.jpg,.jpeg,.png',
    },
    {
      key: 'photoFile',
      id: 3,
      title: 'Applicant Passport Photograph',
      accept: '.jpg,.jpeg,.png',
    },
    {
      key: 'signatureFile',
      id: 4,
      title: 'Applicant Digital Signature Specimen',
      accept: '.pdf,.jpg,.jpeg,.png',
    },
    {
      key: 'doc3_eduCert',
      id: 5,
      title: 'Educational Degree / Certificate (Additional)',
      accept: '.pdf,.jpg,.jpeg,.png',
      optional: true,
    },
    {
      key: 'doc4_birthCert',
      id: 6,
      title: 'Birth / PAN / Identity Certificate (Additional)',
      accept: '.pdf,.jpg,.jpeg,.png',
      optional: true,
    },
    {
      key: 'doc5_utility',
      id: 7,
      title: 'Electricity Bill / Bank Passbook (Additional)',
      accept: '.pdf,.jpg,.jpeg,.png',
      optional: true,
    },
  ];

  const uploadedCount = DOCUMENT_ITEMS.filter((item) => !!data[item.key]).length;

  const handleFileUpload = (itemKey, e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Preserve real File instance and attach preview helper properties
    selected.formattedSize = `${(selected.size / (1024 * 1024)).toFixed(2)} MB`;
    if (selected.type.startsWith('image/')) {
      selected.previewUrl = URL.createObjectURL(selected);
    }

    if (onFileSelect) {
      onFileSelect(itemKey, selected);
    } else if (onChange) {
      onChange(itemKey, selected);
    }
  };

  const handleRemoveFile = (itemKey) => {
    if (onFileRemove) {
      onFileRemove(itemKey);
    } else if (onChange) {
      onChange(itemKey, null);
    }
  };

  const getIdNumberLabel = () => {
    switch (data.idProofType) {
      case 'Aadhaar Card':
        return 'Aadhaar Card Number (12 Digits)';
      case 'PAN Card':
        return 'PAN Card Number (10 Alphanumeric)';
      case 'Voter ID':
        return 'Voter ID / EPIC Card Number';
      case 'Passport':
        return 'Passport Number';
      case 'Driving Licence':
        return 'Driving Licence Number';
      default:
        return `${data.idProofType || 'ID Proof'} Document Number`;
    }
  };

  const getIdNumberPlaceholder = () => {
    switch (data.idProofType) {
      case 'Aadhaar Card':
        return 'e.g. 1234 5678 9012';
      case 'PAN Card':
        return 'e.g. ABCDE1234F';
      case 'Voter ID':
        return 'e.g. ABC1234567';
      case 'Passport':
        return 'e.g. A1234567';
      case 'Driving Licence':
        return 'e.g. OD0220190012345';
      default:
        return 'Enter identification document number';
    }
  };

  const handleIdNumberChange = (e) => {
    let val = e.target.value;
    if (data.idProofType === 'PAN Card') {
      val = val.toUpperCase().slice(0, 10);
    } else if (data.idProofType === 'Aadhaar Card') {
      const clean = val.replace(/\D/g, '').slice(0, 12);
      val = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    onChange('idProofNumber', val);
  };

  return (
    <FormSection
      title={
        <span className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-700 inline-block" />
          STATUTORY IDENTIFICATION DOCUMENTS &amp; UPLOAD STATUS
        </span>
      }
      subtitle="Upload primary KYC documents and any supporting statutory attachments. All uploaded files are stored safely in MongoDB."
    >
      <div className="space-y-6">
        {/* DOCUMENT TYPE & DOCUMENT NUMBER SELECTORS */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <FormSelect
            label="ID Proof Document Type"
            name="idProofType"
            value={data.idProofType || 'Aadhaar Card'}
            onChange={(e) => {
              onChange('idProofType', e.target.value);
            }}
            options={ID_PROOF_TYPES}
            error={errors.idProofType}
          />

          <FormInput
            label={getIdNumberLabel()}
            name="idProofNumber"
            value={data.idProofNumber || ''}
            onChange={handleIdNumberChange}
            placeholder={getIdNumberPlaceholder()}
            icon={Hash}
            error={errors.idProofNumber}
          />
        </div>

        {/* CHECKLIST HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>DOCUMENT ATTACHMENT SLOTS</span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full lowercase">
              multiple files supported
            </span>
          </h4>
          <span className={`text-xs font-bold ${uploadedCount > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
            {uploadedCount} of {DOCUMENT_ITEMS.length} Uploaded
          </span>
        </div>

        {/* ERROR BANNER IF ANY SPECIFIC ERROR */}
        {errors.allDocs && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
            <span>{errors.allDocs}</span>
          </div>
        )}

        {/* ATTACHMENT CARDS */}
        <div className="space-y-3">
          {DOCUMENT_ITEMS.map((item) => {
            const fileData = data[item.key];
            const isUploaded = !!fileData;
            const itemError = errors[item.key];
            const fileName = fileData?.name || (typeof fileData === 'string' ? fileData.split('/').pop() : '');

            return (
              <div
                key={item.key}
                className={`bg-white rounded-2xl border p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all ${
                  itemError ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRefs[item.key]}
                  onChange={(e) => handleFileUpload(item.key, e)}
                  accept={item.accept}
                  className="hidden"
                />

                {/* Left Details */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                    isUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.id}
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug flex items-center gap-1.5">
                      <span>{item.title}</span>
                      {item.optional && <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>}
                    </h5>

                    {/* Status Pill Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Attached ({fileName})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Not Uploaded</span>
                        </span>
                      )}
                    </div>

                    {itemError && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{itemError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Upload / Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {isUploaded ? (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRefs[item.key].current?.click()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.key)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs[item.key].current?.click()}
                      className="text-xs font-bold px-4 py-2 rounded-xl border inline-flex items-center gap-1.5 transition-colors bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FormSection>
  );
}
