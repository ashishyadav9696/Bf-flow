import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../redux/slices/transactionSlice.js';
import { formatCurrency, formatDateTime } from '../utils/formatCurrency.js';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, AlertTriangle, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const TYPE_OPTIONS = ['all', 'deposit', 'withdrawal', 'transfer'];
const STATUS_OPTIONS = ['all', 'completed', 'pending', 'flagged', 'failed'];

const TypeBadge = ({ type }) => {
  const config = {
    deposit: 'badge-success',
    withdrawal: 'badge-danger',
    transfer: 'badge-info',
  };
  const icons = {
    deposit: <ArrowDownLeft size={11} />,
    withdrawal: <ArrowUpRight size={11} />,
    transfer: <ArrowRightLeft size={11} />,
  };
  return (
    <span className={`badge ${config[type] || 'badge-gray'}`}>
      {icons[type]}{type}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    completed: 'badge-success',
    pending: 'badge-warning',
    flagged: 'badge-warning',
    failed: 'badge-danger',
  };
  return <span className={`badge ${config[status] || 'badge-gray'}`}>{status}</span>;
};

export default function TransactionHistory() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { transactions, pagination, loading } = useSelector((state) => state.transaction);

  const [filters, setFilters] = useState({ type: 'all', status: 'all', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (filters.type !== 'all') params.type = filters.type;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    dispatch(fetchTransactions(params));
  }, [dispatch, page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Amount (₹)', 'Status', 'Counterparty', 'Description'];
    const rows = transactions.map((tx) => {
      const isCredit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver?._id === user?._id);
      const counterparty = tx.type === 'deposit' ? 'BankFlow System' : isCredit ? tx.sender?.name || '' : tx.receiver?.name || '';
      return [
        formatDateTime(tx.timestamp),
        tx.type,
        `${isCredit ? '+' : '-'}${tx.amount}`,
        tx.status,
        counterparty,
        tx.description || '',
      ];
    });

    const csvContent = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Transaction History</h1>
          <p className="page-subtitle">{pagination.totalItems} total transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            id="toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Filter size={14} /> Filters
          </button>
          <button
            id="export-csv-btn"
            onClick={exportCSV}
            disabled={transactions.length === 0}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card animate-slide-up">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="input-label">Type</label>
              <select id="filter-type" className="input-field" value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select id="filter-status" className="input-field" value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">From Date</label>
              <input id="filter-start" type="date" className="input-field" value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)} />
            </div>
            <div>
              <label className="input-label">To Date</label>
              <input id="filter-end" type="date" className="input-field" value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)} />
            </div>
          </div>
          <button
            onClick={() => { setFilters({ type: 'all', status: 'all', startDate: '', endDate: '' }); setPage(1); }}
            className="mt-3 text-sm text-gray-500 dark:text-slate-400 hover:text-danger transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft size={24} className="text-gray-300 dark:text-slate-600" />
            </div>
            <h3 className="font-semibold text-gray-700 dark:text-slate-200 mb-1">No transactions found</h3>
            <p className="text-sm text-gray-400 dark:text-slate-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="table-container rounded-2xl">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isCredit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver?._id === user?._id);
                    const counterparty = tx.type === 'deposit'
                      ? 'BankFlow System'
                      : tx.type === 'withdrawal'
                      ? 'ATM Withdrawal'
                      : isCredit ? tx.sender?.name || 'Unknown' : tx.receiver?.name || 'Unknown';

                    const icons = {
                      deposit: <ArrowDownLeft size={16} className="text-green-500" />,
                      withdrawal: <ArrowUpRight size={16} className="text-red-500" />,
                      transfer: <ArrowRightLeft size={16} className="text-blue-500" />,
                    };                    return (
                      <tr key={tx._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                              ${tx.type === 'deposit' ? 'bg-green-50 dark:bg-green-950/20' : tx.type === 'withdrawal' ? 'bg-red-50 dark:bg-red-950/20' : 'bg-blue-50 dark:bg-blue-950/20'}`}>
                              {icons[tx.type]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-slate-200 text-sm">{counterparty}</p>
                              {tx.description && <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[150px]">{tx.description}</p>}
                              {tx.isFraudulent && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <AlertTriangle size={11} className="text-yellow-500" />
                                  <span className="text-[10px] text-yellow-600 font-medium">Flagged</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td><TypeBadge type={tx.type} /></td>
                        <td>
                          <span className={`font-bold text-sm ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td><StatusBadge status={tx.status} /></td>
                        <td className="text-gray-500 dark:text-slate-400 text-xs">{formatDateTime(tx.timestamp)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 dark:border-slate-800/80">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} records)
              </p>
              <div className="flex gap-2">
                <button
                  id="prev-page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center
                    disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  id="next-page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center
                    disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
