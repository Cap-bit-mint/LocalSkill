import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseUrl, fetchPageContent, detectSourceType } from '@/lib/parse/url-parser'

// Mock the anthropic client
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                name: '测试商家',
                category: 'restaurant',
                location_city: '北京',
                location_district: '朝阳',
                location_address: '测试地址123号',
                phone: '010-88888888',
                rating: 4.8,
                avg_price: 200,
                business_hours: { monday: '09:00-21:00' },
                raw_data: { source: 'test' },
              }),
            },
          ],
          id: 'msg_test',
          model: 'claude-sonnet-4-20250514',
          type: 'message',
          role: 'assistant',
        }),
      },
    })),
  }
})

describe('URL Parser', () => {
  describe('detectSourceType', () => {
    it('should detect meituan URL', () => {
      expect(detectSourceType('https://www.meituan.com/shop/123')).toBe('meituan')
      expect(detectSourceType('https://i.meituan.com/shop/123')).toBe('meituan')
    })

    it('should detect dianping URL', () => {
      expect(detectSourceType('https://www.dianping.com/shop/123')).toBe('dianping')
    })

    it('should detect amap URL', () => {
      expect(detectSourceType('https://www.amap.com/shop/123')).toBe('amap')
      expect(detectSourceType('https://m.amap.com/shop/123')).toBe('amap')
      expect(detectSourceType('https://www.gaode.com/shop/123')).toBe('amap')
    })

    it('should return other for unknown URLs', () => {
      expect(detectSourceType('https://www.example.com/shop/123')).toBe('other')
    })
  })

  describe('fetchPageContent', () => {
    it('should be defined', () => {
      expect(fetchPageContent).toBeDefined()
    })
  })

  describe('parseUrl', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it('should parse URL and return merchant data', async () => {
      const mockHtml = `
        <html>
          <head><title>测试商家</title></head>
          <body>
            <h1>商家名称</h1>
            <p>地址信息</p>
          </body>
        </html>
      `

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml),
      } as Response)

      const result = await parseUrl('https://www.meituan.com/shop/123')

      expect(result.name).toBe('测试商家')
      expect(result.source_type).toBe('meituan')
      expect(result.category).toBe('restaurant')
      expect(result.location_city).toBe('北京')
      expect(result.location_district).toBe('朝阳')
      expect(result.phone).toBe('010-88888888')
      expect(result.rating).toBe(4.8)
      expect(result.avg_price).toBe(200)
    })

    it('should handle fetch errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

      await expect(parseUrl('https://www.example.com/invalid')).rejects.toThrow()
    })
  })
})
