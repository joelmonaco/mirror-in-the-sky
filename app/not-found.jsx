import Link from 'next/link'
import { useTranslations } from 'next-intl'
 
export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-3xl font-bold mb-4">
        {t('title')}
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        {t('description')}
      </p>
      <Link 
        href="/" 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        {t('returnHome')}
      </Link>
    </div>
  )
}