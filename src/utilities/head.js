/**
 * Default meta tags
 */
export const defaultMeta = {
  title: 'رفيق - زادك في الطريق',
  description: 'تطبيق إسلامي شامل للأذكار والقرآن الكريم ومواقيت الصلاة',
  keywords: ['إسلام', 'أذكار', 'قرآن', 'مواقيت الصلاة', 'رفيق', 'تطبيق إسلامي', 'Azkar', 'Quran', 'Prayer Times', 'Islamic App', 'Muslim', 'أوقات الصلاة', 'دعاء', 'تسبيح']
}

/**
 * Set a meta tag in the document head
 *
 * @param {Object} tag - The meta tag to set
 * @param {string} tag.name - The name of the meta tag
 * @param {string} tag.property - The property of the meta tag
 * @param {string} tag.content - The content of the meta tag
 * @returns {void}
 */
export const setMetaTag = ({ name, property, content }) => {
  const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(name ? 'name' : 'property', name ? name : property)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

/**
 * Use the meta tags for the current route
 *
 * @param {Object} meta - The meta tags for the current route
 * @param {string} meta.title - The title of the current route
 * @param {string} meta.description - The description of the current route
 * @param {string[]} meta.keywords - The keywords of the current route
 * @returns {void}
 */
export const useMeta = (meta) => {
  // Merge the default meta with the route meta
  let { title, description, keywords } = Object.assign({}, defaultMeta, meta);

  // Append the app name to the title
  title = `${title} - رفيق`

  // Update the meta tags
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