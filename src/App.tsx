import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import VisualEditor from './pages/VisualEditor';
import FrontendSettings from './pages/FrontendSettings';
import SetupGuide from './components/SetupGuide';
import { Toaster } from 'react-hot-toast';
import type { SidebarItem } from './types/navigation';
import './index.css';

const App: React.FC = () => {
  const [sitemap, setSitemap] = useState<SidebarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const response = await fetch(`/sitemap.json?v=${Date.now()}`);
        if (!response.ok) {
          setSitemap([]);
          return;
        }
        const data = await response.json();
        setSitemap(Array.isArray(data) ? data : []);
      } catch (err) {
        setSitemap([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadSitemap();
  }, []);

  if (isLoading) {
    return <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      alignItems: 'center', justifyContent: 'center',
      background: '#f4f6f9', color: '#3b82f6',
      fontSize: '1.2rem', fontWeight: '600'
    }}>Yüklənir...</div>;
  }

  const isSitemapEmpty = !sitemap || sitemap.length === 0;

  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-right" reverseOrder={false} />
        <Sidebar menuItems={sitemap} />
        <main className="main-content">
          <Header />
          <div className="content-body">
            <Routes>
              {isSitemapEmpty ? (
                <Route path="*" element={<SetupGuide />} />
              ) : (
                <>
                  <Route path="/" element={<VisualEditor />} />
                  <Route path="/frontend-settings" element={<FrontendSettings />} />
                  {/* Keep placeholder logic for any other path defined in future sitemaps */}
                  <Route path="*" element={<div className="fade-in"><h1>Səhifə tapılmadı</h1></div>} />
                </>
              )}
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
