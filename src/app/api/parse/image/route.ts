import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseImageFromUrl, parseImageFromBase64 } from '@/lib/parse/image-parser'
import { createParseTask } from '@/lib/parse/processor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, imageBase64, mimeType, merchantId, async: isAsync = true } = body

    console.log('[parse/image] Received request:', {
      hasImageUrl: !!imageUrl,
      hasImageBase64: !!imageBase64,
      base64Length: imageBase64?.length,
      merchantId,
      isAsync,
    })

    if (!imageUrl && !imageBase64) {
      return NextResponse.json({
        error: 'Either imageUrl or imageBase64 is required'
      }, { status: 400 })
    }

    if (isAsync) {
      // Create async task
      const inputType = imageUrl ? 'url' : 'text'
      const inputValue = imageUrl || imageBase64

      const taskId = await createParseTask({
        merchantId,
        taskType: 'image_parse',
        inputType,
        inputValue,
        priority: 1,
      })

      return NextResponse.json({
        success: true,
        task_id: taskId,
        status: 'queued',
        message: 'Image parse task created. Poll /api/parse/image?task_id=xxx for status.',
      })
    } else {
      // Sync parse
      const startTime = Date.now()

      // Check if API key is configured
      if (!process.env.CLAUDE_API_KEY) {
        throw new Error('AI API 未配置，请联系管理员配置 CLAUDE_API_KEY 环境变量')
      }

      let result
      if (imageUrl) {
        result = await parseImageFromUrl(imageUrl)
      } else if (imageBase64) {
        // Strip data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
        result = await parseImageFromBase64(base64Data, mimeType || 'image/png')
      }

      const costMs = Date.now() - startTime
      console.log('[parse/image] Parse result:', result)

      return NextResponse.json({
        success: true,
        result,
        cost_ms: costMs,
      })
    }
  } catch (error) {
    console.error('[parse/image] Error:', error)
    return NextResponse.json({
      error: 'Failed to parse image',
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
