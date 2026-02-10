
import React from 'react';
import { Instagram, Youtube, Facebook, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

interface FooterProps {
  onViewChange: (view: 'home' | 'about' | 'news' | 'events' | 'drivers' | 'rules' | 'contact' | 'gallery') => void;
}

const Footer: React.FC<FooterProps> = ({ onViewChange }) => {
  const { getText, getUrl } = useSiteContent('footer');
  const { getUrl: getImg } = useSiteContent('general');

  const logoImg = getImg('SITE_LOGO_LIGHT');

  const navigationLinks = [
    { name: getText('txt-ana-s-h-f-744', 'ANA SƏHİFƏ'), id: getUrl('txt-ana-s-h-f-744', 'home') as any },
    { name: getText('txt-haqqimizda-942', 'HAQQIMIZDA'), id: getUrl('txt-haqqimizda-942', 'about') as any },
    { name: getText('txt-x-b-rl-r-431', 'XƏBƏRLƏR'), id: getUrl('txt-x-b-rl-r-431', 'news') as any },
    { name: getText('txt-t-dbi-rl-r-62', 'TƏDBİRLƏR'), id: getUrl('txt-t-dbi-rl-r-62', 'events') as any },
    { name: getText('txt-s-r-c-l-r-931', 'SÜRÜCÜLƏR'), id: getUrl('txt-s-r-c-l-r-931', 'drivers') as any },
    { name: getText('txt-qalereya-112', 'QALEREYA'), id: getUrl('txt-qalereya-112', 'gallery') as any },
    { name: getText('txt-laq-452', 'ƏLAQƏ'), id: getUrl('txt-laq-452', 'contact') as any },
  ];

  const rulesLinks = [
    { name: getText('txt-pi-lot-protokolu-31', 'PİLOT PROTOKOLU'), id: getUrl('txt-pi-lot-protokolu-31', 'rules') as any },
    { name: getText('txt-texni-ki-normati-712', 'TEXNİKİ NORMATİVLƏR'), id: getUrl('txt-texni-ki-normati-712', 'rules') as any },
    { name: getText('txt-t-hl-k-si-zli-k-q-121', 'TƏHLÜKƏSİZLİK QAYDALARI'), id: getUrl('txt-t-hl-k-si-zli-k-q-121', 'rules') as any },
    { name: getText('txt-ekoloji-m-suli-yy-612', 'EKOLOJİ MƏSULİYYƏT'), id: getUrl('txt-ekoloji-m-suli-yy-612', 'rules') as any },
  ];

  return (
    <footer className="bg-[#050505] pt-32 pb-12 px-6 lg:px-20 border-t border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-24">

        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => onViewChange('home')}>
            {logoImg ? (
              <img src={logoImg} alt="Forsaj Logo" className="h-10 w-auto object-contain" />
            ) : (
              <h2 className="text-4xl font-black italic tracking-tighter flex items-center">
                <span className="text-white">FORSAJ</span>
                <span className="text-[#FF4D00] ml-1">CLUB</span>
              </h2>
            )}
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
                  onClick={() => {
                    const id = link.id;
                    if (id.startsWith('http')) {
                      window.open(id, '_blank');
                    } else {
                      onViewChange(id as any);
                    }
                  }}
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
                  onClick={() => {
                    const id = link.id;
                    if (id.startsWith('http')) {
                      window.open(id, '_blank');
                    } else {
                      onViewChange(id as any);
                    }
                  }}
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
