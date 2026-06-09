'use client'

import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react'
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
  description: string | null
  business_hours: Record<string, string> | null
  status: string
  verified_data: Record<string, unknown> | null
}

export default function EditMerchantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    description: '',
    businessHours: {} as Record<string, string>,
  })

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const { data, error: merchantError } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', id)
          .single()

        if (merchantError || !data) {
          setError('店铺不存在或无权访问')
          setLoading(false)
          return
        }

        setMerchant(data)

        // 合并 verified_data 和 raw_data（处理 JSON 字符串的情况）
        const parseJsonField = (field: unknown): Record<string, unknown> | null => {
          if (!field) return null
          if (typeof field === 'object') return field as Record<string, unknown>
          if (typeof field === 'string') {
            try {
              return JSON.parse(field)
            } catch {
              return null
            }
          }
          return null
        }

        const verifiedData = parseJsonField(data.verified_data)
        const rawData = parseJsonField(data.raw_data)

        const mergedData = {
          ...data,
          ...(verifiedData || {}),
          ...(rawData || {}),
        }

        setFormData({
          name: mergedData.name || '',
          phone: mergedData.phone || '',
          address: mergedData.location_address || '',
          city: mergedData.location_city || '',
          district: mergedData.location_district || '',
          description: (mergedData.description as string) || '',
          businessHours: (mergedData.business_hours as Record<string, string>) || {},
        })

        setLoading(false)
      } catch {
        setError('加载失败')
        setLoading(false)
      }
    }

    fetchMerchant()
  }, [id])

  const handleSave = async () => {
    if (!merchant || !formData.name || !formData.address) {
      setError('请填写店铺名称和地址')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('merchants')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          location_city: formData.city || null,
          location_district: formData.district || null,
          location_address: formData.address,
          description: formData.description || null,
          business_hours: Object.keys(formData.businessHours).length > 0 ? formData.businessHours : null,
          verified_data: {
            name: formData.name,
            phone: formData.phone,
            location_city: formData.city,
            location_district: formData.district,
            location_address: formData.address,
            description: formData.description,
            business_hours: formData.businessHours,
          },
        })
        .eq('id', merchant.id)

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('保存失败，请重试')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateBusinessHour = (period: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: { ...prev.businessHours, [period]: time },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !merchant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/dashboard/merchants">
          <Button variant="outline">
            返回列表
          </Button>
        </Link>
      </div>
    )
  }

  if (!merchant) return null

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* 返回按钮 */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/merchants/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回详情
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>编辑店铺信息</CardTitle>
          <CardDescription>修改和补充店铺信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 成功提示 */}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-900 dark:text-green-100 font-medium">保存成功！</span>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-900 dark:text-red-100">{error}</span>
            </div>
          )}

          {/* 基本信息 */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">店铺名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="输入店铺名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">联系电话</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="138-xxxx-xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">店铺地址 *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="详细地址"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">城市</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="如：北京"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">商圈/区域</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  placeholder="如：朝阳CBD"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">店铺简介</Label>
              <textarea
                id="description"
                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-y"
                placeholder="介绍一下你的店铺特色、招牌菜品等"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </div>

          {/* 营业时间 */}
          <div className="space-y-3">
            <Label>营业时间</Label>
            <div className="grid gap-2">
              {['周一至周五', '周六周日', '午市', '晚市'].map((period) => (
                <Input
                  key={period}
                  placeholder={`${period}：10:00-22:00`}
                  value={formData.businessHours[period] || ''}
                  onChange={(e) => updateBusinessHour(period, e.target.value)}
                />
              ))}
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.address}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存修改
                </>
              )}
            </Button>
            <Link href={`/dashboard/merchants/${id}`}>
              <Button variant="outline">
                取消
              </Button>
            </Link>
          </div>

          {/* 来源信息 */}
          {merchant.source_url && (
            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>信息来源：{merchant.source_type === 'meituan' ? '美团' : merchant.source_type === 'dianping' ? '大众点评' : merchant.source_type === 'amap' ? '高德地图' : '其他'}</p>
              <p className="truncate mt-1">{merchant.source_url}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
