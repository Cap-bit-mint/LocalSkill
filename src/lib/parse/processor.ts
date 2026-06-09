import { createAdminClient } from '@/lib/supabase/admin'
import { parseUrl, updateMerchantFromParse } from './url-parser'
import { downloadAndParseImage } from './image-parser'
import type { ParseTask, ParseTaskUpdate } from '@/types/database'

const MAX_RETRIES = 3
const POLL_INTERVAL_MS = 2000

interface ProcessorOptions {
  onTaskStart?: (task: ParseTask) => void
  onTaskComplete?: (task: ParseTask, result: unknown) => void
  onTaskFail?: (task: ParseTask, error: Error) => void
}

export class ParseTaskProcessor {
  private supabase = createAdminClient()
  private running = false
  private options: ProcessorOptions

  constructor(options: ProcessorOptions = {}) {
    this.options = options
  }

  async pollQueue(): Promise<void> {
    if (this.running) return

    this.running = true
    try {
      // Find next queued task (highest priority first, oldest first)
      const { data: task, error } = await this.supabase
        .from('parse_tasks')
        .select('*')
        .eq('status', 'queued')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (error || !task) {
        // No tasks in queue
        return
      }

      await this.processTask(task as ParseTask)
    } finally {
      this.running = false
    }
  }

  private async processTask(task: ParseTask): Promise<void> {
    const startTime = Date.now()

    // Mark as running
    await this.updateTask(task.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    this.options.onTaskStart?.(task)

    try {
      let result: unknown

      if (task.task_type === 'url_parse') {
        result = await this.processUrlTask(task)
      } else if (task.task_type === 'image_parse') {
        result = await this.processImageTask(task)
      } else {
        throw new Error(`Unknown task type: ${task.task_type}`)
      }

      const costMs = Date.now() - startTime

      // Mark as completed
      await this.updateTask(task.id, {
        status: 'completed',
        parse_result: result as ParseTaskUpdate['parse_result'],
        completed_at: new Date().toISOString(),
        cost_ms: costMs,
      })

      // Update merchant if linked
      if (task.merchant_id && result) {
        await updateMerchantFromParse(
          task.merchant_id,
          result as Parameters<typeof updateMerchantFromParse>[1]
        )
      }

      this.options.onTaskComplete?.(task, result)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      await this.handleTaskError(task, err)
      this.options.onTaskFail?.(task, err)
    }
  }

  private async processUrlTask(task: ParseTask): Promise<ReturnType<typeof parseUrl>> {
    if (task.input_type !== 'url') {
      throw new Error(`Invalid input_type for url_parse: ${task.input_type}`)
    }

    return parseUrl(task.input_value)
  }

  private async processImageTask(task: ParseTask): Promise<ReturnType<typeof downloadAndParseImage>> {
    if (task.input_type !== 's3_path') {
      throw new Error(`Invalid input_type for image_parse: ${task.input_type}`)
    }

    return downloadAndParseImage(task.input_value)
  }

  private async handleTaskError(task: ParseTask, error: Error): Promise<void> {
    const newRetryCount = task.retry_count + 1

    if (newRetryCount < MAX_RETRIES) {
      // Requeue for retry
      await this.updateTask(task.id, {
        status: 'queued',
        retry_count: newRetryCount,
        error_info: {
          message: error.message,
          lastAttempt: new Date().toISOString(),
          retryCount: newRetryCount,
        } as ParseTaskUpdate['error_info'],
      })
    } else {
      // Mark as failed
      await this.updateTask(task.id, {
        status: 'failed',
        error_info: {
          message: error.message,
          failedAt: new Date().toISOString(),
          totalRetries: newRetryCount,
        } as ParseTaskUpdate['error_info'],
      })
    }
  }

  private async updateTask(
    id: string,
    updates: Partial<ParseTaskUpdate>
  ): Promise<void> {
    await this.supabase
      .from('parse_tasks')
      .update(updates)
      .eq('id', id)
  }
}

// Create a task in the queue
export async function createParseTask(params: {
  merchantId?: string
  taskType: 'url_parse' | 'image_parse' | 'refresh'
  inputType: 'url' | 'text' | 's3_path'
  inputValue: string
  priority?: number
}): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('parse_tasks')
    .insert({
      merchant_id: params.merchantId,
      task_type: params.taskType,
      input_type: params.inputType,
      input_value: params.inputValue,
      status: 'queued',
      priority: params.priority ?? 0,
      retry_count: 0,
      max_retries: MAX_RETRIES,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create parse task: ${error.message}`)
  }

  return data.id
}

// Run processor in a loop (for cron/background jobs)
export async function runProcessorLoop(options: ProcessorOptions = {}): Promise<void> {
  const processor = new ParseTaskProcessor(options)

  while (true) {
    try {
      await processor.pollQueue()
    } catch (error) {
      console.error('Processor error:', error)
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}
