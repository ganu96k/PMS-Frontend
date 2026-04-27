import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBell, setShowBell] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || localStorage.getItem('userId') || 1;

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Expenses',  path: '/expenses',  icon: '💸' },
    { label: 'Income',    path: '/income',    icon: '💵' },
    { label: 'Tasks',     path: '/tasks',     icon: '📋' },
    { label: 'Loans',     path: '/loans',     icon: '🏦' },
    { label: 'Reports',   path: '/reports',   icon: '📈' },
    { label: 'Settings',  path: '/settings',  icon: '⚙️' },
  ];

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    const items = [];
    try {
      const taskRes = await fetch(`http://localhost:8080/api/tasks/user/${userId}`);
      if (taskRes.ok) {
        const tasks = await taskRes.json();
        const highPending = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED');
        highPending.forEach(t => items.push({
          type: 'task',
          label: `🔴 High Priority: ${t.title}`,
          sub: `Due: ${t.dueDate}`,
          path: '/tasks',
        }));
        const today = new Date().toISOString().split('T')[0];
        tasks.filter(t => t.dueDate === today && t.status !== 'COMPLETED').forEach(t => items.push({
          type: 'task',
          label: `⏰ Due Today: ${t.title}`,
          sub: t.status,
          path: '/tasks',
        }));
      }
    } catch (_) {}
    try {
      const loanRes = await fetch(`http://localhost:8080/api/loans`);
      if (loanRes.ok) {
        const loans = await loanRes.json();
        loans.filter(l => l.status === 'ACTIVE').forEach(l => items.push({
          type: 'loan',
          label: `🏦 Active Loan: ${l.loanName}`,
          sub: `Outstanding: ₹${parseFloat(l.outstandingAmount || 0).toLocaleString('en-IN')}`,
          path: '/loans',
        }));
      }
    } catch (_) {}
    setNotifications(items);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const pageLabel = menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.closed}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💹</span>
          {sidebarOpen && <span className={styles.logoText}>FinFlow</span>}
        </div>

        <nav className={styles.menu}>
          {menuItems.map(item => (
            <button
              key={item.path}
              className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.menuLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {user.firstName?.[0]?.toUpperCase() || user.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
          {sidebarOpen && (
            <div className={styles.userMeta}>
              <div className={styles.userName}>{user.firstName || user.first_name || 'User'}</div>
              <div className={styles.userEmail}>{user.email || ''}</div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        )}
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <h1 className={styles.pageTitle}>{pageLabel}</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.bellWrap}>
              <button
                className={styles.bellBtn}
                onClick={() => setShowBell(!showBell)}
                title="Notifications"
              >
                🔔
                {notifications.length > 0 && (
                  <span className={styles.bellBadge}>{notifications.length}</span>
                )}
              </button>
              {showBell && (
                <div className={styles.bellDropdown}>
                  <div className={styles.bellHeader}>
                    Notifications
                    <button className={styles.bellClose} onClick={() => setShowBell(false)}>✕</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className={styles.bellEmpty}>All clear! No alerts.</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className={styles.bellItem} onClick={() => { navigate(n.path); setShowBell(false); }}>
                        <div className={styles.bellItemLabel}>{n.label}</div>
                        <div className={styles.bellItemSub}>{n.sub}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={styles.headerDate}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
