import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import type { SidebarItem } from '../types/navigation';
import './Sidebar.css';

interface SidebarProps {
    menuItems: SidebarItem[];
    user: any;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems, user, onLogout }) => {
    const userRole = user?.role || 'secondary';
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const location = useLocation();

    const toggleExpand = (title: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const IconComponent = ({ name, className }: { name: string; className?: string }) => {
        const Icon = (LucideIcons as any)[name];
        if (!Icon) return <LucideIcons.Circle className={className} size={18} />;
        return <Icon className={className} size={18} />;
    };

    const renderMenuItem = (item: SidebarItem) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems[item.title];

        // Better active check including query params
        const isCurrentActive = (path?: string) => {
            if (!path) return false;
            if (path.includes('?')) {
                return (location.pathname + location.search) === path;
            }
            return location.pathname === path;
        };

        const isActive = isCurrentActive(item.path) || (hasChildren && item.children?.some(child => isCurrentActive(child.path)));

        if (hasChildren) {
            return (
                <li key={item.title} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                    <div
                        className={`sidebar-link has-children ${isExpanded ? 'active expanded' : ''}`}
                        onClick={() => toggleExpand(item.title)}
                    >
                        {item.icon && <IconComponent name={item.icon} className="sidebar-icon" />}
                        <span className="sidebar-text">{item.title}</span>
                        <LucideIcons.ChevronRight className={`sidebar-chevron ${isExpanded ? 'rotate' : ''}`} size={16} />
                    </div>
                    <ul className={`sidebar-submenu ${isExpanded ? 'show' : ''}`}>
                        {item.children?.map(child => (
                            <li key={child.title} className="sidebar-submenu-item">
                                <NavLink
                                    to={child.path || '#'}
                                    className={() => `sidebar-submenu-link ${isCurrentActive(child.path) ? 'active' : ''}`}
                                >
                                    <LucideIcons.Circle size={8} className="submenu-dot" />
                                    <span>{child.title}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </li>
            );
        }

        return (
            <li key={item.title} className="sidebar-item">
                <NavLink
                    to={item.path || '#'}
                    className={() => `sidebar-link ${isCurrentActive(item.path) ? 'active' : ''}`}
                >
                    {item.icon && <IconComponent name={item.icon} className="sidebar-icon" />}
                    <span className="sidebar-text">{item.title}</span>
                    {item.badge && (
                        <span className={`badge ${item.badge.color} sidebar-badge`}>
                            {item.badge.text}
                        </span>
                    )}
                </NavLink>
            </li>
        );
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand-logo">
                    <LucideIcons.Hexagon className="logo-icon" size={24} fill="currentColor" />
                    <span className="brand-name">FORSAJ<span>PANEL</span></span>
                </div>
            </div>

            <div className="sidebar-user">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=${userRole === 'master' ? '3b82f6' : 'f59e0b'}&color=fff`} alt="User" />
                <div className="user-info">
                    <span className="user-name">{user?.name || 'Admin'}</span>
                    <span className="user-role">{userRole === 'master' ? 'Master Admin' : 'Redaktor'}</span>
                </div>
            </div>

            <div className="sidebar-content">
                <div className="sidebar-section-label">ƏSAS NAVİQASİYA</div>
                <ul className="sidebar-menu">
                    {menuItems
                        .filter(item => {
                            const restrictedPaths = ['/frontend-settings', '/users-management'];
                            if (userRole === 'secondary') {
                                if (restrictedPaths.some(p => item.path?.toLowerCase() === p)) return false;
                                if (['SİSTEM AYARLARI', 'ADMİN HESABLARI'].includes(item.title.toUpperCase())) return false;
                            }
                            return true;
                        })
                        .map(item => renderMenuItem(item))}
                    {menuItems.length === 0 && (
                        <div className="empty-sidebar-msg">
                            <p>Menyu boşdur</p>
                        </div>
                    )}
                </ul>
            </div>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={onLogout}>
                    <LucideIcons.LogOut size={18} />
                    <span>Çıxış</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
