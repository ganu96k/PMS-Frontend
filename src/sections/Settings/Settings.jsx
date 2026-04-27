import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import styles from './Settings.module.css';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'dd-mm-yyyy');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('dateFormat', dateFormat);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    if (window.confirm('This will log you out. Continue?')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <div className={styles.row}><span className={styles.label}>Name</span><span className={styles.val}>{user.firstName || user.first_name || '—'} {user.lastName || user.last_name || ''}</span></div>
          <div className={styles.row}><span className={styles.label}>Email</span><span className={styles.val}>{user.email || '—'}</span></div>
          <div className={styles.row}><span className={styles.label}>Role</span><span className={styles.val}>{user.role || 'USER'}</span></div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferences</h2>
          <div className={styles.formRow}>
            <label className={styles.label}>Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className={styles.input}>
              <option value="INR">₹ INR - Indian Rupee</option>
              <option value="USD">$ USD - US Dollar</option>
              <option value="EUR">€ EUR - Euro</option>
            </select>
          </div>
          <div className={styles.formRow}>
            <label className={styles.label}>Date Format</label>
            <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className={styles.input}>
              <option value="dd-mm-yyyy">DD-MM-YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              <option value="mm-dd-yyyy">MM-DD-YYYY</option>
            </select>
          </div>
          <div className={styles.btnRow}>
            <button className={styles.saveBtn} onClick={handleSave}>
              {saved ? '✓ Saved!' : 'Save Preferences'}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.row}><span className={styles.label}>App</span><span className={styles.val}>FinFlow — Personal Finance Manager</span></div>
          <div className={styles.row}><span className={styles.label}>Version</span><span className={styles.val}>1.0.0</span></div>
          <div className={styles.row}><span className={styles.label}>Backend</span><span className={styles.val}>Spring Boot + PostgreSQL</span></div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: '#dc2626' }}>Danger Zone</h2>
          <p className={styles.dangerNote}>Logging out will clear your local session data.</p>
          <button className={styles.dangerBtn} onClick={handleClearData}>Logout & Clear Session</button>
        </div>
      </div>
    </MainLayout>
  );
}
