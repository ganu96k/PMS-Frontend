import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import styles from './Loans.module.css';

function getInitialFormData() {
  return {
    loanName: '',
    principalAmount: '',
    outstandingAmount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'ACTIVE',
    notes: '',
  };
}

function mapLoanToFormData(loan) {
  return {
    loanName: loan.loanName || '',
    principalAmount: loan.principalAmount ?? '',
    outstandingAmount: loan.outstandingAmount ?? '',
    interestRate: loan.interestRate ?? '',
    startDate: loan.startDate ? new Date(loan.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: loan.dueDate ? new Date(loan.dueDate).toISOString().split('T')[0] : '',
    status: loan.status || 'ACTIVE',
    notes: loan.notes || '',
  };
}

function buildLoanPayload(formData) {
  return {
    loanName: formData.loanName,
    principalAmount: formData.principalAmount,
    outstandingAmount: formData.outstandingAmount === '' ? null : formData.outstandingAmount,
    interestRate: formData.interestRate,
    startDate: formData.startDate,
    dueDate: formData.dueDate,
    status: formData.status,
    notes: formData.notes,
  };
}

function getCalendarUrl(loan, emi = null) {
  const title = encodeURIComponent(
    emi ? `EMI Payment: ${loan.loanName} (#${emi.emiNumber})` : `Loan Due: ${loan.loanName}`
  );
  const details = encodeURIComponent(
    emi ? `EMI amount due for ${loan.loanName}` : `Final due date for ${loan.loanName}`
  );
  const dateSource = emi ? emi.dueDate : loan.dueDate;
  const date = String(dateSource || '').replace(/-/g, '').split('T')[0];
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${date}/${date}`;
}

function getWhatsAppUrl(loan, emi = null) {
  const amount = emi ? emi.totalAmount : loan.outstandingAmount;
  const message = encodeURIComponent(
    `FinFlow Loan Alert\n\nLoan: ${loan.loanName}\nType: ${emi ? 'EMI Payment' : 'Loan Overview'}\nAmount: ₹${parseFloat(amount || 0).toLocaleString(
      'en-IN'
    )}\nDue: ${emi ? emi.dueDate : loan.dueDate}\n\nSent via Portfolio PMS`
  );
  return `https://wa.me/?text=${message}`;
}

export default function Loans() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = Number(user.id || localStorage.getItem('userId') || 0);
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  const cacheKey = `cached_loans_${userId}`;

  const fetchLoans = useCallback(async () => {
    if (!userId) {
      setLoans([]);
      setLoading(false);
      setError('User session is incomplete. Please login again.');
      return;
    }

    try {
      const cachedLoans = sessionStorage.getItem(cacheKey);
      if (cachedLoans) {
        setLoans(JSON.parse(cachedLoans));
        setLoading(false);
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('SESSION_EXPIRED');
      }

      const response = await axios.get('http://localhost:8080/api/loans', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const freshData = Array.isArray(response.data) ? response.data : [];
      setLoans(freshData);
      sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loans:', error);
      const status = error?.response?.status;
      if (status === 401 || status === 403 || error?.message === 'SESSION_EXPIRED') {
        setError('Your session expired after the backend restart. Please login again to load loans.');
        sessionStorage.removeItem(cacheKey);
      } else {
        setError('Unable to load loan data right now.');
      }
      setLoading(false);
    }
  }, [cacheKey, userId]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => {
      const nextData = {
        ...previousData,
        [name]: value,
      };

      if (
        name === 'principalAmount' &&
        !editingId &&
        (previousData.outstandingAmount === '' || previousData.outstandingAmount === previousData.principalAmount)
      ) {
        nextData.outstandingAmount = value;
      }

      return nextData;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = buildLoanPayload(formData);

      if (editingId) {
        await axios.put(`http://localhost:8080/api/loans/${editingId}`, payload, { headers });
      } else {
        await axios.post('http://localhost:8080/api/loans', payload, { headers });
      }

      await fetchLoans();
      resetForm();
      setError('');
    } catch (error) {
      console.error('Error saving loan:', error);
      setError('Error saving loan');
    }
  };

  const handleEditLoan = (loan) => {
    setFormData(mapLoanToFormData(loan));
    setEditingId(loan.id);
    setShowForm(true);
  };

  const handleCloneLoan = (loan) => {
    setFormData({
      ...mapLoanToFormData(loan),
      loanName: `${loan.loanName} (Copy)`,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:8080/api/loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      sessionStorage.removeItem(cacheKey);
      await fetchLoans();
      setSelectedLoan(null);
      setError('');
    } catch (error) {
      console.error('Error deleting loan:', error);
      setError('Error deleting loan');
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        {!selectedLoan ? (
          <>
            <div className={styles.header}>
              <div>
                <h2>Loan Management</h2>
                <p>Track and manage all your loans and EMI payments</p>
              </div>
              <button
                className={styles.addBtn}
                onClick={() => {
                  if (!showForm) {
                    setFormData(getInitialFormData());
                    setEditingId(null);
                  }
                  setShowForm((currentValue) => !currentValue);
                }}
              >
                {showForm ? 'Cancel' : '+ Add Loan'}
              </button>
            </div>

            <div className={styles.summaryCards}>
              <div className={styles.card}>
                <span className={styles.label}>Total Loans</span>
                <span className={styles.value}>{loans.length}</span>
              </div>
              <div className={styles.card}>
                <span className={styles.label}>Active Loans</span>
                <span className={styles.value}>{loans.filter((loan) => loan.status === 'ACTIVE').length}</span>
              </div>
              <div className={styles.card}>
                <span className={styles.label}>Total Principal</span>
                <span className={styles.value}>
                  ₹
                  {loans
                    .reduce((sum, loan) => sum + parseFloat(loan.principalAmount || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className={styles.card}>
                <span className={styles.label}>Outstanding</span>
                <span className={styles.value}>
                  ₹
                  {loans
                    .reduce((sum, loan) => sum + parseFloat(loan.outstandingAmount || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <span>{error}</span>
                {(error.includes('login again') || error.includes('session')) && (
                  <button
                    type="button"
                    className={styles.errorAction}
                    onClick={() => navigate('/login')}
                  >
                    Go to Login
                  </button>
                )}
              </div>
            )}

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
                      <label>Outstanding Amount</label>
                      <input
                        type="number"
                        name="outstandingAmount"
                        value={formData.outstandingAmount}
                        onChange={handleInputChange}
                        placeholder="Defaults to principal amount"
                        step="0.01"
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
                      <select name="status" value={formData.status} onChange={handleInputChange}>
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
                      <th>Integration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td>
                          <div className={styles.inlineEditGroup} onClick={() => handleEditLoan(loan)} title="Edit Loan Name">
                            <span>{loan.loanName}</span>
                            <span className={styles.pencilIcon}>✎</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.inlineEditGroup} onClick={() => handleEditLoan(loan)} title="Edit Principal">
                            <span>₹{parseFloat(loan.principalAmount || 0).toFixed(2)}</span>
                            <span className={styles.pencilIcon}>✎</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.inlineEditGroup} onClick={() => handleEditLoan(loan)} title="Edit Outstanding">
                            <span>₹{parseFloat(loan.outstandingAmount || 0).toFixed(2)}</span>
                            <span className={styles.pencilIcon}>✎</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.inlineEditGroup} onClick={() => handleEditLoan(loan)} title="Edit Interest Rate">
                            <span>{loan.interestRate}%</span>
                            <span className={styles.pencilIcon}>✎</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.inlineEditGroup} onClick={() => handleEditLoan(loan)} title="Edit Status">
                            <span className={`${styles.badge} ${styles[loan.status.toLowerCase()]}`}>{loan.status}</span>
                            <span className={styles.pencilIcon}>✎</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.inlineEditGroup} onClick={() => handleEditLoan(loan)} title="Edit Due Date">
                            <span>{new Date(loan.dueDate).toLocaleDateString()}</span>
                            <span className={styles.pencilIcon}>✎</span>
                          </div>
                        </td>
                        <td style={{ display: 'flex', gap: '8px' }}>
                          <a href={getCalendarUrl(loan)} target="_blank" rel="noreferrer" className={styles.iconAction} title="Add to Calendar">
                            📅
                          </a>
                          <a href={getWhatsAppUrl(loan)} target="_blank" rel="noreferrer" className={styles.iconAction} title="Share on WhatsApp">
                            💬
                          </a>
                        </td>
                        <td style={{ display: 'flex', gap: '8px' }}>
                          <button className={styles.actionIconBtn} onClick={() => setSelectedLoan(loan)} title="View Details">
                            👁️
                          </button>
                          <button className={styles.actionIconBtn} onClick={() => handleCloneLoan(loan)} title="Clone Loan">
                            📋
                          </button>
                          <button
                            className={styles.actionIconBtn}
                            style={{ color: '#dc2626' }}
                            onClick={() => handleDelete(loan.id)}
                            title="Delete Loan"
                          >
                            🗑️
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
          <LoanDetail loan={selectedLoan} onBack={() => setSelectedLoan(null)} onDelete={() => handleDelete(selectedLoan.id)} />
        )}
      </div>
    </MainLayout>
  );
}

function LoanDetail({ loan, onBack, onDelete }) {
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmi, setEditingEmi] = useState(null);

  const fetchEmis = useCallback(async () => {
    try {
      const cacheKey = `cached_emis_${loan.id}`;
      const cachedEmis = sessionStorage.getItem(cacheKey);
      if (cachedEmis) {
        setEmis(JSON.parse(cachedEmis));
        setLoading(false);
      }

      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:8080/api/loans/${loan.id}/emis`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const freshEmis = response.data || [];
      setEmis(freshEmis);
      sessionStorage.setItem(cacheKey, JSON.stringify(freshEmis));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching EMIs:', error);
      setLoading(false);
    }
  }, [loan.id]);

  useEffect(() => {
    fetchEmis();
  }, [fetchEmis]);

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

  const submitEmiEdit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`http://localhost:8080/api/loans/${loan.id}/emis/${editingEmi.id}`, editingEmi, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditingEmi(null);
      await fetchEmis();
    } catch (error) {
      console.error('Error updating EMI:', error);
      alert('Error updating EMI');
    }
  };

  const paidEmiPrincipal = emis
    .filter((emi) => emi.status === 'PAID')
    .reduce((sum, emi) => sum + parseFloat(emi.principalAmount || 0), 0);
  const computedOutstanding = parseFloat(loan.principalAmount || 0) - paidEmiPrincipal;
  const paidCount = emis.filter((emi) => emi.status === 'PAID').length;

  return (
    <div className={styles.detailContainer}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Back to Loans
      </button>

      <div className={styles.detailLayout}>
        <div className={styles.detailLeft}>
          <div className={styles.detailCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '24px', margin: '0 0 16px', color: '#1e293b' }}>{loan.loanName}</h2>
              <span className={`${styles.badge} ${styles[loan.status.toLowerCase()]}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
                {loan.status}
              </span>
            </div>

            <div className={styles.mathCards}>
              <div className={styles.mathCard3D}>
                <p>Paid Progress</p>
                <h3>
                  {paidCount}{' '}
                  <span style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>out of {emis.length}</span>
                </h3>
                <div style={{ background: '#e2e8f0', height: 6, borderRadius: 3, marginTop: 10 }}>
                  <div
                    style={{
                      background: '#2563eb',
                      height: 6,
                      borderRadius: 3,
                      width: `${emis.length ? (paidCount / emis.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.mathCard3D}>
                <p>Outstanding Amount</p>
                <h3 style={{ color: '#dc2626' }}>₹{Math.max(0, computedOutstanding).toFixed(2)}</h3>
                <small style={{ color: '#64748b' }}>Original: ₹{parseFloat(loan.principalAmount || 0).toFixed(2)}</small>
              </div>
            </div>

            <div className={styles.detailGrid}>
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
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {emis.map((emi) => (
                    <tr
                      key={emi.id}
                      onClick={() =>
                        setEditingEmi({
                          ...emi,
                          dueDate: new Date(emi.dueDate).toISOString().split('T')[0],
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{emi.emiNumber}</td>
                      <td>
                        <div className={styles.inlineEditGroup} title="Edit Due Date">
                          <span>{new Date(emi.dueDate).toLocaleDateString()}</span>
                          <span className={styles.pencilIcon}>✎</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.inlineEditGroup} title="Edit Principal">
                          <span>₹{parseFloat(emi.principalAmount || 0).toFixed(2)}</span>
                          <span className={styles.pencilIcon}>✎</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.inlineEditGroup} title="Edit Interest">
                          <span>₹{parseFloat(emi.interestAmount || 0).toFixed(2)}</span>
                          <span className={styles.pencilIcon}>✎</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.inlineEditGroup} title="Edit Total">
                          <span>₹{parseFloat(emi.totalAmount || 0).toFixed(2)}</span>
                          <span className={styles.pencilIcon}>✎</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.inlineEditGroup} title="Edit Status">
                          <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(emi.status) }}>
                            {emi.status}
                          </span>
                          <span className={styles.pencilIcon}>✎</span>
                        </div>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={getCalendarUrl(loan, emi)}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconAction}
                          title="Add to Calendar"
                          onClick={(event) => event.stopPropagation()}
                        >
                          📅
                        </a>
                        <a
                          href={getWhatsAppUrl(loan, emi)}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconAction}
                          title="Share on WhatsApp"
                          onClick={(event) => event.stopPropagation()}
                        >
                          💬
                        </a>
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
                <input
                  type="date"
                  value={editingEmi.dueDate}
                  onChange={(event) => setEditingEmi({ ...editingEmi, dueDate: event.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Principal</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingEmi.principalAmount}
                  onChange={(event) => setEditingEmi({ ...editingEmi, principalAmount: event.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Interest</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingEmi.interestAmount}
                  onChange={(event) => setEditingEmi({ ...editingEmi, interestAmount: event.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingEmi.totalAmount}
                  onChange={(event) => setEditingEmi({ ...editingEmi, totalAmount: event.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={editingEmi.status}
                  onChange={(event) => setEditingEmi({ ...editingEmi, status: event.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className={styles.deleteBtn} onClick={() => setEditingEmi(null)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Save EMI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
