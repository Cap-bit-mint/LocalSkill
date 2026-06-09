import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { parseUrl, updateMerchantFromParse } from '@/lib/parse/url-parser'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')

  let query = supabase
    .from('merchants')
    .select('*', { count: 'exact' })
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const { source_url, source_type } = body

  if (!source_type) {
    return NextResponse.json({ error: '缺少信息来源' }, { status: 400 })
  }

  // 创建商家记录
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .insert({
      auth_user_id: user.id,
      name: '待解析',
      source_url: source_url || null,
      source_type,
      status: 'processing', // 改为 processing 表示正在解析
    })
    .select()
    .single()

  if (merchantError) {
    return NextResponse.json({ error: merchantError.message }, { status: 500 })
  }

  // 同步解析 URL
  if (source_url) {
    try {
      // 检查 API Key 是否配置
      if (!process.env.CLAUDE_API_KEY) {
        // 没有 API Key，标记为待确认状态
        await supabase
          .from('merchants')
          .update({ status: 'completed', name: '待确认商家' })
          .eq('id', merchant.id)
      } else {
        // 执行解析
        const parsedData = await parseUrl(source_url)

        // 更新商家信息
        await updateMerchantFromParse(merchant.id, parsedData)
      }
    } catch (error) {
      console.error('[merchants POST] Parse error:', error)
      // 解析失败，标记状态
      await supabase
        .from('merchants')
        .update({
          status: 'failed',
          error_info: {
            message: error instanceof Error ? error.message : '解析失败',
            failedAt: new Date().toISOString(),
          }
        })
        .eq('id', merchant.id)
    }
  } else {
    // 没有 URL，标记为待确认
    await supabase
      .from('merchants')
      .update({ status: 'completed' })
      .eq('id', merchant.id)
  }

  // 获取更新后的商家信息
  const { data: updatedMerchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', merchant.id)
    .single()

  return NextResponse.json(updatedMerchant, { status: 201 })
}
