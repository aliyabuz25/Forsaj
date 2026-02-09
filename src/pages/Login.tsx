import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, User, ShieldAlert, UserPlus, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

interface LoginProps {
    onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const { count, error } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                if (!error && count === 0) {
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

        try {
            if (isLoginMode) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                const userData = { ...data.user, ...profile };
                localStorage.setItem('forsaj_admin_user', JSON.stringify(userData));
                toast.success(`Xoş gəldiniz, ${profile?.name || email}`);

                setTimeout(() => {
                    onLogin(userData);
                }, 1000);

            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([{ id: data.user.id, name, role: 'master' }]);

                    if (profileError) throw profileError;

                    toast.success('Sistem uğurla quraşdırıldı! Zəhmət olmasa e-poçtunuzu təsdiqləyin və daxil olun.');
                    setIsLoginMode(true);
                }
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
                        {isLoginMode ? <ShieldAlert size={40} className="logo-icon" /> : <UserPlus size={40} className="logo-icon" />}
                    </div>
                    <h1>{isLoginMode ? 'Forsaj Admin' : 'Sistemi Quraşdır'}</h1>
                    <p>{isLoginMode ? 'Sistemə daxil olmaq üçün məlumatlarınızı daxil edin' : 'İlk Master Admin hesabını yaradın'}</p>
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
                        <label><Mail size={16} /> E-poçt Ünvanı</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Məs: admin@forsaj.az"
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
                            isLoginMode ? 'Daxil Ol' : 'Sistemi Quraşdır'
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
