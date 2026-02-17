'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, RefreshCw, MapPin } from 'lucide-react'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Main section error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-violet-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-violet-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          오류가 발생했어요
        </h1>
        <p className="text-gray-500 mb-8">
          페이지를 불러오는 중 문제가 생겼습니다.
          <br />
          다시 시도하거나 이전 페이지로 돌아가 주세요.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-100 rounded-xl text-left">
            <p className="text-xs font-mono text-gray-600 break-all">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 px-6"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
          
          <Link href="/trips">
            <Button
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 rounded-xl h-12 px-6 w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              내 여행 목록
            </Button>
          </Link>
        </div>
        
        <button
          onClick={() => window.history.back()}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          이전 페이지로 돌아가기
        </button>
      </div>
    </div>
  )
}
