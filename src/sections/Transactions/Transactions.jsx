import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import styles from './Transactions.module.css';

function getInitialFormData() {
  return {
    description: '',
    amount: '',
    categoryId: '',
    paymentMethodId: '',
    expenseDate: new Date().toISOString().split('T')[0],
  };
}

export default function Transactions() {
  const userId = Number(localStorage.getItem('userId') || 0);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState(getInitialFormData());

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8080/api/expenses/user/${userId}`);
      setTransactions(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  }, [userId]);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [categoriesResponse, paymentMethodsResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/categories/active'),
        axios.get('http://localhost:8080/api/payment-methods/active'),
      ]);

      setCategories(categoriesResponse.data || []);
      setPaymentMethods(paymentMethodsResponse.data || []);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  }, []);

  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((transaction) => transaction.categoryId?.toString() === filterCategory);
    }

    setFilteredTransactions(filtered);
  }, [filterCategory, searchTerm, transactions]);

  useEffect(() => {
    fetchTransactions();
    fetchReferenceData();
  }, [fetchReferenceData, fetchTransactions]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      userId,
      description: formData.description,
      amount: parseFloat(formData.amount),
      categoryId: Number(formData.categoryId),
      paymentMethodId: Number(formData.paymentMethodId),
      expenseDate: formData.expenseDate,
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/expenses/update/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:8080/api/expenses/create', payload);
      }

      await fetchTransactions();
      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction');
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      description: transaction.description || '',
      amount: transaction.amount ?? '',
      categoryId: transaction.categoryId ?? '',
      paymentMethodId: transaction.paymentMethodId ?? '',
      expenseDate: transaction.expenseDate ? new Date(transaction.expenseDate).toISOString().split('T')[0] : getInitialFormData().expenseDate,
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/expenses/delete/${id}`);
      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    }
  };

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const getWeeklyTotal = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return filteredTransactions
      .filter((transaction) => new Date(transaction.expenseDate) >= sevenDaysAgo)
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  };

  const getMonthlyTotal = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return filteredTransactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.expenseDate);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  };

  const weeklyTotal = getWeeklyTotal();
  const monthlyTotal = getMonthlyTotal();

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2>Transaction Management</h2>
            <p>Track and manage all your expense transactions</p>
          </div>
          <button className={styles.addBtn} onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        </div>

        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <span className={styles.label}>Total Transactions</span>
            <span className={styles.value}>{filteredTransactions.length}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Total Amount</span>
            <span className={styles.value}>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Weekly Total</span>
            <span className={styles.value}>₹{weeklyTotal.toFixed(2)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Monthly Total</span>
            <span className={styles.value}>₹{monthlyTotal.toFixed(2)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Average Transaction</span>
            <span className={styles.value}>
              ₹{filteredTransactions.length > 0 ? (totalAmount / filteredTransactions.length).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

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
                  <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Payment Method</label>
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
                  <label>Date</label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
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

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.searchInput}
          />

          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

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
                  <th>Payment Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.expenseDate).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>
                      <span className={styles.badge}>
                        {transaction.categoryName ||
                          categories.find((category) => category.id === transaction.categoryId)?.name ||
                          'Unknown'}
                      </span>
                    </td>
                    <td>
                      {transaction.paymentMethodName ||
                        paymentMethods.find((method) => method.id === transaction.paymentMethodId)?.name ||
                        'Unknown'}
                    </td>
                    <td className={styles.amount}>
                      ₹{Number(transaction.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={styles.statusBadge}>Completed</span>
                    </td>
                    <td className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => handleEdit(transaction)}>
                        Edit
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(transaction.id)}>
                        Delete
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
