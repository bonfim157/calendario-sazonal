'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return // sem key = sem tracking (dev sem configuração)

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? '/ingest',
      ui_host: 'https://eu.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      // Privacidade LGPD: mascarar todos os inputs
      mask_all_text: false,
      mask_all_element_attributes: false,
      session_recording: {
        maskAllInputs: true,
      },
    })
  }, [])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return <>{children}</>
  return <PHProvider client={posthog}>{children}</PHProvider>
}
