export const loadPublicJson = async (relativePath) => {
  const normalizedPath = relativePath.replace(/^\//, '')

  if (import.meta.env.SSR) {
    const { readFile } = await import('node:fs/promises')
    const { resolve } = await import('node:path')
    const filePath = resolve(process.cwd(), 'public', normalizedPath)
    const contents = await readFile(filePath, 'utf-8')

    return JSON.parse(contents)
  }

  const response = await fetch(`/${normalizedPath}`)
  if (!response.ok) {
    throw new Error(`Failed to load ${normalizedPath}`)
  }

  return response.json()
}
