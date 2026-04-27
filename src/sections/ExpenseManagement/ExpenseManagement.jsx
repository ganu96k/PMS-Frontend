import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ExpenseManagementStyles.module.css";

const ExpenseManagement = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    expenseDate: new Date().toISOString().split("T")[0],
    amount: "",
    categoryId: "",
    paymentMethodId: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch expenses
      const expensesRes = await fetch(
        `http://localhost:8080/api/expenses/user/${userId}`
      );
      const expensesData = await expensesRes.json();
      setExpenses(expensesData);

      // Fetch categories
      const categoriesRes = await fetch(
        "http://localhost:8080/api/categories/active"
      );
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);

      // Fetch payment methods
      const paymentRes = await fetch(
        "http://localhost:8080/api/payment-methods/active"
      );
      const paymentData = await paymentRes.json();
      setPaymentMethods(paymentData);

      setError("");
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      userId: parseInt(userId),
      amount: parseFloat(formData.amount),
      categoryId: parseInt(formData.categoryId),
      paymentMethodId: parseInt(formData.paymentMethodId),
    };

    try {
      if (formData.id) {
        // Update
        const response = await fetch(
          `http://localhost:8080/api/expenses/update/${formData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await response.json();
        setExpenses((prev) =>
          prev.map((exp) => (exp.id === formData.id ? data : exp))
        );
      } else {
        // Create
        const response = await fetch(
          "http://localhost:8080/api/expenses/create",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await response.json();
        setExpenses((prev) => [data, ...prev]);
      }

      // Reset form
      setFormData({
        id: null,
        expenseDate: new Date().toISOString().split("T")[0],
        amount: "",
        categoryId: "",
        paymentMethodId: "",
        description: "",
      });
      setShowForm(false);
    } catch (err) {
      setError("Failed to save expense");
      console.error(err);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      id: expense.id,
      expenseDate: expense.expenseDate,
      amount: expense.amount,
      categoryId: expense.categoryId,
      paymentMethodId: expense.paymentMethodId,
      description: expense.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await fetch(`http://localhost:8080/api/expenses/delete/${id}`, {
          method: "DELETE",
        });
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      } catch (err) {
        setError("Failed to delete expense");
        console.error(err);
      }
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === expenses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(expenses.map((exp) => exp.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (
      selectedRows.length > 0 &&
      window.confirm(
        `Delete ${selectedRows.length} selected expenses? This cannot be undone.`
      )
    ) {
      try {
        for (const id of selectedRows) {
          await fetch(`http://localhost:8080/api/expenses/delete/${id}`, {
            method: "DELETE",
          });
        }
        setExpenses((prev) =>
          prev.filter((exp) => !selectedRows.includes(exp.id))
        );
        setSelectedRows([]);
      } catch (err) {
        setError("Failed to delete selected expenses");
        console.error(err);
      }
    }
  };

  const getCategoryName = (id) => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.name : "Unknown";
  };

  const getPaymentMethodName = (id) => {
    const method = paymentMethods.find((pm) => pm.id === id);
    return method ? method.name : "Unknown";
  };

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Expense Management</h1>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button
              className={styles.addBtn}
              onClick={() => {
                setFormData({
                  id: null,
                  expenseDate: new Date().toISOString().split("T")[0],
                  amount: "",
                  categoryId: "",
                  paymentMethodId: "",
                  description: "",
                });
                setShowForm(true);
              }}
            >
              + Add Expense
            </button>

            {selectedRows.length > 0 && (
              <button
                className={styles.deleteBtn}
                onClick={handleDeleteSelected}
              >
                🗑️ Delete {selectedRows.length}
              </button>
            )}
          </div>

          <div className={styles.dateFilter}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              placeholder="Start Date"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Expense Table */}
        <div className={styles.tableContainer}>
          <table className={styles.expenseTable}>
            <thead>
              <tr>
                <th className={styles.checkboxCol}>
                  <input
                    type="checkbox"
                    checked={
                      expenses.length > 0 &&
                      selectedRows.length === expenses.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Sr. No.</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan="8">No expenses found. Add your first expense!</td>
                </tr>
              ) : (
                sortedExpenses.map((expense, index) => (
                  <tr
                    key={expense.id}
                    className={
                      selectedRows.includes(expense.id) ? styles.selectedRow : ""
                    }
                  >
                    <td className={styles.checkboxCol}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(expense.id)}
                        onChange={() => handleSelectRow(expense.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>
                      <div className={styles.inlineEditGroup} onClick={() => handleEdit(expense)} title="Edit Date">
                        <span>{new Date(expense.expenseDate).toLocaleDateString()}</span>
                        <span className={styles.pencilIcon}>✎</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.inlineEditGroup} onClick={() => handleEdit(expense)} title="Edit Category">
                        <span className={styles.categoryBadge}>{getCategoryName(expense.categoryId)}</span>
                        <span className={styles.pencilIcon}>✎</span>
                      </div>
                    </td>
                    <td className={styles.amount}>
                      <div className={styles.inlineEditGroup} onClick={() => handleEdit(expense)} title="Edit Amount">
                        <span>₹{expense.amount?.toFixed(2) || "0.00"}</span>
                        <span className={styles.pencilIcon}>✎</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.inlineEditGroup} onClick={() => handleEdit(expense)} title="Edit Payment Method">
                        <span className={styles.methodBadge}>{getPaymentMethodName(expense.paymentMethodId)}</span>
                        <span className={styles.pencilIcon}>✎</span>
                      </div>
                    </td>
                    <td className={styles.description}>
                      <div className={styles.inlineEditGroup} onClick={() => handleEdit(expense)} title="Edit Description">
                        <span>{expense.description || "-"}</span>
                        <span className={styles.pencilIcon}>✎</span>
                      </div>
                    </td>
                    <td className={styles.actions} style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className={styles.actionIconBtn}
                        onClick={() => handleEdit(expense)}
                        title="Edit Record"
                      >
                        ✎
                      </button>
                      <button
                        className={styles.actionIconBtn}
                        style={{ color: '#dc2626' }}
                        onClick={() => handleDelete(expense.id)}
                        title="Delete Record"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className={styles.summaryBar}>
          <div>
            <strong>Total Expenses:</strong> ₹
            {sortedExpenses
              .reduce((sum, exp) => sum + (exp.amount || 0), 0)
              .toFixed(2)}
          </div>
          <div>
            <strong>Total Records:</strong> {sortedExpenses.length}
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{formData.id ? "Edit Expense" : "Add New Expense"}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Date *</label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  step="0.01"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Payment Method *</label>
                <select
                  name="paymentMethodId"
                  value={formData.paymentMethodId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description (optional)"
                  rows="3"
                ></textarea>
              </div>

              <div className={styles.formButtons}>
                <button type="submit" className={styles.submitBtn}>
                  {formData.id ? "Update Expense" : "Add Expense"}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
