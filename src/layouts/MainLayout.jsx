import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.css";

function getStoredUser() {
  const storedUser = localStorage.getItem("user");
  const fallbackName = localStorage.getItem("userName") || "";
  const [firstName = "", ...lastNameParts] = fallbackName.split(" ");
  const fallbackUser = {
    id: Number(localStorage.getItem("userId")) || 0,
    email: localStorage.getItem("userEmail") || "",
    firstName,
    lastName: lastNameParts.join(" "),
    role: localStorage.getItem("userRole") || "USER",
  };

  if (!storedUser) {
    return fallbackUser;
  }

  try {
    return {
      ...fallbackUser,
      ...JSON.parse(storedUser),
    };
  } catch {
    return fallbackUser;
  }
}

function formatCurrency(value) {
  return `INR ${parseFloat(value || 0).toLocaleString("en-IN")}`;
}

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBell, setShowBell] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const user = getStoredUser();
  const userId = Number(user.id || localStorage.getItem("userId") || 0);

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: "DB" },
    { label: "Expenses", path: "/expenses", icon: "EX" },
    { label: "Budget", path: "/budgets", icon: "BG" },
    { label: "Income", path: "/income", icon: "IN" },
    { label: "Tasks", path: "/tasks", icon: "TS" },
    { label: "Loans", path: "/loans", icon: "LN" },
    { label: "Reports", path: "/reports", icon: "RP" },
    { label: "Certificates", path: "/certificates", icon: "CF" },
    { label: "Settings", path: "/settings", icon: "ST" },
  ];

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !userId) {
      setNotifications([]);
      return;
    }

    const items = [];
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const taskRes = await fetch(`http://localhost:8080/api/tasks/user/${userId}`, {
        headers,
      });

      if (taskRes.ok) {
        const tasks = await taskRes.json();
        const highPending = tasks.filter(
          (task) => task.priority === "HIGH" && task.status !== "COMPLETED"
        );

        highPending.forEach((task) =>
          items.push({
            type: "task",
            label: `High priority: ${task.title}`,
            sub: `Due ${task.dueDate}`,
            path: "/tasks",
          })
        );

        const today = new Date().toISOString().split("T")[0];
        tasks
          .filter((task) => task.dueDate === today && task.status !== "COMPLETED")
          .forEach((task) =>
            items.push({
              type: "task",
              label: `Due today: ${task.title}`,
              sub: task.status,
              path: "/tasks",
            })
          );
      }
    } catch (error) {
      console.debug("Unable to load task notifications", error);
    }

    try {
      const loanRes = await fetch(`http://localhost:8080/api/loans/user/${userId}`, {
        headers,
      });

      if (loanRes.ok) {
        const loans = await loanRes.json();
        loans
          .filter((loan) => loan.status === "ACTIVE")
          .forEach((loan) =>
            items.push({
              type: "loan",
              label: `Active loan: ${loan.loanName}`,
              sub: `Outstanding ${formatCurrency(loan.outstandingAmount)}`,
              path: "/loans",
            })
          );
      }
    } catch (error) {
      console.debug("Unable to load loan notifications", error);
    }

    setNotifications(items);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const pageLabel =
    menuItems.find((item) => item.path === location.pathname)?.label || "Dashboard";

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? "" : styles.closed}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>FF</span>
          {sidebarOpen && <span className={styles.logoText}>FinFlow</span>}
        </div>

        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ""}`}
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
            {user.firstName?.[0]?.toUpperCase() ||
              user.lastName?.[0]?.toUpperCase() ||
              "U"}
          </div>
          {sidebarOpen && (
            <div className={styles.userMeta}>
              <div className={styles.userName}>
                {[user.firstName, user.lastName].filter(Boolean).join(" ") || "User"}
              </div>
              <div className={styles.userEmail}>{user.email || ""}</div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        )}
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.toggleBtn}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? "<" : ">"}
            </button>
            <h1 className={styles.pageTitle}>{pageLabel}</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.bellWrap}>
              <button
                className={styles.bellBtn}
                onClick={() => setShowBell((open) => !open)}
                title="Notifications"
              >
                Alerts
                {notifications.length > 0 && (
                  <span className={styles.bellBadge}>{notifications.length}</span>
                )}
              </button>
              {showBell && (
                <div className={styles.bellDropdown}>
                  <div className={styles.bellHeader}>
                    Notifications
                    <button className={styles.bellClose} onClick={() => setShowBell(false)}>
                      x
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className={styles.bellEmpty}>All clear. No alerts.</div>
                  ) : (
                    notifications.map((notification, index) => (
                      <div
                        key={`${notification.type}-${index}`}
                        className={styles.bellItem}
                        onClick={() => {
                          navigate(notification.path);
                          setShowBell(false);
                        }}
                      >
                        <div className={styles.bellItemLabel}>{notification.label}</div>
                        <div className={styles.bellItemSub}>{notification.sub}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={styles.headerDate}>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
