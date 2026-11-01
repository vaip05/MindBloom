import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const moodLabels = {
  5: 'Great',
  4: 'Good',
  3: 'Okay',
  2: 'Not great',
  1: 'Tough',
}

export default function MoodChart({ data, height = 260 }) {
  const hasData = data.some((d) => d.value != null)

  if (!hasData) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-md bg-bloom-bg/60 text-sm text-bloom-muted">
        Save a few moods to see your weekly trend.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f9b4bc" stopOpacity={0.45} />
              <stop offset="50%" stopColor="#fde68a" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(v) => moodLabels[v] || ''}
            width={72}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [moodLabels[value] || value, 'Mood']}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #e8e6e1',
              boxShadow: 'none',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#moodFill)"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#949cf0"
            strokeWidth={3}
            connectNulls
            dot={(props) => {
              const { cx, cy, payload } = props
              if (payload.value == null) return null
              return <circle cx={cx} cy={cy} r={6} fill={payload.color} stroke="#fff" strokeWidth={2} />
            }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
