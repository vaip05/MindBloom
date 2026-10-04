import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useAuth } from '../context/AuthContext'

function validate(values) {
  const errors = {}
  if (!values.name.trim()) {
    errors.name = 'Name is required.'
  }
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
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

export default function Register() {
  const { register, user, configError } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(configError || '')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(configError || '')
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || configError) return

    setSubmitting(true)
    try {
      await register(values)
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-[2rem] border border-bloom-border bg-white px-6 py-8 shadow-sm sm:px-8">
        <h1 className="text-3xl font-extrabold text-bloom-navy">Create your account</h1>
        <p className="mt-2 text-bloom-navy/80">Begin a calmer, brighter routine.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <ErrorMessage message={formError} />

          <Input
            id="name"
            label="Name"
            placeholder="Your name"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            leftIcon={<User className="h-4 w-4" />}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />

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
            autoComplete="new-password"
            placeholder="At least 6 characters"
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

          <Input
            id="confirmPassword"
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            leftIcon={<Lock className="h-4 w-4" />}
            onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account →'}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl bg-bloom-blue-soft px-4 py-4 text-center text-sm text-bloom-navy">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-bloom-lavender hover:underline">
            Log in →
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
