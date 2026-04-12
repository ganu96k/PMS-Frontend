import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import styles from './DashboardStyles.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalIncome: 50000,
    balance: 50000,
    transactionCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        'http://localhost:8080/api/expenses',
        { headers }
      );

      const expenses = response.data || [];
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      setStats({
        totalExpenses,
        totalIncome: 50000,
        balance: 50000 - totalExpenses,
        transactionCount: expenses.length,
      });

      setRecentTransactions(expenses.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.dashboardContainer}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Total Income</h3>
              <span className={styles.icon}>💵</span>
            </div>
            <div className={styles.statValue}>
              ${stats.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <div className={styles.statFooter}>+2.5% from last month</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Total Expenses</h3>
              <span className={styles.icon}>🔴</span>
            </div>
            <div className={styles.statValue}>
              ${stats.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <div className={styles.statFooter}>-5% from last month</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Balance</h3>
              <span className={styles.icon}>💰</span>
            </div>
            <div className={styles.statValue}>
              ${stats.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <div className={styles.statFooter}>Available funds</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Transactions</h3>
              <span className={styles.icon}>📊</span>
            </div>
            <div className={styles.statValue}>{stats.transactionCount}</div>
            <div className={styles.statFooter}>This period</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={styles.transactionsCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Transactions</h3>
            <a href="/transactions" className={styles.viewAll}>View All →</a>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : recentTransactions.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.expense_date).toLocaleDateString()}</td>
                    <td>{t.description || 'N/A'}</td>
                    <td className={styles.amount}>${t.amount.toFixed(2)}</td>
                    <td><span className={styles.statusBadge}>Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.empty}>No transactions yet</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
