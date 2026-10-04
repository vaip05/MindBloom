import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useAuth } from '../context/AuthContext'
import {
  BIO_MAX_LENGTH,
  DEFAULT_AVATAR,
  PROFILE_AVATARS,
} from '../lib/constants'
import { getUserProfile, updateUserProfile } from '../services/firestoreServices'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [avatarEmoji, setAvatarEmoji] = useState(DEFAULT_AVATAR)
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      try {
        const profile = await getUserProfile(user.uid)
        if (!active) return
        if (profile?.displayName) setDisplayName(profile.displayName)
        if (profile?.avatarEmoji) setAvatarEmoji(profile.avatarEmoji)
        if (typeof profile?.bio === 'string') setBio(profile.bio)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user.uid])

  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!displayName.trim()) {
      setError('Name cannot be empty.')
      return
    }
    if (!PROFILE_AVATARS.includes(avatarEmoji)) {
      setError('Please choose an avatar from the list.')
      return
    }
    if (bio.length > BIO_MAX_LENGTH) {
      setError(`Bio must be ${BIO_MAX_LENGTH} characters or fewer.`)
      return
    }

    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        avatarEmoji,
        bio: bio.trim(),
      })
      setMessage('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    setError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoggingOut(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-bloom-navy">Profile</h1>
        <p className="mt-2 max-w-2xl text-bloom-navy/80">
          Choose a calm avatar, add a short note about yourself, and manage your account.
        </p>
      </header>

      <ErrorMessage message={error} />
      {message ? (
        <div className="rounded-2xl border border-bloom-green bg-bloom-green-soft px-4 py-3 text-sm text-bloom-navy">
          {message}
        </div>
      ) : null}

      <Card className="border border-bloom-border bg-white px-5 py-6 sm:px-6">
        {loading ? (
          <p className="text-sm text-bloom-muted">Loading your profile…</p>
        ) : (
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full bg-bloom-pink-soft text-5xl shadow-sm"
                aria-hidden="true"
              >
                {avatarEmoji}
              </div>
              <div>
                <p className="text-lg font-extrabold text-bloom-navy">
                  {displayName.trim() || 'Your name'}
                </p>
                <p className="mt-1 max-w-md text-sm text-bloom-muted">
                  {bio.trim() || 'Add a short description so your profile feels more like you.'}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-bloom-navy">Avatar</p>
              <p className="mb-3 text-sm text-bloom-muted">Pick an emoji that feels like you.</p>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {PROFILE_AVATARS.map((emoji) => {
                  const selected = avatarEmoji === emoji
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatarEmoji(emoji)}
                      aria-label={`Choose avatar ${emoji}`}
                      aria-pressed={selected}
                      className={`flex h-12 w-full items-center justify-center rounded-2xl text-2xl transition ${
                        selected
                          ? 'bg-bloom-lavender/20 ring-2 ring-bloom-lavender'
                          : 'bg-bloom-bg hover:bg-bloom-blue-soft'
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                })}
              </div>
            </div>

            <Input
              id="displayName"
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <label className="block" htmlFor="bio">
              <span className="mb-2 block text-sm font-semibold text-bloom-navy">
                Short description
              </span>
              <textarea
                id="bio"
                value={bio}
                maxLength={BIO_MAX_LENGTH}
                rows={4}
                placeholder="A calm sentence about what brings you here…"
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-2xl border border-bloom-border bg-white px-4 py-3 text-bloom-navy outline-none focus:border-bloom-lavender focus:ring-2 focus:ring-bloom-lavender/20"
              />
              <span className="mt-1.5 block text-right text-xs text-bloom-muted">
                {bio.length}/{BIO_MAX_LENGTH}
              </span>
            </label>

            <Input id="email" label="Email" value={user.email || ''} disabled readOnly />

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save profile →'}
            </Button>
          </form>
        )}
      </Card>

      <Card className="bg-bloom-pink-soft px-5 py-6">
        <h2 className="text-xl font-extrabold">Sign out</h2>
        <p className="mt-1 text-sm text-bloom-navy/75">
          You can sign back in anytime with the same email.
        </p>
        <Button className="mt-5" variant="secondary" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? 'Signing out…' : 'Log out'}
        </Button>
      </Card>
    </div>
  )
}
