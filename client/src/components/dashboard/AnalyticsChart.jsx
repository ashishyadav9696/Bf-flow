import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactCurrency } from '../../utils/formatCurrency.js';
import { useDarkMode } from '../../context/DarkModeContext.jsx';
import { MoreHorizontal } from 'lucide-react';

const MOCK_DATA = [
  { date: 'Jan', income: 25, expense: 5, trend: 15 },
  { date: 'Feb', income: 33, expense: 15, trend: 30 },
  { date: 'Mar', income: 38, expense: 16, trend: 22 },
  { date: 'Apr', income: 46, expense: 7, trend: 9 },
  { date: 'May', income: 50, expense: 13, trend: 41 },
  { date: 'Jun', income: 32, expense: 12, trend: 13 },
  { date: 'Dec', income: 45, expense: 14, trend: 37 }
];

const CustomTooltip = ({ active, payload, label, dark, isMock }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: dark ? '#1e293b' : '#fff',
        border: `1px solid ${dark ? '#334155' : '#f1f5f9'}`,
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        padding: '12px 16px',
        fontSize: '13px',
      }}>
        <p style={{ margin: '0 0 8px', fontWeight: '700', color: dark ? '#f1f5f9' : '#1e293b' }}>{label}</p>
        {payload.map((entry) =>
          entry.dataKey !== 'trend' ? (
            <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: entry.color }} />
              <span style={{ color: dark ? '#94a3b8' : '#64748b' }}>{entry.name}:</span>
              <span style={{ fontWeight: '700', color: entry.color }}>
                {isMock ? entry.value : formatCompactCurrency(entry.value)}
              </span>
            </div>
          ) : null
        )}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart({ data = [], loading }) {
  const { dark } = useDarkMode();
  const cardBg = dark ? '#1a2234' : '#ffffff';
  const cardBorder = dark ? '#263047' : '#f1f5f9';
  const textMain = dark ? '#f1f5f9' : '#1e293b';
  const textSub = dark ? '#64748b' : '#94a3b8';
  const gridColor = dark ? '#263047' : '#f1f5f9';

  const isMock = data.length === 0;
  
  // Enrich data with trend value
  const chartData = isMock 
    ? MOCK_DATA 
    : data.map((d) => ({
        ...d,
        trend: d.income > 0 ? d.income : d.expense,
      }));

  if (loading) {
    return (
      <div style={{ background: cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${cardBorder}` }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: '700', fontSize: '16px', color: textMain }}>Spending Analytics</h3>
        <div style={{ height: '240px', borderRadius: '14px', background: dark ? '#263047' : '#f8fafc', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      background: cardBg,
      borderRadius: '20px',
      padding: '24px',
      border: `1px solid ${cardBorder}`,
      boxShadow: dark ? '0 4px 32px rgba(0,0,0,0.35)' : '0 4px 24px rgba(0,0,0,0.06)',
      transition: 'background 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: textMain }}>
          Spending Analytics
        </h3>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: textSub, padding: '2px', borderRadius: '6px',
          display: 'flex', alignItems: 'center',
        }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Centered Legend below title */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: textSub, fontWeight: '600' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#3b82f6', display: 'inline-block' }} />
          Income
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: textSub, fontWeight: '600' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444', display: 'inline-block' }} />
          Expense
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 35, bottom: 0 }}
          barCategoryGap={chartData.length === 1 ? '60%' : '30%'}
          barGap={4}
        >
          <CartesianGrid stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: textSub }}
            axisLine={false}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            tickFormatter={(val) => isMock ? val : formatCompactCurrency(val)}
            tick={{ fontSize: 11, fill: textSub }}
            axisLine={false}
            tickLine={false}
            domain={[0, 'auto']}
            tickCount={6}
          />
          <Tooltip
            content={<CustomTooltip dark={dark} isMock={isMock} />}
            cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '8px' }}
          />
          {/* Blue bars — Income */}
          <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} minPointSize={4} />
          {/* Red bars — Expense */}
          <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} minPointSize={4} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
