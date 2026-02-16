import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AuthProvider } from '@/auth/AuthContext'
import './globals.css'

export const metadata = {
  title: 'DateTrip - 커플 여행 플래너',
  description: '커플을 위한 여행 플래너 앱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
