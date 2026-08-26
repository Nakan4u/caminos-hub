'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import {
  DIFFICULTIES,
  DEFAULT_SORT,
  SORT_VALUES,
  filtersToQueryString,
  hasActiveFilters,
  type Difficulty,
  type RouteFilters,
  type SortKey,
} from '@/lib/filters'
import styles from './FilterBar.module.scss'

interface Props {
  filters: RouteFilters
  countries: string[]
  resultCount: number
}

export function FilterBar({ filters, countries, resultCount }: Props) {
  const t = useTranslations('FilterBar')
  const tDifficulty = useTranslations('Difficulty')
  const tSort = useTranslations('Sort')
  const tCountries = useTranslations('Countries')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function apply(next: RouteFilters) {
    const queryString = filtersToQueryString(next)
    startTransition(() => router.push(queryString ? `/?${queryString}` : '/'))
  }

  function toggleInList<T extends string>(list: T[] | undefined, value: T): T[] {
    const current = list ?? []
    return current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value]
  }

  function withoutEmpty(next: RouteFilters): RouteFilters {
    return {
      ...next,
      difficulty: next.difficulty?.length ? next.difficulty : undefined,
      countries: next.countries?.length ? next.countries : undefined,
    }
  }

  return (
    <section className={styles.bar} aria-label={t('ariaLabel')}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const value = new FormData(event.currentTarget).get('q')
          apply({ ...filters, q: String(value ?? '').trim() || undefined })
        }}
      >
        <div className={styles.grid}>
          <div>
            <label className={styles.label} htmlFor="filter-q">
              {t('search')}
            </label>
            <input
              key={filters.q ?? ''}
              id="filter-q"
              name="q"
              className="form-control"
              type="search"
              placeholder={t('searchPlaceholder')}
              defaultValue={filters.q ?? ''}
              onBlur={(event) =>
                apply({ ...filters, q: event.target.value.trim() || undefined })
              }
            />
          </div>

          <div>
            <label className={styles.label} htmlFor="filter-max-km">
              {t('maxDistance')}
            </label>
            <select
              id="filter-max-km"
              className="form-select"
              value={filters.maxKm ?? ''}
              onChange={(event) =>
                apply({
                  ...filters,
                  maxKm: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            >
              <option value="">{t('anyDistance')}</option>
              <option value="150">{t('under150')}</option>
              <option value="300">{t('under300')}</option>
              <option value="500">{t('under500')}</option>
              <option value="800">{t('under800')}</option>
            </select>
          </div>

          <div>
            <label className={styles.label} htmlFor="filter-max-days">
              {t('timeAvailable')}
            </label>
            <select
              id="filter-max-days"
              className="form-select"
              value={filters.maxDays ?? ''}
              onChange={(event) =>
                apply({
                  ...filters,
                  maxDays: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            >
              <option value="">{t('anyLength')}</option>
              <option value="7">{t('upToWeek')}</option>
              <option value="14">{t('upToTwoWeeks')}</option>
              <option value="21">{t('upToThreeWeeks')}</option>
              <option value="35">{t('upToFiveWeeks')}</option>
            </select>
          </div>

          <div>
            <label className={styles.label} htmlFor="filter-sort">
              {t('sortBy')}
            </label>
            <select
              id="filter-sort"
              className="form-select"
              value={filters.sort}
              onChange={(event) =>
                apply({ ...filters, sort: event.target.value as SortKey })
              }
            >
              {SORT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {tSort(value)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-4 mt-3">
          <div>
            <span className={styles.label}>{t('difficulty')}</span>
            <div className={styles.chips}>
              {DIFFICULTIES.map((difficulty: Difficulty) => {
                const active = filters.difficulty?.includes(difficulty) ?? false
                return (
                  <button
                    key={difficulty}
                    type="button"
                    aria-pressed={active}
                    className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                    onClick={() =>
                      apply(
                        withoutEmpty({
                          ...filters,
                          difficulty: toggleInList(filters.difficulty, difficulty),
                        }),
                      )
                    }
                  >
                    {tDifficulty(`${difficulty}.label`)}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className={styles.label}>{t('country')}</span>
            <div className={styles.chips}>
              {countries.map((country) => {
                const active = filters.countries?.includes(country) ?? false
                return (
                  <button
                    key={country}
                    type="button"
                    aria-pressed={active}
                    className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                    onClick={() =>
                      apply(
                        withoutEmpty({
                          ...filters,
                          countries: toggleInList(filters.countries, country),
                        }),
                      )
                    }
                  >
                    {tCountries(`names.${country}`)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={`${styles.count} mb-0 ${isPending ? styles.pending : ''}`}>
            {t.rich('resultCount', {
              count: resultCount,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          {hasActiveFilters(filters) && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => apply({ sort: filters.sort ?? DEFAULT_SORT })}
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
