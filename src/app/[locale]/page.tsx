import { parseFilters, type SearchParams } from '@/lib/filters'
import { listCountries, listRoutes } from '@/lib/routes'
import { FilterBar } from '@/components/FilterBar'
import { RouteCard } from '@/components/RouteCard'
import { CompareProvider } from '@/components/CompareProvider'
import { CompareBar } from '@/components/CompareBar'

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = parseFilters(await searchParams)
  const [routes, countries] = await Promise.all([listRoutes(filters), listCountries()])

  return (
    <>
      <header className="mb-4">
        <p className="eyebrow mb-2">The official routes</p>
        <h1 className="page-title">Every official Camino de Santiago</h1>
        <p className="page-lede">
          Fifteen recognised routes, from a five-day walk out of Ferrol to a
          seven-hundred-kilometre crossing from Seville. Filter by what you actually
          have — distance, time, and how hard you want it to be.
        </p>
      </header>

      <CompareProvider>
        <FilterBar filters={filters} countries={countries} resultCount={routes.length} />

        {routes.length === 0 ? (
          <div className="text-center py-5">
            <h2 className="h5">No routes match those filters</h2>
            <p className="text-secondary mb-0">
              Try allowing more distance or more days, or clear the filters to see all
              fifteen.
            </p>
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
