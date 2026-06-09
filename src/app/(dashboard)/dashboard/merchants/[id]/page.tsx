'use client'

import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Star, Clock, ExternalLink, ArrowLeft, Loader2, RefreshCw, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Merchant = {
  id: string
  name: string
  source_url: string | null
  source_type: string | null
  location_city: string | null
  location_district: string | null
  location_address: string | null
  phone: string | null
  rating: number | null
  avg_price: number | null
  business_hours: Record<string, string> | null
  status: string
  created_at: string
}

type ParseTask = {
  id: string
  merchant_id: string
  task_type: string
  status: string
  parse_result: Record<string, unknown> | null
  error_info: Record<string, unknown> | null
  created_at: string
}

const statusConfig: Record<string, { label: string; className: string; description: string }> = {
  pending: { label: '需要我确认', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', description: '等待 AI 分析' },
  processing: { label: 'AI分析中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', description: '正在提取商家信息...' },
  completed: { label: '已确认', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', description: '分析完成，请确认信息' },
  failed: { label: '分析失败', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', description: '分析失败，请重试' },
  archived: { label: '已成功上线', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', description: '已发布到云端，AI可以推荐' },
}

export default function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const supabase = createClient()

  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [task, setTask] = useState<ParseTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', id)
        .single()

      if (merchantError || !merchantData) {
        setError('店铺不存在或无权访问')
        setLoading(false)
        return
      }

      setMerchant(merchantData)

      const { data: taskData } = await supabase
        .from('parse_tasks')
        .select('*')
        .eq('merchant_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setTask(taskData)
      setLoading(false)
    } catch {
      setError('加载失败')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  useEffect(() => {
    if (!merchant || !task) return
    if (merchant.status === 'failed' || merchant.status === 'archived') {
      return
    }

    const interval = setInterval(async () => {
      await fetchData()
    }, 3000)

    return () => clearInterval(interval)
  }, [merchant?.status, task?.id])

  const handleRetry = async () => {
    if (!merchant) return
    setLoading(true)

    await supabase
      .from('parse_tasks')
      .insert({
        merchant_id: merchant.id,
        task_type: 'url_parse',
        input_type: 'url',
        input_value: merchant.source_url || '',
        status: 'queued',
      })

    await supabase
      .from('merchants')
      .update({ status: 'pending' })
      .eq('id', merchant.id)

    await fetchData()
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !merchant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">{error || '店铺不存在'}</p>
        <Link href="/dashboard/merchants">
          <Button variant="outline">
            返回列表
          </Button>
        </Link>
      </div>
    )
  }

  const config = statusConfig[merchant.status] || statusConfig.pending

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/merchants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </Link>
      </div>

      {/* 状态提示 */}
      {merchant.status === 'pending' && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">排队中</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">正在等待分析，预计 10-30 秒</p>
            </div>
          </CardContent>
        </Card>
      )}

      {merchant.status === 'processing' && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">正在分析...</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">AI 正在提取店铺信息，请稍候</p>
            </div>
          </CardContent>
        </Card>
      )}

      {merchant.status === 'failed' && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-900 dark:text-red-100">分析失败</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {(task?.error_info as { message?: string })?.message || '请检查链接是否正确，或稍后重试'}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      )}

      {merchant.status === 'completed' && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">分析完成</p>
              <p className="text-sm text-green-700 dark:text-green-300">店铺信息已提取完成，确认后即可发布</p>
            </div>
          </CardContent>
        </Card>
      )}

      {merchant.status === 'archived' && (
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <p className="font-medium text-purple-900 dark:text-purple-100">已成功上线</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">顾客可以通过AI助手找到你的店铺了</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 店铺信息卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl">{merchant.name}</CardTitle>
            <Badge className={config.className}>{config.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {merchant.source_url && (
            <div>
              <a
                href={merchant.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                查看来源
              </a>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {merchant.location_city && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">地址</div>
                  <div>{merchant.location_city} {merchant.location_district} {merchant.location_address}</div>
                </div>
              </div>
            )}

            {merchant.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">电话</div>
                  <div>{merchant.phone}</div>
                </div>
              </div>
            )}

            {merchant.rating && (
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">评分</div>
                  <div>{merchant.rating} 分</div>
                </div>
              </div>
            )}

            {merchant.avg_price && (
              <div>
                <div className="text-sm text-muted-foreground">人均消费</div>
                <div>¥{merchant.avg_price}</div>
              </div>
            )}
          </div>

          {merchant.business_hours && Object.keys(merchant.business_hours).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">营业时间</span>
              </div>
              <div className="text-sm">
                {Object.entries(merchant.business_hours).map(([day, time]) => (
                  <div key={day} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{day}</span>
                    <span>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Link href={`/dashboard/merchants/${merchant.id}/edit`}>
              <Button variant="outline">
                编辑信息
              </Button>
            </Link>
            <Link href={`/dashboard/merchants/${merchant.id}/publish`}>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                发布到云端
              </Button>
            </Link>
          </div>

          {merchant.status === 'archived' && merchant.source_url && (
            <div className="pt-4 border-t">
              <a
                href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER || 'Cap-bit-mint'}/${process.env.NEXT_PUBLIC_GITHUB_REPO || 'Local_Skill'}/tree/main/skills/${merchant.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  在 GitHub 查看
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
