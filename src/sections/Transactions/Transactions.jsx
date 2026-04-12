import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import styles from './Transactions.module.css';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    payment_method_id: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterCategory]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category_id?.toString() === filterCategory);
    }

    setFilteredTransactions(filtered);
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
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        await axios.put(
          `http://localhost:8080/api/expenses/${editingId}`,
          formData,
          { headers }
        );
      } else {
        await axios.post('http://localhost:8080/api/expenses', formData, {
          headers,
        });
      }

      fetchTransactions();
      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction');
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      category_id: transaction.category_id,
      payment_method_id: transaction.payment_method_id,
      expense_date: transaction.expense_date,
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:8080/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category_id: '',
      payment_method_id: '',
      expense_date: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <MainLayout>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div>
            <h2>Transaction Management</h2>
            <p>Track and manage all your financial transactions</p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Transaction'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <span className={styles.label}>Total Transactions</span>
            <span className={styles.value}>{filteredTransactions.length}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Total Amount</span>
            <span className={styles.value}>${totalAmount.toFixed(2)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Average Transaction</span>
            <span className={styles.value}>
              ${filteredTransactions.length > 0 ? (totalAmount / filteredTransactions.length).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className={styles.formCard}>
            <h3>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Amount</label>
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
                  <label>Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
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
                  <label>Date</label>
                  <input
                    type="date"
                    name="expense_date"
                    value={formData.expense_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>
                  {editingId ? 'Update Transaction' : 'Add Transaction'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transactions Table */}
        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.loading}>Loading transactions...</div>
          ) : filteredTransactions.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.expense_date).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>
                      <span className={styles.badge}>
                        {categories.find((c) => c.id === transaction.category_id)?.name ||
                          'Unknown'}
                      </span>
                    </td>
                    <td className={styles.amount}>
                      ${transaction.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={styles.statusBadge}>Completed</span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(transaction)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(transaction.id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.empty}>
              <p>No transactions found. {showForm ? '' : 'Click "Add Transaction" to get started!'}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
