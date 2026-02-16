'use client'

import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Loader2 } from 'lucide-react'

export default function CoupleConnect() {
  const { user, couple, refreshCouple } = useAuth()
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 초대 코드 생성
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // 커플 생성 (초대 코드 생성)
  const handleCreateCouple = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const code = generateInviteCode()
      
      const { error: insertError } = await supabase
        .from('couples')
        .insert([
          {
            user1_id: user.id,
            invite_code: code,
          },
        ])

      if (insertError) throw insertError

      await refreshCouple()
      setSuccess(`초대 코드가 생성되었습니다: ${code}`)
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : '커플 생성에 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // 커플 연결 (초대 코드 입력)
  const handleJoinCouple = async () => {
    if (!user || !inviteCode.trim()) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 초대 코드로 커플 찾기
      const { data: coupleData, error: findError } = await supabase
        .from('couples')
        .select('*')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single()

      if (findError || !coupleData) {
        setError('유효하지 않은 초대 코드입니다.')
        setLoading(false)
        return
      }

      if (coupleData.user1_id === user.id) {
        setError('자신의 초대 코드입니다.')
        setLoading(false)
        return
      }

      if (coupleData.user2_id) {
        setError('이미 연결된 커플입니다.')
        setLoading(false)
        return
      }

      // 커플 연결
      const { error: updateError } = await supabase
        .from('couples')
        .update({ user2_id: user.id })
        .eq('id', coupleData.id)

      if (updateError) throw updateError

      await refreshCouple()
      setSuccess('커플 연결이 완료되었습니다!')
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : '커플 연결에 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // 이미 커플이 연결된 경우
  if (couple?.user2_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-rose-600 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-600" />
            커플 연결 완료
          </CardTitle>
          <CardDescription>
            함께 여행을 계획해 보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            서로 연결되었습니다!<br />
            이제 여행을 함께 계획할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  // 커플 생성 대기 중 (초대 코드 생성됨)
  if (couple && !couple.user2_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-rose-600 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            연결 대기 중
          </CardTitle>
          <CardDescription>
            파트너가 초대 코드를 입력할 때까지 기다려주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-rose-50 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">초대 코드</p>
            <p className="text-2xl font-bold text-rose-600 tracking-wider">
              {couple.invite_code}
            </p>
          </div>
          <p className="text-sm text-center text-gray-500">
            파트너에게 이 코드를 공유하세요
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-rose-600 flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-600" />
          커플 연결
        </CardTitle>
        <CardDescription>
          함께 여행을 계획할 파트너를 연결하세요
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">초대 코드 생성</TabsTrigger>
          <TabsTrigger value="join">초대 코드 입력</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{success}</div>
            )}
            <p className="text-sm text-gray-600">
              초대 코드를 생성하여 파트너에게 공유하세요.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateCouple}
              className="w-full bg-rose-600 hover:bg-rose-700"
              disabled={loading}
            >
              {loading ? '생성 중...' : '초대 코드 생성'}
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="join">
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{success}</div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="inviteCode" className="text-sm font-medium">
                초대 코드
              </label>
              <Input
                id="inviteCode"
                placeholder="예: ABCD1234"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleJoinCouple}
              className="w-full bg-rose-600 hover:bg-rose-700"
              disabled={loading || !inviteCode.trim()}
            >
              {loading ? '연결 중...' : '커플 연결하기'}
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
