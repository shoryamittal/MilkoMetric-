const AUTH_STORAGE_KEY = 'agrinex_auth_session'

export function getStoredAuth() {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.isLoggedIn) {
      return parsed
    }
  } catch (e) {
    // Graceful fallback if storage access is restricted
  }
  return null
}

export function setStoredAuth(auth) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (auth && auth.isLoggedIn) {
        window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
      } else {
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
  } catch (e) {
    // Ignore storage quota or security errors
  }
}

export function clearStoredAuth() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch (e) {
    // Ignore
  }
}

export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
