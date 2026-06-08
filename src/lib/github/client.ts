import { Octokit } from '@octokit/rest'

/**
 * GitHub Octokit Client
 * 用于与 GitHub API 交互，支持文件读写操作
 */

// 默认配置（从环境变量读取）
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO // 格式: owner/repo

/**
 * 创建 Octokit 实例
 */
function getOctokit(): Octokit {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set')
  }
  
  return new Octokit({
    auth: GITHUB_TOKEN,
  })
}

/**
 * 从 GITHUB_REPO 环境变量解析 owner 和 repo
 */
export function parseRepoString(repoString?: string): { owner: string; repo: string } {
  const repo = repoString || GITHUB_REPO
  if (!repo) {
    throw new Error('GitHub repository not configured. Set GITHUB_REPO environment variable (format: owner/repo)')
  }
  
  const parts = repo.split('/')
  if (parts.length !== 2) {
    throw new Error(`Invalid GITHUB_REPO format: "${repo}". Expected format: owner/repo`)
  }
  
  return { owner: parts[0], repo: parts[1] }
}

/**
 * 获取文件当前的 SHA（用于更新文件）
 */
async function getFileSha(
  owner: string,
  repo: string,
  path: string,
  ref: string = 'main'
): Promise<string | null> {
  try {
    const octokit = getOctokit()
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    })
    
    if ('sha' in response.data) {
      return response.data.sha
    }
    return null
  } catch (error: unknown) {
    // 404 表示文件不存在，这是正常的
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 404) {
      return null
    }
    throw error
  }
}

/**
 * 创建或更新文件
 * 如果文件存在则更新，不存在则创建
 */
export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string,
  options?: {
    owner?: string
    repo?: string
    branch?: string
    encoding?: 'utf-8' | 'base64'
  }
): Promise<{ success: boolean; sha?: string; url?: string }> {
  const { owner, repo } = parseRepoString(options?.owner && options?.repo ? `${options.owner}/${options.repo}` : undefined)
  const branch = options?.branch || 'main'
  
  const octokit = getOctokit()
  
  // 获取当前文件的 SHA（如果存在）
  const existingSha = await getFileSha(owner, repo, path, branch)
  
  // 编码内容
  const encodedContent = options?.encoding === 'base64'
    ? content
    : Buffer.from(content).toString('base64')
  
  try {
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encodedContent,
      sha: existingSha || undefined, // 更新时需要 SHA，创建时不需要
      branch,
      encoding: options?.encoding || 'base64',
    })
    
    return {
      success: true,
      sha: response.data.content?.sha,
      url: response.data.content?.html_url,
    }
  } catch (error) {
    console.error(`Failed to create/update file ${path}:`, error)
    throw error
  }
}

/**
 * 获取文件内容
 */
export async function getFileContent(
  path: string,
  options?: {
    owner?: string
    repo?: string
    branch?: string
  }
): Promise<{ content: string; sha: string; encoding: string } | null> {
  const { owner, repo } = parseRepoString(options?.owner && options?.repo ? `${options.owner}/${options.repo}` : undefined)
  const ref = options?.branch || 'main'
  
  try {
    const octokit = getOctokit()
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    })
    
    if (!('content' in response.data)) {
      return null
    }
    
    const content = response.data.content?.replace(/\n/g, '') || ''
    const decoded = Buffer.from(content, 'base64').toString('utf-8')
    
    return {
      content: decoded,
      sha: response.data.sha || '',
      encoding: 'utf-8',
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 404) {
      return null
    }
    throw error
  }
}

/**
 * 删除文件
 */
export async function deleteFile(
  path: string,
  message: string,
  options?: {
    owner?: string
    repo?: string
    branch?: string
  }
): Promise<boolean> {
  const { owner, repo } = parseRepoString(options?.owner && options?.repo ? `${options.owner}/${options.repo}` : undefined)
  const branch = options?.branch || 'main'
  
  const octokit = getOctokit()
  
  // 获取文件 SHA
  const sha = await getFileSha(owner, repo, path, branch)
  if (!sha) {
    console.warn(`File ${path} does not exist, nothing to delete`)
    return false
  }
  
  try {
    await octokit.rest.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha,
      branch,
    })
    return true
  } catch (error) {
    console.error(`Failed to delete file ${path}:`, error)
    throw error
  }
}

export { getOctokit }
