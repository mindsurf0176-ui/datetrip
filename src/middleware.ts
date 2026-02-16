import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Supabase 설정 전까지 인증 체크 비활성화
  // TODO: Supabase 환경변수 설정 후 인증 로직 복원
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register', '/trips/:path*'],
}
