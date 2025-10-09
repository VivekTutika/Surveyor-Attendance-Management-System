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

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('adminToken')
        if (token) {
          const profile = await authService.getProfile()
          if (profile.user.role === 'ADMIN') {
            setUser(profile.user)
          } else {
            // Not an admin, clear token
            Cookies.remove('adminToken')
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        Cookies.remove('adminToken')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (mobileNumber: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authService.login(mobileNumber, password)
      
      // Check if user is admin
      if (response.user.role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.')
      }

      // Store token in HTTP-only cookie
      Cookies.set('adminToken', response.token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      setUser(response.user)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Login failed')
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