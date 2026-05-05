import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TaskManagement.module.css";

const STATUS_COLUMNS = [
  { key: "PENDING", title: "Pending", emptyMessage: "No pending tasks" },
  { key: "IN_PROGRESS", title: "In Progress", emptyMessage: "Nothing in progress" },
  { key: "COMPLETED", title: "Completed", emptyMessage: "No completed tasks" },
];

const PRIORITY_ORDER = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const TASK_TYPES = ["OFFICE", "PERSONAL", "LEARNING"];

const getTaskStatus = (task) => task.status || "PENDING";

const getDueDateValue = (task) => {
  if (!task.dueDate) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = new Date(task.dueDate).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
};

const sortTasks = (taskList) =>
  [...taskList].sort((taskA, taskB) => {
    const priorityDiff =
      (PRIORITY_ORDER[taskA.priority] ?? Number.MAX_SAFE_INTEGER) -
      (PRIORITY_ORDER[taskB.priority] ?? Number.MAX_SAFE_INTEGER);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const dueDateDiff = getDueDateValue(taskA) - getDueDateValue(taskB);
    if (dueDateDiff !== 0) {
      return dueDateDiff;
    }

    return (taskA.title || "").localeCompare(taskB.title || "");
  });

const TaskManagement = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropStatus, setActiveDropStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    taskType: "",
    priority: "",
    status: "",
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    dueDate: tomorrowStr,
    priority: "MEDIUM",
    status: "PENDING",
    taskType: "PERSONAL",
  });

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setAllTasks([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/tasks/user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setAllTasks(data);
      setTasks(data);
      setError("");
    } catch (fetchError) {
      setError("Unable to load tasks from server.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = allTasks;

    if (filters.startDate) {
      filtered = filtered.filter((task) => task.dueDate >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter((task) => task.dueDate <= filters.endDate);
    }
    if (filters.taskType) {
      filtered = filtered.filter((task) => task.taskType === filters.taskType);
    }
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }
    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    setTasks(filtered);
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      taskType: "",
      priority: "",
      status: "",
    });
    setTasks(allTasks);
  };

  const downloadCSV = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/tasks/download-csv/${userId}`);
      if (!response.ok) {
        throw new Error(`CSV download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `tasks_${new Date().toISOString().split("T")[0]}.csv`;
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setError(`Failed to download CSV: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      dueDate: tomorrowStr,
      priority: "MEDIUM",
      status: "PENDING",
      taskType: "PERSONAL",
    });
    setError("");
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title || !formData.dueDate) {
      setError("Title and Due Date are required.");
      return;
    }

    const payload = {
      ...formData,
      userId: parseInt(userId, 10),
    };

    try {
      if (formData.id) {
        const response = await fetch(`http://localhost:8080/api/tasks/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Update failed");
        }

        const updatedTask = await response.json();
        setAllTasks((current) =>
          current.map((task) => (task.id === formData.id ? updatedTask : task))
        );
        setTasks((current) =>
          current.map((task) => (task.id === formData.id ? updatedTask : task))
        );
      } else {
        const response = await fetch(`http://localhost:8080/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Create failed");
        }

        const newTask = await response.json();
        setAllTasks((current) => [...current, newTask]);
        setTasks((current) => [...current, newTask]);
      }

      resetForm();
    } catch (submitError) {
      setError("Failed to save task.");
    }
  };

  const handleEdit = (task) => {
    setFormData({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate || tomorrowStr,
      priority: task.priority || "MEDIUM",
      status: getTaskStatus(task),
      taskType: task.taskType || "PERSONAL",
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setAllTasks((current) => current.filter((task) => task.id !== id));
      setTasks((current) => current.filter((task) => task.id !== id));
      setError("");
    } catch (deleteError) {
      setError("Failed to delete task.");
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    if (getTaskStatus(task) === newStatus) {
      return true;
    }

    const payload = {
      ...task,
      status: newStatus,
      userId: parseInt(userId, 10),
    };

    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      const updatedTask = await response.json();
      setAllTasks((current) =>
        current.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask
        )
      );
      setTasks((current) =>
        current.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask
        )
      );
      setError("");
      return true;
    } catch (updateError) {
      setError("Failed to update status.");
      return false;
    }
  };

  const handleDragStart = (task) => {
    setDraggedTaskId(task.id);
    setActiveDropStatus(getTaskStatus(task));
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropStatus("");
  };

  const handleDrop = async (targetStatus) => {
    if (!draggedTaskId) {
      return;
    }

    const draggedTask = tasks.find((task) => task.id === draggedTaskId);
    setActiveDropStatus("");

    if (!draggedTask) {
      return;
    }

    await updateTaskStatus(draggedTask, targetStatus);
  };

  const getTasksForStatus = (status) =>
    sortTasks(tasks.filter((task) => getTaskStatus(task) === status));

  // Dashboard calculations
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;
  const productivityScore = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const avgCompletionTime = tasks.length > 0
    ? Math.round(
        tasks
          .filter((t) => t.durationInMinutes)
          .reduce((sum, t) => sum + (t.durationInMinutes || 0), 0) /
          tasks.filter((t) => t.durationInMinutes).length
      )
    : 0;

  const getCalendarUrl = (task) => {
    const title = encodeURIComponent(`Task: ${task.title}`);
    const details = encodeURIComponent(task.description || "");
    const date = (task.dueDate || tomorrowStr).replace(/-/g, "");
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${date}/${date}`;
  };

  const getWhatsAppUrl = (task) => {
    const message = encodeURIComponent(
      `📌 Task Reminder\n\nTitle: ${task.title}\nDue: ${task.dueDate}\nStatus: ${getTaskStatus(task)}\n\nSent via FinFlow Portfolio`
    );
    return `https://wa.me/?text=${message}`;
  };

  const TaskCard = ({ task }) => (
    <div
      draggable
      onDragStart={() => handleDragStart(task)}
      onDragEnd={handleDragEnd}
      className={`${styles.taskCard} ${
        getTaskStatus(task) === "COMPLETED" ? styles.completed : ""
      } ${task.priority === "HIGH" ? styles.highPriority : ""} ${
        task.isOverdue ? styles.overdue : ""
      } ${draggedTaskId === task.id ? styles.dragging : ""}`}
    >
      <div className={styles.taskHeader}>
        <div className={styles.taskMeta}>
          <span className={`${styles.priorityBadge} ${styles[(task.priority || "LOW").toLowerCase()]}`}>
            {task.priority || "LOW"}
          </span>
          <span className={`${styles.typeBadge}`}>
            {task.taskType || "PERSONAL"}
          </span>
          <a
            href={getCalendarUrl(task)}
            target="_blank"
            rel="noreferrer"
            className={styles.iconAction}
            title="Add to Calendar"
            onClick={(event) => event.stopPropagation()}
          >
            📅
          </a>
          <a
            href={getWhatsAppUrl(task)}
            target="_blank"
            rel="noreferrer"
            className={styles.iconAction}
            title="Share on WhatsApp"
            onClick={(event) => event.stopPropagation()}
          >
            💬
          </a>
        </div>
        <span className={styles.date}>{task.dueDate}</span>
      </div>

      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      
      {task.durationInMinutes && (
        <div className={styles.duration}>⏱️ {Math.round(task.durationInMinutes / 60)}h {task.durationInMinutes % 60}m</div>
      )}

      <div className={styles.taskFooter}>
        <div className={styles.statusActions}>
          {getTaskStatus(task) !== "PENDING" && (
            <button className={styles.statusBtn} onClick={() => updateTaskStatus(task, "PENDING")}>To Pending</button>
          )}
          {getTaskStatus(task) !== "IN_PROGRESS" && getTaskStatus(task) !== "COMPLETED" && (
            <button className={styles.statusBtn} onClick={() => updateTaskStatus(task, "IN_PROGRESS")}>Start</button>
          )}
          {getTaskStatus(task) !== "COMPLETED" && (
            <button className={styles.statusBtn} onClick={() => updateTaskStatus(task, "COMPLETED")}>Complete</button>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => handleEdit(task)}>Edit</button>
          <button className={styles.deleteBtn} onClick={() => handleDelete(task.id)}>Delete</button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>Daily Tasks</h1>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.downloadBtn}
            onClick={() => downloadCSV()}
            title="Download tasks as CSV"
          >
            📥 Download CSV
          </button>
          <button
            className={styles.addBtn}
            onClick={() => {
              setError("");
              setShowForm(true);
              setFormData({
                id: null,
                title: "",
                description: "",
                dueDate: tomorrowStr,
                priority: "MEDIUM",
                status: "PENDING",
                taskType: "PERSONAL",
              });
            }}
          >
            + Add Task
          </button>
        </div>
      </header>

      {/* Dashboard Summary */}
      <div className={styles.dashboard}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Tasks</div>
          <div className={styles.summaryValue}>{totalTasks}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Pending</div>
          <div className={styles.summaryValue}>{pendingCount}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>In Progress</div>
          <div className={styles.summaryValue}>{inProgressCount}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Completed</div>
          <div className={styles.summaryValue}>{completedCount}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Overdue</div>
          <div className={`${styles.summaryValue} ${overdueTasks > 0 ? styles.warning : ""}`}>
            {overdueTasks}
          </div>
        </div>
      </div>

      {/* Productivity Score */}
      <div className={styles.productivitySection}>
        <h3>Productivity Score</h3>
        <div className={styles.scoreContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${productivityScore}%` }}
            ></div>
          </div>
          <div className={styles.scoreText}>{productivityScore}%</div>
        </div>
        {avgCompletionTime > 0 && (
          <div className={styles.avgTime}>
            ⏱️ Avg Completion Time: {Math.round(avgCompletionTime / 60)}h {avgCompletionTime % 60}m
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Filters Toggle */}
      <div className={styles.filtersToggle}>
        <button 
          className={styles.filterToggleBtn}
          onClick={() => setShowFilters(!showFilters)}
        >
          🔍 {showFilters ? "Hide" : "Show"} Filters
        </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className={styles.filtersSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Task Type</label>
              <select
                name="taskType"
                value={filters.taskType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Priority</label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          <div className={styles.filterActions}>
            <button className={styles.applyFilterBtn} onClick={applyFilters}>
              Apply Filters
            </button>
            <button className={styles.resetFilterBtn} onClick={resetFilters}>
              Reset All
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2>{formData.id ? "Edit Task" : "New Task"}</h2>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Due Date *</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleInputChange}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Task Type</label>
              <select name="taskType" value={formData.taskType} onChange={handleInputChange}>
                <option value="OFFICE">Office</option>
                <option value="PERSONAL">Personal</option>
                <option value="LEARNING">Learning</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={resetForm}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Save Task
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className={styles.board}>
          {STATUS_COLUMNS.map((column) => {
            const columnTasks = getTasksForStatus(column.key);

            return (
              <div
                key={column.key}
                className={`${styles.column} ${activeDropStatus === column.key ? styles.dropActive : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (draggedTaskId) {
                    setActiveDropStatus(column.key);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(column.key);
                }}
              >
                <div className={styles.columnHeaderWrap}>
                  <h3 className={styles.columnHeader}>
                    {column.title} <span className={styles.count}>{columnTasks.length}</span>
                  </h3>
                  <p className={styles.columnHint}>{column.emptyMessage}</p>
                </div>

                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}

                {columnTasks.length === 0 && <div className={styles.emptyState}>{column.emptyMessage}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;