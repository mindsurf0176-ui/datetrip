'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러 로깅 (추후 Sentry 등 연동 가능)
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          앗, 문제가 발생했어요
        </h1>
        <p className="text-gray-500 mb-8">
          예상치 못한 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-100 rounded-xl text-left">
            <p className="text-xs font-mono text-gray-600 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
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
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="border-gray-200 hover:bg-gray-50 rounded-xl h-12 px-6"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로 가기
          </Button>
        </div>
      </div>
    </div>
  )
}
