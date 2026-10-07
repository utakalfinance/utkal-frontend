import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { GalleryCard } from './GalleryCard';
import { GalleryLightbox } from './GalleryLightbox';

import teamPhoto1 from '../../assets/image copy 22.png';
import teamPhoto2 from '../../assets/image copy 24.png';

const CORE_TEAM_PHOTOS = [
  {
    id: 'TEAM-1',
    image: teamPhoto1,
    imageUrl: teamPhoto1,
    label: 'OUR TEAM',
    category: 'Team',
    title: 'Executive Leadership & Board Team',
    description: 'Working together with a shared vision for growth, stability and community service across Odisha.',
    modalTitle: 'Executive Leadership & Board Team',
    modalCaption: 'Working together with a shared vision for growth, stability and community service across Odisha.',
  },
  {
    id: 'TEAM-2',
    image: teamPhoto2,
    imageUrl: teamPhoto2,
    label: 'OUR TEAM',
    category: 'Team',
    title: 'Bhubaneswar Corporate Branch Team',
    description: 'Dedicated financial advisory, credit appraisal, and operational staff at Nayapalli HQ.',
    modalTitle: 'Bhubaneswar Corporate Branch Team',
    modalCaption: 'Dedicated financial advisory, credit appraisal, and operational staff at Nayapalli HQ.',
  },
];

export function TeamGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleOpenTeamLightbox = (index) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % CORE_TEAM_PHOTOS.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + CORE_TEAM_PHOTOS.length) % CORE_TEAM_PHOTOS.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 uppercase tracking-widest mb-2">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>OUR TEAM</span>
        </span>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          People behind New Utkal Finance
        </h2>

        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal mt-2">
          Meet the dedicated people who contribute to our vision, operational excellence and commitment to our members across Odisha.
        </p>
      </div>

      {/* Two Dedicated Team Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto items-stretch">
        {CORE_TEAM_PHOTOS.map((photo, index) => (
          <GalleryCard
            key={photo.id}
            image={photo.image}
            label={photo.label}
            title={photo.title}
            description={photo.description}
            index={index}
            onClick={() => handleOpenTeamLightbox(index)}
          />
        ))}
      </div>

      {/* Interactive Lightbox Modal */}
      <GalleryLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        currentIndex={selectedIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        photos={CORE_TEAM_PHOTOS}
      />
    </section>
  );
}

export default TeamGallery;

