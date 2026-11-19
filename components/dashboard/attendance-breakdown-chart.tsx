'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS: Record<string, string> = {
  present: '#16a34a',
  absent: '#dc2626',
  late: '#ca8a04',
  excused: '#6b7280',
}

const LABELS: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
}

export function AttendanceBreakdownChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: LABELS[d.status] ?? d.status }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip formatter={(value) => [Number(value ?? 0), 'Days']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.status] ?? '#6b7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}