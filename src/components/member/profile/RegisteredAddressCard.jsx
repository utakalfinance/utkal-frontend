import React from 'react';
import { MapPin, Info, CheckCircle2, Pencil } from 'lucide-react';

/**
 * RegisteredAddressCard Component
 * Displays verified permanent and communication address details.
 */
export function RegisteredAddressCard({
  address = 'Not provided',
  district = 'Not provided',
  state = 'Odisha',
  pincode = 'Not provided',
  onEdit,
}) {
  const isMissing = (val) => !val || val === 'Not provided' || val === '—';

  const displayAddress = !isMissing(address) ? address : 'Not provided';
  const displayDistrict = !isMissing(district) ? district : 'Not provided';
  const displayState = !isMissing(state) ? state : 'Odisha';
  const displayPincode = !isMissing(pincode) ? pincode : 'Not provided';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-4">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Registered Address
              </h3>
              <p className="text-xs text-slate-500">
                Address registered and verified with New Utkal Finance.
              </p>
            </div>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit('address')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/80 transition-all cursor-pointer shrink-0"
              title="Edit Registered Address"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-1">
          {/* Full Address - Spans 2 cols on desktop */}
          <div className="md:col-span-2 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold">
              Full Registered Street Address
            </span>
            <span
              className={`text-xs leading-relaxed ${
                isMissing(address) ? 'text-slate-400 italic font-normal' : 'font-extrabold text-slate-900'
              }`}
            >
              {displayAddress}
            </span>
          </div>

          {/* District */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold">
              District
            </span>
            <span
              className={`text-xs ${
                isMissing(district) ? 'text-slate-400 italic font-normal' : 'font-extrabold text-slate-900'
              }`}
            >
              {displayDistrict}
            </span>
          </div>

          {/* State & Pincode */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold">
              State &amp; Postal PIN
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs text-slate-900">{displayState}</span>
              <span className="text-slate-300">•</span>
              <span
                className={`font-mono text-xs ${
                  isMissing(pincode) ? 'text-slate-400 italic font-normal' : 'font-extrabold text-[#004085]'
                }`}
              >
                {displayPincode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLIANCE NOTE */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Verified against official address proof document.</span>
      </div>
    </div>
  );
}
