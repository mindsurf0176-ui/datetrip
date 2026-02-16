'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Trip } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TripsPage() {
  const { couple } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (couple) {
      fetchTrips()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couple])

  const fetchTrips = async () => {
    if (!couple) return

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('couple_id', couple.id)
        .order('start_date', { ascending: true })

      if (error) throw error
      setTrips(data || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">내 여행 ✈️</h1>
        <Link href="/trips/new">
          <Button className="bg-rose-600 hover:bg-rose-700">+ 새 여행</Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 mb-4">아직 계획된 여행이 없습니다.</p>
            <Link href="/trips/new">
              <Button className="bg-rose-600 hover:bg-rose-700">
                첫 여행 계획하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-rose-600">{trip.title}</CardTitle>
                  <CardDescription>{trip.destination}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {new Date(trip.start_date).toLocaleDateString('ko-KR')} ~{' '}
                    {new Date(trip.end_date).toLocaleDateString('ko-KR')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
