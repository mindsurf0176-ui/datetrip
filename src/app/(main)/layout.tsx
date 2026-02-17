'use client'

import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { KakaoMapProvider } from '@/components/KakaoMapProvider'
import { LogOut, User, MapPin, Plus, Calendar, Settings, Search } from 'lucide-react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut, isGuest } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Triple Style */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 gradient-violet rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  DateTrip
                </span>
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" className="rounded-xl text-gray-600 hover:text-violet-600 hover:bg-violet-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  홈
                </Button>
              </Link>
              <Link href="/trips">
                <Button variant="ghost" className="rounded-xl text-gray-600 hover:text-violet-600 hover:bg-violet-50">
                  <MapPin className="w-4 h-4 mr-2" />
                  내 여행
                </Button>
              </Link>
              <Link href="/trips/new">
                <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white ml-2">
                  <Plus className="w-4 h-4 mr-2" />
                  여행 만들기
                </Button>
              </Link>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                      <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-violet-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {isGuest ? '게스트' : user.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={signOut}
                      className="w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Mobile User */}
                  <div className="md:hidden flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-violet-600" />
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/login">
                  <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white">
                    시작하기
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)]">
        <KakaoMapProvider>{children}</KakaoMapProvider>
      </main>

      {/* Mobile Tab Bar - Triple Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-violet-600">
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">홈</span>
          </Link>
          <Link href="/trips" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-violet-600">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">내 여행</span>
          </Link>
          <Link href="/trips/new" className="flex flex-col items-center justify-center w-full h-full">
            <div className="w-12 h-12 gradient-violet rounded-full flex items-center justify-center -mt-4 shadow-lg shadow-violet-200">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </Link>
          <Link href="/map" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-violet-600">
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">지도</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-violet-600">
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">설정</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile Bottom Padding */}
      <div className="md:hidden h-16" />
    </div>
  )
}
