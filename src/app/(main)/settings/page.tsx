'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  LogOut, 
  ChevronRight,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  Heart,
  Compass,
  Settings as SettingsIcon,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, couple, loading, signOut, isGuest } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState({
    tripReminder: true,
    partnerActivity: true,
    marketing: false
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center"
          >
            <Compass className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-gray-400 font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-gray-900">설정</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-triple p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-violet-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {isGuest ? '게스트' : user.name || '사용자'}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                {couple?.user2_id && (
                  <div className="flex items-center gap-1 mt-1">
                    <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                    <span className="text-xs text-pink-500 font-medium">파트너 연결됨</span>
                  </div>
                )}
              </div>
              {!isGuest && (
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Guest Notice */}
        {isGuest && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-triple p-5 border-l-4 border-l-violet-600">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">회원가입하고 더 많은 기능을 이용하세요</h3>
                  <p className="text-sm text-gray-500 mt-1">데이터 저장, 파트너 연결, 여행 공유가 가능해요</p>
                  <Link href="/register">
                    <Button className="mt-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                      회원가입하기
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Notifications */}
        {!isGuest && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              알림 설정
            </h3>
            <div className="card-triple divide-y divide-gray-100">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">여행 리마인더</h4>
                    <p className="text-xs text-gray-500">여행 전날 알림을 받아요</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.tripReminder}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, tripReminder: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-4.5 h-4.5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">파트너 활동</h4>
                    <p className="text-xs text-gray-500">파트너가 일정을 추가하면 알림</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.partnerActivity}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, partnerActivity: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-4.5 h-4.5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">마케팅 알림</h4>
                    <p className="text-xs text-gray-500">이벤트 및 프로모션 소식</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                />
              </div>
            </div>
          </motion.section>
        )}

        {/* App Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            앱 설정
          </h3>
          <div className="card-triple divide-y divide-gray-100">
            <button className="flex items-center justify-between p-4 w-full hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Moon className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">다크 모드</h4>
                  <p className="text-xs text-gray-500">시스템 설정 따르기</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-4 w-full hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-4.5 h-4.5 text-orange-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">언어</h4>
                  <p className="text-xs text-gray-500">한국어</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </motion.section>

        {/* Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            지원
          </h3>
          <div className="card-triple divide-y divide-gray-100">
            <button className="flex items-center justify-between p-4 w-full hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-4.5 h-4.5 text-cyan-600" />
                </div>
                <h4 className="font-medium text-gray-900">도움말 & FAQ</h4>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-4 w-full hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-gray-600" />
                </div>
                <h4 className="font-medium text-gray-900">개인정보처리방침</h4>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-4 w-full hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                  <SettingsIcon className="w-4.5 h-4.5 text-gray-600" />
                </div>
                <h4 className="font-medium text-gray-900">서비스 이용약관</h4>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </motion.section>

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">DateTrip v1.0.0</p>
        </div>

        {/* Sign Out */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {isGuest ? '게스트 모드 종료' : '로그아웃'}
          </Button>
        </motion.section>
      </div>
    </div>
  )
}
