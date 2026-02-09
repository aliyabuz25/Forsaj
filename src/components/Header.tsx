import { Search, Menu, ExternalLink } from 'lucide-react';
import './Header.css';

interface HeaderProps {
    user: any;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
    return (
        <header className="header">
            <div className="header-left">
                <button className="icon-btn toggle-sidebar">
                    <Menu size={20} />
                </button>
                <div className="header-search">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Hər şeyi axtar..." />
                </div>
            </div>

            <div className="header-right">
                <a href={import.meta.env.PROD ? "/" : "http://localhost:3005"} target="_blank" rel="noopener noreferrer" className="view-site-btn">
                    <ExternalLink size={16} /> Sayta Bax
                </a>
                <div className="header-profile">
                    <div className="profile-info">
                        <span className="profile-name">{user?.name || 'Octo Admin'}</span>
                        <span className="profile-status">{user?.role === 'master' ? 'Admin Master' : 'Sayt Redaktoru'}</span>
                    </div>
                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} alt="Profile" />
                </div>
            </div>
        </header>
    );
};

export default Header;
