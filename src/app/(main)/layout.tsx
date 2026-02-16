'use client'

import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { KakaoMapProvider } from '@/components/KakaoMapProvider'
import { motion } from 'framer-motion'
import { LogOut, User, Heart, Plus, Calendar, Camera } from 'lucide-react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut, isGuest } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-romantic">
      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-glass rounded-[2rem] border border-white/40 shadow-2xl shadow-rose-100/50 px-6 md:px-10 h-20 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:shadow-rose-300 transition-all"
                >
                  <Heart className="w-6 h-6 text-white fill-white" />
                </motion.div>
                <span className="text-2xl font-black text-gradient hidden sm:block">
                  DateTrip
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/40">
                    {isGuest ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-black text-slate-600">GUEST</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center text-white shadow-md">
                          <Heart className="w-4 h-4 fill-white" />
                        </div>
                        <span className="text-sm font-black text-foreground/80">
                          {user.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={signOut}
                      className="w-12 h-12 rounded-2xl text-muted-foreground hover:text-rose-500 hover:bg-rose-50/50 transition-all border border-transparent hover:border-rose-100"
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </>
              ) : (
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl px-8 h-12 font-black shadow-lg shadow-rose-200">
                    시작하기
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <KakaoMapProvider>{children}</KakaoMapProvider>
      </main>

      {/* Mobile Tab Bar (Optional but nice) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-glass rounded-[2rem] border border-white/40 shadow-2xl shadow-rose-100/50 h-16 flex items-center justify-around px-4">
          <Link href="/" className="p-3 text-rose-500 hover:scale-110 transition-transform">
             <div className="flex flex-col items-center">
               <Heart className="w-6 h-6 fill-rose-500" />
             </div>
          </Link>
          <Link href="/trips" className="p-3 text-muted-foreground hover:text-rose-500 hover:scale-110 transition-transform">
             <div className="flex flex-col items-center">
               <Calendar className="w-6 h-6" />
             </div>
          </Link>
          <Link href="/trips/new" className="p-3 text-muted-foreground hover:text-rose-500 hover:scale-110 transition-transform">
             <div className="flex flex-col items-center">
               <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-200 -mt-2">
                 <Plus className="w-6 h-6" />
               </div>
             </div>
          </Link>
          <div className="p-3 text-muted-foreground/30"><Camera className="w-6 h-6" /></div>
          <div className="p-3 text-muted-foreground/30"><User className="w-6 h-6" /></div>
        </div>
      </div>
    </div>
  )
}

