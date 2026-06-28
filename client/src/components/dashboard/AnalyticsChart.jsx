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

const CustomTooltip = ({ active, payload, label, dark }) => {
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
              <span style={{ fontWeight: '700', color: entry.color }}>{formatCompactCurrency(entry.value)}</span>
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

  // Compute a trend value (avg of income + expense) to drive the green line overlay
  const enrichedData = data.map((d) => ({
    ...d,
    trend: Math.round((d.income + d.expense) / 2),
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: textMain, letterSpacing: '-0.3px' }}>
          Spending Analytics
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {[{ color: '#3b82f6', label: 'Income' }, { color: '#ef4444', label: 'Expense' }].map(({ color, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: textSub, fontWeight: '600' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
          {/* Menu icon */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: textSub, padding: '2px', borderRadius: '6px',
            display: 'flex', alignItems: 'center',
          }}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: textMain }}>No chart data yet</p>
            <p style={{ margin: 0, fontSize: '13px', color: textSub }}>Make transactions to see your analytics</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart
            data={enrichedData}
            margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
            barSize={16}
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: textSub }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: 11, fill: textSub }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip dark={dark} />}
              cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '8px' }}
            />
            {/* Blue bars — Income */}
            <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            {/* Red bars — Expense */}
            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            {/* Green trend line overlay */}
            <Line
              type="monotone"
              dataKey="trend"
              name="Trend"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#22c55e', stroke: '#22c55e', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#22c55e', stroke: dark ? '#1a2234' : '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
