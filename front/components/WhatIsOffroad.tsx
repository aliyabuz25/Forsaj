
import React from 'react';
import { Settings, ShieldCheck, Compass, Zap } from 'lucide-react';

const WhatIsOffroad: React.FC = () => {
  const features = [
    { icon: <Settings className="text-[#D12027]" />, title: 'TEXNİKİ TƏCHİZAT', desc: 'Hər bir maşın xüsusi asqı sistemi və gücləndirilmiş mühərriklə təmin olunur.' },
    { icon: <ShieldCheck className="text-[#D12027]" />, title: 'TƏHLÜKƏSİZLİK', desc: 'Pilotların təhlükəsizliyi bizim üçün prioritetdir. Karkas və kəmərlər məcburidir.' },
    { icon: <Compass className="text-[#D12027]" />, title: 'NAVİQASİYA', desc: 'GPS və xəritə oxuma bacarığı offroad yarışlarında qalibiyyətin yarısıdır.' },
    { icon: <Zap className="text-[#D12027]" />, title: 'EKSTREMAL GÜC', desc: 'Sürücünün fiziki hazırlığı ən az avtomobilin gücü qədər əhəmiyyətlidir.' },
  ];

  return (
    <section className="py-24 px-6 lg:px-20 bg-gray-50 flex flex-col lg:flex-row gap-16 items-center">
      <div className="lg:w-1/2">
        <h4 className="text-[#D12027] font-black italic uppercase text-xs mb-4 tracking-widest">Offroad nədir?</h4>
        <h2 className="text-5xl font-black italic leading-none mb-8 tracking-tighter uppercase">
          ADRENALİN VƏ TEXNİKANIN SİMBİOZU
        </h2>
        <p className="text-gray-500 font-bold italic text-sm mb-12 uppercase leading-relaxed max-w-xl">
          Offroad – yalnız yolsuzluq şəraitində hərəkət etmək deyil, həm də dözümlülük, strateji düşüncə və mühəndislik bacarığının sınağıdır. Azərbaycanın çətin dağlıq relyefi bu idman növü üçün dünyada ən maraqlı məkanlardan biri hesab olunur.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4">
              <div className="bg-white p-3 shadow-lg rounded-sm transform -skew-x-12 shrink-0">
                {f.icon}
              </div>
              <div>
                <h5 className="font-black italic text-sm mb-1 tracking-tight">{f.title}</h5>
                <p className="text-[10px] text-gray-400 font-bold italic uppercase leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-1/2 relative">
        <div className="aspect-video bg-gray-200 shadow-2xl overflow-hidden rounded-sm transform skew-y-3">
          <img 
            src="https://picsum.photos/id/107/800/600" 
            alt="Offroad Culture" 
            className="w-full h-full object-cover opacity-90 grayscale"
          />
        </div>
        <div className="absolute -bottom-8 -left-8 bg-[#D12027] p-8 text-white font-black italic transform -skew-x-12 hidden md:block">
           <span className="text-4xl leading-none">15+</span>
           <p className="text-[10px] uppercase">Yarış İllik</p>
        </div>
      </div>
    </section>
  );
};

export default WhatIsOffroad;
