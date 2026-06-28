import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { formatCurrency, formatDateTime } from '../utils/formatCurrency.js';
import { Users, ArrowRightLeft, TrendingUp, AlertTriangle, ShieldOff, ShieldCheck, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Users', 'Transactions', 'Fraud Alerts'];

export default function AdminPanel() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [userPagination, setUserPagination] = useState({});
  const [txPagination, setTxPagination] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/dashboard'); return; }
    fetchStats();
  }, [user, navigate]);

  useEffect(() => { if (activeTab === 1) fetchUsers(); }, [activeTab, userPage, search]);
  useEffect(() => { if (activeTab === 2) fetchTransactions(); }, [activeTab, txPage]);
  useEffect(() => { if (activeTab === 3) fetchFraudAlerts(); }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch stats');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page: userPage, limit: 10, search } });
      setUsers(res.data.data.users);
      setUserPagination(res.data.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/transactions', { params: { page: txPage, limit: 10 } });
      setTransactions(res.data.data.transactions);
      setTxPagination(res.data.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFraudAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/fraud-alerts');
      setFraudAlerts(res.data.data.transactions);
    } catch (err) {
      toast.error('Failed to fetch fraud alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId, isSuspended) => {
    try {
      await api.patch(`/admin/users/${userId}/suspend`);
      toast.success(`User ${isSuspended ? 'unsuspended' : 'suspended'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Transactions', value: stats.stats.totalTransactions, icon: ArrowRightLeft, color: 'bg-green-50 text-green-600' },
    { label: 'Total Volume', value: formatCurrency(stats.stats.totalVolume), icon: TrendingUp, color: 'bg-purple-50 text-purple-600', isCurrency: true },
    { label: 'Fraud Alerts', value: stats.stats.fraudAlerts, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ] : [];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <AlertTriangle size={24} className="text-yellow-500" /> Admin Panel
        </h1>
        <p className="page-subtitle">Manage users, transactions, and fraud alerts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {TABS.map((tab, i) => (
          <button
            key={i}
            id={`admin-tab-${tab.toLowerCase().replace(' ', '-')}`}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === i ? 'bg-white dark:bg-slate-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
          >
            {tab}
            {tab === 'Fraud Alerts' && stats?.stats.fraudAlerts > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {stats.stats.fraudAlerts}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 0: Overview */}
      {activeTab === 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => {
              const colorMap = {
                'bg-blue-50 text-blue-600': 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
                'bg-green-50 text-green-600': 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400',
                'bg-purple-50 text-purple-600': 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
                'bg-red-50 text-red-600': 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
              };
              const parsedColor = colorMap[color] || color;
              return (
                <div key={label} className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${parsedColor}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 1: Users */}
      {activeTab === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <input
              id="admin-search-users"
              type="text"
              placeholder="Search by name, email, or account..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setUserPage(1); }}
              className="input-field max-w-sm"
            />
            <button onClick={fetchUsers} className="btn-secondary px-3 py-2.5">
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="card p-0">
            <div className="table-container rounded-2xl">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Account No.</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-slate-200">{u.name}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{u.email}</p>
                        </div>
                      </td>
                      <td><span className="font-mono text-xs text-gray-800 dark:text-slate-200">{u.accountNumber}</span></td>
                      <td><span className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(u.balance)}</span></td>
                      <td>
                        <span className={`badge ${u.isSuspended ? 'badge-danger' : 'badge-success'}`}>
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td>
                        {!u.isAdmin && (
                          <button
                            id={`suspend-user-${u._id}`}
                            onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                              ${u.isSuspended
                                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                              }`}
                          >
                            {u.isSuspended ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                            {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userPagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 dark:border-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Page {userPagination.currentPage} of {userPagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button disabled={userPage <= 1} onClick={() => setUserPage((p) => p - 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft size={15} />
                  </button>
                  <button disabled={userPage >= userPagination.totalPages} onClick={() => setUserPage((p) => p + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Transactions */}
      {activeTab === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-0">
            <div className="table-container rounded-2xl">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td><span className="text-sm text-gray-800 dark:text-slate-200">{tx.sender?.name || '─'}</span></td>
                      <td><span className="text-sm text-gray-800 dark:text-slate-200">{tx.receiver?.name || '─'}</span></td>
                      <td><span className="badge badge-info">{tx.type}</span></td>
                      <td><span className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(tx.amount)}</span></td>
                      <td>
                        <span className={`badge ${tx.status === 'flagged' ? 'badge-warning' : tx.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                          {tx.isFraudulent && <AlertTriangle size={10} />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500 dark:text-slate-400">{formatDateTime(tx.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {txPagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 dark:border-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">Page {txPagination.currentPage} of {txPagination.totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={txPage <= 1} onClick={() => setTxPage((p) => p - 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft size={15} />
                  </button>
                  <button disabled={txPage >= txPagination.totalPages} onClick={() => setTxPage((p) => p + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Fraud Alerts */}
      {activeTab === 3 && (
        <div className="space-y-4 animate-fade-in">
          {loading ? (
            <div className="card animate-pulse h-32"></div>
          ) : fraudAlerts.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-green-500 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-slate-200">No Fraud Alerts</h3>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">All transactions look clean!</p>
            </div>
          ) : fraudAlerts.map((tx) => (
            <div key={tx._id} className="card border border-yellow-200 dark:border-yellow-900/30 bg-yellow-50/30 dark:bg-yellow-950/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{tx.type.toUpperCase()}</span>
                    <span className="badge badge-warning">Fraudulent</span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">{tx.fraudReason}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-slate-400">
                    <div><span className="text-gray-400 dark:text-slate-500">Amount: </span><span className="font-bold">{formatCurrency(tx.amount)}</span></div>
                    <div><span className="text-gray-400 dark:text-slate-500">From: </span><span>{tx.sender?.name || '─'}</span></div>
                    <div><span className="text-gray-400 dark:text-slate-500">To: </span><span>{tx.receiver?.name || '─'}</span></div>
                    <div><span className="text-gray-400 dark:text-slate-500">Time: </span><span>{formatDateTime(tx.timestamp)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
