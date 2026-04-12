import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Transactions', path: '/transactions', icon: '💳' },
    { label: 'Expenses', path: '/expenses', icon: '💰' },
    { label: 'Loans', path: '/loans', icon: '🏦' },
    { label: 'Reports', path: '/reports', icon: '📈' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📊</div>
          <span className={styles.logoText}>FinFlow</span>
        </div>

        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user.first_name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className={styles.userName}>{user.first_name} {user.last_name}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.toggleBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ≡
            </button>
            <h1 className={styles.pageTitle}>
              {menuItems.find((m) => m.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.searchBar}>
              <input type="text" placeholder="Search..." />
              <span>🔍</span>
            </div>
            <button className={styles.notificationBtn}>🔔</button>
          </div>
        </header>

        {/* Content Area */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
