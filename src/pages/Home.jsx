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
            Log a mood, or run a one-minute breathing exercise.
          </p>
        </div>
        <SunriseIllustration className="w-36 self-end sm:w-48" />
      </header>

      <Card className="bg-bloom-pink-soft px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">
            Daily check-in
          </p>
          <span className="rounded-md bg-white/80 px-3 py-1 text-xs font-bold text-bloom-lavender">
            Preview
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-bloom-navy">Today&apos;s mood</h2>
        <p className="mt-1 text-bloom-navy/75">
          These tiles are a preview. Saving a mood happens on Mood & Stress.
        </p>
        <div className="mt-5 pointer-events-none opacity-70">
          <MoodSelector value="" onChange={() => {}} />
        </div>
        <Link to="/mood" className="mt-6 block">
          <Button className="w-full">Navigate to Mood Check In</Button>
        </Link>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border border-bloom-border bg-white px-5 py-6 sm:px-6 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-extrabold text-bloom-navy">This week</h2>
            <span className="rounded-md bg-bloom-bg px-3 py-1 text-xs font-bold text-bloom-lavender">
              Not built
            </span>
          </div>
          <p className="mt-1 text-sm text-bloom-muted">
            Mood and stress for the last seven days will be charted here.
          </p>
          <div className="mt-4 flex h-[220px] items-center justify-center rounded-md bg-bloom-bg/70 text-sm text-bloom-muted">
            No check-ins to chart yet
          </div>
        </Card>

        <Card className="flex flex-col bg-bloom-blue-soft px-5 py-6 sm:px-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">
              Breath
            </p>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-bloom-navy">One minute</h2>
          <p className="mt-1 text-bloom-navy/75">
            Box, 4-7-8, or coherent. Finished sessions stay in the log.
          </p>
          <div className="my-8 flex flex-1 items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-md bg-white/80">
              <FlowerMark className="h-16 w-16" />
            </div>
          </div>
          <Link to="/breathe">
            <Button className="w-full">
              Navigate to Breathing Exercise
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
