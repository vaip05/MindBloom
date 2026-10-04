import { NavLink } from 'react-router-dom'
import {
  Bell,
  ChartLine,
  Flower2,
  Heart,
  Home,
  Menu,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import BrandLogo from './BrandLogo'
import DecorativePetals from './DecorativePetals'
import { NAV_ITEMS } from '../lib/constants'

const ICONS = {
  home: Home,
  heart: Heart,
  flower: Flower2,
  bell: Bell,
  sparkles: Sparkles,
  chart: ChartLine,
  user: User,
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  const nav = (
    <nav className="mt-10 flex flex-1 flex-col gap-2">
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon]
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-bloom-pink-soft text-bloom-navy'
                  : 'text-bloom-navy/80 hover:bg-white/70'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <>
      <button
        type="button"
        className="fixed top-4 left-4 z-40 rounded-full bg-white p-2.5 shadow-sm border border-bloom-border lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-bloom-navy/20 backdrop-blur-[2px] lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-bloom-border/70 bg-bloom-bg px-5 py-6 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between">
          <BrandLogo />
          <button
            type="button"
            className="rounded-full p-1 text-bloom-muted lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {nav}

        <div className="relative mt-auto h-36 overflow-hidden">
          <DecorativePetals className="absolute inset-0" />
        </div>
      </aside>
    </>
  )
}
