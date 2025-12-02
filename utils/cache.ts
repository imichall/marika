// Cache helper pro client-side cacheování dat
const CACHE_DURATION = 10 * 60 * 1000 // 10 minut v milisekundách

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export const getCachedData = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(`cache_${key}`)
    if (!cached) return null

    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()

    // Kontrola, jestli cache není starší než CACHE_DURATION
    if (now - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`cache_${key}`)
      return null
    }

    return entry.data
  } catch (err) {
    console.error(`Error reading cache for ${key}:`, err)
    return null
  }
}

export const setCachedData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
  } catch (err) {
    console.error(`Error writing cache for ${key}:`, err)
  }
}

export const clearCache = (key: string): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`cache_${key}`)
}

export const clearAllCache = (): void => {
  if (typeof window === 'undefined') return

  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key)
    }
  })
}

// Cache pro soubory (obrázky, dokumenty) pomocí Cache API
const FILE_CACHE_NAME = 'marika-files-cache'
const FILE_CACHE_DURATION = 10 * 60 * 1000 // 10 minut

export const getCachedFile = async (url: string): Promise<Response | null> => {
  if (typeof window === 'undefined' || !('caches' in window)) return null

  try {
    const cache = await caches.open(FILE_CACHE_NAME)
    const cached = await cache.match(url)

    if (!cached) return null

    // Kontrola expirace pomocí custom header
    const cachedTime = cached.headers.get('x-cached-time')
    if (cachedTime) {
      const timestamp = parseInt(cachedTime, 10)
      const now = Date.now()

      if (now - timestamp > FILE_CACHE_DURATION) {
        await cache.delete(url)
        return null
      }
    }

    return cached
  } catch (err) {
    console.error(`Error reading file cache for ${url}:`, err)
    return null
  }
}

export const setCachedFile = async (url: string, response: Response): Promise<void> => {
  if (typeof window === 'undefined' || !('caches' in window)) return

  try {
    const cache = await caches.open(FILE_CACHE_NAME)

    // Vytvoření nové Response s cache timestampem
    const headers = new Headers(response.headers)
    headers.set('x-cached-time', Date.now().toString())

    const cachedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    })

    await cache.put(url, cachedResponse)
  } catch (err) {
    console.error(`Error writing file cache for ${url}:`, err)
  }
}

export const fetchWithCache = async (url: string): Promise<Response> => {
  // Nejdřív zkusíme cache
  const cached = await getCachedFile(url)
  if (cached) {
    return cached
  }

  // Pokud není v cache, stáhneme a uložíme
  const response = await fetch(url)

  // Cache pouze úspěšné odpovědi (status 200-299)
  if (response.ok) {
    // Klonujeme response, protože může být použita pouze jednou
    const responseClone = response.clone()
    await setCachedFile(url, responseClone)
  }

  return response
}

export const clearFileCache = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('caches' in window)) return

  try {
    await caches.delete(FILE_CACHE_NAME)
  } catch (err) {
    console.error('Error clearing file cache:', err)
  }
}

export const getCachedFileUrl = async (url: string): Promise<string> => {
  const cached = await getCachedFile(url)
  if (cached) {
    const blob = await cached.blob()
    return URL.createObjectURL(blob)
  }

  // Pokud není v cache, stáhneme a cachujeme
  const response = await fetchWithCache(url)
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

