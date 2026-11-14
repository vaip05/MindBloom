import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function toDayLabel(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

export function buildWeeklyStressData(entries = []) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  return days.map((day) => {
    const key = day.toDateString()
    const dayEntries = entries.filter((entry) => {
      const created = entry.createdAt?.toDate?.() || new Date(entry.createdAt || entry.localDate)
      return created.toDateString() === key
    })
    const latest = dayEntries[dayEntries.length - 1]
    return {
      day: toDayLabel(day),
      value: latest?.stressLevel ?? null,
    }
  })
}

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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bloom-border)" vertical={false} syncWithTicks />
          <XAxis dataKey="day" tick={{ fill: 'var(--color-bloom-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0.7, 5.3]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: 'var(--color-bloom-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [value, 'Stress']}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid var(--color-bloom-border)',
              backgroundColor: 'var(--color-bloom-card)',
              color: 'var(--color-bloom-navy)',
            }}
            labelStyle={{ color: 'var(--color-bloom-navy)' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#38bdf8"
            strokeWidth={3}
            fill="url(#stressFill)"
            connectNulls
            dot={(props) => {
              const { cx, cy, payload, index } = props
              if (payload?.value == null || !Number.isFinite(cx) || !Number.isFinite(cy)) return null
              return (
                <circle
                  key={`stress-dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill="#38bdf8"
                  stroke="var(--color-bloom-card)"
                  strokeWidth={2}
                />
              )
            }}
            activeDot={{ r: 8, fill: '#0ea5e9', stroke: 'var(--color-bloom-card)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
