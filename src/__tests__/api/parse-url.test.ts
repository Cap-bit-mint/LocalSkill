import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/parse/url/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'task-123', status: 'queued' },
        error: null,
      }),
    }),
  }),
}))

vi.mock('@/lib/parse/processor', () => ({
  createParseTask: vi.fn().mockResolvedValue('task-123'),
}))

describe('Parse URL API', () => {
  describe('POST - Async Mode', () => {
    it('should create parse task for URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/parse/url', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.meituan.com/shop/123',
          async: true,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.task_id).toBeDefined()
      expect(data.status).toBe('queued')
    })

    it('should reject invalid URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/parse/url', {
        method: 'POST',
        body: JSON.stringify({
          url: 'not-a-valid-url',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should reject missing URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/parse/url', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })

  describe('GET - Check Status', () => {
    it('should return task status', async () => {
      const request = new NextRequest('http://localhost:3000/api/parse/url?task_id=task-123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.task_id).toBe('task-123')
      expect(data).toHaveProperty('status')
    })

    it('should reject without task_id', async () => {
      const request = new NextRequest('http://localhost:3000/api/parse/url')

      const response = await GET(request)

      expect(response.status).toBe(400)
    })
  })
})
