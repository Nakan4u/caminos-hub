'use client'

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { logoutAction } from '@/lib/actions/auth'
import { Avatar } from './Avatar'
import styles from './UserMenu.module.scss'

interface Props {
  locale: string
  name: string | null
  email: string
  image: string | null
  labels: {
    greeting: string
    myRoutes: string
    settings: string
    signOut: string
  }
}

/** Header avatar with a click-to-open dropdown (My routes / Account settings /
 *  Sign out). The one interactive island in the header — `AuthMenu` stays a
 *  Server Component and passes the resolved user + translated labels in. */
export function UserMenu({ locale, name, email, image, labels }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={labels.greeting}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar src={image} name={name} email={email} />
      </button>

      {open && (
        <div className={styles.panel} role="menu">
          <p className={styles.heading}>{labels.greeting}</p>
          <Link
            href="/my-routes"
            role="menuitem"
            className={styles.item}
            onClick={() => setOpen(false)}
          >
            {labels.myRoutes}
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            className={styles.item}
            onClick={() => setOpen(false)}
          >
            {labels.settings}
          </Link>
          <hr className={styles.divider} />
          <form action={logoutAction.bind(null, locale)}>
            <button type="submit" role="menuitem" className={styles.item}>
              {labels.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
