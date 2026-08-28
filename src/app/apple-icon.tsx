import { ImageResponse } from 'next/og'
import { LOGO_COLORS, logoSvg } from '@/lib/logo'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// iOS home-screen icon. Apple masks its own rounded corners, so the logo sits
// on a full-bleed limestone tile. Satori rasterises the shared SVG.
export default function AppleIcon() {
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(
    logoSvg(size.width),
  ).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: LOGO_COLORS.tile,
        }}
      >
        <img src={dataUri} width={size.width} height={size.height} alt="" />
      </div>
    ),
    { ...size },
  )
}
