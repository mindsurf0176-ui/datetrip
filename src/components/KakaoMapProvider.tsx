'use client'

import Script from 'next/script'
import { ReactNode } from 'react'

interface KakaoMapProviderProps {
  children: ReactNode
}

export function KakaoMapProvider({ children }: KakaoMapProviderProps) {
  const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&libraries=services&autoload=false`}
        strategy="afterInteractive"
      />
      {children}
    </>
  )
}
