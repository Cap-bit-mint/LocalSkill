'use client'

import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

interface CopyButtonProps {
  text: string
  successMessage?: string
  className?: string
  size?: 'sm' | 'default' | 'icon'
}

export function CopyButton({ text, successMessage, className, size = 'icon' }: CopyButtonProps) {
  const { copy, copied } = useCopyToClipboard()
  const isCopied = copied === text

  return (
    <Button
      variant="ghost"
      size={size === 'icon' ? 'icon' : 'sm'}
      className={className}
      onClick={() => copy(text, successMessage)}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : size !== 'icon' ? (
        <>
          <Copy className="h-3 w-3 mr-1" />
          复制
        </>
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">复制</span>
    </Button>
  )
}
