'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewTripPage() {
  const { couple } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!couple) {
      setError('커플 연결이 필요합니다.')
      setLoading(false)
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('종료일은 시작일보다 늦어야 합니다.')
      setLoading(false)
      return
    }

    try {
      const { data, error: insertError } = await supabase
        .from('trips')
        .insert([
          {
            couple_id: couple.id,
            title,
            destination,
            start_date: startDate,
            end_date: endDate,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/trips/${data.id}`)
    } catch (err: any) {
      setError(err.message || '여행 생성에 실패했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-rose-600">✈️ 새 여행 만들기</CardTitle>
          <CardDescription>함께 떠날 여행을 계획하세요</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                여행 제목
              </label>
              <Input
                id="title"
                placeholder="예: 제주도 힐링 여행"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="destination" className="text-sm font-medium">
                여행지
              </label>
              <Input
                id="destination"
                placeholder="예: 제주도"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  시작일
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  종료일
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Link href="/trips">
              <Button type="button" variant="outline">취소</Button>
            </Link>
            <Button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700"
              disabled={loading}
            >
              {loading ? '생성 중...' : '여행 만들기'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
