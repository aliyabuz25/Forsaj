import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { supabase } from '../lib/supabaseClient';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  img: string;
  description: string;
}

interface NewsProps {
  onViewChange: (view: any) => void;
}

const bbcodeToHtml = (bbcode: string) => {
  if (!bbcode) return '';
  let html = bbcode
    .replace(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>')
    .replace(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>')
    .replace(/\[u\](.*?)\[\/u\]/gi, '<span style="text-decoration: underline;">$1</span>')
    .replace(/\[s\](.*?)\[\/s\]/gi, '<strike>$1</strike>')
    .replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" style="color: #FF4D00;">$2</a>')
    .replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" style="max-width: 100%;" />')
    .replace(/\n/g, '<br />');
  return html;
};

const News: React.FC<NewsProps> = ({ onViewChange }) => {
  const { getText } = useSiteContent('news');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('date', { ascending: false })
          .limit(3);

        if (error) throw error;
        if (data) setNewsData(data as any);
      } catch (err) {
        console.error('Failed to load news from Supabase', err);
      }
    };
    loadNews();
  }, []);

  if (newsData.length === 0) return null;

  const mainNews = newsData[0];
  const sideNews = newsData.slice(1);

  return (
    <section className="py-24 px-4 lg:px-10 bg-[#0A0A0A]">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-end mb-12 px-2">
          <div className="flex items-start gap-4">
            <div className="w-2 h-16 bg-[#FF4D00]"></div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">
                {getText('SECTION_TITLE', 'SON XƏBƏRLƏR')}
              </h2>
              <p className="text-[#FF4D00] font-black italic text-xs mt-2 uppercase tracking-widest">
                {getText('SECTION_SUBTITLE', 'Motorsport və Offroad dünyasından yeniliklər')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewChange('news')}
            className="bg-[#FF4D00] text-black font-black italic text-xs px-10 py-4 rounded-sm transform -skew-x-12 flex items-center gap-3 hover:bg-white transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <span className="transform skew-x-12 flex items-center gap-2">{getText('VIEW_ALL_BTN', 'HAMISI')} <ArrowRight className="w-5 h-5" /></span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div
            onClick={() => onViewChange('news')}
            className="lg:col-span-7 group relative overflow-hidden bg-[#111] min-h-[450px] md:min-h-[580px] flex items-end p-10 cursor-pointer shadow-2xl rounded-sm border border-white/5"
          >
            <img
              src={mainNews.img}
              alt={mainNews.title}
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 transition-transform duration-1000 group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="relative z-10 w-full">
              <span className="text-[#FF4D00] text-[10px] font-black italic uppercase mb-3 block tracking-[0.3em]">{getText('FEATURED_LABEL', 'SON XƏBƏR')}</span>
              <h3 className="text-4xl md:text-7xl font-black italic text-white leading-none tracking-tighter mb-5 uppercase">
                {mainNews.title}
              </h3>
              <p
                className="text-gray-400 font-bold italic text-xs md:text-base uppercase tracking-wide max-w-xl line-clamp-2"
                dangerouslySetInnerHTML={{ __html: bbcodeToHtml(mainNews.description) }}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            {sideNews.map((news) => (
              <div
                key={news.id}
                onClick={() => onViewChange('news')}
                className="group cursor-pointer flex flex-col flex-1 bg-white/5 p-6 rounded-sm border border-white/5 hover:border-[#FF4D00]/30 hover:bg-white/[0.08] transition-all shadow-sm"
              >
                <div className="aspect-video w-full overflow-hidden bg-[#000] mb-5 rounded-sm shadow-md relative">
                  <img
                    src={news.img}
                    alt={news.title}
                    className="w-full h-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[#FF4D00] text-[10px] font-black italic mb-2 uppercase tracking-widest">
                    <Calendar size={12} /> {news.date}
                  </div>
                  <h4 className="text-3xl font-black italic text-white uppercase leading-tight mb-2 group-hover:text-[#FF4D00] transition-colors tracking-tighter line-clamp-1">
                    {news.title}
                  </h4>
                  <p
                    className="text-gray-500 text-[10px] font-bold italic uppercase tracking-wider line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: bbcodeToHtml(news.description) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;