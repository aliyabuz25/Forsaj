import React, { useState, useEffect } from 'react';
import { Lock, User, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

interface LoginProps {
    onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const response = await fetch('/api/check-setup');
                const data = await response.json();
                if (data.needsSetup) {
                    setIsLoginMode(false);
                }
            } catch (err) {
                console.error('Setup check failed', err);
            }
        };
        checkSetup();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Virtual email mapping for Supabase Auth
        // const virtualEmail = `${username.trim().toLowerCase()}@forsaj.admin`;

        try {

            const setupResult = await response.json();

            if (!response.ok) {
                throw new Error(setupResult.error || 'Quraşdırma uğursuz oldu');
            }

            toast.success('Baza uğurla başladıldı! İndi daxil ola bilərsiniz.');
            setIsLoginMode(true);
        }
    } catch (err: any) {
        toast.error(err.message || 'Əməliyyat uğursuz oldu');
    } finally {
        setIsLoading(false);
    }
};

return (
    <div className="login-page">
        <div className="login-card fade-in">
            <div className="login-header">
                <div className="login-logo">
                    {isLoginMode ? <ShieldAlert size={40} className="logo-icon" /> : <Lock size={40} className="logo-icon" />}
                </div>
                <h1>{isLoginMode ? 'Forsaj Admin' : 'Sistem Quraşdırılması'}</h1>
                <p>{isLoginMode ? 'Sistemə daxil olmaq üçün məlumatlarınızı daxil edin' : 'İlkayan Master Admin hesabını yaradaraq bazanı başladın'}</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                {!isLoginMode && (
                    <div className="form-group">
                        <label><User size={16} /> Tam Adınız</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Məs: Əli Məmmədov"
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label><User size={16} /> İstifadəçi Adı</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Məs: admin"
                        required
                    />
                </div>

                <div className="form-group">
                    <label><Lock size={16} /> Şifrə</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="login-btn" disabled={isLoading}>
                    {isLoading ? (
                        <div className="loader-container">
                            <Loader2 className="animate-spin" size={20} />
                            <span>Gözləyin...</span>
                        </div>
                    ) : (
                        isLoginMode ? 'Daxil Ol' : 'Bazanı Başlat'
                    )}
                </button>
            </form>

            <div className="login-footer">
                <p>© 2026 Forsaj Club. Platformanın təhlükəsizliyi üçün mütəmadi olaraq şifrənizi yeniləyin.</p>
            </div>
        </div>
    </div>
);
    };

export default Login;
