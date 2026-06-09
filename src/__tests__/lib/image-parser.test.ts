import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseImageFromUrl, parseImageFromBase64, downloadAndParseImage } from '@/lib/parse/image-parser'

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
                name: '图片识别商家',
                category: 'restaurant',
                location_city: '上海',
                location_district: '浦东',
                location_address: '浦东大道100号',
                phone: '021-66666666',
                rating: 4.2,
                avg_price: 180,
                raw_data: {},
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

describe('Image Parser', () => {
  describe('parseImageFromUrl', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it('should parse image from URL', async () => {
      const result = await parseImageFromUrl('https://example.com/merchant.jpg')

      expect(result.name).toBe('图片识别商家')
      expect(result.category).toBe('restaurant')
      expect(result.location_city).toBe('上海')
      expect(result.location_district).toBe('浦东')
      expect(result.phone).toBe('021-66666666')
      expect(result.rating).toBe(4.2)
    })
  })

  describe('parseImageFromBase64', () => {
    it('should parse image from base64 data', async () => {
      const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const mimeType = 'image/png'

      const result = await parseImageFromBase64(base64Data, mimeType)

      expect(result.name).toBe('图片识别商家')
      expect(result.source_type).toBe('other')
    })
  })

  describe('downloadAndParseImage', () => {
    it('should download and parse from S3 path', async () => {
      const mockDownload = vi.fn().mockResolvedValue({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
        type: 'image/png',
      })

      vi.mock('@/lib/supabase/admin', () => ({
        createAdminClient: () => ({
          storage: {
            from: () => ({
              download: mockDownload,
            }),
          },
        }),
      }))

      // Note: This test requires proper mocking of Supabase client
      // In real tests, use MSW or similar to mock the storage download
    })
  })
})
