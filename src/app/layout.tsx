import './globals.css'
import { Providers } from '@/components/Providers'

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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
