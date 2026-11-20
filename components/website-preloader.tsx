'use client'

import { useEffect, useState } from 'react'

export function WebsitePreloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const started = performance.now()
    const finish = () => {
      const remaining = Math.max(0, 900 - (performance.now() - started))
      window.setTimeout(() => setVisible(false), remaining)
    }

    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })

    return () => window.removeEventListener('load', finish)
  }, [])

  if (!visible) return null

  return (
    <div className="website-preloader" role="status" aria-label="Loading Greenwood School">
      <div className="preloader-brand">
        <div className="preloader-mark">GS</div>
        <div className="preloader-copy">
          <span>Greenwood School</span>
          <small>Preparing your workspace</small>
        </div>
      </div>
      <div className="preloader-track"><span /></div>
    </div>
  )
}
