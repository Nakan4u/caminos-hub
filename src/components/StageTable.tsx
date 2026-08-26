import { getTranslations } from 'next-intl/server'
import type { RouteWithStages } from '@/lib/routes'
import styles from './StageTable.module.scss'

const LONG_STAGE_KM = 30

export async function StageTable({ stages }: { stages: RouteWithStages['stages'] }) {
  const t = await getTranslations('StageTable')
  const tFormat = await getTranslations('Format')

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
            <th scope="col">{t('stageNumber')}</th>
            <th scope="col">{t('stage')}</th>
            <th scope="col" className={styles.numeric}>
              {t('distance')}
            </th>
            <th scope="col" className={styles.numeric}>
              {t('total')}
            </th>
            <th scope="col" className={styles.numeric}>
              {t('ascent')}
            </th>
            <th scope="col">{t('notes')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ stage, cumulative }) => {
            const isLong = stage.distanceKm >= LONG_STAGE_KM
            return (
              <tr key={stage.order}>
                <td className={styles.order}>{stage.order}</td>
                <td className={styles.leg}>
                  {stage.fromPlace}
                  <span className={styles.arrow}>→</span>
                  {stage.toPlace}
                </td>
                <td className={`${styles.numeric} ${isLong ? styles.long : ''}`}>
                  {tFormat('km', { km: stage.distanceKm.toFixed(1) })}
                </td>
                <td className={`${styles.numeric} ${styles.cumulative}`}>
                  {cumulative.toFixed(1)}
                </td>
                <td className={`${styles.numeric} ${styles.cumulative}`}>
                  {stage.ascentM ? tFormat('meters', { m: stage.ascentM }) : '—'}
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
