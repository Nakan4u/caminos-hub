'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DIFFICULTIES,
  DEFAULT_SORT,
  SORT_OPTIONS,
  filtersToQueryString,
  hasActiveFilters,
  type Difficulty,
  type RouteFilters,
  type SortKey,
} from '@/lib/filters'
import { DIFFICULTY_LABELS } from '@/lib/format'
import styles from './FilterBar.module.scss'

interface Props {
  filters: RouteFilters
  countries: string[]
  resultCount: number
}

export function FilterBar({ filters, countries, resultCount }: Props) {
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
    <section className={styles.bar} aria-label="Filter routes">
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
              Search
            </label>
            <input
              key={filters.q ?? ''}
              id="filter-q"
              name="q"
              className="form-control"
              type="search"
              placeholder="Name, start or finish"
              defaultValue={filters.q ?? ''}
              onBlur={(event) =>
                apply({ ...filters, q: event.target.value.trim() || undefined })
              }
            />
          </div>

          <div>
            <label className={styles.label} htmlFor="filter-max-km">
              Max distance
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
              <option value="">Any distance</option>
              <option value="150">Under 150 km</option>
              <option value="300">Under 300 km</option>
              <option value="500">Under 500 km</option>
              <option value="800">Under 800 km</option>
            </select>
          </div>

          <div>
            <label className={styles.label} htmlFor="filter-max-days">
              Time available
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
              <option value="">Any length</option>
              <option value="7">Up to a week</option>
              <option value="14">Up to two weeks</option>
              <option value="21">Up to three weeks</option>
              <option value="35">Up to five weeks</option>
            </select>
          </div>

          <div>
            <label className={styles.label} htmlFor="filter-sort">
              Sort by
            </label>
            <select
              id="filter-sort"
              className="form-select"
              value={filters.sort}
              onChange={(event) =>
                apply({ ...filters, sort: event.target.value as SortKey })
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-4 mt-3">
          <div>
            <span className={styles.label}>Difficulty</span>
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
                    {DIFFICULTY_LABELS[difficulty]}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className={styles.label}>Country</span>
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
                    {country}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={`${styles.count} mb-0 ${isPending ? styles.pending : ''}`}>
            <strong>{resultCount}</strong> {resultCount === 1 ? 'route' : 'routes'}
          </p>
          {hasActiveFilters(filters) && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => apply({ sort: filters.sort ?? DEFAULT_SORT })}
            >
              Clear filters
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
