'use client'

import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, ExternalLink, CheckCircle, AlertCircle, Sparkles, Copy, GitBranch, FileText, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Merchant = {
  id: string
  name: string
  status: string
  source_url: string | null
  location_city: string | null
  location_district: string | null
  phone: string | null
  rating: number | null
}

interface PublishResult {
  success: boolean
  skill_name?: string
  skill_path?: string
  skill_id?: string
  github_url?: string
  directory_url?: string
  error?: string
  detail?: string
}

export default function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const supabase = createClient()

  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [result, setResult] = useState<PublishResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

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

        // 如果已经发布，直接显示结果
        if (data.status === 'archived') {
          setResult({
            success: true,
            skill_path: `skills/${data.id}`,
            github_url: `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER || 'Cap-bit-mint'}/${process.env.NEXT_PUBLIC_GITHUB_REPO || 'Local_Skill'}/tree/main/skills/${data.id}`,
          })
        }

        setLoading(false)
      } catch {
        setError('加载失败')
        setLoading(false)
      }
    }

    fetchMerchant()
  }, [id])

  const handlePublish = async () => {
    if (!merchant) return

    setPublishing(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`/api/merchants/${merchant.id}/publish`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '发布失败')
        if (data.detail) {
          setError(`${data.error}: ${data.detail}`)
        }
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setPublishing(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
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

      {/* 发布状态卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">发布到云端</CardTitle>
              <CardDescription>将店铺信息发布到 AI 助手网络</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 店铺信息 */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg">{merchant.name}</div>
            {merchant.location_city && (
              <div className="text-sm text-muted-foreground mt-1">
                {merchant.location_city} {merchant.location_district}
              </div>
            )}
          </div>

          {/* 当前状态 */}
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Badge
              className={
                merchant.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                merchant.status === 'archived' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }
            >
              {merchant.status === 'completed' ? '已确认' :
               merchant.status === 'archived' ? '已上线' : '待处理'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {merchant.status === 'completed' ? '可以发布了' :
               merchant.status === 'archived' ? '已成功发布' : '请先确认店铺信息'}
            </span>
          </div>

          {/* 发布成功结果 */}
          {result?.success && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900 dark:text-green-100">发布成功!</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  顾客可以通过 AI 助手找到你的店铺了
                </p>
              </div>

              {/* 链接卡片 */}
              <div className="space-y-3">
                {result.github_url && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <GitBranch className="h-4 w-4" />
                      GitHub 仓库
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={result.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all text-sm"
                      >
                        {result.github_url}
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(result.github_url!, 'github')}
                      >
                        {copied === 'github' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {result.directory_url && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      目录更新
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={result.directory_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all text-sm"
                      >
                        {result.directory_url}
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(result.directory_url!, 'directory')}
                      >
                        {copied === 'directory' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {result.skill_name && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      Skill 名称
                    </div>
                    <div className="font-mono text-sm">{result.skill_name}</div>
                  </div>
                )}
              </div>

              {/* 返回按钮 */}
              <div className="flex gap-3 pt-2">
                <Link href="/dashboard/merchants" className="flex-1">
                  <Button variant="outline" className="w-full">
                    返回列表
                  </Button>
                </Link>
                <Link href={`/dashboard/merchants/${id}`} className="flex-1">
                  <Button className="w-full">
                    查看详情
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-900 dark:text-red-100">发布失败</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* 发布按钮 */}
          {!result?.success && (
            <div className="space-y-3">
              {merchant.status === 'completed' && (
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full"
                  size="lg"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      发布中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      立即发布
                    </>
                  )}
                </Button>
              )}

              {merchant.status !== 'completed' && merchant.status !== 'archived' && (
                <div className="text-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  请先完成信息确认才能发布
                </div>
              )}

              {merchant.status === 'archived' && (
                <div className="text-center text-sm text-muted-foreground">
                  此店铺已成功发布
                </div>
              )}
            </div>
          )}

          {/* 发布说明 */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>• 发布后，AI 助手将能够在本地商家推荐中展示你的店铺</p>
            <p>• 店铺信息将同步到 GitHub 仓库供 AI 助手检索使用</p>
            <p>• 你可以随时编辑或更新店铺信息</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
