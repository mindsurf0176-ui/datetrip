'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Couple } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  couple: Couple | null
  loading: boolean
  isGuest: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  loginAsGuest: () => void
  refreshCouple: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [couple, setCouple] = useState<Couple | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data }: { data: { session: { user: { id: string } } | null } }) => {
      if (data.session?.user) {
        fetchUserProfile(data.session.user.id)
      } else {
        setLoading(false)
      }
    })

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((
      _event: string,
      session: { user: { id: string } } | null
    ) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setCouple(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      
      setUser(profile)
      
      // 커플 정보 가져오기
      await fetchCoupleInfo(userId)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
      setLoading(false)
    }
  }

  const fetchCoupleInfo = async (userId: string) => {
    try {
      const { data: coupleData, error } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching couple:', error)
      }
      
      setCouple(coupleData || null)
    } catch (error) {
      console.error('Error fetching couple info:', error)
      setCouple(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) return { error: authError }

    if (authData.user) {
      // 프로필 생성
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
          },
        ])

      if (profileError) return { error: profileError }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCouple(null)
    setIsGuest(false)
  }

  const loginAsGuest = () => {
    setIsGuest(true)
    setUser({
      id: 'guest',
      email: 'guest@datetrip.app',
      name: '게스트',
      created_at: new Date().toISOString(),
    } as User)
    setLoading(false)
  }

  const refreshCouple = async () => {
    if (user) {
      await fetchCoupleInfo(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        couple,
        loading,
        isGuest,
        signIn,
        signUp,
        signOut,
        loginAsGuest,
        refreshCouple,
      }}
    >
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
