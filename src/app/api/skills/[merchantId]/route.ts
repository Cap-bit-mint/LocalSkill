import { NextRequest, NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  const { merchantId } = await params

  try {
    const owner = process.env.GITHUB_OWNER || 'localskill'
    const repo = process.env.GITHUB_REPO || 'skills'
    const branch = process.env.GITHUB_BRANCH || 'main'

    // Get the info.json for this merchant
    const fileContent = await getFileContent(
      `skills/${merchantId}/data/info.json`,
      { owner, repo, branch }
    )

    if (!fileContent) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      )
    }

    const merchantData = JSON.parse(fileContent.content)

    // Return in MCP-compatible format
    return NextResponse.json({
      merchant: merchantData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch merchant data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merchant data' },
      { status: 500 }
    )
  }
}
