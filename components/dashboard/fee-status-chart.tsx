'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS: Record<string, string> = {
  paid: '#16a34a',
  partially_paid: '#ca8a04',
  unpaid: '#6b7280',
  overdue: '#dc2626',
}

const LABELS: Record<string, string> = {
  paid: 'Paid',
  partially_paid: 'Partial',
  unpaid: 'Unpaid',
  overdue: 'Overdue',
}

export function FeeStatusChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: LABELS[d.status] ?? d.status }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.status] ?? '#6b7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}