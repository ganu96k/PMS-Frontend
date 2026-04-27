import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import styles from './Loans.module.css';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    loanName: '',
    principalAmount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'ACTIVE',
    notes: '',
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/loans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoans(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loans:', error);
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
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingId) {
        await axios.put(`http://localhost:8080/api/loans/${editingId}`, formData, { headers });
      } else {
        await axios.post('http://localhost:8080/api/loans', formData, { headers });
      }
      
      fetchLoans();
      resetForm();
    } catch (error) {
      console.error('Error saving loan:', error);
      alert('Error saving loan');
    }
  };

  const resetForm = () => {
    setFormData({
      loanName: '',
      principalAmount: '',
      interestRate: '',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'ACTIVE',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditLoan = (loan) => {
    setFormData({
      ...loan,
      startDate: new Date(loan.startDate).toISOString().split('T')[0],
      dueDate: new Date(loan.dueDate).toISOString().split('T')[0],
    });
    setEditingId(loan.id);
    setShowForm(true);
  };

  const handleCloneLoan = (loan) => {
    setFormData({
      ...loan,
      loanName: loan.loanName + ' (Copy)',
      startDate: new Date(loan.startDate).toISOString().split('T')[0],
      dueDate: new Date(loan.dueDate).toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:8080/api/loans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchLoans();
        setSelectedLoan(null);
      } catch (error) {
        console.error('Error deleting loan:', error);
        alert('Error deleting loan');
      }
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        {!selectedLoan ? (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div>
                <h2>Loan Management</h2>
                <p>Track and manage all your loans and EMI payments</p>
              </div>
              <button className={styles.addBtn} onClick={() => { resetForm(); setShowForm(!showForm); }}>
                {showForm ? '✕ Cancel' : '+ Add Loan'}
              </button>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryCards}>
              <div className={styles.card}>
                <span className={styles.label}>Total Loans</span>
                <span className={styles.value}>{loans.length}</span>
              </div>
              <div className={styles.card}>
                <span className={styles.label}>Active Loans</span>
                <span className={styles.value}>
                  {loans.filter((l) => l.status === 'ACTIVE').length}
                </span>
              </div>
              <div className={styles.card}>
                <span className={styles.label}>Total Principal</span>
                <span className={styles.value}>
                  ₹{loans
                    .reduce((sum, l) => sum + parseFloat(l.principalAmount || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className={styles.card}>
                <span className={styles.label}>Outstanding</span>
                <span className={styles.value}>
                  ₹{loans
                    .reduce((sum, l) => sum + parseFloat(l.outstandingAmount || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add Form */}
            {showForm && (
              <div className={styles.formCard}>
                <h3>{editingId ? 'Edit Loan' : 'Add New Loan'}</h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Loan Name</label>
                      <input
                        type="text"
                        name="loanName"
                        value={formData.loanName}
                        onChange={handleInputChange}
                        placeholder="e.g., Home Loan"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Principal Amount</label>
                      <input
                        type="number"
                        name="principalAmount"
                        value={formData.principalAmount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Interest Rate (%)</label>
                      <input
                        type="number"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleInputChange}
                        placeholder="e.g., 8.5"
                        step="0.1"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Due Date</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="PAID_OFF">Paid Off</option>
                        <option value="DEFAULTED">Defaulted</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Additional notes"
                      rows="3"
                    />
                  </div>
                  <button type="submit" className={styles.submitBtn}>
                    {editingId ? 'Update Loan' : 'Add Loan'}
                  </button>
                </form>
              </div>
            )}

            {/* Loans Table */}
            <div className={styles.tableCard}>
              {loading ? (
                <div className={styles.loading}>Loading loans...</div>
              ) : loans.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Loan Name</th>
                      <th>Principal</th>
                      <th>Outstanding</th>
                      <th>Interest Rate</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td>{loan.loanName}</td>
                        <td>₹{parseFloat(loan.principalAmount).toFixed(2)}</td>
                        <td>₹{parseFloat(loan.outstandingAmount).toFixed(2)}</td>
                        <td>{loan.interestRate}%</td>
                        <td>
                          <span
                            className={`${styles.badge} ${styles[loan.status.toLowerCase()]}`}
                          >
                            {loan.status}
                          </span>
                        </td>
                        <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                        <td>
                          <button
                            className={styles.viewBtn}
                            onClick={() => setSelectedLoan(loan)}
                          >
                            View Details
                          </button>
                          <button
                            className={styles.viewBtn} style={{ marginLeft: 6, background: '#f59e0b' }}
                            onClick={() => handleEditLoan(loan)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.viewBtn} style={{ marginLeft: 6, background: '#3b82f6' }}
                            onClick={() => handleCloneLoan(loan)}
                          >
                            Clone
                          </button>
                          <button
                            className={styles.deleteBtn} style={{ marginLeft: 6 }}
                            onClick={() => handleDelete(loan.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.empty}>No loans found. Create one to get started!</div>
              )}
            </div>
          </>
        ) : (
          <LoanDetail
            loan={selectedLoan}
            onBack={() => setSelectedLoan(null)}
            onDelete={() => {
              handleDelete(selectedLoan.id);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}

// Loan Detail Component
function LoanDetail({ loan, onBack, onDelete }) {
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmi, setEditingEmi] = useState(null);

  useEffect(() => {
    fetchEMIs();
  }, []);

  const fetchEMIs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:8080/api/loans/${loan.id}/emis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmis(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching EMIs:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return '#27ae60';
      case 'PENDING':
        return '#f39c12';
      case 'OVERDUE':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const submitEmiEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:8080/api/loans/${loan.id}/emis/${editingEmi.id}`,
        editingEmi,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingEmi(null);
      fetchEMIs();
    } catch (err) {
      alert('Error updating EMI');
    }
  };

  return (
    <div className={styles.detailContainer}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Back to Loans
      </button>

      <div className={styles.detailLayout}>
        {/* Left: Loan Details */}
        <div className={styles.detailLeft}>
          <div className={styles.detailCard}>
            <h2>{loan.loanName}</h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Principal Amount</span>
                <span className={styles.detailValue}>₹{parseFloat(loan.principalAmount).toFixed(2)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Outstanding Amount</span>
                <span className={styles.detailValue}>₹{parseFloat(loan.outstandingAmount).toFixed(2)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Interest Rate</span>
                <span className={styles.detailValue}>{loan.interestRate}%</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Start Date</span>
                <span className={styles.detailValue}>{new Date(loan.startDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Due Date</span>
                <span className={styles.detailValue}>{new Date(loan.dueDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <span
                  className={`${styles.badge} ${styles[loan.status.toLowerCase()]}`}
                >
                  {loan.status}
                </span>
              </div>
            </div>
            {loan.notes && (
              <div className={styles.notesSection}>
                <span className={styles.notesLabel}>Notes</span>
                <p>{loan.notes}</p>
              </div>
            )}
            <button className={styles.deleteLoanBtn} onClick={onDelete}>
              Delete Loan
            </button>
          </div>
        </div>

        {/* Right: EMI Table */}
        <div className={styles.detailRight}>
          <div className={styles.emiCard}>
            <h3>EMI Schedule ({emis.length} total)</h3>
            {loading ? (
              <div className={styles.loading}>Loading EMIs...</div>
            ) : emis.length > 0 ? (
              <table className={styles.emiTable}>
                <thead>
                  <tr>
                    <th>EMI #</th>
                    <th>Due Date</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emis.map((emi) => (
                    <tr key={emi.id} onClick={() => setEditingEmi({ ...emi, dueDate: new Date(emi.dueDate).toISOString().split('T')[0] })} style={{ cursor: 'pointer' }}>
                      <td>{emi.emiNumber}</td>
                      <td>{new Date(emi.dueDate).toLocaleDateString()}</td>
                      <td>₹{parseFloat(emi.principalAmount).toFixed(2)}</td>
                      <td>₹{parseFloat(emi.interestAmount).toFixed(2)}</td>
                      <td>₹{parseFloat(emi.totalAmount).toFixed(2)}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(emi.status) }}
                        >
                          {emi.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.empty}>No EMIs found for this loan</div>
            )}
          </div>
        </div>
      </div>

      {editingEmi && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit EMI #{editingEmi.emiNumber}</h3>
            <form onSubmit={submitEmiEdit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Due Date</label>
                <input type="date" value={editingEmi.dueDate} onChange={(e) => setEditingEmi({...editingEmi, dueDate: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Principal</label>
                <input type="number" step="0.01" value={editingEmi.principalAmount} onChange={(e) => setEditingEmi({...editingEmi, principalAmount: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Interest</label>
                <input type="number" step="0.01" value={editingEmi.interestAmount} onChange={(e) => setEditingEmi({...editingEmi, interestAmount: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Total Amount</label>
                <input type="number" step="0.01" value={editingEmi.totalAmount} onChange={(e) => setEditingEmi({...editingEmi, totalAmount: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select value={editingEmi.status} onChange={(e) => setEditingEmi({...editingEmi, status: e.target.value})}>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className={styles.deleteBtn} onClick={() => setEditingEmi(null)}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Save EMI</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
