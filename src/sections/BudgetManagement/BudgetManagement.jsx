import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import styles from "./BudgetManagement.module.css";

const API = "http://localhost:8080/api";

const createEmptyDraft = () => ({
  itemName: "",
  expectedAmount: "",
  notes: "",
});

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const formatCurrency = (value) =>
  `INR ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function BudgetManagement() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = Number(user.id || localStorage.getItem("userId") || 0);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(createEmptyDraft());

  const fetchBudgets = useCallback(async () => {
    if (!userId) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API}/monthly-budgets/user/${userId}?month=${selectedMonth}`
      );

      if (!response.ok) {
        throw new Error("Failed to load budget items");
      }

      const data = await response.json();
      setBudgets(data);
      setError("");
    } catch (fetchError) {
      setError("Failed to load monthly budget items");
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, userId]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const resetEditor = () => {
    setEditingId(null);
    setDraft(createEmptyDraft());
  };

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const startCreate = () => {
    setEditingId("new");
    setDraft(createEmptyDraft());
    setError("");
  };

  const startEdit = (budget) => {
    setEditingId(budget.id);
    setDraft({
      itemName: budget.itemName || "",
      expectedAmount: budget.expectedAmount?.toString() || "",
      notes: budget.notes || "",
    });
    setError("");
  };

  const handleSave = async () => {
    if (!draft.itemName.trim()) {
      setError("Item name is required");
      return;
    }

    if (!draft.expectedAmount || Number.isNaN(Number(draft.expectedAmount))) {
      setError("Expected amount is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId,
        budgetMonth: `${selectedMonth}-01`,
        itemName: draft.itemName.trim(),
        expectedAmount: Number.parseFloat(draft.expectedAmount),
        notes: draft.notes.trim(),
      };

      const url =
        editingId === "new"
          ? `${API}/monthly-budgets`
          : `${API}/monthly-budgets/${editingId}`;
      const method = editingId === "new" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save budget item");
      }

      await fetchBudgets();
      resetEditor();
      setError("");
    } catch (saveError) {
      setError("Failed to save budget item");
      console.error(saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget item?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/monthly-budgets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete budget item");
      }

      setBudgets((current) => current.filter((budget) => budget.id !== id));
      if (editingId === id) {
        resetEditor();
      }
      setError("");
    } catch (deleteError) {
      setError("Failed to delete budget item");
      console.error(deleteError);
    }
  };

  const totalExpected = budgets.reduce(
    (sum, budget) => sum + Number(budget.expectedAmount || 0),
    0
  );
  const averageExpected =
    budgets.length > 0 ? totalExpected / budgets.length : 0;

  const renderEditableCells = (rowNumber) => (
    <>
      <td>{rowNumber}</td>
      <td>
        <input
          type="text"
          name="itemName"
          value={draft.itemName}
          onChange={handleDraftChange}
          placeholder="Enter budget item"
        />
      </td>
      <td>
        <input
          type="number"
          name="expectedAmount"
          value={draft.expectedAmount}
          onChange={handleDraftChange}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </td>
      <td>
        <input
          type="text"
          name="notes"
          value={draft.notes}
          onChange={handleDraftChange}
          placeholder="Optional note"
        />
      </td>
      <td className={styles.actionCell}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving" : "Save"}
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={resetEditor}
          disabled={saving}
        >
          Cancel
        </button>
      </td>
    </>
  );

  return (
    <MainLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Planning</p>
            <h1>Monthly Expected Budget</h1>
            <p className={styles.subtext}>
              Keep a simple list of planned monthly items and amounts, then
              review the total at the bottom like a spreadsheet.
            </p>
          </div>
          <div className={styles.headerActions}>
            <label className={styles.monthPicker}>
              <span>Month</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => {
                  setSelectedMonth(event.target.value);
                  resetEditor();
                }}
              />
            </label>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={startCreate}
              disabled={editingId === "new"}
            >
              Add Row
            </button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Total Expected</span>
            <strong>{formatCurrency(totalExpected)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Items</span>
            <strong>{budgets.length}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Average Item</span>
            <strong>{formatCurrency(averageExpected)}</strong>
          </div>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loading}>Loading monthly budget...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Item</th>
                  <th>Expected Amount</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {editingId === "new" && (
                  <tr className={styles.editingRow}>{renderEditableCells(1)}</tr>
                )}

                {budgets.length === 0 && editingId !== "new" ? (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>
                      No budget items for this month yet. Add your first row to
                      start planning.
                    </td>
                  </tr>
                ) : (
                  budgets.map((budget, index) =>
                    editingId === budget.id ? (
                      <tr key={budget.id} className={styles.editingRow}>
                        {renderEditableCells(
                          editingId === "new" ? index + 2 : index + 1
                        )}
                      </tr>
                    ) : (
                      <tr key={budget.id}>
                        <td>{editingId === "new" ? index + 2 : index + 1}</td>
                        <td>{budget.itemName}</td>
                        <td className={styles.amountCell}>
                          {formatCurrency(budget.expectedAmount)}
                        </td>
                        <td>{budget.notes || "-"}</td>
                        <td className={styles.actionCell}>
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => startEdit(budget)}
                            disabled={editingId !== null}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={() => handleDelete(budget.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Total</td>
                  <td className={styles.totalCell}>
                    {formatCurrency(totalExpected)}
                  </td>
                  <td>{budgets.length} items</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
