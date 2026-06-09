import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseUrl } from '@/lib/parse/url-parser'
import { createParseTask } from '@/lib/parse/processor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, merchantId, async: isAsync = true } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    if (isAsync) {
      // Create async task in queue
      const taskId = await createParseTask({
        merchantId,
        taskType: 'url_parse',
        inputType: 'url',
        inputValue: url,
        priority: 1,
      })

      return NextResponse.json({
        success: true,
        task_id: taskId,
        status: 'queued',
        message: 'Parse task created. Poll /api/tasks/[id] for status.',
      })
    } else {
      // Sync parse
      const startTime = Date.now()
      const result = await parseUrl(url)
      const costMs = Date.now() - startTime

      return NextResponse.json({
        success: true,
        result,
        cost_ms: costMs,
      })
    }
  } catch (error) {
    console.error('URL parse error:', error)
    return NextResponse.json({
      error: 'Failed to parse URL',
      detail: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// GET: Check parse status or get result
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('task_id')

  if (!taskId) {
    return NextResponse.json({ error: 'task_id is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: task, error } = await supabase
    .from('parse_tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({
    task_id: task.id,
    status: task.status,
    result: task.status === 'completed' ? task.parse_result : null,
    error: task.status === 'failed' ? task.error_info : null,
    created_at: task.created_at,
    completed_at: task.completed_at,
    cost_ms: task.cost_ms,
  })
}
