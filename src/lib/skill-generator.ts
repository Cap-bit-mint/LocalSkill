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

// 绝对禁止编造的内容列表
const FABRICATION_FORBIDDEN = [
  { key: 'price', label: '价格信息', desc: '人均价格、菜品价格等数值必须来自商家确认' },
  { key: 'business_hours_special', label: '特殊营业时间', desc: '特殊节假日营业时间不可推测' },
  { key: 'service_scope', label: '服务范围', desc: '是否提供外卖、预约等服务必须确认' },
  { key: 'contact_info', label: '联系方式', desc: '电话、微信等联系方式必须准确' },
  { key: 'location_detail', label: '位置信息', desc: '详细地址、楼层、门牌号必须核实' },
  { key: 'rating', label: '评分数据', desc: '评分只能引用原始数据，不可自行评定' },
  { key: 'menu_items', label: '菜品列表', desc: '菜单信息必须来自商家提供' },
]

export function generateSkillName(merchant: Merchant): string {
  const cityPrefix = merchant.location_city
    ? merchant.location_city.replace(/市$/, '')
    : ''

  const name = merchant.name
    .replace(/[^\w一-龥]/g, '')
    .slice(0, 20)

  return `${cityPrefix}${name}`
}

export function generateSKILLMD(merchant: Merchant): string {
  const template = CATEGORY_TEMPLATES[merchant.category || 'other']
  const sourceName = merchant.source_type === 'meituan' ? '美团'
    : merchant.source_type === 'dianping' ? '大众点评'
    : merchant.source_type === 'amap' ? '高德'
    : merchant.source_type || '第三方平台'

  const businessHoursText = merchant.business_hours
    ? Object.entries(merchant.business_hours as Record<string, string>)
        .map(([day, time]) => `${day}: ${time}`)
        .join('\n')
    : '营业时间请电话咨询'

  const updatedAt = merchant.updated_at
    ? new Date(merchant.updated_at).toLocaleDateString('zh-CN')
    : '未知'

  const fabricationTable = FABRICATION_FORBIDDEN.map(
    item => `| ${item.label} | ${item.desc} |`
  ).join('\n')

  return `# ${merchant.name}

> ${template.description}

---

## 重要声明

**数据来源**: 本文件中的商家信息由 AI 从 ${sourceName} 链接解析生成，数据可能存在误差。

**使用前请务必**:
1. **人工核实** - 所有 AI 解析的信息（地址、电话、营业时间等）必须经过商家确认
2. **只读使用** - 本 Skill 仅提供信息查询，不执行任何写操作
3. **如有疑问** - 请直接联系商家核实

---

## 基本信息

| 项目 | 内容 |
|------|------|
| **地址** | ${merchant.location_address || '暂无'} |
| **电话** | ${merchant.phone || '暂无'} |
| **城市** | ${merchant.location_city || '暂无'} |
| **区域** | ${merchant.location_district || '暂无'} |
| **评分** | ${merchant.rating ? `${merchant.rating}分` : '暂无评分'} |
| **人均** | ${merchant.avg_price ? `¥${merchant.avg_price}` : '暂无'} |
| **数据来源** | ${sourceName} |
| **更新时间** | ${updatedAt} |

## 营业时间

${businessHoursText}

---

## 绝对禁止事项

以下内容**绝对不能编造或推测**，必须以商家确认为准：

| 禁止事项 | 说明 |
|---------|------|
${fabricationTable}

---

## 功能说明

${template.capabilities.map(c => `- ${c}`).join('\n')}

## 使用示例

\`\`\`
用户: 这家店在哪里?
助手: ${merchant.name} 位于 ${merchant.location_address || '地址信息'}，联系电话 ${merchant.phone || '电话信息'}。

用户: 营业到几点?
助手: ${merchant.name} 的营业时间是 ${merchant.business_hours ? '见上方营业时间' : '请电话咨询'}。
      建议致电 ${merchant.phone || '商家电话'} 确认当天具体时间。

用户: 能预约吗?
助手: 关于预约服务，建议直接联系商家 ${merchant.phone || '商家电话'} 确认。
\`\`\`

## 触发关键词

${template.triggers.map(t => `- ${t}`).join('\n')}

---

**本文件由 LocalSkill 自动生成 | 生成时间: ${new Date().toLocaleString('zh-CN')}**
`
}

export interface SkillJsonConfig {
  $schema: string
  name: string
  version: string
  description: string
  source: string
  sourceUrl: string | null
  category: string
  triggers: string[]
  capabilities: {
    read: string[]
    write: string[]
  }
  safety: {
    humanVerificationRequired: boolean
    readonly: boolean
    fabricationForbidden: string[]
    warnings: string[]
  }
  tools: {
    name: string
    description: string
    readOnly: boolean
    returns: {
      type: string
      properties: Record<string, { type: string; description?: string; default?: string }>
    }
  }[]
  metadata: {
    generatedBy: string
    generatedAt: string
    verifiedAt: string | null
    verifiedBy: string | null
  }
}

export function generateSkillJson(merchant: Merchant): string {
  const template = CATEGORY_TEMPLATES[merchant.category || 'other']
  const skillName = generateSkillName(merchant)

  const config: SkillJsonConfig = {
    $schema: 'https://localskill.ai/schema/skill.json',
    name: skillName,
    version: '1.0.0',
    description: template.description,
    source: merchant.source_type || 'unknown',
    sourceUrl: merchant.source_url,
    category: merchant.category || 'other',
    triggers: template.triggers,
    capabilities: {
      read: [
        'query_address',
        'query_phone',
        'query_hours',
        'query_rating',
        'query_price',
      ],
      write: [],
    },
    safety: {
      humanVerificationRequired: true,
      readonly: true,
      fabricationForbidden: FABRICATION_FORBIDDEN.map(f => f.key),
      warnings: [
        'AI-parsed data must be verified by merchant',
        'Do not fabricate any business information',
        'Direct user to official contact for accuracy',
      ],
    },
    tools: [
      {
        name: 'getMerchantInfo',
        description: '获取商家基本信息（地址、电话、城市、区域）',
        readOnly: true,
        returns: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '商家名称' },
            address: { type: 'string', description: '详细地址' },
            phone: { type: 'string', description: '联系电话' },
            city: { type: 'string', description: '所在城市' },
            district: { type: 'string', description: '所在区域' },
          },
        },
      },
      {
        name: 'getBusinessHours',
        description: '获取商家营业时间',
        readOnly: true,
        returns: {
          type: 'object',
          properties: {
            hours: { type: 'object', description: '营业时间映射' },
            note: { type: 'string', description: '备注', default: '请电话确认' },
          },
        },
      },
      {
        name: 'getMerchantRating',
        description: '获取商家评分和价格信息',
        readOnly: true,
        returns: {
          type: 'object',
          properties: {
            rating: { type: 'number', description: '评分（1-5分）' },
            avgPrice: { type: 'number', description: '人均价格（元）' },
          },
        },
      },
    ],
    metadata: {
      generatedBy: 'LocalSkill',
      generatedAt: new Date().toISOString(),
      verifiedAt: merchant.verified_at || null,
      verifiedBy: null,
    },
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

// 导出禁止编造列表供外部使用
export { FABRICATION_FORBIDDEN }
