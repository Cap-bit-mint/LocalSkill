import { NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github/client'

// Cache directory.json for 5 minutes
const CACHE_MAX_AGE = 60 * 5

export async function GET() {
  try {
    const owner = process.env.GITHUB_OWNER || 'localskill'
    const repo = process.env.GITHUB_REPO || 'skills'
    const branch = process.env.GITHUB_BRANCH || 'main'

    const fileContent = await getFileContent('directory.json', {
      owner,
      repo,
      branch,
    })

    if (!fileContent) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      )
    }

    // Parse and return the directory
    const directory = JSON.parse(fileContent.content)

    return NextResponse.json(directory, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`,
      },
    })
  } catch (error) {
    console.error('Failed to fetch directory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch directory' },
      { status: 500 }
    )
  }
}
