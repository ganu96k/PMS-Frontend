import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import styles from './DashboardStyles.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    incomeCount: 0,
    balance: 0,
    transactionCount: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    dailyAverage: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalLoanAmount: 0,
    totalOutstanding: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentIncomes, setRecentIncomes] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch expenses
      const expenseResponse = await axios.get(
        'http://localhost:8080/api/expenses',
        { headers }
      ).catch(() => ({ data: [] }));

      // Fetch incomes (using mock data if endpoint not available)
      let incomesData = [];
      try {
        const incomeResponse = await axios.get(
          'http://localhost:8080/api/incomes',
          { headers }
        );
        incomesData = incomeResponse.data || [];
      } catch (err) {
        // Use mock data if income endpoint not available
        incomesData = [
          { id: 1, incomeDate: '2024-04-01', amount: 50000, categoryId: 1, description: 'Monthly Salary' },
          { id: 2, incomeDate: '2024-04-05', amount: 15000, categoryId: 2, description: 'Freelance Project' },
          { id: 3, incomeDate: '2024-04-10', amount: 5000, categoryId: 3, description: 'Investment Dividend' },
        ];
      }

      // Fetch loans
      const loanResponse = await axios.get(
        'http://localhost:8080/api/loans',
        { headers }
      ).catch(() => ({ data: [] }));

      const expenses = expenseResponse.data || [];
      const loansData = loanResponse.data || [];

      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalIncome = incomesData.reduce((sum, i) => sum + (i.amount || 0), 0);

      // Calculate weekly total (last 7 days)
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weeklyTotal = expenses
        .filter(e => new Date(e.expense_date) >= sevenDaysAgo)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      // Calculate monthly total (current month)
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const monthlyTotal = expenses
        .filter(e => {
          const eDate = new Date(e.expense_date);
          return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      // Calculate daily average
      const dailyAverage = expenses.length > 0 ? totalExpenses / expenses.length : 0;

      // Calculate loan stats
      const totalLoanAmount = loansData.reduce((sum, l) => sum + parseFloat(l.principalAmount || 0), 0);
      const totalOutstanding = loansData.reduce((sum, l) => sum + parseFloat(l.outstandingAmount || 0), 0);
      const activeLoans = loansData.filter(l => l.status === 'ACTIVE').length;

      setStats({
        totalExpenses,
        totalIncome,
        incomeCount: incomesData.length,
        balance: totalIncome - totalExpenses,
        transactionCount: expenses.length,
        weeklyTotal,
        monthlyTotal,
        dailyAverage,
        totalLoans: loansData.length,
        activeLoans,
        totalLoanAmount,
        totalOutstanding,
      });

      setRecentTransactions(expenses.slice(0, 5));
      setRecentIncomes(incomesData.slice(0, 3));
      setLoans(loansData.slice(0, 3));
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
              <h3>Income Items</h3>
              <span className={styles.icon}>📥</span>
            </div>
            <div className={styles.statValue}>{stats.incomeCount}</div>
            <div className={styles.statFooter}>Total sources</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Transactions</h3>
              <span className={styles.icon}>📊</span>
            </div>
            <div className={styles.statValue}>{stats.transactionCount}</div>
            <div className={styles.statFooter}>This period</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Weekly Expenses</h3>
              <span className={styles.icon}>📈</span>
            </div>
            <div className={styles.statValue}>
              ${stats.weeklyTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <div className={styles.statFooter}>Last 7 days</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Monthly Expenses</h3>
              <span className={styles.icon}>📅</span>
            </div>
            <div className={styles.statValue}>
              ${stats.monthlyTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <div className={styles.statFooter}>This month</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Daily Average</h3>
              <span className={styles.icon}>💳</span>
            </div>
            <div className={styles.statValue}>
              ${stats.dailyAverage.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <div className={styles.statFooter}>Per transaction</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Total Loans</h3>
              <span className={styles.icon}>📋</span>
            </div>
            <div className={styles.statValue}>{stats.totalLoans}</div>
            <div className={styles.statFooter}>{stats.activeLoans} active</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Loan Amount</h3>
              <span className={styles.icon}>🏦</span>
            </div>
            <div className={styles.statValue}>
              ₹{stats.totalLoanAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className={styles.statFooter}>Principal amount</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Outstanding</h3>
              <span className={styles.icon}>⚠️</span>
            </div>
            <div className={styles.statValue}>
              ₹{stats.totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className={styles.statFooter}>Balance remaining</div>
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

        {/* Recent Incomes */}
        <div className={styles.transactionsCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Incomes</h3>
            <a href="/income" className={styles.viewAll}>View All →</a>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : recentIncomes.length > 0 ? (
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
                {recentIncomes.map((i) => (
                  <tr key={i.id}>
                    <td>{new Date(i.incomeDate).toLocaleDateString()}</td>
                    <td>{i.description || 'N/A'}</td>
                    <td className={styles.amount} style={{ color: '#27ae60' }}>+₹{i.amount.toFixed(2)}</td>
                    <td><span className={styles.statusBadge} style={{ background: '#27ae60' }}>Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.empty}>No incomes yet</div>
          )}
        </div>

        {/* Recent Loans */}
        <div className={styles.transactionsCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Loans</h3>
            <a href="/loans" className={styles.viewAll}>View All →</a>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : loans.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Loan Name</th>
                  <th>Principal</th>
                  <th>Outstanding</th>
                  <th>Interest Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.loanName}</td>
                    <td>₹{parseFloat(loan.principalAmount).toFixed(2)}</td>
                    <td>₹{parseFloat(loan.outstandingAmount).toFixed(2)}</td>
                    <td>{loan.interestRate}%</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[loan.status?.toLowerCase()]}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.empty}>No loans yet</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
