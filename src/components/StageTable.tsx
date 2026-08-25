import type { RouteWithStages } from '@/lib/routes'
import styles from './StageTable.module.scss'

const LONG_STAGE_KM = 30

export function StageTable({ stages }: { stages: RouteWithStages['stages'] }) {
  type Row = { stage: RouteWithStages['stages'][number]; cumulative: number }
  const rows = stages.reduce<Row[]>((acc, stage) => {
    const cumulative = (acc.at(-1)?.cumulative ?? 0) + stage.distanceKm
    acc.push({ stage, cumulative })
    return acc
  }, [])

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Stage</th>
            <th scope="col" className={styles.numeric}>
              Distance
            </th>
            <th scope="col" className={styles.numeric}>
              Total
            </th>
            <th scope="col" className={styles.numeric}>
              Ascent
            </th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ stage, cumulative }) => {
            const isLong = stage.distanceKm >= LONG_STAGE_KM
            return (
              <tr key={stage.id}>
                <td className={styles.order}>{stage.order}</td>
                <td className={styles.leg}>
                  {stage.fromPlace}
                  <span className={styles.arrow}>→</span>
                  {stage.toPlace}
                </td>
                <td className={`${styles.numeric} ${isLong ? styles.long : ''}`}>
                  {stage.distanceKm.toFixed(1)} km
                </td>
                <td className={`${styles.numeric} ${styles.cumulative}`}>
                  {cumulative.toFixed(1)}
                </td>
                <td className={`${styles.numeric} ${styles.cumulative}`}>
                  {stage.ascentM ? `${stage.ascentM} m` : '—'}
                </td>
                <td className={styles.notes}>{stage.notes ?? ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
