'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import type { Metrics } from '@/lib/types'

export function StatsSection() {
  const { t } = useLanguage()
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error)
    
    // Increment visit counter
    fetch('/api/metrics', { method: 'POST' }).catch(console.error)
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
