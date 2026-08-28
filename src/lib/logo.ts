// Single source of truth for the Camino-Hub logo: a scallop shell, the symbol
// pilgrims carry along the Camino.
//
// <Logo> renders these shapes as inline JSX for the site header;
// app/apple-icon.tsx rasterises `logoSvg()` for the iOS home-screen icon.
// The browser favicon (app/icon.svg) repeats the same geometry by hand because
// it must stay a static file.

export const LOGO_COLORS = {
  shell: '#2f3a3f', // $granite
  tile: '#faf7f1', // $limestone — background for the standalone icon tiles
} as const

// Fan-shaped scallop shell, hinge/point at the bottom, viewBox `0 0 32 32`.
export const SHELL_PATH = 'M4 14 A13 13 0 0 1 28 14 L16 28 Z'

// Shell ribs, radiating from the hinge — drawn in the surface colour so they
// read as grooves carved out of the shell.
export const SHELL_RIBS = [
  'M16 28 6 17',
  'M16 28 11 10.5',
  'M16 28 16 6.2',
  'M16 28 21 10.5',
  'M16 28 26 17',
]

/**
 * Full standalone SVG markup for the logo on a limestone tile.
 * Used for the iOS icon; corners are left square because Apple masks its own.
 */
export function logoSvg(size: number): string {
  const ribs = SHELL_RIBS.map(
    (d) =>
      `<path d="${d}" stroke="${LOGO_COLORS.tile}" stroke-width="1.5" stroke-linecap="round"/>`,
  ).join('\n  ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${LOGO_COLORS.tile}"/>
  <path d="${SHELL_PATH}" fill="${LOGO_COLORS.shell}"/>
  ${ribs}
</svg>`
}
