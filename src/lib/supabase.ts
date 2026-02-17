import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  return url
}

const getSupabaseKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
  return key
}

// 클라이언트 컴포넌트용 Supabase 클라이언트 (lazy initialization)
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseBrowserClient = () => {
  if (browserClient) return browserClient
  
  const url = getSupabaseUrl()
  const key = getSupabaseKey()
  
  browserClient = createBrowserClient(url, key)
  return browserClient
}

// Export for backward compatibility
export const supabase = {
  auth: {
    getSession: () => getSupabaseBrowserClient().auth.getSession(),
    signInWithPassword: (credentials: { email: string; password: string }) => 
      getSupabaseBrowserClient().auth.signInWithPassword(credentials),
    signUp: (credentials: { email: string; password: string }) => 
      getSupabaseBrowserClient().auth.signUp(credentials),
    signOut: () => getSupabaseBrowserClient().auth.signOut(),
    onAuthStateChange: (callback: (event: string, session: { user: { id: string } } | null) => void) => 
      getSupabaseBrowserClient().auth.onAuthStateChange(callback),
  },
  from: (table: string) => getSupabaseBrowserClient().from(table),
  channel: (name: string) => getSupabaseBrowserClient().channel(name),
  removeChannel: (channel: ReturnType<ReturnType<typeof getSupabaseBrowserClient>['channel']>) => 
    getSupabaseBrowserClient().removeChannel(channel),
}

// 서버/정적 생성용 Supabase 클라이언트
export const supabaseAdmin = createClient(
  getSupabaseUrl(),
  process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseKey(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
