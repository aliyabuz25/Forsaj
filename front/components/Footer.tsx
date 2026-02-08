
import React from 'react';
import { Instagram, Youtube, Facebook, ArrowRight } from 'lucide-react';

interface FooterProps {
  onViewChange: (view: 'home' | 'about' | 'news' | 'events' | 'drivers' | 'rules' | 'contact' | 'gallery') => void;
}

const Footer: React.FC<FooterProps> = ({ onViewChange }) => {
  const navigationLinks = [
    { name: 'ANA SƏHİFƏ', id: 'home' as const },
    { name: 'HAQQIMIZDA', id: 'about' as const },
    { name: 'XƏBƏRLƏR', id: 'news' as const },
    { name: 'TƏDBİRLƏR', id: 'events' as const },
    { name: 'SÜRÜCÜLƏR', id: 'drivers' as const },
    { name: 'QALEREYA', id: 'gallery' as const },
    { name: 'ƏLAQƏ', id: 'contact' as const },
  ];

  const rulesLinks = [
    { name: 'PİLOT PROTOKOLU', id: 'rules' as const },
    { name: 'TEXNİKİ NORMATİVLƏR', id: 'rules' as const },
    { name: 'TƏHLÜKƏSİZLİK QAYDALARI', id: 'rules' as const },
    { name: 'EKOLOJİ MƏSULİYYƏT', id: 'rules' as const },
  ];

  return (
    <footer className="bg-[#050505] pt-32 pb-12 px-6 lg:px-20 border-t border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-24">

        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => onViewChange('home')}>
            <h2 className="text-4xl font-black italic tracking-tighter flex items-center">
              <span className="text-white">FORSAJ</span>
              <span className="text-[#FF4D00] ml-1">CLUB</span>
            </h2>
          </div>
          <p className="text-gray-500 font-bold italic text-[11px] uppercase leading-relaxed mb-10 max-w-xs tracking-tight">
            Azərbaycanın ən prestijli motorsport mərkəzi. Sərhədsiz offroad həyəcanını bizimlə yaşayın.
          </p>
          <div className="flex gap-4">
            {[Instagram, Youtube, Facebook].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="bg-white/5 p-4 rounded-sm text-gray-500 hover:bg-[#FF4D00] hover:text-black transition-all transform hover:-translate-y-1 shadow-sm"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[#FF4D00] font-black italic text-[13px] mb-8 uppercase tracking-[0.3em]">NAVİQASİYA</h4>
          <ul className="space-y-5">
            {navigationLinks.map(link => (
              <li key={link.name}>
                <button
                  onClick={() => onViewChange(link.id)}
                  className="text-gray-500 font-black italic text-[11px] uppercase hover:text-white transition-colors tracking-tight text-left"
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[#FF4D00] font-black italic text-[13px] mb-8 uppercase tracking-[0.3em]">MOTORSPORT</h4>
          <ul className="space-y-5">
            {rulesLinks.map(link => (
              <li key={link.name}>
                <button
                  onClick={() => onViewChange(link.id)}
                  className="text-gray-500 font-black italic text-[11px] uppercase hover:text-white transition-colors tracking-tight text-left"
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/5 p-8 rounded-sm border border-white/5">
          <h4 className="text-white font-black italic text-[13px] mb-4 uppercase tracking-tighter">XƏBƏRDAR OL</h4>
          <p className="text-gray-500 font-bold italic text-[10px] uppercase mb-8 leading-relaxed tracking-tight">
            Yarış təqvimi və xəbərlərdən anında xəbərdar olmaq üçün abunə olun.
          </p>
          <div className="flex items-center">
            <input
              type="email"
              placeholder="EMAIL DAXİL EDİN"
              className="flex-grow bg-[#111] border border-white/10 border-r-0 py-4 px-5 font-black italic text-[10px] text-white uppercase focus:outline-none focus:border-[#FF4D00] transition-colors placeholder:text-gray-600"
            />
            <button className="bg-[#FF4D00] text-black p-4 hover:bg-white transition-colors flex items-center justify-center">
              <ArrowRight size={22} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-600 font-black italic text-[9px] uppercase tracking-widest">
          © 2024 FORSAJ CLUB. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-10">
          <a href="#" className="text-gray-600 font-black italic text-[9px] uppercase tracking-widest hover:text-[#FF4D00] transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-600 font-black italic text-[9px] uppercase tracking-widest hover:text-[#FF4D00] transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
