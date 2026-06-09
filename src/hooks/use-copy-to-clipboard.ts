'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/toast'

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = useCallback(async (text: string, successMessage?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      toast.success(successMessage || '已复制到剪贴板')
      setTimeout(() => setCopied(null), resetDelay)
      return true
    } catch {
      toast.error('复制失败，请手动选择复制')
      return false
    }
  }, [resetDelay])

  return { copy, copied }
}
