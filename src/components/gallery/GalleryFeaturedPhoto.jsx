import React, { useState } from 'react';
import { GalleryLightbox } from './GalleryLightbox';

import mdPhoto from '../../assets/image copy 9.png';
import sureshPhoto from '../../assets/WhatsApp Image 2026-09-19 at 12.41.27.jpeg';
import hemantaPhoto from '../../assets/WhatsApp Image 2026-09-19 at 13.58.06.jpeg';
import ajitPhoto from '../../assets/WhatsApp Image 2026-09-19 at 13.55.28.jpeg';
import antarjamiPhoto from '../../assets/image copy 25.png';
import govindaPhoto from '../../assets/image copy 19.png';
import mornalPhoto from '../../assets/image copy 26.png';

export function GalleryFeaturedPhoto() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const teamMembers = [
    {
      id: 1,
      image: mdPhoto,
      name: "Bhagirathi Mohapatra",
      modalTitle: "Bhagirathi Mohapatra",
      modalCaption: "Managing Director • New Utkal Finance Limited",
      category: "Leadership",
    },
    {
      id: 2,
      image: sureshPhoto,
      name: "Suresh Kumar Behera",
      modalTitle: "Suresh Kumar Behera",
      modalCaption: "Director • New Utkal Finance Limited",
      category: "Leadership",
    },
    {
      id: 3,
      image: hemantaPhoto,
      name: "Hemanta Kumar Nayak",
      modalTitle: "Hemanta Kumar Nayak",
      modalCaption: "Director • New Utkal Finance Limited",
      category: "Leadership",
    },
    {
      id: 4,
      image: ajitPhoto,
      name: "Ajit Bhuria",
      modalTitle: "Ajit Bhuria",
      modalCaption: "Share Holder • New Utkal Finance Limited",
      category: "Leadership",
    },
    {
      id: 5,
      image: antarjamiPhoto,
      name: "Antarjami Behera",
      modalTitle: "Antarjami Behera",
      modalCaption: "Board Member • New Utkal Finance Limited",
      category: "Leadership",
    },
    {
      id: 6,
      image: govindaPhoto,
      name: "Govinda Behera",
      modalTitle: "Govinda Behera",
      modalCaption: "Board Member • New Utkal Finance Limited",
      category: "Leadership",
    },
    {
      id: 7,
      image: mornalPhoto,
      name: "Mornal Kumar Mohapatra",
      modalTitle: "Mornal Kumar Mohapatra",
      modalCaption: "Board Member • New Utkal Finance Limited",
      category: "Leadership",
    },
  ];

  const handleOpenPhoto = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 font-sans">
      {/* Header Accent and Subtitle */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className="w-16 h-1 bg-amber-400 rounded-full mx-auto mb-3 shadow-xs" />
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
          Meet the people who contribute their experience, vision and commitment to our growing financial community.
        </p>
      </div>

      {/* Team Cards Grid (4 in row on large screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {teamMembers.map((member, index) => (
          <div
            key={member.id}
            onClick={() => handleOpenPhoto(index)}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col justify-between"
          >
            {/* Portrait Photo Container - Full Uncropped View */}
            <div className="relative overflow-hidden bg-slate-100 rounded-t-3xl">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-auto object-cover object-top group-hover:scale-102 transition-transform duration-500 rounded-t-3xl"
                loading="eager"
              />
            </div>

            {/* Name Under Image */}
            <div className="p-4 sm:p-5 text-center bg-white border-t border-slate-100">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {member.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen Lightbox */}
      <GalleryLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        currentIndex={currentIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        photos={teamMembers}
      />
    </section>
  );
}

export default GalleryFeaturedPhoto;
