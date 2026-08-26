import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <div className="text-center py-5">
      <p className="eyebrow mb-2">{t('eyebrow')}</p>
      <h1 className="page-title">{t('title')}</h1>
      <p className="page-lede mx-auto">{t('lede')}</p>
      <Link href="/" className="btn btn-arrow mt-3">
        {t('backLink')}
      </Link>
    </div>
  )
}
