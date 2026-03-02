'use client'

import { useEffect, useState, useRef } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import type { Metrics } from '@/lib/types'

// Cookie utility functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, seconds: number): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + seconds * 1000).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=${window.location.pathname}; SameSite=Lax`
}

export function StatsSection() {
  const { t } = useLanguage()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const hasIncremented = useRef(false)

  useEffect(() => {
    // Fetch metrics
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error)
    
    // Increment visit counter with anti-double counting
    // Use cookie with 20s TTL to prevent double counting on same page
    const cookieName = `cdla_visited_${window.location.pathname.replace(/\//g, '_')}`
    const alreadyVisited = getCookie(cookieName)
    
    if (!alreadyVisited && !hasIncremented.current) {
      hasIncremented.current = true
      setCookie(cookieName, '1', 20) // 20 second TTL
      
      fetch('/api/metrics', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          // Update visits_total with the new value
          setMetrics(prev => prev ? { ...prev, visits_total: data.visits_total } : prev)
        })
        .catch(console.error)
    }
  }, [])

  const stats = [
    {
      value: metrics?.projects_delivered || 50,
      suffix: '+',
      label: t.home.statsProjects,
    },
    {
      value: metrics?.years_experience || 5,
      suffix: '+',
      label: t.home.statsYears,
    },
    {
      value: metrics?.active_countries || 10,
      suffix: '+',
      label: t.home.statsCountries,
    },
    {
      value: metrics?.visits_total || 0,
      suffix: '+',
      label: t.home.statsVisits,
    },
  ]

  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold md:text-4xl">
                {stat.value}{stat.suffix}
              </div>
              <div className="mt-1 text-sm text-foreground/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
