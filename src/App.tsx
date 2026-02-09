import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import VisualEditor from './pages/VisualEditor';
import FrontendSettings from './pages/FrontendSettings';
import CoursesManager from './pages/CoursesManager';
import UsersManager from './pages/UsersManager';
import SetupGuide from './components/SetupGuide';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import type { SidebarItem } from './types/navigation';
import './index.css';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [sitemap, setSitemap] = useState<SidebarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('forsaj_admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const response = await fetch(`/api/sitemap?v=${Date.now()}`);
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
    <Router basename={import.meta.env.PROD ? '/admin' : '/'}>
      <div className="app-container">
        <Toaster position="top-right" reverseOrder={false} />
        {!user ? (
          <Login onLogin={setUser} />
        ) : (
          <>
            <Sidebar menuItems={sitemap} userRole={user.role} onLogout={() => {
              localStorage.removeItem('forsaj_admin_user');
              setUser(null);
            }} />
            <main className="main-content">
              <Header user={user} />
              <div className="content-body">
                <Routes>
                  {isSitemapEmpty ? (
                    <Route path="*" element={<SetupGuide />} />
                  ) : (
                    <>
                      <Route path="/" element={<VisualEditor />} />
                      <Route path="/courses" element={<CoursesManager />} />

                      <Route path="/users-management" element={<UsersManager currentUser={user} />} />

                      <Route path="/frontend-settings" element={
                        user.role === 'master' ? <FrontendSettings /> : <div className="fade-in"><h1>İcazə yoxdur</h1><p>Bu səhifə yalnız Master Admin üçündür.</p></div>
                      } />

                      <Route path="*" element={<div className="fade-in"><h1>Səhifə tapılmadı</h1></div>} />
                    </>
                  )}
                </Routes>
              </div>
            </main>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
