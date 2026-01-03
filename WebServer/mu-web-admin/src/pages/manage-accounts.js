import Head from 'next/head';
import styles from '@/styles/Main.module.css';
import axios from 'axios';
import {useState, useEffect} from 'react';

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    memb___id: '',
    memb__pwd: '',
    bloc_code: 0
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/accounts');
      setAccounts(response.data);
      setError('');
    } catch (err) {
      setError('Error loading accounts: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await axios.post('/api/accounts', {
        memb___id: formData.memb___id,
        memb__pwd: formData.memb__pwd
      });
      setSuccess('Account created successfully!');
      setShowCreateForm(false);
      setFormData({memb___id: '', memb__pwd: '', bloc_code: 0});
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account');
    }
  };

  const handleDeleteAccount = async (memb_guid) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await axios.delete('/api/accounts', {data: {memb_guid}});
      setSuccess('Account deleted successfully!');
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting account');
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setFormData({
      memb___id: account.memb___id,
      memb__pwd: '',
      bloc_code: account.bloc_code
    });
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await axios.put('/api/accounts', {
        memb_guid: editingAccount.memb_guid,
        memb__pwd: formData.memb__pwd || undefined,
        bloc_code: formData.bloc_code
      });
      setSuccess('Account updated successfully!');
      setEditingAccount(null);
      setFormData({memb___id: '', memb__pwd: '', bloc_code: 0});
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating account');
    }
  };

  const handleInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  return (
    <>
      <Head>
        <title>Manage Accounts - MuOnlineJS Admin Panel</title>
        <meta name="description" content="Manage Accounts"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div className={styles.mainWrapper} style={{flexDirection: 'column', padding: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h1 style={{margin: 0}}>Manage Accounts</h1>
          <button className={styles.button} onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingAccount(null);
            setFormData({memb___id: '', memb__pwd: '', bloc_code: 0});
          }}>
            {showCreateForm ? 'Cancel' : 'Create New Account'}
          </button>
        </div>

        {error && (
          <div style={{padding: '10px', marginBottom: '20px', backgroundColor: '#ff4444', color: 'white', borderRadius: '5px'}}>
            {error}
          </div>
        )}

        {success && (
          <div style={{padding: '10px', marginBottom: '20px', backgroundColor: '#44ff44', color: 'black', borderRadius: '5px'}}>
            {success}
          </div>
        )}

        {(showCreateForm || editingAccount) && (
          <div className={styles.box} style={{marginBottom: '20px', padding: '20px'}}>
            <h2>{editingAccount ? 'Edit Account' : 'Create New Account'}</h2>
            <form onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}>
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="memb___id" style={{display: 'block', marginBottom: '5px'}}>Username (max 11 chars):</label>
                <input
                  id="memb___id"
                  type="text"
                  name="memb___id"
                  value={formData.memb___id}
                  onChange={handleInputChange}
                  maxLength={11}
                  required={!editingAccount}
                  disabled={!!editingAccount}
                  style={{width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
                />
              </div>
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="memb__pwd" style={{display: 'block', marginBottom: '5px'}}>
                  Password (max 11 chars){editingAccount ? ' (leave empty to keep current)' : ''}:
                </label>
                <input
                  id="memb__pwd"
                  type="password"
                  name="memb__pwd"
                  value={formData.memb__pwd}
                  onChange={handleInputChange}
                  maxLength={11}
                  required={!editingAccount}
                  style={{width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
                />
              </div>
              {editingAccount && (
                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                      type="checkbox"
                      name="bloc_code"
                      checked={formData.bloc_code === 1}
                      onChange={handleInputChange}
                    />
                    Banned
                  </label>
                </div>
              )}
              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" className={styles.button}>
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </button>
                {editingAccount && (
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => {
                      setEditingAccount(null);
                      setFormData({memb___id: '', memb__pwd: '', bloc_code: 0});
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className={styles.box} style={{padding: '20px'}}>
          <h2>Accounts List</h2>
          {loading ? (
            <div>Loading...</div>
          ) : accounts.length === 0 ? (
            <div>No accounts found.</div>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #ccc'}}>
                  <th style={{padding: '10px', textAlign: 'left'}}>ID</th>
                  <th style={{padding: '10px', textAlign: 'left'}}>Username</th>
                  <th style={{padding: '10px', textAlign: 'left'}}>Status</th>
                  <th style={{padding: '10px', textAlign: 'left'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.memb_guid} style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '10px'}}>{account.memb_guid}</td>
                    <td style={{padding: '10px'}}>{account.memb___id}</td>
                    <td style={{padding: '10px'}}>
                      <span style={{color: account.bloc_code === 1 ? '#ff4444' : '#44ff44'}}>
                        {account.bloc_code === 1 ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td style={{padding: '10px'}}>
                      <button
                        className={styles.button}
                        onClick={() => handleEditAccount(account)}
                        style={{marginRight: '10px', padding: '5px 15px'}}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.button} ${styles.red}`}
                        onClick={() => handleDeleteAccount(account.memb_guid)}
                        style={{padding: '5px 15px'}}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
