/**
 * Type Extensions for LocalSkill
 * 补充数据库类型，提供更方便的类型别名和接口
 */

export * from './database'

// ==================== Type Aliases ====================

/** 商家状态 */
export type MerchantStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'archived'

/** 数据来源 */
export type SourceType = 'meituan' | 'dianping' | 'amap' | 'other'

/** 商家分类 */
export type Category = 'restaurant' | 'retail' | 'beauty' | 'repair' | 'other'

/** 解析任务类型 */
export type TaskType = 'url_parse' | 'image_parse' | 'refresh'

/** 任务状态 */
export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed'

/** 部署状态 */
export type DeploymentStatus = 'pending' | 'pushing' | 'succeeded' | 'failed'

/** 技能可见性 */
export type SkillVisibility = 'private' | 'public'

// ==================== API Response Types ====================

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 带统计的响应 */
export interface StatsResponse {
  totalMerchants: number
  totalSkills: number
  totalParseTasks: number
  completedTasks: number
  failedTasks: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'merchant_added' | 'parse_completed' | 'skill_published' | 'deploy_success'
  title: string
  description: string
  createdAt: string
}

// ==================== Form Types ====================

/** 创建商家表单数据 */
export interface CreateMerchantForm {
  name: string
  sourceUrl: string
  sourceType: SourceType
  category: Category
}

/** 更新商家表单数据 */
export interface UpdateMerchantForm {
  name?: string
  category?: Category
  phone?: string
  locationCity?: string
  locationDistrict?: string
  locationAddress?: string
  businessHours?: Record<string, string>
}

/** 解析结果 */
export interface ParseResult {
  merchantInfo: {
    name: string
    phone?: string
    address?: string
    rating?: number
    avgPrice?: number
    businessHours?: Record<string, string>
  }
  rawData: Record<string, unknown>
  confidence: number
}

// ==================== UI Types ====================

/** 状态配置（用于 UI 显示） */
export interface StatusConfig {
  label: string
  color: string
  bgColor: string
}

/** 商家�态配置映射 */
export const merchantStatusConfig: Record<MerchantStatus, StatusConfig> = {
  pending: { label: '待处理', color: 'text-zinc-600', bgColor: 'bg-zinc-100' },
  processing: { label: '解析中', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { label: '失败', color: 'text-red-600', bgColor: 'bg-red-100' },
  archived: { label: '已归档', color: 'text-zinc-400', bgColor: 'bg-zinc-50' },
}

/** 任务状态配置映射 */
export const taskStatusConfig: Record<TaskStatus, StatusConfig> = {
  queued: { label: '排队中', color: 'text-zinc-600', bgColor: 'bg-zinc-100' },
  running: { label: '运行中', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { label: '失败', color: 'text-red-600', bgColor: 'bg-red-100' },
}

/** 数据来源配置映射 */
export const sourceTypeConfig: Record<SourceType, { label: string; icon: string }> = {
  meituan: { label: '美团', icon: '🏪' },
  dianping: { label: '大众点评', icon: '📍' },
  amap: { label: '高德地图', icon: '🗺️' },
  other: { label: '其他', icon: '📋' },
}

/** 商家分类配置映射 */
export const categoryConfig: Record<Category, { label: string; icon: string }> = {
  restaurant: { label: '餐饮', icon: '🍜' },
  retail: { label: '零售', icon: '🛒' },
  beauty: { label: '美容', icon: '💅' },
  repair: { label: '维修', icon: '🔧' },
  other: { label: '其他', icon: '📦' },
}

// ==================== Session Types ====================

/** 用户会话信息 */
export interface SessionUser {
  id: string
  email: string
  createdAt: string
}

/** 带商家的用户信息 */
export interface UserWithMerchant {
  id: string
  email: string
  createdAt: string
  merchant?: {
    id: string
    name: string
  }
}
