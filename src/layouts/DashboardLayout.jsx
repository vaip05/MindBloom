import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-bloom-bg">
      <Sidebar />
      <main className="flex-1 px-4 pt-16 pb-8 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto w-full max-w-6xl animate-fade-up">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
