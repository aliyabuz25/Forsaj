import React, { useState, useEffect } from 'react';
import { PlayCircle, Image as ImageIcon, Video, ArrowRight, Zap, Maximize2, Calendar, X } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

interface GalleryItem {
  id: number;
  title: string;
  url: string;
  videoId?: string; // YouTube ID for the video
  duration?: string;
}

interface GalleryEvent {
  id: number;
  title: string;
  date: string;
  photos: GalleryItem[];
  videos: GalleryItem[];
}

const galleryData: GalleryEvent[] = [
  {
    id: 1,
    title: 'SUMQAYIT CHALLENGE 2024',
    date: 'İyul 2024',
    photos: [
      { id: 101, title: 'SAHİL START', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400&fit=crop' },
      { id: 102, title: 'QUMLUQ SINAĞI', url: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?q=80&w=400&fit=crop' },
      { id: 103, title: 'PİT STOP', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&fit=crop' },
      { id: 104, title: 'FİNİŞ ANI', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&fit=crop' },
      { id: 105, title: 'TEXNİKİ BAXIŞ', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&fit=crop' },
      { id: 106, title: 'AZARKEŞLƏR', url: 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=400&fit=crop' },
      { id: 107, title: 'QALİB KÜRSÜSÜ', url: 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?q=80&w=400&fit=crop' },
      { id: 108, title: 'GÜN BATIMI', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&fit=crop' },
    ],
    videos: [
      { id: 201, title: 'RƏSMİ RECAP', videoId: 'dQw4w9WgXcQ', duration: '02:45', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&fit=crop' },
      { id: 202, title: 'DRONE GÖRÜNTÜLƏRİ', videoId: 'dQw4w9WgXcQ', duration: '01:30', url: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?q=80&w=800&fit=crop' },
      { id: 203, title: 'KABİN İÇİ', videoId: 'dQw4w9WgXcQ', duration: '05:12', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&fit=crop' },
      { id: 204, title: 'OFFROAD HIGHLIGHTS', videoId: 'dQw4w9WgXcQ', duration: '03:20', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&fit=crop' },
      { id: 205, title: 'MÜSAHİBƏLƏR', videoId: 'dQw4w9WgXcQ', duration: '04:15', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&fit=crop' },
    ]
  },
  {
    id: 2,
    title: 'XIZI DAĞ SINAĞI 2024',
    date: 'May 2024',
    photos: [
      { id: 301, title: 'ZİRVƏYƏ DOĞRU', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&fit=crop' },
      { id: 302, title: 'DAŞLIQ ƏRAZİ', url: 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?q=80&w=400&fit=crop' },
      { id: 303, title: 'DİNAMİKA', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&fit=crop' },
      { id: 304, title: 'PİLOT BAXIŞI', url: 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=400&fit=crop' },
      { id: 305, title: 'BULUDLAR ÜSTÜNDƏ', url: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?q=80&w=400&fit=crop' },
      { id: 306, title: 'QARLI KEÇİD', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&fit=crop' },
    ],
    videos: [
      { id: 401, title: 'DAĞ RALLİSİ FİNAL', videoId: 'dQw4w9WgXcQ', duration: '10:15', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&fit=crop' },
      { id: 402, title: 'EXTREME CLIMB', videoId: 'dQw4w9WgXcQ', duration: '02:10', url: 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?q=80&w=800&fit=crop' },
      { id: 403, title: 'ENGINE SOUNDS', videoId: 'dQw4w9WgXcQ', duration: '01:05', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&fit=crop' },
      { id: 404, title: 'XIZI LANDSCAPE', videoId: 'dQw4w9WgXcQ', duration: '03:30', url: 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=800&fit=crop' },
    ]
  }
];

const GalleryPage: React.FC = () => {
  const [activeType, setActiveType] = useState<'photos' | 'videos'>('photos');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [dynamicVideos, setDynamicVideos] = useState<any[]>([]);
  const { getText } = useSiteContent('gallerypage');

  useEffect(() => {
    fetch('/videos.json')
      .then(res => res.json())
      .then(data => setDynamicVideos(data))
      .catch(() => { });
  }, []);

  const VideoModal = () => {
    if (!playingVideoId) return null;

    return (
      <div
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
        onClick={() => setPlayingVideoId(null)}
      >
        <div className="relative w-full max-w-5xl aspect-video bg-black border border-white/10 shadow-[0_0_100px_rgba(255,77,0,0.2)]">
          <button
            onClick={(e) => { e.stopPropagation(); setPlayingVideoId(null); }}
            className="absolute -top-12 right-0 md:-right-12 text-white/50 hover:text-[#FF4D00] transition-colors"
          >
            <X size={40} strokeWidth={1.5} />
          </button>

          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen py-16 px-6 lg:px-20 text-white animate-in fade-in duration-500">
      <VideoModal />

      {/* Standardized Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-20">
        <div className="flex items-start gap-4">
          <div className="w-2 h-16 bg-[#FF4D00] shadow-[0_0_15px_rgba(255,77,0,0.4)]"></div>
          <div>
            <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white">
              {getText('PAGE_TITLE', 'QALEREYA')}
            </h2>
            <p className="text-[#FF4D00] font-black italic text-[11px] md:text-sm mt-2 uppercase tracking-[0.4em]">
              {getText('PAGE_SUBTITLE', 'XRONOLOJİ MOTORSPORT ARXİVİ // FORSAJ CLUB')}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white/5 p-1 rounded-sm flex items-center border border-white/10 shadow-xl self-end lg:self-center">
          <button
            onClick={() => setActiveType('photos')}
            className={`px-10 py-4 font-black italic text-sm uppercase tracking-widest transition-all flex items-center gap-3 ${activeType === 'photos' ? 'bg-[#FF4D00] text-black transform -skew-x-12 shadow-lg shadow-[#FF4D00]/20' : 'text-gray-500 hover:text-white'}`}
          >
            <span className={activeType === 'photos' ? 'transform skew-x-12 flex items-center gap-2' : 'flex items-center gap-2'}>
              <ImageIcon size={18} /> {getText('TAB_PHOTOS', 'FOTOLAR')}
            </span>
          </button>
          <button
            onClick={() => setActiveType('videos')}
            className={`px-10 py-4 font-black italic text-sm uppercase tracking-widest transition-all flex items-center gap-3 ${activeType === 'videos' ? 'bg-[#FF4D00] text-black transform -skew-x-12 shadow-lg shadow-[#FF4D00]/20' : 'text-gray-500 hover:text-white'}`}
          >
            <span className={activeType === 'videos' ? 'transform skew-x-12 flex items-center gap-2' : 'flex items-center gap-2'}>
              <Video size={18} /> {getText('TAB_VIDEOS', 'VİDEOLAR')}
            </span>
          </button>
        </div>
      </div>

      {/* Categorized Content */}
      <div className="space-y-32">
        {galleryData.map((event) => (
          <section key={event.id} className="relative group">
            {/* Event Title Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-8">
              <div className="flex items-center gap-6">
                <div className="text-6xl md:text-7xl font-black italic text-white/5 select-none leading-none tracking-tighter absolute -top-12 left-0 pointer-events-none group-hover:text-[#FF4D00]/10 transition-colors">
                  {event.id.toString().padStart(2, '0')}
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-[#FF4D00] font-black italic text-[10px] uppercase tracking-[0.3em]">
                    <Calendar size={14} /> {event.date}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 font-black italic text-[10px] uppercase tracking-widest">
                {getText('TOTAL_LABEL', 'TOPLAM')} {activeType === 'photos' ? event.photos.length : event.videos.length} {activeType === 'photos' ? getText('TYPE_PHOTO', 'FOTO') : getText('TYPE_VIDEO', 'VİDEO')}
              </p>
            </div>

            {activeType === 'photos' ? (
              /* Photo Grid - High Density / Small Squares */
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {event.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group/item relative aspect-square bg-[#111] overflow-hidden cursor-pointer shadow-lg hover:z-20 transition-all duration-300"
                  >
                    <img
                      src={photo.url}
                      className="w-full h-full object-cover grayscale opacity-60 transition-all duration-500 group-hover/item:scale-110 group-hover/item:grayscale-0 group-hover/item:opacity-100"
                      alt={photo.title}
                    />
                    <div className="absolute inset-0 bg-[#FF4D00]/20 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 size={24} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Video Grid - High Density / 4-5 per row on desktop */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(dynamicVideos.length > 0 ? dynamicVideos : event.videos).map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setPlayingVideoId(video.videoId || 'dQw4w9WgXcQ')}
                    className="group/video relative flex flex-col bg-[#111] border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#FF4D00]/50 hover:shadow-2xl shadow-lg cursor-pointer"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={video.thumbnail || video.url}
                        className="w-full h-full object-cover grayscale opacity-30 transition-all duration-700 group-hover/video:scale-105 group-hover/video:grayscale-0 group-hover/video:opacity-100"
                        alt={video.title}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full border border-white/10 transition-all duration-300 group-hover/video:scale-110 group-hover/video:bg-[#FF4D00] group-hover/video:text-black">
                          <PlayCircle size={40} strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-[8px] font-black italic uppercase tracking-widest border border-white/10 text-white/80">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4 border-t border-white/5">
                      <h4 className="text-[11px] font-black italic text-gray-400 uppercase tracking-tight group-hover/video:text-[#FF4D00] transition-colors line-clamp-1">{video.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
