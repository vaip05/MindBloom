import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import { formatAuthError } from '../lib/constants'
import { ensureUserProfile } from '../services/firestoreServices'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [configError] = useState(
    isFirebaseConfigured
      ? null
      : 'Firebase is not configured. Copy .env.example to .env and add your Firebase project keys.',
  )

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      configError,
      isAuthenticated: Boolean(user),
      async register({ name, email, password }) {
        if (!auth) throw new Error(configError)
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
          if (name) {
            await updateProfile(cred.user, { displayName: name.trim() })
          }
          await ensureUserProfile(cred.user, { displayName: name?.trim() })
          return cred.user
        } catch (error) {
          throw new Error(formatAuthError(error))
        }
      },
      async login({ email, password }) {
        if (!auth) throw new Error(configError)
        try {
          const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
          await ensureUserProfile(cred.user)
          return cred.user
        } catch (error) {
          throw new Error(formatAuthError(error))
        }
      },
      async logout() {
        if (!auth) throw new Error(configError)
        await signOut(auth)
      },
    }),
    [user, loading, configError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
