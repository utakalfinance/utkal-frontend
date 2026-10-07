import React from 'react';

export function GalleryCard({ image, title, description, label = "OUR TEAM", onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[18px] border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col h-full"
    >
      {/* Photo Container */}
      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-slate-100 rounded-t-[18px]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 rounded-t-[18px]"
          loading="lazy"
        />
      </div>

      {/* Card Body Under Image */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-2 bg-white rounded-b-[18px]">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest block">
            {label}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-blue-700 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-0.5">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GalleryCard;

