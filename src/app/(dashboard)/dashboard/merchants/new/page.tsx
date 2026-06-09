'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WizardProvider, useWizard } from '@/components/wizard-context'
import { Stepper } from '@/components/ui/stepper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react'

const steps = [
  { title: '提交店铺', description: '输入链接' },
  { title: '信息确认', description: '编辑内容' },
  { title: '预览效果', description: '测试对话' },
  { title: '发布成功', description: '上线运营' },
]

// 解析状态类型
type ParseStatus = 'idle' | 'submitting' | 'parsing' | 'completed' | 'failed'

function WizardContent() {
  const router = useRouter()
  const { currentStep, setCurrentStep, formData, updateFormData } = useWizard()
  const [isLoading, setIsLoading] = useState(false)
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle')

  // Step 1 - 提交 URL 或截图并等待解析
  const handleSubmitAndParse = async () => {
    const isImageMode = !formData.sourceUrl && formData.imageFile

    if (!formData.sourceUrl && !formData.imageFile) {
      toast.error(isImageMode ? '请上传截图' : '请输入店铺链接')
      return
    }

    setParseStatus('submitting')
    setIsLoading(true)

    try {
      let merchantId: string

      // 1. 创建商家记录
      if (isImageMode) {
        // 截图模式：先创建商家记录
        const response = await fetch('/api/merchants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_url: null,
            source_type: 'other',
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || '创建商家记录失败')
        }

        const merchantData = await response.json()
        merchantId = merchantData.id
        updateFormData({ merchantId })

        // 2. 上传图片并解析
        setParseStatus('parsing')
        toast.loading('正在上传并解析图片...')

        // 转换为 base64
        const reader = new FileReader()
        const imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(formData.imageFile!)
        })

        // 调用图片解析 API
        const parseResponse = await fetch('/api/parse/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            merchantId,
            async: false, // 同步解析
          }),
        })

        if (!parseResponse.ok) {
          const data = await parseResponse.json()
          console.error('[new/page] Parse API error:', data)
          throw new Error(data.error || data.detail || '图片解析失败')
        }

        const parseResult = await parseResponse.json()
        console.log('[new/page] Parse result:', parseResult)

        if (parseResult.success && parseResult.result) {
          // 解析成功，更新表单数据
          const result = parseResult.result
          console.log('[new/page] Updating form with:', result)
          updateFormData({
            name: result.name || '',
            phone: result.phone || '',
            address: result.location_address || '',
            city: result.location_city || '',
            district: result.location_district || '',
          })
          setParseStatus('completed')
          setCurrentStep(1)
          toast.success('解析完成！请确认信息')
          return
        } else {
          console.error('[new/page] Parse failed or no result:', parseResult)
          throw new Error(parseResult.error || parseResult.detail || '解析结果为空')
        }
      } else {
        // URL 模式：API 现在是同步解析，直接等待返回结果
        setParseStatus('parsing')
        toast.loading('正在解析链接...')

        const response = await fetch('/api/merchants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_url: formData.sourceUrl,
            source_type: formData.sourceType || 'other',
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || '提交失败')
        }

        const data = await response.json()
        updateFormData({ merchantId: data.id })

        // 检查解析状态
        if (data.status === 'completed') {
          // 解析成功，更新表单数据
          updateFormData({
            name: data.name || '',
            phone: data.phone || '',
            address: data.location_address || '',
            city: data.location_city || '',
            district: data.location_district || '',
          })
          setParseStatus('completed')
          setCurrentStep(1)
          toast.success('解析完成！请确认信息')
        } else if (data.status === 'failed') {
          setParseStatus('failed')
          const errorMsg = (data.error_info as { message?: string })?.message
          toast.error(errorMsg || '解析失败，请重试')
        } else {
          // 状态还是 processing（API Key 未配置）
          setParseStatus('completed')
          setCurrentStep(1)
          toast.warning('请手动填写店铺信息')
        }
      }
    } catch (err) {
      setParseStatus('failed')
      toast.error(err instanceof Error ? err.message : '提交失败')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 - 确认信息
  const handleConfirm = () => {
    if (!formData.name || !formData.address) {
      toast.error('请填写店铺名称和地址')
      return
    }
    setCurrentStep(2)
  }

  // Step 3 - 预览发布
  const handlePublish = async () => {
    setIsLoading(true)
    try {
      toast.loading('正在发布...')
      // 模拟发布
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success('发布成功！')
      setCurrentStep(3)
    } catch {
      toast.error('发布失败')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (formData.sourceUrl || formData.imageFile) && parseStatus !== 'parsing'
      case 1:
        return formData.name && formData.address
      case 2:
        return true
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep === 0) {
      handleSubmitAndParse()
    } else if (currentStep === 1) {
      handleConfirm()
    } else if (currentStep === 2) {
      handlePublish()
    } else {
      router.push('/dashboard/merchants')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Stepper */}
      <div className="hidden sm:block">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      {/* Mobile step indicator */}
      <div className="sm:hidden text-center">
        <div className="text-sm text-muted-foreground">
          步骤 {currentStep + 1} / {steps.length}
        </div>
        <div className="mt-2 font-medium">{steps[currentStep].title}</div>
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 0 && <Step1Submission parseStatus={parseStatus} />}
          {currentStep === 1 && <Step2Confirmation />}
          {currentStep === 2 && <Step3Preview />}
          {currentStep === 3 && <Step4Success />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || parseStatus === 'parsing'}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          上一步
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {isLoading || parseStatus === 'parsing' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {parseStatus === 'parsing' ? '解析中...' : '处理中...'}
            </>
          ) : currentStep === 3 ? (
            '完成'
          ) : (
            <>
              {currentStep === 0 ? '提交让AI分析' : '下一步'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Parse status indicator */}
      {parseStatus === 'parsing' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-card border shadow-lg rounded-full px-6 py-3 flex items-center gap-3 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm">AI 正在解析店铺信息...</span>
        </div>
      )}
    </div>
  )
}

// Step 1: Submission
function Step1Submission({ parseStatus }: { parseStatus: ParseStatus }) {
  const { formData, updateFormData } = useWizard()
  const [mode, setMode] = useState<'url' | 'image'>('url')

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">提交你的店铺信息</CardTitle>
        <p className="text-muted-foreground mt-2">
          复制美团、大众点评或高德地图的店铺页面链接，AI会自动帮你分析整理
        </p>
      </CardHeader>

      {/* Status indicator */}
      {parseStatus === 'parsing' && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">AI 正在解析中...</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">请稍候，预计需要 10-30 秒</p>
          </div>
        </div>
      )}

      {parseStatus === 'completed' && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">解析完成！</p>
            <p className="text-sm text-green-700 dark:text-green-300">点击"下一步"确认信息</p>
          </div>
        </div>
      )}

      {parseStatus === 'failed' && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-100">解析失败</p>
            <p className="text-sm text-red-700 dark:text-red-300">请检查链接是否正确，然后重试</p>
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'url' ? 'default' : 'outline'}
          onClick={() => setMode('url')}
          size="sm"
        >
          链接输入
        </Button>
        <Button
          variant={mode === 'image' ? 'default' : 'outline'}
          onClick={() => setMode('image')}
          size="sm"
        >
          截图上传
        </Button>
      </div>

      {mode === 'url' ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">信息来源</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'meituan', label: '美团' },
                { value: 'dianping', label: '大众点评' },
                { value: 'amap', label: '高德地图' },
                { value: 'other', label: '其他' },
              ].map((source) => (
                <Button
                  key={source.value}
                  variant={formData.sourceType === source.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFormData({ sourceType: source.value as any })}
                >
                  {source.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">店铺链接</label>
            <input
              type="url"
              placeholder="https://www.meituan.com/shop/xxx"
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              value={formData.sourceUrl || ''}
              onChange={(e) => updateFormData({ sourceUrl: e.target.value })}
              disabled={parseStatus === 'parsing' || parseStatus === 'submitting'}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>示例链接：</strong>
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• 美团商家页：meituan.com/shop/xxxx</li>
              <li>• 大众点评：dianping.com/shop/xxxx</li>
              <li>• 高德地图：gaode.com/place/xxxx</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              className="hidden"
              disabled={parseStatus === 'parsing'}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  updateFormData({ imageFile: file })
                }
              }}
            />
            <label htmlFor="image-upload" className={`cursor-pointer ${parseStatus === 'parsing' ? 'opacity-50' : ''}`}>
              {formData.imageFile ? (
                <div className="space-y-2">
                  <div className="text-green-600">
                    <CheckCircle className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-sm font-medium">{formData.imageFile.name}</p>
                  <p className="text-xs text-muted-foreground">点击更换图片</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-muted-foreground">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">点击上传截图</p>
                  <p className="text-xs text-muted-foreground">
                    支持 JPG、PNG 格式，建议使用美团/大众点评 App 截图
                  </p>
                </div>
              )}
            </label>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            截图功能解析速度较慢，建议使用链接输入
          </p>
        </div>
      )}
    </div>
  )
}

// Step 2: Confirmation & Edit
function Step2Confirmation() {
  const { formData, updateFormData } = useWizard()

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">确认并补充店铺信息</CardTitle>
        <p className="text-muted-foreground mt-2">
          AI 已从链接中提取了信息，请确认并补充遗漏的内容
        </p>
      </CardHeader>

      {/* AI Parsed Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-primary mb-2">
          <Sparkles className="h-4 w-4" />
          AI 已解析的信息
        </div>
        <p className="text-sm text-muted-foreground">
          {formData.sourceUrl ? `来源：${formData.sourceUrl}` : '已上传截图'}
        </p>
      </div>

      {/* Editable Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium mb-2 block">店铺名称 *</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="输入店铺名称"
            value={formData.name || ''}
            onChange={(e) => updateFormData({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">联系电话</label>
          <input
            type="tel"
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="138-xxxx-xxxx"
            value={formData.phone || ''}
            onChange={(e) => updateFormData({ phone: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-2 block">店铺地址 *</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="详细地址"
            value={formData.address || ''}
            onChange={(e) => updateFormData({ address: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">城市</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="如：北京"
            value={formData.city || ''}
            onChange={(e) => updateFormData({ city: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">商圈/区域</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="如：朝阳CBD"
            value={formData.district || ''}
            onChange={(e) => updateFormData({ district: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-2 block">店铺简介</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
            placeholder="介绍一下你的店铺特色、招牌菜品等"
            value={formData.description || ''}
            onChange={(e) => updateFormData({ description: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-2 block">营业时间</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {['周一至周五', '周六周日', '午市', '晚市'].map((period) => (
              <input
                key={period}
                type="text"
                className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={`${period}：10:00-22:00`}
                onChange={(e) => {
                  const hours = formData.businessHours || {}
                  updateFormData({
                    businessHours: { ...hours, [period]: e.target.value },
                  })
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 3: Preview & Test
function Step3Preview() {
  const { formData } = useWizard()
  const [testQuestion, setTestQuestion] = useState('')
  const [testResponse, setTestResponse] = useState('')

  const suggestedQuestions = [
    '这家店几点开门？',
    '有什么招牌菜？',
    '地址在哪里？',
  ]

  const handleTest = () => {
    const responses: Record<string, string> = {
      '这家店几点开门？': `${formData.name || '该店铺'}营业时间为 10:00-22:00，欢迎光临！`,
      '有什么招牌菜？': formData.description || '店铺主营特色美食，欢迎品尝！',
      '地址在哪里？': `${formData.city || ''}${formData.district || ''}${formData.address || '详细地址待补充'}`,
    }

    const response = responses[testQuestion] || `关于"${testQuestion}"，我来帮您查询...`
    setTestResponse(response)
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">预览效果</CardTitle>
        <p className="text-muted-foreground mt-2">
          查看生成的店铺介绍效果，并模拟顾客对话测试
        </p>
      </CardHeader>

      {/* Generated Skill Preview */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="font-medium">{formData.name || '店铺名称'}</div>
        <div className="text-sm text-muted-foreground">
          {formData.description || '店铺简介将在此展示...'}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {formData.phone && (
            <span className="bg-background px-2 py-1 rounded">☎ {formData.phone}</span>
          )}
          {formData.address && (
            <span className="bg-background px-2 py-1 rounded">📍 {formData.address}</span>
          )}
          {formData.businessHours && (
            <span className="bg-background px-2 py-1 rounded">🕐 营业中</span>
          )}
        </div>
      </div>

      {/* Test Conversation */}
      <div className="space-y-4">
        <label className="text-sm font-medium block">模拟对话测试</label>

        <div className="bg-zinc-900 dark:bg-black rounded-lg p-4 space-y-3">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              className="block w-full text-left px-3 py-2 rounded bg-zinc-800 text-zinc-100 text-sm hover:bg-zinc-700 transition-colors"
              onClick={() => {
                setTestQuestion(q)
                setTestResponse('')
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {testQuestion && (
          <div className="space-y-3">
            <div className="bg-primary/10 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">顾客问：</span> {testQuestion}
            </div>
            <button
              onClick={handleTest}
              className="text-sm text-primary hover:underline"
            >
              点击获取AI回答 →
            </button>
            {testResponse && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">AI回答：</span> {testResponse}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          💡 提示：发布后，顾客可以直接在AI助手中询问这些问题，AI会根据你提供的信息自动回答。
        </p>
      </div>
    </div>
  )
}

// Step 4: Success
function Step4Success() {
  const { formData } = useWizard()
  const { copy } = useCopyToClipboard()

  const shareText = `${formData.name || '我的店铺'}已上线AI推荐！

现在顾客可以直接问AI找到我们：
• 附近有什么好店？
• ${formData.name || '店铺'}几点开门？
• ${formData.name || '店铺'}有什么招牌菜？

让AI成为你的金牌销售 🚀`

  return (
    <div className="space-y-6 text-center">
      <div className="py-8">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">发布成功！</h2>
        <p className="text-muted-foreground">
          {formData.name || '你的店铺'}已成功上线，AI助手可以推荐你的店了
        </p>
      </div>

      {/* Share Text */}
      <div className="bg-muted/50 rounded-lg p-4 text-left">
        <div className="flex justify-between items-start mb-2">
          <label className="text-sm font-medium">分享文案</label>
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => copy(shareText, '已复制分享文案')}
          >
            一键复制
          </button>
        </div>
        <p className="text-sm whitespace-pre-line text-muted-foreground">
          {shareText}
        </p>
      </div>

      {/* Next Steps */}
      <div className="grid gap-4 sm:grid-cols-2 text-left">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-medium mb-2">查看店铺</h3>
          <p className="text-sm text-muted-foreground mb-3">
            在后台管理你的店铺信息
          </p>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/merchants'}>
            进入管理后台
          </Button>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-medium mb-2">添加更多店铺</h3>
          <p className="text-sm text-muted-foreground mb-3">
            让更多顾客通过AI找到你
          </p>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/merchants/new'}>
            <Plus className="h-4 w-4 mr-2" />
            添加新店铺
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NewMerchantWizard() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
