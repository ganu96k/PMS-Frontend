import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TaskManagement.module.css";

const TaskManagement = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

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
  });

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        throw new Error("Failed to fetch tasks");
      }
    } catch (err) {
      setError("Unable to load tasks from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      setError("Title and Due Date are required.");
      return;
    }

    const payload = {
      ...formData,
      userId: parseInt(userId),
    };

    try {
      if (formData.id) {
        const res = await fetch(`http://localhost:8080/api/tasks/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const updatedTask = await res.json();
        setTasks(tasks.map((t) => (t.id === formData.id ? updatedTask : t)));
      } else {
        const res = await fetch(`http://localhost:8080/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError("Failed to save task.");
    }
  };

  const handleEdit = (task) => {
    setFormData(task);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const res = await fetch(`http://localhost:8080/api/tasks/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        setTasks(tasks.filter((t) => t.id !== id));
      } catch (err) {
        setError("Failed to delete task.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "MEDIUM",
      status: "PENDING",
    });
    setError("");
  };

  const updateTaskStatus = async (task, newStatus) => {
    const payload = { ...task, status: newStatus };
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(tasks.map(t => t.id === task.id ? updated : t));
      }
    } catch (err) {
      setError("Failed to update status.");
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  // Split tasks by status
  const pendingTasks = tasks.filter(t => t.status === "PENDING" || !t.status);
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  const TaskCard = ({ task }) => (
    <div className={`${styles.taskCard} ${task.status === 'COMPLETED' ? styles.completed : ''} ${task.priority === 'HIGH' ? styles.highPriority : ''}`}>
      <div className={styles.taskHeader}>
        <span className={`${styles.priorityBadge} ${styles[task.priority.toLowerCase()]}`}>
          {task.priority}
        </span>
        <span className={styles.date}>{task.dueDate}</span>
      </div>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      
      <div className={styles.taskFooter}>
        <div className={styles.statusActions}>
          {task.status !== 'PENDING' && (
            <button className={styles.statusBtn} onClick={() => updateTaskStatus(task, 'PENDING')}>To Pending</button>
          )}
          {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
            <button className={styles.statusBtn} onClick={() => updateTaskStatus(task, 'IN_PROGRESS')}>Start</button>
          )}
          {task.status !== 'COMPLETED' && (
            <button className={styles.statusBtn} onClick={() => updateTaskStatus(task, 'COMPLETED')}>Complete</button>
          )}
        </div>
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => handleEdit(task)}>Edit</button>
          <button className={styles.deleteBtn} onClick={() => handleDelete(task.id)}>Delete</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
          <h1>Daily Tasks</h1>
        </div>
        <button className={styles.addBtn} onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Task
        </button>
      </header>
      
      {error && <div className={styles.error}>{error}</div>}

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
            <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Save Task</button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className={styles.board}>
          <div className={styles.column}>
            <h3 className={styles.columnHeader}>
              Pending <span className={styles.count}>{pendingTasks.length}</span>
            </h3>
            {pendingTasks.map(t => <TaskCard key={t.id} task={t} />)}
            {pendingTasks.length === 0 && <div className={styles.emptyState}>No pending tasks</div>}
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnHeader}>
              In Progress <span className={styles.count}>{inProgressTasks.length}</span>
            </h3>
            {inProgressTasks.map(t => <TaskCard key={t.id} task={t} />)}
            {inProgressTasks.length === 0 && <div className={styles.emptyState}>Nothing in progress</div>}
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnHeader}>
              Completed <span className={styles.count}>{completedTasks.length}</span>
            </h3>
            {completedTasks.map(t => <TaskCard key={t.id} task={t} />)}
            {completedTasks.length === 0 && <div className={styles.emptyState}>No completed tasks</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
