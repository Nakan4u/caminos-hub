import { Link } from '@/i18n/navigation'

export default function NotFound() {
  return (
    <div className="text-center py-5">
      <p className="eyebrow mb-2">Off the waymarked path</p>
      <h1 className="page-title">We could not find that route</h1>
      <p className="page-lede mx-auto">
        The page you asked for does not exist. The fifteen official routes are all
        listed in the catalog.
      </p>
      <Link href="/" className="btn btn-arrow mt-3">
        Browse all routes
      </Link>
    </div>
  )
}
