import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function StressChart({ data, height = 260 }) {
  const hasData = data.some((d) => d.value != null)

  if (!hasData) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-md bg-bloom-bg/60 text-sm text-bloom-muted">
        Log stress levels to unlock this chart.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="stressFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [value, 'Stress']}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #e8e6e1',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#7dd3fc"
            strokeWidth={3}
            fill="url(#stressFill)"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
