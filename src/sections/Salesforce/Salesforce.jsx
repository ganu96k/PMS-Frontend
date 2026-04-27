import React, { useState } from 'react';
import styles from './SalesforceStyles.module.css';

const Salesforce = () => {
  const [operationType, setOperationType] = useState('insert');
  const [singleRecord, setSingleRecord] = useState({
    Month__c: '',
    Category__c: '',
    Amount__c: '',
    Spend_Date__c: '',
    Payment_Type__c: '',
    Sub_Category__c: ''
  });
  
  const [bulkRecords, setBulkRecords] = useState('');
  const [recordIds, setRecordIds] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8080/api/salesforce';

  // Handle single record field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSingleRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Insert single record
  const handleInsertSingle = async () => {
    if (!validateSingleRecord()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleRecord)
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to insert record');
      } else {
        setResponse({
          success: true,
          message: 'Record inserted successfully!',
          data: data.data
        });
        setSingleRecord({
          Month__c: '', Category__c: '', Amount__c: '', 
          Spend_Date__c: '', Payment_Type__c: '', Sub_Category__c: ''
        });
      }
    } catch (err) {
      setError(err.message || 'Error inserting record');
    } finally {
      setLoading(false);
    }
  };

  // Update single record
  const handleUpdateSingle = async () => {
    if (!singleRecord.Id || singleRecord.Id.trim() === '') {
      setError('Record ID is required for update');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleRecord)
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to update record');
      } else {
        setResponse({
          success: true,
          message: 'Record updated successfully!',
          data: data.data
        });
      }
    } catch (err) {
      setError(err.message || 'Error updating record');
    } finally {
      setLoading(false);
    }
  };

  // Bulk insert records
  const handleBulkInsert = async () => {
    try {
      const records = JSON.parse(bulkRecords);
      if (!Array.isArray(records)) {
        setError('Bulk data must be a JSON array');
        return;
      }

      setLoading(true);
      setError(null);
      setResponse(null);

      // Insert records one by one (Salesforce limitation)
      const results = [];
      for (const record of records) {
        const res = await fetch(`${API_BASE_URL}/insert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        
        const data = await res.json();
        results.push({ record, success: res.ok, response: data });
      }

      const successCount = results.filter(r => r.success).length;
      setResponse({
        success: true,
        message: `Inserted ${successCount}/${records.length} records`,
        data: results
      });
      setBulkRecords('');
    } catch (err) {
      setError(err.message || 'Error parsing bulk data');
    } finally {
      setLoading(false);
    }
  };

  // Bulk update records
  const handleBulkUpdate = async () => {
    try {
      const records = JSON.parse(bulkRecords);
      if (!Array.isArray(records)) {
        setError('Bulk data must be a JSON array');
        return;
      }

      setLoading(true);
      setError(null);
      setResponse(null);

      const res = await fetch(`${API_BASE_URL}/bulk-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records)
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to bulk update records');
      } else {
        setResponse({
          success: true,
          message: `Updated ${data.recordsUpdated || records.length} records`,
          data: data.data
        });
        setBulkRecords('');
      }
    } catch (err) {
      setError(err.message || 'Error parsing bulk data');
    } finally {
      setLoading(false);
    }
  };

  // Delete records
  const handleDelete = async () => {
    try {
      const ids = recordIds.split(',').map(id => id.trim()).filter(id => id);
      
      if (ids.length === 0) {
        setError('Please provide at least one record ID');
        return;
      }

      setLoading(true);
      setError(null);
      setResponse(null);

      const res = await fetch(`${API_BASE_URL}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids)
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to delete records');
      } else {
        setResponse({
          success: true,
          message: `Deleted ${data.recordsDeleted || ids.length} records`,
          data: data.data
        });
        setRecordIds('');
      }
    } catch (err) {
      setError(err.message || 'Error deleting records');
    } finally {
      setLoading(false);
    }
  };

  // Validate single record
  const validateSingleRecord = () => {
    const { Month__c, Category__c, Amount__c, Spend_Date__c } = singleRecord;
    
    if (!Month__c || !Category__c || !Amount__c || !Spend_Date__c) {
      setError('Please fill in all required fields (Month, Category, Amount, Date)');
      return false;
    }

    if (isNaN(Amount__c) || parseFloat(Amount__c) <= 0) {
      setError('Amount must be a valid positive number');
      return false;
    }

    return true;
  };

  return (
    <section className={styles.salesforceContainer}>
      <div className={styles.header}>
        <h2>Salesforce Integration</h2>
        <p>Manage Daily Spend Records in Salesforce</p>
      </div>

      <div className={styles.content}>
        {/* Operation Type Selector */}
        <div className={styles.operationSelector}>
          <label>Select Operation:</label>
          <select value={operationType} onChange={(e) => setOperationType(e.target.value)}>
            <option value="insert">Insert New Record</option>
            <option value="update">Update Record</option>
            <option value="bulkInsert">Bulk Insert</option>
            <option value="bulkUpdate">Bulk Update</option>
            <option value="delete">Delete Records</option>
          </select>
        </div>

        {/* Single Record Operations */}
        {(operationType === 'insert' || operationType === 'update') && (
          <div className={styles.formSection}>
            <h3>{operationType === 'insert' ? 'Insert New Record' : 'Update Record'}</h3>
            
            {operationType === 'update' && (
              <div className={styles.formGroup}>
                <label>Record ID (for update)</label>
                <input
                  type="text"
                  name="Id"
                  placeholder="e.g., a01XXXXXXXXXXXX"
                  value={singleRecord.Id || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Month *</label>
                <input
                  type="text"
                  name="Month__c"
                  placeholder="e.g., March"
                  value={singleRecord.Month__c}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category *</label>
                <input
                  type="text"
                  name="Category__c"
                  placeholder="e.g., Food"
                  value={singleRecord.Category__c}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Amount *</label>
                <input
                  type="number"
                  name="Amount__c"
                  placeholder="e.g., 500"
                  value={singleRecord.Amount__c}
                  onChange={handleInputChange}
                  className={styles.input}
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Spend Date *</label>
                <input
                  type="date"
                  name="Spend_Date__c"
                  value={singleRecord.Spend_Date__c}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Payment Type</label>
                <input
                  type="text"
                  name="Payment_Type__c"
                  placeholder="e.g., Paytm"
                  value={singleRecord.Payment_Type__c}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Sub Category</label>
                <input
                  type="text"
                  name="Sub_Category__c"
                  placeholder="e.g., Breakfast"
                  value={singleRecord.Sub_Category__c}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>

            <button
              onClick={operationType === 'insert' ? handleInsertSingle : handleUpdateSingle}
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Processing...' : (operationType === 'insert' ? 'Insert Record' : 'Update Record')}
            </button>
          </div>
        )}

        {/* Bulk Operations */}
        {(operationType === 'bulkInsert' || operationType === 'bulkUpdate') && (
          <div className={styles.formSection}>
            <h3>{operationType === 'bulkInsert' ? 'Bulk Insert Records' : 'Bulk Update Records'}</h3>
            <p className={styles.helpText}>
              {operationType === 'bulkInsert' 
                ? 'Enter a JSON array of records to insert'
                : 'Enter a JSON array of records with ID and fields to update'
              }
            </p>
            <div className={styles.formGroup}>
              <textarea
                value={bulkRecords}
                onChange={(e) => setBulkRecords(e.target.value)}
                placeholder={operationType === 'bulkInsert'
                  ? `[
  {"Month__c": "March", "Category__c": "Food", "Amount__c": 500},
  {"Month__c": "April", "Category__c": "Transport", "Amount__c": 200}
]`
                  : `[
  {"Id": "a01XXXXXXXXXXXX", "Amount__c": 500},
  {"Id": "a01YYYYYYYYYYYY", "Amount__c": 300}
]`
                }
                className={styles.textarea}
                rows={8}
              />
            </div>
            <button
              onClick={operationType === 'bulkInsert' ? handleBulkInsert : handleBulkUpdate}
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Processing...' : (operationType === 'bulkInsert' ? 'Insert Records' : 'Update Records')}
            </button>
          </div>
        )}

        {/* Delete Operation */}
        {operationType === 'delete' && (
          <div className={styles.formSection}>
            <h3>Delete Records</h3>
            <p className={styles.helpText}>Enter comma-separated record IDs to delete</p>
            <div className={styles.formGroup}>
              <textarea
                value={recordIds}
                onChange={(e) => setRecordIds(e.target.value)}
                placeholder="a01XXXXXXXXXXXX, a01YYYYYYYYYYYY, a01ZZZZZZZZZZZZZ"
                className={styles.textarea}
                rows={4}
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={loading}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              {loading ? 'Processing...' : 'Delete Records'}
            </button>
          </div>
        )}

        {/* Response Message */}
        {error && (
          <div className={styles.alert} style={{ backgroundColor: '#fee', color: '#c00' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {response && (
          <div className={styles.alert} style={{ backgroundColor: '#efe', color: '#060' }}>
            <strong>Success:</strong> {response.message}
            {response.data && (
              <pre className={styles.responseData}>{JSON.stringify(response.data, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Salesforce;
