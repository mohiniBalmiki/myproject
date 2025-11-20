import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string, additionalData?: { phone?: string, pan?: string }) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  resendVerification: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session from local storage
    const getInitialSession = async () => {
      try {
        const token = localStorage.getItem('local.auth.token');
        const userStr = localStorage.getItem('local.auth.user');
        
        if (token && userStr) {
          const userData = JSON.parse(userStr);
          const mockUser: any = {
            id: userData.id,
            email: userData.email,
            user_metadata: {
              name: userData.name
            }
          };
          
          setUser(mockUser);
          setSession({
            access_token: token,
            token_type: 'bearer',
            expires_in: 604800,
            expires_at: Date.now() + 604800000,
            refresh_token: '',
            user: mockUser
          } as any);
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes (keep for Supabase compatibility if needed later)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT') {
          // Clear any local storage data
          localStorage.removeItem('local.auth.token');
          localStorage.removeItem('local.auth.user');
          setUser(null);
          setSession(null);
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string, additionalData?: { phone?: string, pan?: string }) => {
    try {
      // Use LOCAL authentication (SQLite backend) instead of Supabase
      const response = await fetch('http://localhost:5000/api/auth/local/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone: additionalData?.phone || '',
          pan: additionalData?.pan || ''
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful - user can now login
      console.log('Registration successful:', data.user);
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Use LOCAL authentication (SQLite backend) instead of Supabase
      const response = await fetch('http://localhost:5000/api/auth/local/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store session data locally
      if (data.session && data.user) {
        localStorage.setItem('local.auth.token', data.session.access_token);
        localStorage.setItem('local.auth.user', JSON.stringify(data.user));
        
        // Create a mock user object for compatibility
        const mockUser: any = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: {
            name: data.user.name
          }
        };
        
        setUser(mockUser);
        setSession({
          access_token: data.session.access_token,
          token_type: 'bearer',
          expires_in: 604800, // 7 days
          expires_at: data.session.expires_at,
          refresh_token: '',
          user: mockUser
        } as any);
      }

    } catch (error: any) {
      console.error('Signin error:', error)
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  const signOut = async () => {
    try {
      // Clear local auth data
      localStorage.removeItem('local.auth.token');
      localStorage.removeItem('local.auth.user');
      setUser(null);
      setSession(null);
      
      // Also clear Supabase session for compatibility
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Signout error:', error)
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      setSession(data.session)
      setUser(data.session?.user ?? null)
    } catch (error: any) {
      console.error('Refresh session error:', error)
      throw new Error(error.message || 'Failed to refresh session')
    }
  }

  const resendVerification = async (email: string) => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

    } catch (error: any) {
      console.error('Resend verification error:', error)
      throw new Error(error.message || 'Failed to resend verification email')
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
    resendVerification
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}