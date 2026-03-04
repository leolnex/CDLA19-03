'use client'

import { useEffect, useRef } from 'react'

export function DbInitializer() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Initialize database on first load
    fetch('/api/init')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('[CDLA] Database initialized')
        }
      })
      .catch(err => {
        console.error('[CDLA] Database init error:', err)
      })
  }, [])

  return null
}
