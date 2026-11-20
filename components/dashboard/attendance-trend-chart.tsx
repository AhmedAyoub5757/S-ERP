'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function AttendanceTrendChart({ data }: { data: { date: string; percentPresent: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No attendance data in this range.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis domain={[0, 100]} fontSize={12} unit="%" />
        <Tooltip
          formatter={(value) => [
            `${value ?? 0}%`,
            'Present',
          ]}
        />
        <Line type="monotone" dataKey="percentPresent" stroke="#4f705f" strokeWidth={2} dot={{ r: 3, fill: '#18372a', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#18372a' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}