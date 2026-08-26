import { notFound } from 'next/navigation'

// Catches any path under `[locale]` that doesn't match a defined route
// (e.g. `/uk/does-not-exist`) and triggers the localized `not-found.tsx`
// in this segment. Without this, Next.js falls back to the framework's
// default 404 page for genuinely unmatched routes.
export default function CatchAllPage(): never {
  notFound()
}
