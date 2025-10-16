export const isoToDateKey = (iso?: string | null): string => {
  if (!iso) return new Date().toISOString().split('T')[0]
  try {
    return new Date(iso).toISOString().split('T')[0]
  } catch (e) {
    return new Date().toISOString().split('T')[0]
  }
}

export const nowIso = (): string => new Date().toISOString()
