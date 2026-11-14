import { Link } from 'react-router-dom'
import Card from './ui/Card'
import { describeGardenDay, gardenSummary, gardenTodayLine } from '../lib/garden'

const BASE = 158

function stemHeight(tended) {
  if (tended <= 0) return 36
  return 72 + tended * 16
}

function Flower({ color }) {
  return (
    <g className="garden-bloom">
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="-12"
          rx="6"
          ry="9"
          fill={color}
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r="4" fill="#F6C95C" />
    </g>
  )
}

function Petal({ anchored = false }) {
  const cy = anchored ? 0 : -11
  return (
    <g className="garden-bloom">
      <ellipse cx="0" cy={cy} rx="6.5" ry="11" fill="#C4B5FD" />
      <ellipse cx="0" cy={cy} rx="2" ry="7" fill="#ffffff" opacity="0.35" />
    </g>
  )
}

function quadPoint(t, start, control, end) {
  const rest = 1 - t
  return {
    x: rest * rest * start.x + 2 * rest * t * control.x + t * t * end.x,
    y: rest * rest * start.y + 2 * rest * t * control.y + t * t * end.y,
  }
}

function Leaf({ x, y, flip = false }) {
  const lean = flip ? 32 : -32
  return (
    <ellipse
      cx={x}
      cy={y}
      rx="11"
      ry="5.5"
      fill="#7DBF8A"
      transform={`rotate(${lean} ${x} ${y})`}
    />
  )
}

function Stem({ day, index }) {
  const x = 48 + index * 78
  const height = stemHeight(day.tended)
  const top = BASE - height
  const lean = (index % 2 === 0 ? -1 : 1) * 8
  const tipX = x + lean
  const midY = (BASE + top) / 2
  const start = { x, y: BASE }
  const control = { x: x + lean * 0.4, y: midY }
  const end = { x: tipX, y: top }
  const side = lean >= 0 ? -1 : 1
  const leafAt = quadPoint(0.55, start, control, end)
  const petalAt = quadPoint(0.8, start, control, end)

  return (
    <g>
      {day.isToday ? (
        <ellipse cx={x} cy={BASE + 2} rx="30" ry="11" fill="#ffffff" opacity="0.72" />
      ) : null}
      <path
        d={`M ${x} ${BASE} Q ${x + lean * 0.4} ${midY} ${tipX} ${top}`}
        stroke={day.tended ? '#6E9A72' : '#B7CDB4'}
        strokeWidth={day.tended ? 2.6 : 2}
        strokeLinecap="round"
        fill="none"
      />
      {day.breath ? (
        <Leaf x={leafAt.x + side * 9} y={leafAt.y} flip={side > 0} />
      ) : null}
      {day.checkIn && day.journal ? (
        <g transform={`translate(${petalAt.x + side * 8} ${petalAt.y}) rotate(${side * 28}) scale(0.68)`}>
          <Petal anchored />
        </g>
      ) : null}
      <g transform={`translate(${tipX} ${top})`}>
        {day.checkIn ? <Flower color={day.color} /> : null}
        {!day.checkIn && day.journal ? <Petal /> : null}
        {day.tended === 0 ? (
          <>
            <ellipse cx="-6" cy="0" rx="7" ry="3.5" fill="#C5E6C4" transform="rotate(-30 -6 0)" />
            <ellipse cx="6" cy="0" rx="7" ry="3.5" fill="#A7D7A8" transform="rotate(30 6 0)" />
          </>
        ) : null}
      </g>
      <text
        x={x}
        y="196"
        textAnchor="middle"
        fill={day.isToday ? 'var(--color-bloom-navy)' : 'var(--color-bloom-muted)'}
        fontSize="13"
        fontWeight={day.isToday ? 800 : 600}
        fontFamily="EB Garamond, Georgia, serif"
      >
        {day.label}
      </text>
    </g>
  )
}

function LegendMark({ children }) {
  return (
    <svg viewBox="0 0 28 28" className="h-5 w-5" aria-hidden="true">
      {children}
    </svg>
  )
}

export default function BloomGarden({ days, loading = false, error = '' }) {
  const today = days.find((day) => day.isToday)
  const summary = error
    ? 'The garden will appear once this week loads.'
    : loading
      ? 'Gathering this week’s check-ins, breaths, and pages.'
      : gardenSummary(days)
  const todayLine = !loading && !error ? gardenTodayLine(today) : ''

  return (
    <Card className="bg-bloom-green-soft px-5 py-6 sm:px-7" aria-labelledby="garden-heading">
      <div className="grid items-center gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">Garden</p>
          <h2 id="garden-heading" className="mt-2 text-2xl font-extrabold text-bloom-navy">
            Seven days of care
          </h2>
          <p className="mt-2 text-bloom-navy/80">{summary}</p>
          {todayLine ? <p className="mt-3 text-sm text-bloom-navy/80">{todayLine}</p> : null}
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-bloom-navy">
            <li className="flex items-center gap-1.5">
              <LegendMark>
                <g transform="translate(14 16)">
                  {[0, 72, 144, 216, 288].map((angle) => (
                    <ellipse key={angle} cx="0" cy="-6" rx="3" ry="4.5" fill="var(--color-bloom-petal-pink)" transform={`rotate(${angle})`} />
                  ))}
                  <circle r="2" fill="var(--color-bloom-sun)" />
                </g>
              </LegendMark>
              Check-in
            </li>
            <li className="flex items-center gap-1.5">
              <LegendMark>
                <ellipse cx="14" cy="16" rx="9" ry="4.5" fill="var(--color-bloom-petal-green)" transform="rotate(-32 14 16)" />
              </LegendMark>
              Breath
            </li>
            <li className="flex items-center gap-1.5">
              <LegendMark>
                <ellipse cx="14" cy="12" rx="4" ry="7" fill="var(--color-bloom-petal-lilac)" />
              </LegendMark>
              Journal
            </li>
          </ul>
          {!loading && !error && today && today.tended < 3 ? (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
              {!today.checkIn ? (
                <Link to="/mood" className="text-bloom-lavender-dark hover:underline">
                  Log a check-in
                </Link>
              ) : null}
              {!today.breath ? (
                <Link to="/breathe" className="text-bloom-lavender-dark hover:underline">
                  Take a breath
                </Link>
              ) : null}
              {!today.journal ? (
                <Link to="/journal" className="text-bloom-lavender-dark hover:underline">
                  Write a page
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-3">
          <svg viewBox="0 0 560 210" className="w-full" role="img" aria-labelledby="garden-drawing">
            <title id="garden-drawing">A garden bed with one stem for each of the last seven days</title>
            <ellipse cx="280" cy="168" rx="246" ry="16" fill="#C5E0C2" />
            <ellipse cx="280" cy="172" rx="220" ry="10" fill="#DDECD7" />
            {days.map((day, index) => (
              <Stem key={day.key} day={day} index={index} />
            ))}
          </svg>
          {!loading && !error ? (
            <ul className="sr-only">
              {days.map((day) => (
                <li key={day.key}>{describeGardenDay(day)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
