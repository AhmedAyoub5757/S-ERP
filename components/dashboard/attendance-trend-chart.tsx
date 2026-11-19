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
        <Tooltip formatter={(value: number) => [`${value}%`, 'Present']} />
        <Line type="monotone" dataKey="percentPresent" stroke="#2563eb" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}