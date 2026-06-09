'use client'

import * as React from 'react'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'loading' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (opts: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
  promise: <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) => Promise<T>
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).slice(2, 9)
    const duration = opts.duration ?? (opts.type === 'loading' ? Infinity : 4000)

    setToasts((prev) => [...prev, { ...opts, id, duration }])

    if (duration !== Infinity) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }, [dismiss])

  const promise = useCallback(async <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ): Promise<T> => {
    const id = toast({ type: 'loading', title: messages.loading, duration: Infinity })

    try {
      const result = await promise
      dismiss(id)
      toast({ type: 'success', title: messages.success })
      return result
    } catch {
      dismiss(id)
      toast({ type: 'error', title: messages.error })
      throw new Error(messages.error)
    }
  }, [toast, dismiss])

  // Update global toast function
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__localSkillToast = toast
      ;(window as any).__localSkillToastPromise = promise
    }
  }, [toast, promise])

  if (!mounted) return <>{children}</>

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, promise }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience export helpers
export const toast = {
  success: (title: string, description?: string) => {
    if (typeof window !== 'undefined' && (window as any).__localSkillToast) {
      ;(window as any).__localSkillToast({ type: 'success', title, description })
    }
  },
  error: (title: string, description?: string) => {
    if (typeof window !== 'undefined' && (window as any).__localSkillToast) {
      ;(window as any).__localSkillToast({ type: 'error', title, description })
    }
  },
  info: (title: string, description?: string) => {
    if (typeof window !== 'undefined' && (window as any).__localSkillToast) {
      ;(window as any).__localSkillToast({ type: 'info', title, description })
    }
  },
  warning: (title: string, description?: string) => {
    if (typeof window !== 'undefined' && (window as any).__localSkillToast) {
      ;(window as any).__localSkillToast({ type: 'warning', title, description })
    }
  },
  loading: (title: string, description?: string) => {
    if (typeof window !== 'undefined' && (window as any).__localSkillToast) {
      return (window as any).__localSkillToast({ type: 'loading', title, description, duration: Infinity })
    }
    return ''
  },
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}

const typeStyles: Record<ToastType, string> = {
  success: 'border-green-500/30 bg-green-50 dark:bg-green-950/30',
  error: 'border-red-500/30 bg-red-50 dark:bg-red-950/30',
  warning: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/30',
  info: 'border-blue-500/30 bg-blue-50 dark:bg-blue-950/30',
  loading: 'border-border bg-card dark:bg-card',
}

const typeIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  loading: <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />,
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        'animate-in slide-in-from-right-8 fade-in duration-200 pointer-events-auto',
        typeStyles[t.type]
      )}
    >
      <div className="shrink-0">{typeIcons[t.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{t.title}</p>
        {t.description && (
          <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
        )}
      </div>
      {t.type !== 'loading' && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
