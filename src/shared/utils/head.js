const defaultMeta = {
  title: 'رفيق - زادك في الطريق',
  description: 'تطبيق إسلامي شامل للأذكار والقرآن الكريم ومواقيت الصلاة',
  keywords: [
    'إسلام',
    'أذكار',
    'قرآن',
    'مواقيت الصلاة',
    'رفيق',
    'تطبيق إسلامي',
    'Azkar',
    'Quran',
    'Prayer Times',
    'Islamic App',
    'Muslim',
    'أوقات الصلاة',
    'دعاء',
    'تسبيح',
  ],
}

const setMetaTag = ({ name, property, content }) => {
  const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(name ? 'name' : 'property', name || property)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

export const useMeta = (meta) => {
  let { title, description, keywords } = Object.assign({}, defaultMeta, meta)

  if (title !== defaultMeta.title) title = `${title} - رفيق`

  document.title = title
  setMetaTag({ name: 'description', content: description })
  setMetaTag({ name: 'keywords', content: keywords.join(', ') })
  setMetaTag({ property: 'og:title', content: title })
  setMetaTag({ property: 'og:description', content: description })
  setMetaTag({ property: 'og:keywords', content: keywords.join(', ') })
  setMetaTag({ name: 'twitter:title', content: title })
  setMetaTag({ name: 'twitter:description', content: description })
  setMetaTag({ name: 'twitter:keywords', content: keywords.join(', ') })
}
