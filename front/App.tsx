
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Marquee from './components/Marquee';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import NewsPage from './components/NewsPage';
import EventsPage from './components/EventsPage';
import DriversPage from './components/DriversPage';
import RulesPage from './components/RulesPage';
import ContactPage from './components/ContactPage';
import GalleryPage from './components/GalleryPage';
import Footer from './components/Footer';
import { useSiteContent } from './hooks/useSiteContent';
import { useEffect } from 'react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'news' | 'events' | 'drivers' | 'rules' | 'contact' | 'gallery'>('home');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleViewChange = (view: 'home' | 'about' | 'news' | 'events' | 'drivers' | 'rules' | 'contact' | 'gallery', category: string | null = null) => {
    setCurrentView(view);
    setActiveCategory(category);
    window.scrollTo(0, 0);
  };

  const { getText } = useSiteContent('general');

  useEffect(() => {
    const title = getText('SEO_TITLE', 'Forsaj Club - Offroad Motorsport Hub');
    const description = getText('SEO_DESCRIPTION', '');
    const keywords = getText('SEO_KEYWORDS', '');

    document.title = title;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    if (keywords) {
      let metaKey = document.querySelector('meta[name="keywords"]');
      if (!metaKey) {
        metaKey = document.createElement('meta');
        metaKey.setAttribute('name', 'keywords');
        document.head.appendChild(metaKey);
      }
      metaKey.setAttribute('content', keywords);
    }
  }, [getText]);

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" />
      <Marquee />
      <Navbar currentView={currentView} onViewChange={(view) => handleViewChange(view, null)} />
      <main className="flex-grow">
        {currentView === 'home' && <Home onViewChange={(view, cat) => handleViewChange(view, cat || null)} />}
        {currentView === 'about' && <About />}
        {currentView === 'news' && <NewsPage />}
        {currentView === 'events' && <EventsPage onViewChange={(view) => handleViewChange(view, null)} />}
        {currentView === 'drivers' && <DriversPage initialCategoryId={activeCategory} />}
        {currentView === 'rules' && <RulesPage />}
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'gallery' && <GalleryPage />}
      </main>
      <Footer onViewChange={(view) => handleViewChange(view, null)} />
    </div>
  );
};

export default App;
