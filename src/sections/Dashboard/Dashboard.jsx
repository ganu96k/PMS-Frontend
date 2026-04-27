import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import styles from './DashboardStyles.module.css';

const API = 'http://localhost:8080/api';

function LoadingDots() {
  return (
    <div className={styles.loadingWrap}>
      <div className={styles.loadingDots}>
        <span></span><span></span><span></span>
      </div>
      <p className={styles.loadingText}>Fetching your data...</p>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon, onClick }) {
  return (
    <div className={styles.statCard} style={{ borderTop: `3px solid ${color}` }} onClick={onClick}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statIcon}>{icon}</span>
      </div>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || localStorage.getItem('userId') || 1;

  const [period, setPeriod] = useState('monthly');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ incomes: [], expenses: [], tasks: [], loans: [] });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [incRes, expRes, taskRes, loanRes] = await Promise.allSettled([
        fetch(`${API}/incomes/user/${userId}`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API}/expenses/user/${userId}`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API}/tasks/user/${userId}`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API}/loans`).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      setData({
        incomes: incRes.status === 'fulfilled' ? (incRes.value || []) : [],
        expenses: expRes.status === 'fulfilled' ? (expRes.value || []) : [],
        tasks: taskRes.status === 'fulfilled' ? (taskRes.value || []) : [],
        loans: loanRes.status === 'fulfilled' ? (loanRes.value || []) : [],
      });
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filterByPeriod = (arr, dateField) => {
    const now = new Date();
    if (period === 'weekly') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      return arr.filter(i => new Date(i[dateField]) >= weekAgo);
    }
    if (period === 'monthly') {
      return arr.filter(i => {
        const d = new Date(i[dateField]);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    return arr;
  };

  const filteredIncomes  = filterByPeriod(data.incomes,  'incomeDate');
  const filteredExpenses = filterByPeriod(data.expenses, 'expense_date');

  const totalIncome   = filteredIncomes.reduce((s, i)  => s + (i.amount  || 0), 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + (e.amount  || 0), 0);
  const balance       = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
  const expenseRatio  = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100).toFixed(1) : 0;

  const pendingTasks     = data.tasks.filter(t => t.status === 'PENDING');
  const inProgressTasks  = data.tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks   = data.tasks.filter(t => t.status === 'COMPLETED');
  const highPriPending   = data.tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED');

  const activeLoans     = data.loans.filter(l => l.status === 'ACTIVE');
  const totalOutstanding = data.loans.reduce((s, l) => s + parseFloat(l.outstandingAmount || 0), 0);
  const totalLoanPrincipal = data.loans.reduce((s, l) => s + parseFloat(l.principalAmount || 0), 0);

  // Marquee alerts
  const alerts = [
    ...(balance < 0 ? [`⚠️ Expenses exceed Income by ₹${Math.abs(balance).toLocaleString('en-IN')}`] : []),
    ...highPriPending.map(t => `🔴 HIGH: "${t.title}" due ${t.dueDate}`),
    ...activeLoans.map(l => `🏦 ${l.loanName} — Outstanding ₹${parseFloat(l.outstandingAmount || 0).toLocaleString('en-IN')}`),
  ];

  const sortFn = (a, b, f) => sortDir === 'desc' ? new Date(b[f]) - new Date(a[f]) : new Date(a[f]) - new Date(b[f]);
  const recentExpenses = [...filteredExpenses].sort((a, b) => sortFn(a, b, 'expense_date')).slice(0, 5);
  const recentIncomes  = [...filteredIncomes].sort((a, b)  => sortFn(a, b, 'incomeDate')).slice(0, 5);

  const fmt = n => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <MainLayout>
      <div className={styles.dashboard}>

        {/* Marquee */}
        {alerts.length > 0 && (
          <div className={styles.marqueeBar}>
            <span className={styles.marqueeLabel}>⚡ Live</span>
            <div className={styles.marqueeScroller}>
              <span>{alerts.join('   ◆   ')}&nbsp;&nbsp;&nbsp;&nbsp;{alerts.join('   ◆   ')}</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.periodGroup}>
            {['weekly', 'monthly', 'alltime'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`${styles.periodBtn} ${period === p ? styles.activePeriod : ''}`}>
                {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.toolRight}>
            <select value={sortDir} onChange={e => setSortDir(e.target.value)} className={styles.sortSelect}>
              <option value="desc">↓ Newest First</option>
              <option value="asc">↑ Oldest First</option>
            </select>
            <button className={styles.refreshBtn} onClick={fetchAll}>↻ Refresh</button>
          </div>
        </div>

        {loading ? <LoadingDots /> : (
          <>
            {/* Summary Cards */}
            <div className={styles.statsGrid}>
              <StatCard label="Total Income"   value={fmt(totalIncome)}   sub={`${filteredIncomes.length} entries`}   color="#16a34a" icon="💵" onClick={() => navigate('/income')} />
              <StatCard label="Total Expenses"  value={fmt(totalExpenses)} sub={`${filteredExpenses.length} entries`}  color="#dc2626" icon="💸" onClick={() => navigate('/expenses')} />
              <StatCard label="Net Balance"     value={fmt(balance)}       sub={balance >= 0 ? '✅ Positive' : '❌ Deficit'} color={balance >= 0 ? '#2563eb' : '#dc2626'} icon="💰" />
              <StatCard label="Savings Rate"    value={`${savingsRate}%`}  sub="of income saved"                       color="#7c3aed" icon="📊" />
            </div>

            {/* Mid Row */}
            <div className={styles.midGrid}>
              {/* Ratio + Loans */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Income vs Expenses Analysis</h3>
                <div className={styles.ratioLabels}>
                  <span className={styles.greenText}>Income: {fmt(totalIncome)}</span>
                  <span className={styles.redText}>Expenses: {fmt(totalExpenses)}</span>
                </div>
                <div className={styles.ratioBar}>
                  <div className={styles.ratioFill} style={{ width: `${expenseRatio}%` }} />
                </div>
                <div className={styles.ratioNote}>{expenseRatio}% of income spent this {period === 'alltime' ? 'period' : period.replace('ly','')}</div>

                <div className={styles.divider} />

                <div className={styles.loanRow}>
                  <div className={styles.loanStat}>
                    <span>Loans</span><strong>{data.loans.length}</strong>
                  </div>
                  <div className={styles.loanStat}>
                    <span>Active</span><strong style={{ color: '#f59e0b' }}>{activeLoans.length}</strong>
                  </div>
                  <div className={styles.loanStat}>
                    <span>Outstanding</span><strong className={styles.redText}>{fmt(totalOutstanding)}</strong>
                  </div>
                  <div className={styles.loanStat}>
                    <span>Principal</span><strong>{fmt(totalLoanPrincipal)}</strong>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Task Overview</h3>
                  <button className={styles.linkBtn} onClick={() => navigate('/tasks')}>View All →</button>
                </div>
                <div className={styles.taskStats}>
                  <div className={`${styles.taskBubble} ${styles.bubblePending}`}>
                    <strong>{pendingTasks.length}</strong><span>Pending</span>
                  </div>
                  <div className={`${styles.taskBubble} ${styles.bubbleProgress}`}>
                    <strong>{inProgressTasks.length}</strong><span>In Progress</span>
                  </div>
                  <div className={`${styles.taskBubble} ${styles.bubbleDone}`}>
                    <strong>{completedTasks.length}</strong><span>Completed</span>
                  </div>
                </div>
                {highPriPending.length > 0 && (
                  <div className={styles.alertBox}>🔴 {highPriPending.length} high-priority task(s) need attention</div>
                )}
                <div className={styles.miniTaskList}>
                  {[...pendingTasks, ...inProgressTasks].slice(0, 4).map(t => (
                    <div key={t.id} className={styles.miniTask}>
                      <span className={`${styles.priDot} ${t.priority === 'HIGH' ? styles.dotRed : t.priority === 'MEDIUM' ? styles.dotAmber : styles.dotBlue}`} />
                      <span className={styles.miniTaskTitle}>{t.title}</span>
                      <span className={styles.miniTaskDate}>{t.dueDate}</span>
                    </div>
                  ))}
                  {pendingTasks.length + inProgressTasks.length === 0 && (
                    <p className={styles.empty}>All caught up! 🎉</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className={styles.bottomGrid}>
              {/* Recent Expenses */}
              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Recent Expenses</h3>
                  <button className={styles.linkBtn} onClick={() => navigate('/expenses')}>View All →</button>
                </div>
                {recentExpenses.length === 0
                  ? <p className={styles.empty}>No expenses this {period}</p>
                  : <table className={styles.table}>
                      <thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
                      <tbody>{recentExpenses.map(e => (
                        <tr key={e.id}>
                          <td>{e.expense_date}</td>
                          <td>{e.description || '—'}</td>
                          <td className={styles.redText}>{fmt(e.amount)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                }
              </div>

              {/* Recent Incomes */}
              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Recent Incomes</h3>
                  <button className={styles.linkBtn} onClick={() => navigate('/income')}>View All →</button>
                </div>
                {recentIncomes.length === 0
                  ? <p className={styles.empty}>No income this {period}</p>
                  : <table className={styles.table}>
                      <thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
                      <tbody>{recentIncomes.map(i => (
                        <tr key={i.id}>
                          <td>{i.incomeDate}</td>
                          <td>{i.description || '—'}</td>
                          <td className={styles.greenText}>{fmt(i.amount)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                }
              </div>

              {/* Active Loans */}
              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Active Loans</h3>
                  <button className={styles.linkBtn} onClick={() => navigate('/loans')}>View All →</button>
                </div>
                {activeLoans.length === 0
                  ? <p className={styles.empty}>No active loans</p>
                  : activeLoans.slice(0, 4).map(l => {
                      const paid = parseFloat(l.principalAmount) - parseFloat(l.outstandingAmount);
                      const pct  = ((paid / parseFloat(l.principalAmount)) * 100).toFixed(0);
                      return (
                        <div key={l.id} className={styles.loanItem}>
                          <div className={styles.loanItemHeader}>
                            <span className={styles.loanItemName}>{l.loanName}</span>
                            <span className={styles.loanItemRate}>{l.interestRate}%</span>
                          </div>
                          <div className={styles.loanItemMeta}>
                            <span>{fmt(l.principalAmount)} principal</span>
                            <span className={styles.redText}>{fmt(l.outstandingAmount)} left</span>
                          </div>
                          <div className={styles.loanProg}>
                            <div className={styles.loanProgFill} style={{ width: `${pct}%` }} />
                          </div>
                          <div className={styles.loanProgLabel}>{pct}% repaid</div>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
