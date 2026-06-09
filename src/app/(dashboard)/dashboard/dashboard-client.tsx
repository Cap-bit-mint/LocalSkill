'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedStatCard } from '@/components/ui/animated-stat-card'
import { RecentActivity } from '@/components/recent-activity'
import {
  Building2,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Users,
  TrendingUp,
  FileText,
} from 'lucide-react'

interface StatsData {
  totalMerchants: number
  publishedMerchants: number
  pendingMerchants: number
  totalSkills: number
}

interface DashboardClientProps {
  stats: StatsData
}

function DashboardContent({ stats }: { stats: StatsData }) {
  const statsList = [
    {
      title: '我的店铺',
      value: stats.totalMerchants,
      icon: Building2,
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0,
    },
    {
      title: '已成功上线',
      value: stats.publishedMerchants,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
      delay: 100,
    },
    {
      title: '需要我确认',
      value: stats.pendingMerchants,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      delay: 200,
    },
    {
      title: '全平台店铺',
      value: stats.totalSkills,
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      delay: 300,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">欢迎回来</h1>
          <p className="text-muted-foreground mt-1">管理你的商家，让AI帮你找好店</p>
        </div>
        <Link href="/dashboard/merchants/new">
          <Button size="lg" className="shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            添加我的店铺
          </Button>
        </Link>
      </div>

      {/* 统计卡片 - 带动画 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat) => (
          <AnimatedStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
            delay={stat.delay}
          />
        ))}
      </div>

      {/* 快捷操作和最近活动 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧：快捷操作 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 快速开始 */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                  <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">快速开始</CardTitle>
                  <p className="text-sm text-muted-foreground">3分钟让AI认识你的店</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">1</div>
                  <div className="text-sm">
                    <p className="font-medium">提交链接</p>
                    <p className="text-xs text-muted-foreground">复制店铺链接</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-medium">2</div>
                  <div className="text-sm">
                    <p className="font-medium">AI分析</p>
                    <p className="text-xs text-muted-foreground">自动提取信息</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-medium">3</div>
                  <div className="text-sm">
                    <p className="font-medium">一键发布</p>
                    <p className="text-xs text-muted-foreground">上线AI推荐</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                添加你的第一个商家，只需提供美团或大众点评的店铺链接，
                AI会自动分析并生成店铺介绍。
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard/merchants/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    添加我的店铺
                  </Button>
                </Link>
                <Link href="/dashboard/merchants">
                  <Button variant="outline">
                    查看全部
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 全城商家查询助手 */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">全城商家查询助手</CardTitle>
                  <p className="text-sm text-muted-foreground">让AI帮你查找附近好店</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">顾客主动发现</p>
                    <p className="text-xs text-muted-foreground">问AI"附近有什么好吃的"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">营业时间查询</p>
                    <p className="text-xs text-muted-foreground">AI直接回答"几点关门"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">智能推荐</p>
                    <p className="text-xs text-muted-foreground">根据位置和偏好推荐</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">权威信息来源</p>
                    <p className="text-xs text-muted-foreground">数据来自大众点评</p>
                  </div>
                </div>
              </div>
              <Link href="/master-skill">
                <Button variant="outline" className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  查看安装指南
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：最近操作 */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">最近操作</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface DashboardClientProps {
  stats: StatsData
}

export default function DashboardClient({ stats }: DashboardClientProps) {
  return <DashboardContent stats={stats} />
}
