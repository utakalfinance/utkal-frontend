import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export function GalleryLightbox({ isOpen, onClose, currentIndex, onPrev, onNext, photos }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in font-sans"
      onClick={onClose}
    >
      {/* Lightbox Main Container Box */}
      <div
        className="relative bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/80 text-white z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-slate-800 text-amber-400 px-3 py-1 rounded-full border border-slate-700">
              {currentIndex + 1} / {photos.length}
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider hidden sm:inline-block">
              Team Photograph
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Stage Area */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[450px] p-2">
          {/* Main Photo */}
          <img
            src={currentPhoto.image}
            alt={currentPhoto.modalTitle || currentPhoto.title}
            className="max-w-full max-h-[65vh] sm:max-h-[72vh] object-contain rounded-xl shadow-2xl"
          />

          {/* Navigation Controls (Only if multiple photos) */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onPrev === 'function') onPrev();
                }}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 flex items-center justify-center transition-all hover:scale-105 shadow-xl cursor-pointer"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onNext === 'function') onNext();
                }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 flex items-center justify-center transition-all hover:scale-105 shadow-xl cursor-pointer"
                aria-label="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Caption Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 text-white space-y-1 text-center sm:text-left z-10">
          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {currentPhoto.modalTitle}
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            {currentPhoto.modalCaption}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GalleryLightbox;
