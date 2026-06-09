'use client'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, language, className, showLineNumbers }: CodeBlockProps) {
  const { copy, copied } = useCopyToClipboard()

  const lines = code.split('\n')

  return (
    <div className={cn('relative group', className)}>
      <pre className="bg-zinc-900 dark:bg-black text-zinc-100 rounded-lg p-4 overflow-x-auto text-sm font-mono border border-zinc-800">
        {showLineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-zinc-900/50 dark:bg-black/50 border-r border-zinc-800 flex flex-col pt-4">
            {lines.map((_, i) => (
              <span key={i} className="px-2 text-right text-zinc-600 select-none">
                {i + 1}
              </span>
            ))}
          </div>
        )}
        <code className={cn(showLineNumbers && 'pl-14')}>{code}</code>
      </pre>
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8"
        onClick={() => copy(code)}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            已复制
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 mr-1" />
            复制
          </>
        )}
      </Button>
    </div>
  )
}
