import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
const MoodStress = lazy(() => import('./pages/MoodStress'))
const Breath = lazy(() => import('./pages/Breath'))
const Reminders = lazy(() => import('./pages/Reminders'))
const Suggestions = lazy(() => import('./pages/Suggestions'))
const Progress = lazy(() => import('./pages/Progress'))
const Profile = lazy(() => import('./pages/Profile'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner label="Loading page…" />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="mood" element={<MoodStress />} />
              <Route path="breathe" element={<Breath />} />
              <Route path="reminders" element={<Reminders />} />
              <Route path="suggestions" element={<Suggestions />} />
              <Route path="progress" element={<Progress />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
