import type { Merchant } from '@/types/database'

export interface GeneratedSkillFiles {
  'SKILL.md': string
  'skill.json': string
  'data/info.json': string
}

const CATEGORY_TEMPLATES = {
  restaurant: {
    triggers: ['点餐', '外卖', '餐厅推荐', '附近餐厅', '美食'],
    capabilities: [
      '查询菜单和价格',
      '预约座位',
      '下单外卖',
      '查看营业时间',
      '获取商家联系方式',
    ],
    description: '餐厅点餐和服务助手',
  },
  retail: {
    triggers: ['购物', '商品查询', '门店位置', '库存查询'],
    capabilities: [
      '查询商品信息',
      '查看价格和优惠',
      '查询门店位置',
      '查看库存情况',
    ],
    description: '零售购物助手',
  },
  beauty: {
    triggers: ['美容', '美发', '预约', '护肤'],
    capabilities: [
      '预约服务',
      '查看项目价格',
      '查询技师档期',
      '获取商家信息',
    ],
    description: '美容美发预约助手',
  },
  repair: {
    triggers: ['维修', '修理', '保养', '安装'],
    capabilities: [
      '预约维修服务',
      '查询维修进度',
      '获取报价',
      '联系技师',
    ],
    description: '维修服务助手',
  },
  other: {
    triggers: ['服务', '查询', '预约', '联系方式'],
    capabilities: [
      '查询商家信息',
      '联系商家',
      '预约服务',
      '获取地址和电话',
    ],
    description: '商家服务助手',
  },
}

export function generateSkillName(merchant: Merchant): string {
  const cityPrefix = merchant.location_city 
    ? merchant.location_city.replace(/市$/, '')
    : ''
  
  const name = merchant.name
    .replace(/[^\w\u4e00-\u9fa5]/g, '')
    .slice(0, 20)

  return `${cityPrefix}${name}`
}

export function generateSKILLMD(merchant: Merchant): string {
  const template = CATEGORY_TEMPLATES[merchant.category || 'other']
  
  const businessHoursText = merchant.business_hours
    ? Object.entries(merchant.business_hours as Record<string, string>)
        .map(([day, time]) => `${day}: ${time}`)
        .join('\n')
    : '营业时间请电话咨询'

  return `# ${merchant.name}

> ${template.description}

## 基本信息

- **地址**: ${merchant.location_address || '暂无'}
- **电话**: ${merchant.phone || '暂无'}
- **城市**: ${merchant.location_city || '暂无'}
- **区域**: ${merchant.location_district || '暂无'}
- **评分**: ${merchant.rating ? `${merchant.rating}分` : '暂无评分'}
- **人均**: ${merchant.avg_price ? `¥${merchant.avg_price}` : '暂无'}

## 营业时间

${businessHoursText}

## 功能说明

${template.capabilities.map(c => `- ${c}`).join('\n')}

## 使用示例

\`\`\`
用户: 附近有什么好吃的餐厅?
助手: 我可以帮您了解 ${merchant.name} 的菜品和预约服务。
\`\`\`

## 触发关键词

${template.triggers.map(t => `- ${t}`).join('\n')}
`
}

export interface SkillJsonConfig {
  name: string
  description: string
  category: string
  triggers: string[]
  capabilities: string[]
  mcpServers?: Record<string, unknown>[]
}

export function generateSkillJson(merchant: Merchant): string {
  const template = CATEGORY_TEMPLATES[merchant.category || 'other']
  const skillName = generateSkillName(merchant)

  const config: SkillJsonConfig = {
    name: skillName,
    description: template.description,
    category: merchant.category || 'other',
    triggers: template.triggers,
    capabilities: template.capabilities,
  }

  return JSON.stringify(config, null, 2)
}

export interface MerchantInfo {
  name: string
  source: string
  category: string
  address: string | null
  phone: string | null
  city: string | null
  district: string | null
  rating: number | null
  avgPrice: number | null
  businessHours: Record<string, string> | null
  sourceUrl: string | null
}

export function generateInfoJson(merchant: Merchant): string {
  const info: MerchantInfo = {
    name: merchant.name,
    source: merchant.source_type || 'other',
    category: merchant.category || 'other',
    address: merchant.location_address,
    phone: merchant.phone,
    city: merchant.location_city,
    district: merchant.location_district,
    rating: merchant.rating,
    avgPrice: merchant.avg_price,
    businessHours: merchant.business_hours as Record<string, string> | null,
    sourceUrl: merchant.source_url,
  }

  return JSON.stringify(info, null, 2)
}

export function generateAllSkillFiles(merchant: Merchant): GeneratedSkillFiles {
  return {
    'SKILL.md': generateSKILLMD(merchant),
    'skill.json': generateSkillJson(merchant),
    'data/info.json': generateInfoJson(merchant),
  }
}

// Generate directory.json entry for this skill
export interface DirectoryEntry {
  name: string
  path: string
  description: string
  category: string
  city?: string
  district?: string
  rating?: number
  publishedAt: string
}

export function generateDirectoryEntry(merchant: Merchant): DirectoryEntry {
  return {
    name: merchant.name,
    path: `skills/${generateSkillName(merchant)}`,
    description: CATEGORY_TEMPLATES[merchant.category || 'other'].description,
    category: merchant.category || 'other',
    city: merchant.location_city || undefined,
    district: merchant.location_district || undefined,
    rating: merchant.rating || undefined,
    publishedAt: new Date().toISOString(),
  }
}
