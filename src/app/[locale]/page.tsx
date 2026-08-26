import { getTranslations } from 'next-intl/server'
import { parseFilters, type SearchParams } from '@/lib/filters'
import { listCountries, listRoutes } from '@/lib/routes'
import { FilterBar } from '@/components/FilterBar'
import { RouteCard } from '@/components/RouteCard'
import { CompareProvider } from '@/components/CompareProvider'
import { CompareBar } from '@/components/CompareBar'

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const t = await getTranslations('Catalog')
  const filters = parseFilters(await searchParams)
  const [routes, countries] = await Promise.all([
    listRoutes(filters, locale),
    listCountries(),
  ])

  return (
    <>
      <header className="mb-4">
        <p className="eyebrow mb-2">{t('eyebrow')}</p>
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-lede">{t('lede')}</p>
      </header>

      <CompareProvider>
        <FilterBar filters={filters} countries={countries} resultCount={routes.length} />

        {routes.length === 0 ? (
          <div className="text-center py-5">
            <h2 className="h5">{t('emptyTitle')}</h2>
            <p className="text-secondary mb-0">{t('emptyLede')}</p>
          </div>
        ) : (
          <div className="row g-3 g-md-4">
            {routes.map((route) => (
              <div className="col-12 col-md-6 col-xl-4" key={route.slug}>
                <RouteCard route={route} />
              </div>
            ))}
          </div>
        )}

        <CompareBar />
      </CompareProvider>
    </>
  )
}
