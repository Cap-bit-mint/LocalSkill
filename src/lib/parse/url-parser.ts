import { createClient } from '@/lib/supabase/server'
import type { MerchantInsert } from '@/types/database'

const AI_BASE_URL = (process.env.CLAUDE_BASE_URL || 'https://api.anthropic.com').replace(/\/v1$/, '')
const AI_API_KEY = process.env.CLAUDE_API_KEY
const AI_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'

// Check if API key is configured
if (!AI_API_KEY) {
  console.warn('[url-parser] WARNING: CLAUDE_API_KEY is not configured!')
}

export interface ParsedMerchantData {
  name: string
  source_type: 'meituan' | 'dianping' | 'amap' | 'other'
  category: 'restaurant' | 'retail' | 'beauty' | 'repair' | 'other'
  location_city?: string
  location_district?: string
  location_address?: string
  phone?: string
  rating?: number
  avg_price?: number
  business_hours?: Record<string, string>
  raw_data: Record<string, unknown>
}

export async function fetchPageContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`)
  }

  const html = await response.text()

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.slice(0, 15000)
}

function detectSourceType(url: string): 'meituan' | 'dianping' | 'amap' | 'other' {
  if (url.includes('meituan.com')) return 'meituan'
  if (url.includes('dianping.com')) return 'dianping'
  if (url.includes('amap.com') || url.includes('gaode.com')) return 'amap'
  return 'other'
}

const PARSE_PROMPT = `你是一个商家信息提取专家。请从以下网页内容中提取商家信息。

要求：
1. 如果找不到某个字段，返回 null（不要编造）
2. 价格如果是范围（如"30-50元"），取平均值
3. 评分如果没有明确数字，返回 null

请以 JSON 格式返回，字段如下：
{
  "name": "商家名称",
  "category": "restaurant|retail|beauty|repair|other",
  "location_city": "城市",
  "location_district": "区域/区县",
  "location_address": "详细地址",
  "phone": "电话",
  "rating": 4.5,
  "avg_price": 100,
  "business_hours": {"monday": "09:00-22:00", ...},
  "raw_data": {}
}

以下是网页内容：
`

export async function parseUrl(url: string): Promise<ParsedMerchantData> {
  if (!AI_API_KEY) {
    throw new Error('CLAUDE_API_KEY is not configured')
  }

  const content = await fetchPageContent(url)
  const sourceType = detectSourceType(url)

  const response = await fetch(`${AI_BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: PARSE_PROMPT + content,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const resultText = data.content?.[0]?.text || ''
  const result = JSON.parse(resultText)

  return {
    name: result.name || '未知商家',
    source_type: sourceType,
    category: result.category || 'other',
    location_city: result.location_city,
    location_district: result.location_district,
    location_address: result.location_address,
    phone: result.phone,
    rating: result.rating,
    avg_price: result.avg_price,
    business_hours: result.business_hours,
    raw_data: result.raw_data || { source_url: url },
  }
}

export async function updateMerchantFromParse(
  merchantId: string,
  parsedData: ParsedMerchantData
): Promise<void> {
  const supabase = await createClient()

  const update: Partial<MerchantInsert> = {
    name: parsedData.name,
    source_type: parsedData.source_type,
    category: parsedData.category,
    location_city: parsedData.location_city,
    location_district: parsedData.location_district,
    location_address: parsedData.location_address,
    phone: parsedData.phone,
    rating: parsedData.rating,
    avg_price: parsedData.avg_price,
    business_hours: parsedData.business_hours as MerchantInsert['business_hours'],
    raw_data: parsedData.raw_data as MerchantInsert['raw_data'],
    status: 'completed',
    verified_at: new Date().toISOString(),
  }

  await supabase
    .from('merchants')
    .update(update)
    .eq('id', merchantId)
}
