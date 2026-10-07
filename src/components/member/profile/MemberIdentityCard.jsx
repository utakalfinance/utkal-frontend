import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

/**
 * MemberIdentityCard Component
 * Displays avatar (image or initial), legal name, status badge, copyable Member ID, and verification indicators.
 */
export function MemberIdentityCard({
  name = 'Not provided',
  memberId = 'Not provided',
  photoUrl = null,
  status = 'Active',
  kycStatus = 'Verified',
  memberSince = null,
  onEdit,
}) {
  const [copied, setCopied] = useState(false);

  // Generate clean initials from name (e.g., "Jyoti Das" -> "JD")
  const getInitials = (fullName) => {
    if (!fullName || fullName === 'Not provided') return 'M';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleCopyMemberId = () => {
    if (!memberId || memberId === 'Not provided') return;
    navigator.clipboard?.writeText(memberId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasValidId = memberId && memberId !== 'Not provided';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-7 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        {/* LEFT: AVATAR & PRIMARY INFO */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          {/* Avatar Container */}
          <div className="relative shrink-0 group">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0B1528] via-[#003366] to-[#0055A5] text-white flex items-center justify-center font-black text-xl sm:text-2xl tracking-tight shadow-md border-2 border-white ring-2 ring-slate-100">
                {getInitials(name)}
              </div>
            )}
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit('avatar')}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#004085] hover:bg-blue-900 border-2 border-white flex items-center justify-center shadow-xs text-white transition-transform hover:scale-110 cursor-pointer"
                title="Change Profile Photo"
                aria-label="Change Profile Photo"
              >
                <Pencil className="w-3 h-3 stroke-[2.5]" />
              </button>
            ) : (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs"
                title="Verified Active Member"
              >
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            )}
          </div>

          {/* Member Details */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight capitalize truncate">
                {name}
              </h2>
              <StatusBadge status={status} />
            </div>

            {/* Copyable Member ID */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                <span className="text-slate-500 font-sans text-[11px] font-semibold">Member ID:</span>
                <span className="text-[#004085] font-extrabold">{memberId}</span>
                {hasValidId && (
                  <button
                    type="button"
                    onClick={handleCopyMemberId}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer ml-0.5"
                    title="Copy Member ID"
                    aria-label="Copy Member ID"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              {copied && (
                <span className="text-[11px] font-bold text-emerald-700 animate-fade-in">
                  Copied!
                </span>
              )}
            </div>

            {/* Verification Status & Member Since Line */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap pt-0.5">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Account: Active &amp; Verified</span>
              </span>
              {memberSince && memberSince !== 'Not provided' && (
                <>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Member since: <strong className="text-slate-700">{memberSince}</strong></span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: KYC STATUS BADGE & EDIT BUTTON */}
        <div className="self-stretch sm:self-center flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hidden sm:inline">
              KYC Status:
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{kycStatus}</span>
            </div>
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit('personal')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#004085] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

