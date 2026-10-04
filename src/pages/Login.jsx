import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useAuth } from '../context/AuthContext'

function validate(values) {
  const errors = {}
  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }
  return errors
}

export default function Login() {
  const { login, user, configError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(configError || '')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(configError || '')
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || configError) return

    setSubmitting(true)
    try {
      await login(values)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-[2rem] border border-bloom-border bg-white px-6 py-8 shadow-sm sm:px-8">
        <h1 className="text-3xl font-extrabold text-bloom-navy">Welcome back</h1>
        <p className="mt-2 text-bloom-navy/80">Take a moment for yourself.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <ErrorMessage message={formError} />

          <Input
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />

          <Input
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={values.password}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <button
                type="button"
                className="text-bloom-muted hover:text-bloom-navy"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log in →'}
          </Button>

          <p className="text-center">
            <button
              type="button"
              className="text-sm font-semibold text-bloom-lavender underline-offset-2 hover:underline"
              onClick={() =>
                setFormError(
                  'Password reset will be available once Firebase email reset is enabled for your project.',
                )
              }
            >
              Forgot password?
            </button>
          </p>
        </form>

        <div className="my-6 flex items-center gap-3 text-sm text-bloom-muted">
          <div className="h-px flex-1 bg-bloom-border" />
          <span>or</span>
          <div className="h-px flex-1 bg-bloom-border" />
        </div>

        <div className="rounded-2xl bg-bloom-pink-soft px-4 py-4 text-center text-sm text-bloom-navy">
          New to MindBloom?{' '}
          <Link to="/register" className="font-bold text-bloom-lavender hover:underline">
            Create an account →
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
