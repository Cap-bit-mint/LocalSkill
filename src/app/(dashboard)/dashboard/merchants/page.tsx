'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, MapPin, Calendar, Search, X, Building2, Sparkles } from 'lucide-react'

type Merchant = {
  id: string
  name: string
  status: string
  location_city: string | null
  location_district: string | null
  source_type: string | null
  rating: number | null
  created_at: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '需要我确认', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  processing: { label: 'AI分析中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: '已确认', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  failed: { label: '分析失败', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  archived: { label: '已成功上线', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
}

const statusBadgeVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'default',
  processing: 'secondary',
  completed: 'default',
  failed: 'destructive',
  archived: 'secondary',
}

export default function MerchantsPage() {
  const supabase = createClient()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const fetchMerchants = async () => {
    setLoading(true)
    let query = supabase
      .from('merchants')
      .select('*')
      .order('created_at', { ascending: false })

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    setMerchants(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMerchants()
  }, [statusFilter])

  // 自动刷新 pending 和 processing 状态的商家
  useEffect(() => {
    const hasProcessingMerchants = merchants.some(
      m => m.status === 'pending' || m.status === 'processing'
    )

    if (!hasProcessingMerchants) return

    const interval = setInterval(() => {
      fetchMerchants()
    }, 5000)

    return () => clearInterval(interval)
  }, [merchants])

  const filteredMerchants = merchants.filter((merchant) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      merchant.name.toLowerCase().includes(query) ||
      merchant.location_city?.toLowerCase().includes(query) ||
      merchant.location_district?.toLowerCase().includes(query)
    )
  })

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">商家管理</h1>
          <p className="text-muted-foreground mt-1">
            共 {filteredMerchants.length} 个店铺
          </p>
        </div>
        <Link href="/dashboard/merchants/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            添加我的店铺
          </Button>
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索店铺名称、地址..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            全部
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(key)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 商家列表 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : filteredMerchants.length > 0 ? (
        <div className="grid gap-4">
          {filteredMerchants.map((merchant) => {
            const config = statusConfig[merchant.status] || statusConfig.pending
            return (
              <Link key={merchant.id} href={`/dashboard/merchants/${merchant.id}`}>
                <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{merchant.name}</h3>
                          <Badge variant={statusBadgeVariants[merchant.status] || 'secondary'}>{config.label}</Badge>
                          {merchant.rating && (
                            <span className="text-sm text-yellow-500">⭐ {merchant.rating}</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          {merchant.location_city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {merchant.location_city}
                              {merchant.location_district && ` ${merchant.location_district}`}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(merchant.created_at).toLocaleDateString('zh-CN')}
                            {merchant.source_type && (
                              <span className="ml-2 text-muted-foreground/70">
                                · {merchant.source_type === 'meituan' ? '美团' :
                                   merchant.source_type === 'dianping' ? '大众点评' :
                                   merchant.source_type === 'amap' ? '高德' : '其他'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-muted-foreground ml-4">
                        →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            {/* 空状态插画 */}
            <div className="flex justify-center mb-6">
              {searchQuery ? (
                <div className="relative">
                  <div className="p-6 bg-muted rounded-full">
                    <Search className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
              ) : statusFilter ? (
                <div className="relative">
                  <div className="p-6 bg-muted rounded-full">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
                    <Building2 className="h-12 w-12 text-blue-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 p-2 bg-yellow-400 rounded-full">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {searchQuery ? (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  未找到相关店铺
                </h3>
                <p className="text-muted-foreground mb-6">
                  没有找到与 "{searchQuery}" 相关的店铺
                </p>
                <Button variant="outline" onClick={clearSearch}>
                  <X className="h-4 w-4 mr-2" />
                  清除搜索
                </Button>
              </>
            ) : statusFilter ? (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  没有{statusConfig[statusFilter]?.label}的店铺
                </h3>
                <p className="text-muted-foreground mb-6">
                  当前没有需要处理的店铺
                </p>
                <Button variant="outline" onClick={() => setStatusFilter(null)}>
                  查看全部店铺
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  还没有店铺
                </h3>
                <p className="text-muted-foreground mb-2">
                  添加你的第一个店铺，让顾客通过AI找到你
                </p>
                <p className="text-sm text-muted-foreground/70 mb-6">
                  只需提供美团或大众点评的店铺链接，3分钟完成
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/dashboard/merchants/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      添加我的店铺
                    </Button>
                  </Link>
                  <Link href="/master-skill">
                    <Button variant="outline">
                      <Sparkles className="h-4 w-4 mr-2" />
                      了解全城查询助手
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
