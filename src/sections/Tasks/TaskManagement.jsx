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

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "MEDIUM",
    status: "PENDING",
  });

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`http://localhost:8080/tasks/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (err) {
      setError("Unable to load tasks from server.");
      console.error(err);
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
        const res = await fetch(`http://localhost:8080/tasks/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const updatedTask = await res.json();
        setTasks(tasks.map((t) => (t.id === formData.id ? updatedTask : t)));
      } else {
        const res = await fetch(`http://localhost:8080/tasks`, {
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
        const res = await fetch(`http://localhost:8080/tasks/${id}`, { method: "DELETE" });
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

  const toggleStatus = async (task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    const payload = { ...task, status: newStatus };
    try {
      const res = await fetch(`http://localhost:8080/tasks/${task.id}`, {
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Daily Tasks</h1>
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
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Save Task</button>
          </div>
        </form>
      )}

      <div className={styles.taskGrid}>
        {tasks.map(task => (
          <div key={task.id} className={`${styles.taskCard} ${task.status === 'COMPLETED' ? styles.completed : ''}`}>
            <div className={styles.taskHeader}>
              <span className={`${styles.priorityBadge} ${styles[task.priority.toLowerCase()]}`}>
                {task.priority}
              </span>
              <span className={styles.date}>{task.dueDate}</span>
            </div>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div className={styles.taskFooter}>
              <button 
                type="button"
                className={styles.statusToggle} 
                onClick={() => toggleStatus(task)}
              >
                {task.status === "COMPLETED" ? "Mark Pending" : "Mark Complete"}
              </button>
              <div className={styles.actions}>
                <button type="button" className={styles.editBtn} onClick={() => handleEdit(task)}>Edit</button>
                <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && !showForm && (
          <div className={styles.emptyState}>No tasks found. Create one!</div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;
