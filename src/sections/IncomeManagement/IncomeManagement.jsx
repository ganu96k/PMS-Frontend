import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./IncomeManagementStyles.module.css";

const DEFAULT_INCOME_CATEGORIES = [
  { id: 1, name: "Salary" },
  { id: 2, name: "Freelance" },
  { id: 3, name: "Investment" },
  { id: 4, name: "Bonus" },
  { id: 5, name: "Other" },
];

const IncomeManagement = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    incomeDate: new Date().toISOString().split("T")[0],
    amount: "",
    categoryId: "",
    description: "",
  });

  const fetchData = useCallback(async () => {
    try {
      // Try to fetch incomes from backend
      try {
        const incomesRes = await fetch(
          `http://localhost:8080/api/incomes/user/${userId}`
        );
        if (incomesRes.ok) {
          const incomesData = await incomesRes.json();
          setIncomes(incomesData);
        } else {
          // Use mock data if endpoint doesn't exist
          setIncomes([
            {
              id: 1,
              userId: parseInt(userId),
              incomeDate: "2024-04-01",
              amount: 50000,
              categoryId: 1,
              description: "Monthly Salary",
            },
            {
              id: 2,
              userId: parseInt(userId),
              incomeDate: "2024-04-05",
              amount: 15000,
              categoryId: 2,
              description: "Freelance Project",
            },
            {
              id: 3,
              userId: parseInt(userId),
              incomeDate: "2024-04-10",
              amount: 5000,
              categoryId: 3,
              description: "Investment Dividend",
            },
          ]);
        }
      } catch (err) {
        // Use mock data if backend is not available
        setIncomes([
          {
            id: 1,
            userId: parseInt(userId),
            incomeDate: "2024-04-01",
            amount: 50000,
            categoryId: 1,
            description: "Monthly Salary",
          },
          {
            id: 2,
            userId: parseInt(userId),
            incomeDate: "2024-04-05",
            amount: 15000,
            categoryId: 2,
            description: "Freelance Project",
          },
          {
            id: 3,
            userId: parseInt(userId),
            incomeDate: "2024-04-10",
            amount: 5000,
            categoryId: 3,
            description: "Investment Dividend",
          },
        ]);
      }

      setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
      setError("");
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.categoryId) {
      setError("Please fill all required fields");
      return;
    }

    const payload = {
      userId: parseInt(userId),
      incomeDate: formData.incomeDate,
      amount: parseFloat(formData.amount),
      categoryId: parseInt(formData.categoryId),
      description: formData.description,
    };

    try {
      if (formData.id) {
        // Update existing income
        const updateRes = await fetch(`http://localhost:8080/api/incomes/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!updateRes.ok) throw new Error("Failed to update");
        const updatedIncome = await updateRes.json();
        setIncomes((prev) =>
          prev.map((inc) => (inc.id === formData.id ? updatedIncome : inc))
        );
      } else {
        // Add new income
        const createRes = await fetch(`http://localhost:8080/api/incomes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!createRes.ok) throw new Error("Failed to create");
        const newIncome = await createRes.json();
        setIncomes((prev) => [newIncome, ...prev]);
      }

      // Reset form
      setFormData({
        id: null,
        incomeDate: new Date().toISOString().split("T")[0],
        amount: "",
        categoryId: "",
        description: "",
      });
      setShowForm(false);
      setError("");
    } catch (err) {
      setError("Failed to save income");
      console.error(err);
    }
  };

  const handleEdit = (income) => {
    setFormData({
      id: income.id,
      incomeDate: income.incomeDate,
      amount: income.amount,
      categoryId: income.categoryId,
      description: income.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        const deleteRes = await fetch(`http://localhost:8080/api/incomes/${id}`, {
          method: "DELETE",
        });
        if (!deleteRes.ok) throw new Error("Failed to delete");
        setIncomes((prev) => prev.filter((inc) => inc.id !== id));
      } catch(err) {
        setError("Failed to delete income");
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
    if (selectedRows.length === incomes.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(incomes.map((inc) => inc.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (
      selectedRows.length > 0 &&
      window.confirm(
        `Delete ${selectedRows.length} selected incomes? This cannot be undone.`
      )
    ) {
      try {
        await Promise.all(selectedRows.map(id => 
          fetch(`http://localhost:8080/api/incomes/${id}`, { method: "DELETE" })
        ));
        setIncomes((prev) =>
          prev.filter((inc) => !selectedRows.includes(inc.id))
        );
        setSelectedRows([]);
      } catch(err) {
        setError("Failed to delete some incomes");
        console.error(err);
      }
    }
  };

  const getCategoryName = (id) => {
    const category = incomeCategories.find((cat) => cat.id === id);
    return category ? category.name : "Unknown";
  };

  const sortedIncomes = [...incomes].sort(
    (a, b) => new Date(b.incomeDate) - new Date(a.incomeDate)
  );

  const totalIncome = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading incomes...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Income Management</h1>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className={styles.totalIncome}>
          Total Income: <strong>₹{totalIncome.toFixed(2)}</strong>
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
                  incomeDate: new Date().toISOString().split("T")[0],
                  amount: "",
                  categoryId: "",
                  description: "",
                });
                setShowForm(true);
              }}
            >
              + Add Income
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

        {/* Add/Edit Form */}
        {showForm && (
          <div className={styles.formContainer}>
            <h2>{formData.id ? "Edit Income" : "Add New Income"}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Income Date *</label>
                  <input
                    type="date"
                    name="incomeDate"
                    value={formData.incomeDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleInputChange}
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
                    <option value="">Select Category</option>
                    {incomeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>
                  {formData.id ? "Update" : "Add"} Income
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      id: null,
                      incomeDate: new Date().toISOString().split("T")[0],
                      amount: "",
                      categoryId: "",
                      description: "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Income Table */}
        <div className={styles.tableContainer}>
          <table className={styles.incomeTable}>
            <thead>
              <tr>
                <th className={styles.checkboxCol}>
                  <input
                    type="checkbox"
                    checked={
                      incomes.length > 0 && selectedRows.length === incomes.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Sr. No.</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedIncomes.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan="7">No incomes found. Add your first income!</td>
                </tr>
              ) : (
                sortedIncomes.map((income, index) => (
                  <tr
                    key={income.id}
                    className={
                      selectedRows.includes(income.id) ? styles.selectedRow : ""
                    }
                  >
                    <td className={styles.checkboxCol}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(income.id)}
                        onChange={() => handleSelectRow(income.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>{new Date(income.incomeDate).toLocaleDateString()}</td>
                    <td>
                      <span className={styles.categoryBadge}>
                        {getCategoryName(income.categoryId)}
                      </span>
                    </td>
                    <td className={styles.amount}>
                      ₹{income.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className={styles.description}>
                      {income.description || "-"}
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(income)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(income.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomeManagement;
