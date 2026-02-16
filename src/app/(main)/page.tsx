'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/auth/AuthContext'
import CoupleConnect from '@/components/CoupleConnect'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Plane, 
  Map as MapIcon, 
  Heart, 
  Camera, 
  Wallet, 
  Settings, 
  ChevronRight,
  Sparkles
} from 'lucide-react'

export default function HomePage() {
  const { user, couple, loading, isGuest } = useAuth()
  const router = useRouter()
  const [skipCoupleConnect, setSkipCoupleConnect] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl"
          >
            💖
          </motion.div>
          <p className="text-rose-400 font-bold animate-pulse">우리들의 공간을 준비 중이에요...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-5xl mx-auto">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-500 rounded-[2rem] mb-8 shadow-2xl shadow-rose-200"
        >
          <span className="text-5xl">💑</span>
        </motion.div>
        <h1 className="text-5xl font-black mb-4">
          반가워요, <span className="text-gradient">{user.name}</span>님!
        </h1>
        <p className="text-xl text-muted-foreground font-medium flex items-center justify-center gap-2">
          오늘은 어떤 설레는 여행을 꿈꾸고 계신가요? <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
        </p>
      </motion.div>

      {/* Couple Connect or Main Menu */}
      {!couple?.user2_id && !skipCoupleConnect && !isGuest ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto space-y-6"
        >
          <CoupleConnect />
          <button
            className="w-full py-3 text-muted-foreground hover:text-rose-500 transition-all text-sm font-bold flex items-center justify-center gap-1 group"
            onClick={() => setSkipCoupleConnect(true)}
          >
            나중에 연결하기 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Trip Card */}
            <motion.div variants={item}>
              <Link href="/trips/new" className="group block h-full">
                <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-200 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-rose-300 h-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-colors" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                      <Plane className="w-8 h-8 rotate-45" />
                    </div>
                    <h3 className="text-3xl font-black mb-3">새 여행 만들기</h3>
                    <p className="text-rose-50/90 text-lg font-medium mb-8">우리만의 소중한 추억을 위한<br />특별한 여행을 시작해 보세요.</p>
                    <div className="mt-auto inline-flex items-center gap-2 bg-white text-rose-500 rounded-2xl px-6 py-3 text-sm font-black group-hover:bg-rose-50 transition-colors self-start">
                      지금 시작하기
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* My Trips Card */}
            <motion.div variants={item}>
              <Link href="/trips" className="group block h-full">
                <div className="relative overflow-hidden bg-glass rounded-[3rem] p-10 shadow-xl shadow-rose-100/50 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-rose-200 border border-white h-full">
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-rose-50 rounded-full translate-y-1/2 translate-x-1/2 -z-10 group-hover:bg-rose-100 transition-colors" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="bg-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                      <MapIcon className="w-8 h-8 text-rose-500" />
                    </div>
                    <h3 className="text-3xl font-black mb-3 text-foreground">내 여행 목록</h3>
                    <p className="text-muted-foreground text-lg font-medium mb-8">우리가 함께 다녀왔거나<br />준비 중인 여행들이에요.</p>
                    <div className="mt-auto inline-flex items-center gap-2 text-rose-500 font-black text-lg group-hover:gap-3 transition-all">
                      모두 보기
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Sub Action Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Heart, label: '위시리스트', color: 'bg-amber-100 text-amber-600', href: '/wishlist' },
              { icon: Camera, label: '추억 앨범', color: 'bg-purple-100 text-purple-600', href: '/memories' },
              { icon: Wallet, label: '예산 관리', color: 'bg-emerald-100 text-emerald-600', href: '/budget' },
              { icon: Settings, label: '설정', color: 'bg-slate-100 text-slate-600', href: '/settings' },
            ].map((item_data, idx) => (
              <motion.div key={idx} variants={item}>
                <Link href={item_data.href} className="group block">
                  <div className="bg-glass rounded-3xl p-6 text-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-rose-100 border border-white">
                    <div className={`w-14 h-14 ${item_data.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <item_data.icon className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-foreground/80">{item_data.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Partner Notice */}
          {(isGuest || skipCoupleConnect) && !couple?.user2_id && (
            <motion.div 
              variants={item}
              className="relative overflow-hidden bg-glass rounded-[2.5rem] p-8 border-2 border-rose-100/50 shadow-lg shadow-rose-100/20"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Heart className="w-32 h-32 text-rose-500 rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-3xl flex items-center justify-center shadow-inner">
                  <span className="text-4xl animate-bounce">💌</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-foreground mb-1">파트너와 함께 연결해 보세요!</h4>
                  <p className="text-muted-foreground font-medium">커플 연결을 하면 실시간으로 여행 계획을 함께 짤 수 있어요.</p>
                </div>
                {!isGuest && (
                  <Button 
                    onClick={() => setSkipCoupleConnect(false)}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-8 h-14 font-black text-lg shadow-lg shadow-rose-200 transition-all hover:scale-105"
                  >
                    지금 연결하기
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
