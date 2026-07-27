import { PostHog } from 'posthog-node'

let _client: PostHog | null = null

// Cliente Node.js para server-side event capture.
// Só inicializa quando POSTHOG_API_KEY estiver configurado.
export function getPostHog(): PostHog | null {
  if (!process.env.POSTHOG_API_KEY) return null
  if (!_client) {
    _client = new PostHog(process.env.POSTHOG_API_KEY, {
      host: 'https://eu.i.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
  }
  return _client
}

export function captureEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const ph = getPostHog()
  if (!ph) return
  ph.capture({ distinctId, event, properties })
}
