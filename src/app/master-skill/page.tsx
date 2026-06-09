'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Code2,
  Sparkles,
  Globe,
  MessageSquare,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Bot,
  CheckCircle,
  Users,
  MapPin,
  Clock,
  Star,
  Menu,
} from 'lucide-react'
import { useState } from 'react'

function CodeBlock({
  code,
  language,
  onCopy,
}: {
  code: string
  language: string
  onCopy?: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="bg-zinc-900 dark:bg-black text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm border border-zinc-800">
        <code>{code}</code>
      </pre>
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-3 right-3"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1 text-green-500" />
            已复制
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            复制
          </>
        )}
      </Button>
      <div className="absolute top-3 left-3">
        <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300 border-0">
          {language}
        </Badge>
      </div>
    </div>
  )
}

export default function MasterSkillPage() {
  const githubOwner = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'Cap-bit-mint'
  const githubRepo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'Local_Skill'
  const claudeInstallCommand = `claude mcp add localskill https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/main/master-skill.json`

  const [installSuccess, setInstallSuccess] = useState(false)

  const handleCopyCommand = () => {
    setInstallSuccess(true)
    setTimeout(() => setInstallSuccess(false), 3000)
  }

  const usageExamples = [
    {
      title: '查找附近餐厅',
      example: '"附近有什么好吃的川菜馆？"',
      icon: '🍜',
    },
    {
      title: '获取营业时间',
      example: '"老北京炸酱面馆几点关门？"',
      icon: '🕐',
    },
    {
      title: '查看菜单和招牌菜',
      example: '"这家店有什么招牌菜？"',
      icon: '📋',
    },
    {
      title: '获取联系方式',
      example: '"川味坊的电话是多少？"',
      icon: '📞',
    },
  ]

  const supportedAIs = [
    { name: 'Claude CLI', desc: 'Claude Code 官方命令行工具' },
    { name: 'Cline', desc: 'VS Code 插件，支持多 AI' },
    { name: 'Cursor', desc: 'AI 代码编辑器' },
    { name: 'Roo Code', desc: 'VS Code 中的 AI 编程助手' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">LocalSkill</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              返回控制台
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            消费者工具
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            全城商家查询助手
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            一键安装，让AI帮你查找附近所有好店、营业时间、菜单
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="#installation">
              <Button size="lg">
                开始安装
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard/merchants/new">
              <Button size="lg" variant="outline">
                我是商家
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-2">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">全平台覆盖</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                一键查询美团、大众点评、高德等平台的商家信息，无需在多个应用间切换
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-green-100 dark:bg-green-900/30 mb-2">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">自然语言交互</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                用日常对话方式查询："附近有什么川菜馆？"、"这家店营业到几点？"
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-2">
                <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">支持主流 AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Claude CLI、Cursor、Cline 等主流 AI 助手均可使用
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Installation Section */}
        <section id="installation" className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            一键安装
          </h2>

          <div className="space-y-8">
            {/* Claude CLI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5" />
                  Claude CLI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  如果你使用 Claude Code 或 Claude CLI，运行以下命令安装：
                </p>
                <CodeBlock
                  code={claudeInstallCommand}
                  language="bash"
                  onCopy={handleCopyCommand}
                />
                {installSuccess && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    安装命令已复制到剪贴板
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  安装完成后，你就可以通过自然语言查询商家信息了
                </p>
              </CardContent>
            </Card>

            {/* Supported AIs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  支持的 AI 助手
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {supportedAIs.map((ai) => (
                    <div key={ai.name} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-background rounded-lg">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{ai.name}</div>
                        <div className="text-xs text-muted-foreground">{ai.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            使用示例
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {usageExamples.map((example) => (
              <Card key={example.title} className="bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{example.icon}</span>
                    <div>
                      <h3 className="font-semibold mb-1">
                        {example.title}
                      </h3>
                      <p className="text-muted-foreground text-sm font-mono bg-muted px-2 py-1 rounded">
                        {example.example}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Demo Conversation */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            对话演示
          </h2>

          <Card className="bg-zinc-900 dark:bg-black border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-zinc-300" />
                </div>
                <div className="bg-zinc-800 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-md">
                  <p className="text-zinc-100 text-sm">附近有什么好吃的川菜馆？</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-zinc-800 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-md">
                  <p className="text-zinc-100 text-sm">找到3家附近的川菜馆：</p>
                </div>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 max-w-sm ml-11">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-100 font-medium">川味坊</span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-zinc-400 text-xs">4.8</span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">
                      招牌毛血旺、水煮鱼
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />10:00-22:00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="text-center pt-16 border-t">
          <h2 className="text-2xl font-bold mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-muted-foreground mb-8">
            安装全城商家查询助手，让 AI 帮你找好店
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#installation">
              <Button size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                立即安装
              </Button>
            </Link>
            <Link href="/dashboard/merchants/new">
              <Button size="lg" variant="outline">
                我是商家，立即入驻
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>LocalSkill</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
