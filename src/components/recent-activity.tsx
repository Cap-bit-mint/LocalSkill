'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Building2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'merchant_added' | 'parse_completed' | 'skill_published' | 'deploy_success'
  title: string
  description: string
  createdAt: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
  className?: string
}

// Mock data for demo
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'merchant_added',
    title: '新增商家',
    description: '川味坊已添加到平台',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'parse_completed',
    title: '信息解析完成',
    description: '川味坊的信息已成功解析',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: '3',
    type: 'skill_published',
    title: '店铺上线',
    description: '川味坊已成功上线AI推荐',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
]

const typeConfig = {
  merchant_added: {
    icon: Building2,
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  parse_completed: {
    icon: CheckCircle,
    color: 'text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  skill_published: {
    icon: Sparkles,
    color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  },
  deploy_success: {
    icon: CheckCircle,
    color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分钟前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}小时前`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}天前`
  }
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayActivities = mounted ? (activities.length > 0 ? activities : mockActivities) : []

  if (displayActivities.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">最近操作</h3>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          查看全部
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-3">
        {displayActivities.map((activity, index) => {
          const config = typeConfig[activity.type]
          const Icon = config.icon

          return (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg bg-card border transition-all duration-300',
                'hover:bg-accent/50 cursor-pointer',
                mounted && 'animate-in slide-in-from-right-4 fade-in'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'backwards',
              }}
            >
              <div className={cn('p-2 rounded-lg shrink-0', config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {formatTimeAgo(activity.createdAt)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Empty state component
export function EmptyActivityState() {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
        <Clock className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">暂无操作记录</p>
      <p className="text-xs text-muted-foreground mt-1">
        添加你的第一个店铺开始记录
      </p>
    </div>
  )
}
