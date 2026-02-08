
import React, { useState } from 'react';
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'news' | 'events' | 'drivers' | 'rules' | 'contact' | 'gallery'>('home');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleViewChange = (view: 'home' | 'about' | 'news' | 'events' | 'drivers' | 'rules' | 'contact' | 'gallery', category: string | null = null) => {
    setCurrentView(view);
    setActiveCategory(category);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col min-h-screen">
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
