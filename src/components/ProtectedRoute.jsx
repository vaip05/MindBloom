import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './ui/LoadingSpinner'
import ErrorMessage from './ui/ErrorMessage'

export default function ProtectedRoute({ children }) {
  const { user, loading, configError } = useAuth()
  const location = useLocation()

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bloom-bg p-6">
        <div className="w-full max-w-md space-y-4">
          <ErrorMessage message={configError} />
          <p className="text-center text-sm text-bloom-muted">
            After adding Firebase keys, restart the Vite dev server.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bloom-bg">
        <LoadingSpinner label="Checking your session…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
