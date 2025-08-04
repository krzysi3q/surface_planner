import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://handylay.com'
  const languages = ['en', 'pl', 'es', 'zh']
  
  const routes = [
    '',
    '/planner',
    '/language'
  ]
  
  const sitemap: MetadataRoute.Sitemap = []
  
  // Add root URL (default language)
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
    alternates: {
      languages: languages.reduce((acc, lang) => {
        acc[lang] = `${baseUrl}/${lang}`
        return acc
      }, {} as Record<string, string>)
    }
  })
  
  // Add localized pages
  languages.forEach(lang => {
    routes.forEach(route => {
      const url = route === '' ? `${baseUrl}/${lang}` : `${baseUrl}/${lang}${route}`
      const priority = route === '' ? 0.9 : 0.8
      
      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority,
        alternates: {
          languages: languages.reduce((acc, altLang) => {
            const altUrl = route === '' ? `${baseUrl}/${altLang}` : `${baseUrl}/${altLang}${route}`
            acc[altLang] = altUrl
            return acc
          }, {} as Record<string, string>)
        }
      })
    })
  })
  
  return sitemap
}
