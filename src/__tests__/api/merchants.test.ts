import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/merchants/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'merchant-123', name: '测试商家', status: 'pending' },
          error: null,
        }),
      }),
    }),
  }),
}))

describe('Merchants API - GET', () => {
  it('should return merchants list', async () => {
    const request = new NextRequest('http://localhost:3000/api/merchants')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('pagination')
  })

  it('should filter by status', async () => {
    const request = new NextRequest('http://localhost:3000/api/merchants?status=completed')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('should paginate results', async () => {
    const request = new NextRequest('http://localhost:3000/api/merchants?page=1&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(10)
  })
})

describe('Merchants API - POST', () => {
  it('should create merchant with URL', async () => {
    const request = new NextRequest('http://localhost:3000/api/merchants', {
      method: 'POST',
      body: JSON.stringify({
        source_url: 'https://www.meituan.com/shop/123',
        source_type: 'meituan',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id')
    expect(data.name).toBe('测试商家')
  })

  it('should reject without source_type', async () => {
    const request = new NextRequest('http://localhost:3000/api/merchants', {
      method: 'POST',
      body: JSON.stringify({
        source_url: 'https://example.com',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})
