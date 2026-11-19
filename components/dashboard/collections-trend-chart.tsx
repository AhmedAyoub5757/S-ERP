'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function CollectionsTrendChart({ data }: { data: { date: string; amount: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No payments recorded in this range.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip formatter={(value) => [`Rs. ${Number(value ?? 0).toLocaleString()}`, 'Collected']} />
        <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}