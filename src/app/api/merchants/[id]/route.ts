import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { data: merchant, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .eq('auth_user_id', user.id)
    .single()

  if (error || !merchant) {
    return NextResponse.json({ error: '商家不存在' }, { status: 404 })
  }

  // 获取最新的解析任务
  const { data: task } = await supabase
    .from('parse_tasks')
    .select('*')
    .eq('merchant_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({ ...merchant, task })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const { verified_data, status, name, phone, location_city, location_district, location_address, rating, avg_price } = body

  const updateData: Record<string, unknown> = {}

  if (verified_data) {
    updateData.verified_data = verified_data
    updateData.verified_at = new Date().toISOString()
  }

  if (status) {
    updateData.status = status
  }

  // 更新基本信息
  if (name) updateData.name = name
  if (phone !== undefined) updateData.phone = phone
  if (location_city !== undefined) updateData.location_city = location_city
  if (location_district !== undefined) updateData.location_district = location_district
  if (location_address !== undefined) updateData.location_address = location_address
  if (rating !== undefined) updateData.rating = rating
  if (avg_price !== undefined) updateData.avg_price = avg_price

  updateData.updated_at = new Date().toISOString()

  const { data: merchant, error } = await supabase
    .from('merchants')
    .update(updateData)
    .eq('id', id)
    .eq('auth_user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(merchant)
}
