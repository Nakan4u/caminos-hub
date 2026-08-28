import { avatarInitial } from '@/lib/avatar'
import styles from './Avatar.module.scss'

/**
 * Round user avatar. Renders the profile image (Google accounts) when present,
 * otherwise a letter glyph derived from the name/email. Plain `<img>` on
 * purpose — Google's CDN doesn't need `next/image` optimisation and this keeps
 * `next.config` free of remote-image patterns.
 */
export function Avatar({
  src,
  name,
  email,
  size = 28,
}: {
  src: string | null
  name: string | null
  email: string
  size?: number
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- deliberate: see doc comment
      <img
        className={styles.avatar}
        style={{ width: size, height: size }}
        src={src}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {avatarInitial(name, email)}
    </span>
  )
}
