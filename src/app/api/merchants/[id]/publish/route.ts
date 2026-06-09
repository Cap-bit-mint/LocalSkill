import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateFile, getFileContent } from '@/lib/github/client'
import {
  generateAllSkillFiles,
  generateDirectoryEntry,
  generateSkillName,
} from '@/lib/skill-generator'
import type { Merchant } from '@/types/database'
import type { DirectoryEntry } from '@/lib/skill-generator'

interface DirectoryJson {
  version: string
  skills: DirectoryEntry[]
  updated_at: string
}

async function updateDirectoryJson(
  newEntry: DirectoryEntry,
  owner: string,
  repo: string,
  branch: string
): Promise<void> {
  const dirPath = 'directory.json'
  
  // Get existing directory.json
  const existing = await getFileContent(dirPath, { owner, repo, branch })
  
  let directory: DirectoryJson
  
  if (existing) {
    try {
      directory = JSON.parse(existing.content)
    } catch {
      directory = { version: '1.0.0', skills: [], updated_at: new Date().toISOString() }
    }
  } else {
    directory = { version: '1.0.0', skills: [], updated_at: new Date().toISOString() }
  }
  
  // Remove existing entry if updating
  directory.skills = directory.skills.filter(
    s => s.path !== newEntry.path
  )
  
  // Add new entry
  directory.skills.push(newEntry)
  directory.updated_at = new Date().toISOString()
  
  // Write back
  await createOrUpdateFile(
    dirPath,
    JSON.stringify(directory, null, 2),
    `chore: add ${newEntry.name} to directory`,
    { owner, repo, branch }
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 获取商家信息
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .eq('auth_user_id', user.id)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ error: '商家不存在' }, { status: 404 })
  }

  if (merchant.status !== 'completed') {
    return NextResponse.json({ 
      error: '商家信息未确认，无法发布',
      detail: `当前状态: ${merchant.status}`
    }, { status: 400 })
  }

  // 合并 verified_data 和 raw_data
  const merchantData = {
    ...merchant,
    ...(merchant.verified_data as Partial<Merchant> || {}),
    ...(merchant.raw_data as Partial<Merchant> || {}),
  } as Merchant

  // 生成 skill 名称
  const skillName = generateSkillName(merchantData)
  const skillPath = `skills/${skillName}`

  const owner = process.env.GITHUB_OWNER || 'localskill'
  const repo = process.env.GITHUB_REPO || 'skills'
  const branch = process.env.GITHUB_BRANCH || 'main'

  try {
    // 生成所有 Skill 文件
    const files = generateAllSkillFiles(merchantData)

    // 并行创建所有文件
    await Promise.all([
      createOrUpdateFile(
        `${skillPath}/SKILL.md`,
        files['SKILL.md'],
        `feat: add skill for ${merchant.name}`,
        { owner, repo, branch }
      ),
      createOrUpdateFile(
        `${skillPath}/skill.json`,
        files['skill.json'],
        `feat: add skill.json for ${merchant.name}`,
        { owner, repo, branch }
      ),
      createOrUpdateFile(
        `${skillPath}/data/info.json`,
        files['data/info.json'],
        `feat: add merchant data for ${merchant.name}`,
        { owner, repo, branch }
      ),
    ])

    // 更新 directory.json
    const directoryEntry = generateDirectoryEntry(merchantData)
    await updateDirectoryJson(directoryEntry, owner, repo, branch)

    // 创建 skills 表记录
    const { data: skillRecord, error: skillError } = await adminClient
      .from('skills')
      .insert({
        merchant_id: id,
        skill_name: skillName,
        skill_version: '1.0.0',
        mcp_config: {
          type: 'http',
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localskill.ai'}/api/mcp/${id}`,
        },
        capabilities: JSON.parse(files['skill.json']).capabilities,
        visibility: 'public',
        github_repo: `${owner}/${repo}`,
        github_path: skillPath,
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (skillError) {
      console.error('Failed to create skill record:', skillError)
    }

    // 更新商家状态
    await supabase
      .from('merchants')
      .update({ status: 'archived' })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      skill_name: skillName,
      skill_path: skillPath,
      skill_id: skillRecord?.id,
      github_url: `https://github.com/${owner}/${repo}/tree/${branch}/${skillPath}`,
      directory_url: `https://github.com/${owner}/${repo}/blob/${branch}/directory.json`,
    })
  } catch (error) {
    console.error('发布失败:', error)
    return NextResponse.json({ 
      error: '发布失败，请重试',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
