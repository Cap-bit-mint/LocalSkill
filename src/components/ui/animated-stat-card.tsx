'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface AnimatedStatCardProps {
  title: string
  value: number
  icon: LucideIcon
  gradient: string
  delay?: number
}

export function AnimatedStatCard({
  title,
  value,
  icon: Icon,
  gradient,
  delay = 0,
}: AnimatedStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy animation
  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Count up animation
  useEffect(() => {
    if (!isVisible || hasAnimated) return

    const timeout = setTimeout(() => {
      setHasAnimated(true)
      const duration = 1200
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out-cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.floor(eased * value))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timeout)
  }, [isVisible, value, delay, hasAnimated])

  return (
    <div ref={cardRef} className="group">
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300',
          'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* Gradient background on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300',
            gradient,
            'group-hover:opacity-5'
          )}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div
            className={cn(
              'p-2 rounded-lg bg-gradient-to-br transition-transform duration-300',
              gradient,
              'group-hover:scale-110'
            )}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Value */}
        <div className="text-3xl font-bold tabular-nums tracking-tight">
          {displayValue.toLocaleString()}
        </div>

        {/* Subtle animation indicator */}
        {hasAnimated && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
        )}
      </div>
    </div>
  )
}
