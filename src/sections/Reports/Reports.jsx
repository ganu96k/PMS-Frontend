import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import styles from './Reports.module.css';

export default function Reports() {
  const [reportType, setReportType] = useState('monthly'); // daily, weekly, monthly
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    avgTransaction: 0,
    highestExpense: 0,
    lowestExpense: 0,
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSummaries([]);
        setStats({
          totalSpent: 0,
          avgTransaction: 0,
          highestExpense: 0,
          lowestExpense: 0,
        });
        setLoading(false);
        return;
      }

      const endpoint = `http://localhost:8080/api/reports/${reportType}`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data || [];
      setSummaries(data);

      // Calculate stats
      if (data.length > 0) {
        const totalSpent = data.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const avgTransaction = totalSpent / data.length;
        const highest = Math.max(...data.map((s) => Number(s.maxAmount)));
        const lowest = Math.min(...data.map((s) => Number(s.minAmount)));

        setStats({
          totalSpent,
          avgTransaction,
          highestExpense: highest,
          lowestExpense: lowest,
        });
      } else {
        setStats({
          totalSpent: 0,
          avgTransaction: 0,
          highestExpense: 0,
          lowestExpense: 0,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  }, [reportType]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerateReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:8080/api/reports/generate', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReports();
      alert('Reports generated successfully!');
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Error generating reports');
    }
  };

  const chartData = summaries.slice(0, 6);
  const maxAmount = Math.max(1, ...chartData.map((summary) => Number(summary.totalAmount) || 0));
  const chartHeight = 300;

  return (
    <MainLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2>Financial Reports & Analysis</h2>
            <p>Professional insights into your spending patterns</p>
          </div>
          <button className={styles.generateBtn} onClick={handleGenerateReports}>
            ⟳ Generate Reports
          </button>
        </div>

        {/* Analysis Cards */}
        <div className={styles.analyticsGrid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💰</div>
            <div className={styles.cardContent}>
              <h3>Total Spent</h3>
              <p className={styles.value}>
                ${stats.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
              <span className={styles.meta}>Across all periods</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📊</div>
            <div className={styles.cardContent}>
              <h3>Average Transaction</h3>
              <p className={styles.value}>
                ${stats.avgTransaction.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
              <span className={styles.meta}>Per {reportType} period</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📈</div>
            <div className={styles.cardContent}>
              <h3>Highest Expense</h3>
              <p className={styles.value}>
                ${stats.highestExpense.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
              <span className={styles.meta}>Maximum spent</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📉</div>
            <div className={styles.cardContent}>
              <h3>Lowest Expense</h3>
              <p className={styles.value}>
                ${stats.lowestExpense.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
              <span className={styles.meta}>Minimum spent</span>
            </div>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className={styles.reportSelector}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${reportType === 'daily' ? styles.active : ''}`}
              onClick={() => setReportType('daily')}
            >
              📅 Daily
            </button>
            <button
              className={`${styles.tab} ${reportType === 'weekly' ? styles.active : ''}`}
              onClick={() => setReportType('weekly')}
            >
              📆 Weekly
            </button>
            <button
              className={`${styles.tab} ${reportType === 'monthly' ? styles.active : ''}`}
              onClick={() => setReportType('monthly')}
            >
              📋 Monthly
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className={styles.chartCard}>
          <h3>Spending Timeline</h3>
          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.loading}>Loading chart data...</div>
            ) : chartData.length > 0 ? (
              <div className={styles.barChart}>
                <div className={styles.chartBars}>
                  {chartData.map((summary, index) => (
                    <div key={index} className={styles.chartBar}>
                      <div
                        className={styles.bar}
                        style={{
                          height: `${(Number(summary.totalAmount) / maxAmount) * chartHeight}px`,
                        }}
                      >
                        <span className={styles.barValue}>
                          ${Number(summary.totalAmount).toFixed(0)}
                        </span>
                      </div>
                      <div className={styles.barLabel}>{summary.displayPeriod}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.empty}>No data available</div>
            )}
          </div>
        </div>

        {/* Details Table */}
        <div className={styles.detailsCard}>
          <h3>Detailed Analysis</h3>
          {loading ? (
            <div className={styles.loading}>Loading details...</div>
          ) : summaries.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Total Amount</th>
                    <th>Transactions</th>
                    <th>Average</th>
                    <th>Max</th>
                    <th>Min</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((summary) => (
                    <tr key={summary.id}>
                      <td className={styles.periodCell}>
                        <strong>{summary.displayPeriod}</strong>
                      </td>
                      <td className={styles.amountCell}>
                        ${Number(summary.totalAmount).toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className={styles.centerCell}>
                        <span className={styles.badge}>{summary.transactionCount}</span>
                      </td>
                      <td className={styles.amountCell}>
                        ${Number(summary.averageAmount).toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className={styles.amountCell}>
                        ${Number(summary.maxAmount).toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className={styles.amountCell}>
                        ${Number(summary.minAmount).toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.empty}>No summary data available</div>
          )}
        </div>

        {/* Key Insights */}
        <div className={styles.insightsCard}>
          <h3>💡 Key Insights</h3>
          <div className={styles.insightsList}>
            {summaries.length > 0 ? (
              <>
                <div className={styles.insight}>
                  <span className={styles.insightIcon}>→</span>
                  <span>
                    Your highest spending was $
                    {stats.highestExpense.toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    in a single {reportType} period.
                  </span>
                </div>
                <div className={styles.insight}>
                  <span className={styles.insightIcon}>→</span>
                  <span>
                    Average spending per {reportType} period: $
                    {stats.avgTransaction.toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}.
                  </span>
                </div>
                <div className={styles.insight}>
                  <span className={styles.insightIcon}>→</span>
                  <span>
                    Total spending tracked: $
                    {stats.totalSpent.toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    across {summaries.length} {reportType} periods.
                  </span>
                </div>
                <div className={styles.insight}>
                  <span className={styles.insightIcon}>→</span>
                  <span>
                    Lowest spending was $
                    {stats.lowestExpense.toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}.
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.empty}>No insights available yet</div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
