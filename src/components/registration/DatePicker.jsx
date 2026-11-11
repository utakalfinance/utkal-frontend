import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { ValidationMessage } from './ValidationMessage';

/**
 * Converts an ISO date string (YYYY-MM-DD) to Indian format (DD/MM/YYYY).
 */
export function isoToDmy(isoStr) {
  if (!isoStr || typeof isoStr !== 'string') return '';
  const trimmed = isoStr.trim();
  const parts = trimmed.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return '';
}

/**
 * Validates Day part (01 - 31).
 */
function validateDayPart(dayStr, isDeleting) {
  if (!dayStr) return { str: '', error: null };
  let s = dayStr.replace(/\D/g, '').slice(0, 2);

  // If typing forward and 1st digit is 4-9, auto-prefix '0'
  if (!isDeleting && s.length === 1) {
    const d1 = parseInt(s[0], 10);
    if (d1 > 3) {
      s = '0' + s;
    }
  }

  if (s.length === 2) {
    const num = parseInt(s, 10);
    if (num > 31) {
      return { str: '31', error: 'Day cannot exceed 31 (set to 31).' };
    }
    if (num === 0) {
      return { str: '01', error: 'Day must be between 01 and 31.' };
    }
  }

  return { str: s, error: null };
}

/**
 * Validates Month part (01 - 12).
 */
function validateMonthPart(monthStr, isDeleting) {
  if (!monthStr) return { str: '', error: null };
  let s = monthStr.replace(/\D/g, '').slice(0, 2);

  // If typing forward and 1st digit is 2-9, auto-prefix '0'
  if (!isDeleting && s.length === 1) {
    const m1 = parseInt(s[0], 10);
    if (m1 > 1) {
      s = '0' + s;
    }
  }

  if (s.length === 2) {
    const num = parseInt(s, 10);
    if (num > 12) {
      return { str: '12', error: 'Month cannot exceed 12 (set to 12).' };
    }
    if (num === 0) {
      return { str: '01', error: 'Month must be between 01 and 12.' };
    }
  }

  return { str: s, error: null };
}

/**
 * Strictly validates Year part (minYear to maxYear, e.g. 1940 to 2026).
 * Blocks ANY input that would result in a year greater than maxYear!
 */
function validateYearPart(yearStr, isDeleting, minYear = 1940, maxYear = 2026) {
  if (!yearStr) return { str: '', error: null };
  let s = yearStr.replace(/\D/g, '').slice(0, 4);

  if (isDeleting) {
    return { str: s, error: null };
  }

  const maxYearStr = String(maxYear);

  // 1st digit of year: only '1' (for 19xx) or '2' (for 20xx)
  if (s.length >= 1) {
    if (s[0] !== '1' && s[0] !== '2') {
      return { str: '', error: `Year must begin with 19xx or 20xx (max ${maxYear}).` };
    }
  }

  // 2nd digit of year:
  if (s.length >= 2) {
    if (s[0] === '1' && s[1] !== '9') {
      return { str: '1', error: `Year must be ${minYear} or later.` };
    }
    if (s[0] === '2' && s[1] !== '0') {
      // Cannot be 21xx, 22xx, 23xx, etc.
      return { str: '2', error: `Year cannot exceed ${maxYear} (21xx+ is blocked).` };
    }
  }

  // 3rd digit of year:
  if (s.length >= 3) {
    if (s[0] === '1' && s[1] === '9') {
      // 1940..1999: 3rd digit must be >= 4
      const d3 = parseInt(s[2], 10);
      if (d3 < 4) {
        return { str: '19', error: `Year must be ${minYear} or later.` };
      }
    }
    if (s[0] === '2' && s[1] === '0') {
      // 2000..2026: 3rd digit can only be 0, 1, or 2 (for 2026)
      const maxD3 = parseInt(maxYearStr[2], 10);
      const d3 = parseInt(s[2], 10);
      if (d3 > maxD3) {
        return { str: '20', error: `Year cannot exceed ${maxYear}.` };
      }
    }
  }

  // 4th digit of year:
  if (s.length === 4) {
    const num = parseInt(s, 10);
    if (num > maxYear) {
      return { str: String(maxYear), error: `Year cannot exceed ${maxYear} (set to ${maxYear}).` };
    }
    if (num < minYear) {
      return { str: String(minYear), error: `Year must be ${minYear} or later (set to ${minYear}).` };
    }
  }

  return { str: s, error: null };
}

/**
 * Formats and strictly validates the entire date string.
 */
export function formatAndValidateDate(rawInput, isDeleting = false, minYear = 1940, maxYear = 2026) {
  if (!rawInput) {
    return { formattedText: '', iso: '', error: null, isComplete: false };
  }

  const cleaned = rawInput.replace(/[^0-9\/\-\.]/g, '');
  if (!cleaned) {
    return { formattedText: '', iso: '', error: null, isComplete: false };
  }

  let rawDay = '';
  let rawMonth = '';
  let rawYear = '';

  const parts = cleaned.split(/[\/\-\.]/);
  if (parts.length > 1) {
    rawDay = parts[0] || '';
    rawMonth = parts[1] || '';
    rawYear = parts[2] || '';
  } else {
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length <= 2) {
      rawDay = digits;
    } else if (digits.length <= 4) {
      rawDay = digits.slice(0, 2);
      rawMonth = digits.slice(2);
    } else {
      rawDay = digits.slice(0, 2);
      rawMonth = digits.slice(2, 4);
      rawYear = digits.slice(4, 8);
    }
  }

  // Strictly validate each part
  const dayRes = validateDayPart(rawDay, isDeleting);
  const monthRes = validateMonthPart(rawMonth, isDeleting);
  const yearRes = validateYearPart(rawYear, isDeleting, minYear, maxYear);

  let inlineError = yearRes.error || monthRes.error || dayRes.error;

  let dayPart = dayRes.str;
  let monthPart = monthRes.str;
  let yearPart = yearRes.str;

  // Verify days in specific month (e.g. Feb leap year, April 30 days)
  if (dayPart.length === 2 && monthPart.length === 2 && yearPart.length === 4) {
    const y = parseInt(yearPart, 10);
    const m = parseInt(monthPart, 10);
    const d = parseInt(dayPart, 10);
    const maxDays = new Date(y, m, 0).getDate();
    if (d > maxDays) {
      dayPart = String(maxDays).padStart(2, '0');
      inlineError = `Adjusted day to ${maxDays} (maximum for ${new Date(y, m - 1).toLocaleString('default', { month: 'long' })}).`;
    }
  }

  // Assemble formatted display string
  let formatted = dayPart;
  if (!isDeleting) {
    if (dayPart.length === 2) {
      formatted += '/';
      if (monthPart) {
        formatted += monthPart;
        if (monthPart.length === 2) {
          formatted += '/';
          if (yearPart) {
            formatted += yearPart;
          }
        }
      }
    } else if (monthPart) {
      formatted += '/' + monthPart;
      if (yearPart) {
        formatted += '/' + yearPart;
      }
    }
  } else {
    if (monthPart || parts.length > 1) {
      formatted += '/' + monthPart;
    }
    if (yearPart || parts.length > 2) {
      formatted += '/' + yearPart;
    }
  }

  const isComplete = dayPart.length === 2 && monthPart.length === 2 && yearPart.length === 4;
  let iso = '';
  let finalYear = 1996;
  let finalMonth = 4;
  let finalDay = 1;

  if (isComplete) {
    const y = parseInt(yearPart, 10);
    const m = parseInt(monthPart, 10);
    const d = parseInt(dayPart, 10);
    finalYear = y;
    finalMonth = m - 1;
    finalDay = d;
    iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return {
    formattedText: formatted,
    iso,
    error: inlineError,
    isComplete,
    year: finalYear,
    month: finalMonth,
    day: finalDay,
  };
}

/**
 * Reusable DatePicker component supporting:
 * 1. Direct keyboard typing with STRICT range blocking (never allows year > 2026, month > 12, or day > 31).
 * 2. Visual interactive Calendar picker with month navigation and Year Grid selection (1940 - 2026).
 * 3. Bidirectional synchronization: typing updates calendar, picking updates input and age.
 */
export function DatePicker({
  label = 'Date of Birth',
  name = 'dob',
  value = '',
  onChange,
  error = null,
  minYear = 1940,
  maxYear = 2026,
  required = false,
  helperText = '',
  dropUp = true,
  placeholder = 'DD/MM/YYYY',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showYearGrid, setShowYearGrid] = useState(false);
  const [inlineNotice, setInlineNotice] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const isDeletingRef = useRef(false);

  // Local state for the typed text
  const [inputValue, setInputValue] = useState(() => isoToDmy(value));

  // Calendar view year and month
  const initialDateObj = value ? new Date(value) : null;
  const initialValid = initialDateObj && !isNaN(initialDateObj.getTime());
  const [viewYear, setViewYear] = useState(() => (initialValid ? initialDateObj.getFullYear() : 1996));
  const [viewMonth, setViewMonth] = useState(() => (initialValid ? initialDateObj.getMonth() : 4)); // May

  // Keep inputValue and calendar view in sync when value prop updates from parent
  useEffect(() => {
    if (value) {
      const formatted = isoToDmy(value);
      setInputValue(formatted);
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowYearGrid(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Selected date parsed from current value prop
  const selectedDateObj = value ? new Date(value) : null;
  const hasSelectedDate = selectedDateObj && !isNaN(selectedDateObj.getTime());

  // Handle day click from calendar
  const handleSelectDay = (day) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const isoFormatted = `${viewYear}-${m}-${d}`;
    const dmyFormatted = `${d}/${m}/${viewYear}`;

    setInputValue(dmyFormatted);
    setInlineNotice(null);
    if (onChange) onChange(isoFormatted);
    setIsOpen(false);
    setShowYearGrid(false);
  };

  // Keyboard navigation and backspace detection
  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isDeletingRef.current = true;
    } else {
      isDeletingRef.current = false;
    }

    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape' || e.key === 'Enter') {
      setIsOpen(false);
    }
  };

  // Input typing change handler with strict blocking of year > 2026
  const handleInputChange = (e) => {
    const raw = e.target.value;
    const isDeleting = isDeletingRef.current;

    const result = formatAndValidateDate(raw, isDeleting, minYear, maxYear);

    setInputValue(result.formattedText);
    setInlineNotice(result.error);

    if (result.isComplete && result.iso) {
      if (onChange) onChange(result.iso);
      setViewYear(result.year);
      setViewMonth(result.month);
    } else if (!result.formattedText.trim()) {
      if (onChange) onChange('');
      setInlineNotice(null);
    }
  };

  // Input blur handler
  const handleBlur = () => {
    if (!inputValue.trim()) {
      setInlineNotice(null);
      if (onChange) onChange('');
      return;
    }

    const result = formatAndValidateDate(inputValue, false, minYear, maxYear);
    if (result.isComplete && result.iso) {
      setInputValue(result.formattedText);
      setInlineNotice(result.error);
      if (onChange) onChange(result.iso);
      setViewYear(result.year);
      setViewMonth(result.month);
    } else {
      setInlineNotice('Please enter complete date (DD/MM/YYYY).');
    }
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    setInlineNotice(null);
    if (onChange) onChange('');
    inputRef.current?.focus();
  };

  // Month navigation with year transition
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > minYear) {
        setViewYear((y) => y - 1);
        setViewMonth(11);
      }
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < maxYear) {
        setViewYear((y) => y + 1);
        setViewMonth(0);
      }
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const displayError = error || (inlineNotice && !inlineNotice.includes('set to') && !inlineNotice.includes('Adjusted') ? inlineNotice : null);
  const displayNotice = inlineNotice && (inlineNotice.includes('set to') || inlineNotice.includes('Adjusted')) ? inlineNotice : null;

  return (
    <div className="space-y-1.5 relative text-left" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={name} className="block text-xs font-bold text-slate-700 tracking-wide uppercase">
            {label} {required && <span className="text-rose-500 font-extrabold">*</span>}
          </label>
        </div>
      )}

      <div className="relative rounded-xl shadow-2xs">
        {/* Left Calendar icon button: click to toggle calendar */}
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setShowYearGrid(false);
          }}
          className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-blue-600 hover:text-blue-700 focus:outline-none transition-colors cursor-pointer z-10"
          title="Click to toggle calendar"
          tabIndex={-1}
        >
          <CalendarIcon className="w-4 h-4" />
        </button>

        {/* Text Input: strictly prevents year > 2026 */}
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          maxLength={10}
          inputMode="numeric"
          autoComplete="off"
          className={`w-full text-xs font-bold tracking-wider rounded-xl border transition-all duration-200 outline-none
            pl-10 pr-12 py-2.5 sm:py-3 font-mono
            ${
              displayError
                ? 'border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : isOpen
                ? 'border-blue-600 ring-2 ring-blue-600/15 bg-white text-slate-900'
                : 'border-slate-300/90 bg-white text-slate-900 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
            }
            placeholder:text-slate-400 placeholder:font-normal placeholder:font-sans placeholder:tracking-normal
          `}
        />

        {/* Right side controls: Clear button & Chevron dropdown button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 z-10">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
              title="Clear date"
              tabIndex={-1}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              setShowYearGrid(false);
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer focus:outline-none"
            title={isOpen ? 'Close calendar' : 'Open calendar'}
            tabIndex={-1}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* CALENDAR POPUP - OPENS UPWARDS SO ALL 31 DAYS ARE 100% VISIBLE */}
        {isOpen && (
          <div
            className={`absolute ${
              dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
            } left-0 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-fade-in text-slate-900 select-none`}
          >
            {/* HEADER: MONTH NAV & YEAR TOGGLE */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-extrabold text-slate-900 w-24 text-center">
                  {months[viewMonth]}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* YEAR SELECTION TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setShowYearGrid(!showYearGrid)}
                className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-black border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Click to view all years"
              >
                <span>{viewYear}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showYearGrid ? 'rotate-180 text-blue-700' : ''
                  }`}
                />
              </button>
            </div>

            {/* YEAR GRID VIEW (CLICK YEAR TO TOGGLE) */}
            {showYearGrid ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Select Birth Year
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">{minYear} – {maxYear}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setViewYear(y);
                        setShowYearGrid(false);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        viewYear === y
                          ? 'bg-[#004085] text-white font-extrabold shadow-sm ring-2 ring-blue-400'
                          : 'bg-white hover:bg-blue-50 text-slate-800 border border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* DAY HEADERS */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* CALENDAR DAYS GRID - ALL DAYS 1 TO 31 FULLY VISIBLE */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected =
                      hasSelectedDate &&
                      selectedDateObj.getFullYear() === viewYear &&
                      selectedDateObj.getMonth() === viewMonth &&
                      selectedDateObj.getDate() === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#004085] text-white shadow-sm font-black'
                            : 'hover:bg-blue-50 text-slate-800'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Quick helper footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-rose-600 font-semibold transition-colors cursor-pointer"
              >
                Clear
              </button>
              <span className="text-[10px] text-slate-400 font-medium">
                Max year: {maxYear}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Auto-correction info notice */}
      {displayNotice && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg mt-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{displayNotice}</span>
        </p>
      )}

      {/* Error message */}
      <ValidationMessage message={displayError} />

      {helperText && !displayError && !displayNotice && (
        <p className="text-[11px] text-slate-500 font-normal">{helperText}</p>
      )}
    </div>
  );
}

export default DatePicker;
