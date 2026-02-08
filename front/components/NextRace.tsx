import React from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

interface NextRaceProps {
  onViewChange: (view: any) => void;
}

const NextRace: React.FC<NextRaceProps> = ({ onViewChange }) => {
  const { getText } = useSiteContent('nextrace');

  return (
    <section className="py-24 px-6 lg:px-20 bg-[#0F0F0F]">
      <div className="flex justify-between items-end mb-12">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-12 bg-[#FF4D00]"></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">
              {getText('SECTION_TITLE', 'NÖVBƏTİ YARIŞ')}
            </h2>
            <p className="text-[#FF4D00] font-black italic text-[10px] mt-1 uppercase tracking-[0.2em]">
              {getText('SECTION_SUBTITLE', 'LİVE REGİSTRATİON OPEN')}
            </p>
          </div>
        </div>
        <button
          onClick={() => onViewChange('events')}
          className="bg-white/5 text-white font-black italic text-[10px] px-8 py-3 rounded-sm transform -skew-x-12 flex items-center gap-2 hover:bg-[#FF4D00] hover:text-black transition-all border border-white/5"
        >
          <span className="transform skew-x-12">{getText('VIEW_ALL_BTN', 'TAM TƏQVİM')}</span> <ChevronRight className="w-4 h-4 transform skew-x-12" />
        </button>
      </div>

      <div className="bg-[#111] shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden rounded-sm border-l-8 border-[#FF4D00] max-w-6xl mx-auto relative group">
        <div className="md:w-1/2 bg-black relative min-h-[300px] md:min-h-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541447271487-09612b3f49f7?q=80&w=1974&auto=format&fit=crop"
            alt="Next Race"
            className="w-full h-full object-cover opacity-40 grayscale group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <span className="text-[#FF4D00] text-9xl font-black italic opacity-5 uppercase select-none tracking-tighter">
              {getText('RACE_LOCATION_BG', 'SUMQAYIT')}
            </span>
          </div>
        </div>
        <div className="md:w-1/2 p-10 md:p-20 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-[#FF4D00] font-black italic mb-4">
            <Calendar className="w-5 h-5" />
            <span className="text-lg tracking-widest uppercase">{getText('RACE_DATE', '2024-07-20')}</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black italic leading-[0.9] mb-6 tracking-tighter uppercase text-white">
            {getText('RACE_CITY', 'SUMQAYIT')} <br /><span className="text-gray-500">{getText('RACE_TYPE', 'CHALLENGE')}</span>
          </h2>
          <div className="flex items-center gap-2 text-gray-500 font-black italic mb-10 text-xs uppercase tracking-widest">
            <MapPin className="w-4 h-4 text-[#FF4D00]" />
            <span>{getText('RACE_LOCATION', 'SUMQAYIT SAHİL TRASI // SECTOR 04')}</span>
          </div>

          <button
            onClick={() => onViewChange('events')}
            className="bg-[#FF4D00] hover:bg-white text-black font-black italic py-5 px-12 rounded-sm flex items-center gap-3 transition-all self-start transform -skew-x-12 group shadow-[0_10px_30px_rgba(255,77,0,0.2)]"
          >
            <span className="transform skew-x-12 uppercase text-lg">{getText('REGISTER_BTN', 'QATILMAQ ÜÇÜN QEYDİYYAT')}</span>
            <ChevronRight className="w-6 h-6 transform skew-x-12 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NextRace;