import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import MoodSelector from '../components/MoodSelector'
import SunriseIllustration from '../components/SunriseIllustration'
import { FlowerMark } from '../components/BrandLogo'
import { getGreeting } from '../lib/constants'

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-bloom-navy sm:text-4xl">{getGreeting()}</h1>
          <p className="mt-2 max-w-xl text-bloom-navy/80">
            Take a moment for yourself. A calmer, brighter you is possible.
          </p>
        </div>
        <SunriseIllustration className="w-36 self-end sm:w-48" />
      </header>

      <Card className="bg-bloom-pink-soft px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">
            Daily check-in
          </p>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-bloom-lavender">
            TODO · Coming soon
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-bloom-navy">How are you feeling today?</h2>
        <p className="mt-1 text-bloom-navy/75">
          Mood tracking will live here. This preview keeps the layout for future work.
        </p>
        <div className="mt-5 pointer-events-none opacity-70">
          <MoodSelector value="" onChange={() => {}} />
        </div>
        <Button className="mt-6 w-full" disabled>
          Save mood →
        </Button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border border-bloom-border bg-white px-5 py-6 sm:px-6 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-extrabold text-bloom-navy">Your Weekly Mood Trend</h2>
            <span className="rounded-full bg-bloom-bg px-3 py-1 text-xs font-bold text-bloom-lavender">
              TODO · Coming soon
            </span>
          </div>
          <p className="mt-1 text-sm text-bloom-muted">
            Progress charts will appear here once mood data is saved.
          </p>
          <div className="mt-4 flex h-[220px] items-center justify-center rounded-3xl bg-bloom-bg/70 text-sm text-bloom-muted">
            Chart placeholder
          </div>
        </Card>

        <Card className="flex flex-col bg-bloom-blue-soft px-5 py-6 sm:px-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">
              Take a breath
            </p>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-bloom-navy">Find a little calm</h2>
          <p className="mt-1 text-bloom-navy/75">
            A short guided breathing exercise, about a minute.
          </p>
          <div className="my-8 flex flex-1 items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/80">
              <FlowerMark className="h-16 w-16" />
            </div>
          </div>
          <Link to="/breathe">
            <Button className="w-full">
              Start breathing →
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
