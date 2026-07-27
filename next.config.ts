import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy reverso do PostHog — evita bloqueio por ad-blockers.
    // Só rota se NEXT_PUBLIC_POSTHOG_KEY estiver configurado.
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return []
    return [
      { source: '/ingest/static/:path*', destination: 'https://eu-assets.i.posthog.com/static/:path*' },
      { source: '/ingest/:path*',        destination: 'https://eu.i.posthog.com/:path*' },
    ]
  },
}

export default nextConfig
