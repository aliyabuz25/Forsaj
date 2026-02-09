import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Shield, User, Lock, Save, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './UsersManager.css';

interface AdminUser {
    id: number;
    username: string;
    name: string;
    role: 'master' | 'secondary';
}

const UsersManager: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<AdminUser & { password?: string }> | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            toast.error('İstifadəçiləri yükləmək mümkün olmadı');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser?.username || !editingUser?.name || (!editingUser?.id && !editingUser?.password)) {
            toast.error('Zəhmət olmasa bütün sahələri doldurun');
            return;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            });

            if (response.ok) {
                toast.success(editingUser.id ? 'İstifadəçi yeniləndi' : 'Yeni istifadəçi yaradıldı');
                setIsModalOpen(false);
                setEditingUser(null);
                fetchUsers();
            } else {
                toast.error('Xəta baş verdi');
            }
        } catch (err) {
            toast.error('Serverlə bağlantı kəsildi');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) return;

        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('İstifadəçi silindi');
                fetchUsers();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Silmək mümkün olmadı');
            }
        } catch (err) {
            toast.error('Serverlə bağlantı kəsildi');
        }
    };

    const openModal = (user: Partial<AdminUser> | null = null) => {
        setEditingUser(user ? { ...user } : { username: '', name: '', password: '', role: 'secondary' });
        setIsModalOpen(true);
    };

    if (isLoading) return <div className="loading-state">Yüklənir...</div>;

    return (
        <div className="users-manager fade-in">
            <div className="manager-header">
                <div>
                    <h1>Admin Hesabları</h1>
                    <p>Sistemi idarə edən bütün administratorların siyahısı və yetkiləri</p>
                </div>
                <button className="add-user-btn" onClick={() => openModal()}>
                    <UserPlus size={18} /> Yeni Admin
                </button>
            </div>

            <div className="users-grid">
                {users.map(user => (
                    <div key={user.id} className="user-card">
                        <div className="user-avatar">
                            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=${user.role === 'master' ? '3b82f6' : 'f59e0b'}&color=fff`} alt={user.name} />
                            <div className={`role-badge ${user.role}`}>
                                <Shield size={10} /> {user.role === 'master' ? 'Master' : 'Secondary'}
                            </div>
                        </div>
                        <div className="user-details">
                            <h3>{user.name}</h3>
                            <span>@{user.username}</span>
                        </div>
                        <div className="user-actions">
                            <button className="edit-btn" onClick={() => openModal(user)} title="Düzəliş et">
                                <Edit size={16} />
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteUser(user.id)} title="Sil">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingUser?.id ? 'İstifadəçini Redaktə Et' : 'Yeni Admin Hesabı'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveUser}>
                            <div className="form-group">
                                <label><User size={14} /> Tam Ad</label>
                                <input
                                    type="text"
                                    value={editingUser?.name || ''}
                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    placeholder="Məs: Əli Məmmədov"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><User size={14} /> İstifadəçi Adı</label>
                                <input
                                    type="text"
                                    value={editingUser?.username || ''}
                                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                    placeholder="Məs: alimm"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><Lock size={14} /> Şifrə {editingUser?.id && <span className="helper-text">(Dəyişmək istəmirsinizsə boş saxlayın)</span>}</label>
                                <input
                                    type="password"
                                    value={editingUser?.password || ''}
                                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                                    placeholder="••••••••"
                                    required={!editingUser?.id}
                                />
                            </div>
                            <div className="form-group">
                                <label><Shield size={14} /> Yetki (Rol)</label>
                                <select
                                    value={editingUser?.role || 'secondary'}
                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                                >
                                    <option value="master">Master Admin (Tam Yetki)</option>
                                    <option value="secondary">Redaktör (Məhdud Yetki)</option>
                                </select>
                            </div>
                            {editingUser?.role === 'master' && (
                                <div className="role-warning">
                                    <AlertCircle size={14} /> Master Admin bütün sistem daxilində tam səlahiyyətə malikdir.
                                </div>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Ləğv Et</button>
                                <button type="submit" className="save-btn"><Save size={18} /> Yadda Saxla</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManager;
