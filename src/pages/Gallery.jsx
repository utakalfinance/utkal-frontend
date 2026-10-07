import React from 'react';
import { GalleryHero } from '../components/gallery/GalleryHero';
import { TeamGallery } from '../components/gallery/TeamGallery';
import { GalleryIntro } from '../components/gallery/GalleryIntro';
import { GalleryCTA } from '../components/gallery/GalleryCTA';

export function Gallery() {
  return (
    <div className="space-y-6 sm:space-y-10 pb-12 font-sans w-full max-w-full overflow-x-hidden">
      <GalleryHero />
      <TeamGallery />
      <GalleryIntro />
      <GalleryCTA />
    </div>
  );
}

export default Gallery;
