import BrandLogo from '../components/BrandLogo'
import DecorativePetals from '../components/DecorativePetals'
import SunriseIllustration from '../components/SunriseIllustration'

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bloom-bg">
      <div className="absolute top-6 left-6 z-10 md:top-8 md:left-10">
        <BrandLogo />
      </div>

      <SunriseIllustration className="absolute top-4 right-4 w-40 md:top-8 md:right-10 md:w-56" />
      <DecorativePetals className="absolute inset-x-0 bottom-0 h-48" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24">
        <div className="animate-fade-up w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
