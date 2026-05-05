import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import styles from "./DashboardStyles.module.css";

const API = "http://localhost:8080/api";

function LoadingDots() {
  return (
    <div className={styles.loadingWrap}>
      <div className={styles.loadingDots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className={styles.loadingText}>Fetching your data...</p>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon, onClick }) {
  return (
    <div
      className={styles.statCard}
      style={{ borderTop: `3px solid ${color}` }}
      onClick={onClick}
    >
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statIcon}>{icon}</span>
      </div>
      <div className={styles.statValue} style={{ color }}>
        {value}
      </div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

function formatCurrency(value) {
  return `INR ${(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || localStorage.getItem("userId") || 1;
  const authToken = localStorage.getItem("authToken");
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const [period, setPeriod] = useState("monthly");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    incomes: [],
    expenses: [],
    tasks: [],
    loans: [],
    budgets: [],
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [incRes, expRes, taskRes, loanRes, budgetRes] =
        await Promise.allSettled([
          fetch(`${API}/incomes/user/${userId}`)
            .then((response) => (response.ok ? response.json() : []))
            .catch(() => []),
          fetch(`${API}/expenses/user/${userId}`)
            .then((response) => (response.ok ? response.json() : []))
            .catch(() => []),
          fetch(`${API}/tasks/user/${userId}`)
            .then((response) => (response.ok ? response.json() : []))
            .catch(() => []),
          authToken
            ? fetch(`${API}/loans`, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              })
                .then((response) => (response.ok ? response.json() : []))
                .catch(() => [])
            : Promise.resolve([]),
          fetch(`${API}/monthly-budgets/user/${userId}?month=${currentMonthKey}`)
            .then((response) => (response.ok ? response.json() : []))
            .catch(() => []),
        ]);

      setData({
        incomes: incRes.status === "fulfilled" ? incRes.value || [] : [],
        expenses: expRes.status === "fulfilled" ? expRes.value || [] : [],
        tasks: taskRes.status === "fulfilled" ? taskRes.value || [] : [],
        loans: loanRes.status === "fulfilled" ? loanRes.value || [] : [],
        budgets: budgetRes.status === "fulfilled" ? budgetRes.value || [] : [],
      });
    } catch (error) {
      console.error("Dashboard fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [authToken, currentMonthKey, userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filterByPeriod = (records, dateField) => {
    const now = new Date();

    if (period === "weekly") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return records.filter((record) => new Date(record[dateField]) >= weekAgo);
    }

    if (period === "monthly") {
      return records.filter((record) => {
        const date = new Date(record[dateField]);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
    }

    return records;
  };

  const filteredIncomes = filterByPeriod(data.incomes, "incomeDate");
  const filteredExpenses = filterByPeriod(data.expenses, "expenseDate");

  const currentMonthExpenses = data.expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.expenseDate);
      const today = new Date();
      return (
        expenseDate.getMonth() === today.getMonth() &&
        expenseDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const currentMonthBudget = data.budgets.reduce(
    (sum, item) => sum + (item.expectedAmount || 0),
    0
  );
  const currentMonthBudgetGap = currentMonthBudget - currentMonthExpenses;

  const totalIncome = filteredIncomes.reduce(
    (sum, income) => sum + (income.amount || 0),
    0
  );
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );
  const balance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
  const expenseRatio =
    totalIncome > 0
      ? Math.min((totalExpenses / totalIncome) * 100, 100).toFixed(1)
      : 0;

  const pendingTasks = data.tasks.filter((task) => task.status === "PENDING");
  const inProgressTasks = data.tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  );
  const completedTasks = data.tasks.filter(
    (task) => task.status === "COMPLETED"
  );
  const highPriorityPending = data.tasks.filter(
    (task) => task.priority === "HIGH" && task.status !== "COMPLETED"
  );

  const activeLoans = data.loans.filter((loan) => loan.status === "ACTIVE");
  const totalOutstanding = data.loans.reduce(
    (sum, loan) => sum + parseFloat(loan.outstandingAmount || 0),
    0
  );
  const totalLoanPrincipal = data.loans.reduce(
    (sum, loan) => sum + parseFloat(loan.principalAmount || 0),
    0
  );

  const alerts = [
    ...(balance < 0
      ? [`Expenses exceed income by ${formatCurrency(Math.abs(balance))}`]
      : []),
    ...highPriorityPending.map(
      (task) => `High priority task "${task.title}" due ${task.dueDate}`
    ),
    ...activeLoans.map(
      (loan) =>
        `${loan.loanName} outstanding ${formatCurrency(
          parseFloat(loan.outstandingAmount || 0)
        )}`
    ),
  ];

  const sortByDate = (left, right, fieldName) =>
    sortDir === "desc"
      ? new Date(right[fieldName]) - new Date(left[fieldName])
      : new Date(left[fieldName]) - new Date(right[fieldName]);

  const recentExpenses = [...filteredExpenses]
    .sort((left, right) => sortByDate(left, right, "expenseDate"))
    .slice(0, 5);
  const recentIncomes = [...filteredIncomes]
    .sort((left, right) => sortByDate(left, right, "incomeDate"))
    .slice(0, 5);

  return (
    <MainLayout>
      <div className={styles.dashboard}>
        {alerts.length > 0 && (
          <div className={styles.marqueeBar}>
            <span className={styles.marqueeLabel}>Live</span>
            <div className={styles.marqueeScroller}>
              <span>
                {alerts.join(" | ")}&nbsp;&nbsp;&nbsp;&nbsp;
                {alerts.join(" | ")}
              </span>
            </div>
          </div>
        )}

        <div className={styles.toolbar}>
          <div className={styles.periodGroup}>
            {["weekly", "monthly", "alltime"].map((option) => (
              <button
                key={option}
                onClick={() => setPeriod(option)}
                className={`${styles.periodBtn} ${
                  period === option ? styles.activePeriod : ""
                }`}
              >
                {option === "alltime"
                  ? "All Time"
                  : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.toolRight}>
            <select
              value={sortDir}
              onChange={(event) => setSortDir(event.target.value)}
              className={styles.sortSelect}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            <button className={styles.refreshBtn} onClick={fetchAll}>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingDots />
        ) : (
          <>
            <div className={styles.statsGrid}>
              <StatCard
                label="Total Income"
                value={formatCurrency(totalIncome)}
                sub={`${filteredIncomes.length} entries`}
                color="#16a34a"
                icon="IN"
                onClick={() => navigate("/income")}
              />
              <StatCard
                label="Total Expenses"
                value={formatCurrency(totalExpenses)}
                sub={`${filteredExpenses.length} entries`}
                color="#dc2626"
                icon="EX"
                onClick={() => navigate("/expenses")}
              />
              <StatCard
                label="Net Balance"
                value={formatCurrency(balance)}
                sub={balance >= 0 ? "Positive" : "Deficit"}
                color={balance >= 0 ? "#2563eb" : "#dc2626"}
                icon="NB"
              />
              <StatCard
                label="Savings Rate"
                value={`${savingsRate}%`}
                sub="of income saved"
                color="#7c3aed"
                icon="SV"
              />
              <StatCard
                label="Expected Budget"
                value={formatCurrency(currentMonthBudget)}
                sub={`${data.budgets.length} items this month`}
                color="#0f766e"
                icon="BG"
                onClick={() => navigate("/budgets")}
              />
            </div>

            <div className={styles.midGrid}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Income vs Expense Analysis</h3>
                <div className={styles.ratioLabels}>
                  <span className={styles.greenText}>
                    Income: {formatCurrency(totalIncome)}
                  </span>
                  <span className={styles.redText}>
                    Expenses: {formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className={styles.ratioBar}>
                  <div
                    className={styles.ratioFill}
                    style={{ width: `${expenseRatio}%` }}
                  />
                </div>
                <div className={styles.ratioNote}>
                  {expenseRatio}% of income spent this{" "}
                  {period === "alltime" ? "period" : period.replace("ly", "")}
                </div>

                <div className={styles.divider} />

                <div className={styles.loanRow}>
                  <div className={styles.loanStat}>
                    <span>Loans</span>
                    <strong>{data.loans.length}</strong>
                  </div>
                  <div className={styles.loanStat}>
                    <span>Active</span>
                    <strong style={{ color: "#f59e0b" }}>{activeLoans.length}</strong>
                  </div>
                  <div className={styles.loanStat}>
                    <span>Outstanding</span>
                    <strong className={styles.redText}>
                      {formatCurrency(totalOutstanding)}
                    </strong>
                  </div>
                  <div className={styles.loanStat}>
                    <span>Principal</span>
                    <strong>{formatCurrency(totalLoanPrincipal)}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Task Overview</h3>
                  <button
                    className={styles.linkBtn}
                    onClick={() => navigate("/tasks")}
                  >
                    View All
                  </button>
                </div>
                <div className={styles.taskStats}>
                  <div className={`${styles.taskBubble} ${styles.bubblePending}`}>
                    <strong>{pendingTasks.length}</strong>
                    <span>Pending</span>
                  </div>
                  <div className={`${styles.taskBubble} ${styles.bubbleProgress}`}>
                    <strong>{inProgressTasks.length}</strong>
                    <span>In Progress</span>
                  </div>
                  <div className={`${styles.taskBubble} ${styles.bubbleDone}`}>
                    <strong>{completedTasks.length}</strong>
                    <span>Completed</span>
                  </div>
                </div>
                {highPriorityPending.length > 0 && (
                  <div className={styles.alertBox}>
                    {highPriorityPending.length} high-priority task(s) need attention
                  </div>
                )}
                <div className={styles.miniTaskList}>
                  {[...pendingTasks, ...inProgressTasks].slice(0, 4).map((task) => (
                    <div key={task.id} className={styles.miniTask}>
                      <span
                        className={`${styles.priDot} ${
                          task.priority === "HIGH"
                            ? styles.dotRed
                            : task.priority === "MEDIUM"
                            ? styles.dotAmber
                            : styles.dotBlue
                        }`}
                      />
                      <span className={styles.miniTaskTitle}>{task.title}</span>
                      <span className={styles.miniTaskDate}>{task.dueDate}</span>
                    </div>
                  ))}
                  {pendingTasks.length + inProgressTasks.length === 0 && (
                    <p className={styles.empty}>All tasks are up to date.</p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.bottomGrid}>
              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Monthly Budget</h3>
                  <button
                    className={styles.linkBtn}
                    onClick={() => navigate("/budgets")}
                  >
                    View All
                  </button>
                </div>
                <div className={styles.budgetSummary}>
                  <div className={styles.budgetStat}>
                    <span>Expected</span>
                    <strong>{formatCurrency(currentMonthBudget)}</strong>
                  </div>
                  <div className={styles.budgetStat}>
                    <span>Actual</span>
                    <strong>{formatCurrency(currentMonthExpenses)}</strong>
                  </div>
                  <div className={styles.budgetStat}>
                    <span>Gap</span>
                    <strong
                      className={
                        currentMonthBudgetGap >= 0
                          ? styles.greenText
                          : styles.redText
                      }
                    >
                      {formatCurrency(currentMonthBudgetGap)}
                    </strong>
                  </div>
                </div>
                {data.budgets.length === 0 ? (
                  <p className={styles.empty}>No budget items added for this month.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Expected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.budgets.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td>{item.itemName}</td>
                          <td>{formatCurrency(item.expectedAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Recent Expenses</h3>
                  <button
                    className={styles.linkBtn}
                    onClick={() => navigate("/expenses")}
                  >
                    View All
                  </button>
                </div>
                {recentExpenses.length === 0 ? (
                  <p className={styles.empty}>No expenses in this period.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{expense.expenseDate}</td>
                          <td>{expense.description || "-"}</td>
                          <td className={styles.redText}>
                            {formatCurrency(expense.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Recent Incomes</h3>
                  <button
                    className={styles.linkBtn}
                    onClick={() => navigate("/income")}
                  >
                    View All
                  </button>
                </div>
                {recentIncomes.length === 0 ? (
                  <p className={styles.empty}>No income in this period.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIncomes.map((income) => (
                        <tr key={income.id}>
                          <td>{income.incomeDate}</td>
                          <td>{income.description || "-"}</td>
                          <td className={styles.greenText}>
                            {formatCurrency(income.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>Active Loans</h3>
                  <button
                    className={styles.linkBtn}
                    onClick={() => navigate("/loans")}
                  >
                    View All
                  </button>
                </div>
                {activeLoans.length === 0 ? (
                  <p className={styles.empty}>No active loans.</p>
                ) : (
                  activeLoans.slice(0, 4).map((loan) => {
                    const principal = parseFloat(loan.principalAmount || 0);
                    const outstanding = parseFloat(loan.outstandingAmount || 0);
                    const paid = principal - outstanding;
                    const percentRepaid =
                      principal > 0 ? ((paid / principal) * 100).toFixed(0) : 0;

                    return (
                      <div key={loan.id} className={styles.loanItem}>
                        <div className={styles.loanItemHeader}>
                          <span className={styles.loanItemName}>{loan.loanName}</span>
                          <span className={styles.loanItemRate}>
                            {loan.interestRate}%
                          </span>
                        </div>
                        <div className={styles.loanItemMeta}>
                          <span>{formatCurrency(principal)} principal</span>
                          <span className={styles.redText}>
                            {formatCurrency(outstanding)} left
                          </span>
                        </div>
                        <div className={styles.loanProg}>
                          <div
                            className={styles.loanProgFill}
                            style={{ width: `${percentRepaid}%` }}
                          />
                        </div>
                        <div className={styles.loanProgLabel}>
                          {percentRepaid}% repaid
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
