import React from 'react';
import { UserCheck } from 'lucide-react';
import mdPhoto from '../../assets/image copy 9.png';
import sureshPhoto from '../../assets/WhatsApp Image 2026-09-19 at 12.41.27.jpeg';
import hemantaPhoto from '../../assets/WhatsApp Image 2026-09-19 at 13.58.06.jpeg';
import antarjamiPhoto from '../../assets/image copy 25.png';
import govindaPhoto from '../../assets/image copy 19.png';
import ajitBhueiaPhoto from '../../assets/WhatsApp Image 2026-09-19 at 13.55.28.jpeg';
import mornalPhoto from '../../assets/image copy 26.png';
import krushnaPhoto from '../../assets/krushna_chandra_sahoo.jpg';
import jalandharPhoto from '../../assets/jalandhar_pradhan.jpg';
import surathPhoto from '../../assets/surath_sahoo.jpg';

export function LeadershipTeam() {
  const leaders = [
    {
      id: 1,
      image: mdPhoto,
      name: "Bhagirathi Mohapatra",
    },
    {
      id: 2,
      image: sureshPhoto,
      name: "Suresh Kumar Behera",
    },
    {
      id: 3,
      image: hemantaPhoto,
      name: "Hemanta Kumar Nayak",
    },
    {
      id: 4,
      image: antarjamiPhoto,
      name: "Antarjami Behera",
    },
    {
      id: 5,
      image: govindaPhoto,
      name: "Govinda Behera",
    },
    {
      id: 6,
      image: ajitBhueiaPhoto,
      name: "Ajit Kumar Bhueia",
    },
    {
      id: 7,
      image: mornalPhoto,
      name: "Mornal Kumar Mohapatra",
    },
    {
      id: 8,
      image: krushnaPhoto,
      name: "Krushna Chandra Sahoo",
    },
    {
      id: 9,
      image: jalandharPhoto,
      name: "Jalandhar Pradhan",
    },
    {
      id: 10,
      image: surathPhoto,
      name: "Surath Sahoo",
    },
  ];

  return (
    <section className="bg-slate-100/70 py-16 sm:py-20 border-y border-slate-200/80 font-sans relative overflow-hidden">
      {/* Background Decorative Ambient Circles */}
      <div className="absolute -top-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 uppercase tracking-widest mb-3 shadow-xs">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> OUR LEADERSHIP
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Meet Our Leadership
          </h2>

          {/* Thin Gold Accent Line */}
          <div className="w-16 h-1 bg-amber-400 rounded-full mx-auto my-3 shadow-xs" />

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal mt-2">
            Meet the people who contribute their experience, vision and commitment to our growing financial community.
          </p>
        </div>

        {/* Leadership Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 max-w-7xl mx-auto">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden group transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
            >
              {/* Photo Container */}
              <div className="relative overflow-hidden bg-slate-900">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-auto object-cover object-top group-hover:scale-102 transition-transform duration-500"
                />
              </div>

              {/* Under Image: Only Write The Name */}
              <div className="p-4 sm:p-5 text-center bg-white border-t border-slate-100">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {leader.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LeadershipTeam;

