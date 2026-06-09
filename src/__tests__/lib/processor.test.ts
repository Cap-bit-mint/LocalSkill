import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createParseTask, ParseTaskProcessor } from '@/lib/parse/processor'

// Mock Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    }),
  }),
}))

describe('Parse Task Processor', () => {
  describe('createParseTask', () => {
    it('should create a URL parse task', async () => {
      const taskId = await createParseTask({
        merchantId: 'merchant-123',
        taskType: 'url_parse',
        inputType: 'url',
        inputValue: 'https://example.com/shop/123',
        priority: 1,
      })

      expect(taskId).toBeDefined()
      expect(typeof taskId).toBe('string')
    })

    it('should create an image parse task', async () => {
      const taskId = await createParseTask({
        merchantId: 'merchant-123',
        taskType: 'image_parse',
        inputType: 's3_path',
        inputValue: 'screenshots/merchant-123.png',
      })

      expect(taskId).toBeDefined()
    })

    it('should throw without required fields', async () => {
      await expect(
        createParseTask({
          taskType: 'url_parse',
          inputType: 'url',
          inputValue: '',
        } as Parameters<typeof createParseTask>[0])
      ).rejects.toThrow()
    })
  })

  describe('ParseTaskProcessor', () => {
    let processor: ParseTaskProcessor

    beforeEach(() => {
      processor = new ParseTaskProcessor()
    })

    it('should create processor with options', () => {
      const processorWithOptions = new ParseTaskProcessor({
        onTaskStart: vi.fn(),
        onTaskComplete: vi.fn(),
        onTaskFail: vi.fn(),
      })

      expect(processorWithOptions).toBeDefined()
    })

    it('should poll empty queue without error', async () => {
      await expect(processor.pollQueue()).resolves.not.toThrow()
    })
  })
})
