'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { authService } from '@/services/api'

interface User {
  id: string
  name: string
  mobileNumber: string
  role: 'ADMIN' | 'SURVEYOR'
  isActive: boolean
  createdAt: string
  project?: {
    id: number
    name: string
  }
  location?: {
    id: number
    name: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (mobileNumber: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check for existing token on mount and set up token refresh interval
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('adminToken')
        if (token) {
          // Validate token by fetching profile
          const profile = await authService.getProfile()
          if (profile.role === 'ADMIN') {
            setUser(profile)
          } else {
            // Not an admin, clear token
            Cookies.remove('adminToken')
            setUser(null)
          }
        }
      } catch (error: any) {
        console.error('Auth check failed:', error)
        Cookies.remove('adminToken')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Set up interval to periodically refresh auth state
    const interval = setInterval(() => {
      if (user) {
        authService.getProfile().catch((error) => {
          console.error('Token refresh failed:', error)
          Cookies.remove('adminToken')
          setUser(null)
          router.push('/login')
        })
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes

    return () => clearInterval(interval)
  }, [user, router])

  const login = async (mobileNumber: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Attempting login with:', mobileNumber)

      const response = await authService.login(mobileNumber, password)
      console.log('Login response:', response)
      
      // Check if user is admin
      if (response.user.role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.')
      }

      // Store token in cookie with longer expiration
      Cookies.set('adminToken', response.token, {
        expires: 30, // 30 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      setUser(response.user)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    Cookies.remove('adminToken')
    setUser(null)
    router.push('/login')
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}