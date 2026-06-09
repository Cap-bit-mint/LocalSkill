import { createAdminClient } from '@/lib/supabase/admin'

const AI_BASE_URL = (process.env.CLAUDE_BASE_URL || 'https://api.anthropic.com').replace(/\/v1$/, '')
const AI_API_KEY = process.env.CLAUDE_API_KEY
const AI_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'

// Check if API key is configured
if (!AI_API_KEY) {
  console.warn('[image-parser] WARNING: CLAUDE_API_KEY is not configured!')
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

const IMAGE_PARSE_PROMPT = `你是一个商家信息提取专家。请从这张商家截图/图片中提取信息。

要求：
1. 如果找不到某个字段，返回 null（不要编造）
2. 价格如果是范围（如"30-50元"），取平均值
3. 评分如果没有明确数字，返回 null
4. 如果是商家详情截图，尽量提取完整信息

请以 JSON 格式返回，字段如下：
{
  "name": "商家名称",
  "category": "restaurant|retail|beauty|repair|other",
  "location_city": "城市（如北京）",
  "location_district": "区域/区县",
  "location_address": "详细地址",
  "phone": "电话",
  "rating": 4.5,
  "avg_price": 100,
  "business_hours": {"monday": "09:00-22:00", ...},
  "raw_data": {}
}

只返回 JSON，不要其他文字。`

async function callAIApi(content: { type: string; source?: { type: string; url?: string; media_type?: string; data?: string }; text?: string }[]): Promise<ParsedMerchantData> {
  if (!AI_API_KEY) {
    throw new Error('CLAUDE_API_KEY is not configured')
  }

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
          content,
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
    source_type: 'other',
    category: result.category || 'other',
    location_city: result.location_city,
    location_district: result.location_district,
    location_address: result.location_address,
    phone: result.phone,
    rating: result.rating,
    avg_price: result.avg_price,
    business_hours: result.business_hours,
    raw_data: result.raw_data || {},
  }
}

export async function parseImageFromUrl(imageUrl: string): Promise<ParsedMerchantData> {
  return callAIApi([
    {
      type: 'image',
      source: {
        type: 'url',
        url: imageUrl,
      },
    },
    {
      type: 'text',
      text: IMAGE_PARSE_PROMPT,
    },
  ])
}

export async function parseImageFromBase64(
  base64Data: string,
  mimeType: string = 'image/png'
): Promise<ParsedMerchantData> {
  return callAIApi([
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: mimeType,
        data: base64Data,
      },
    },
    {
      type: 'text',
      text: IMAGE_PARSE_PROMPT,
    },
  ])
}

export async function downloadAndParseImage(s3Path: string): Promise<ParsedMerchantData> {
  // Download image from S3/Supabase Storage
  const supabase = createAdminClient()

  // Extract bucket and path from s3Path (format: bucket/path)
  const [bucket, ...pathParts] = s3Path.split('/')
  const path = pathParts.join('/')

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error || !data) {
    throw new Error(`Failed to download image: ${error?.message || 'Unknown error'}`)
  }

  // Convert to base64
  const buffer = await data.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const detectedMimeType = data.type || 'image/png'

  return parseImageFromBase64(base64, detectedMimeType)
}
