// UTC date helpers: produce start/end Date objects anchored to UTC day boundaries
export const startOfDayUTC = (dateStr: string): Date => {
  // dateStr expected in YYYY-MM-DD format
  return new Date(`${dateStr}T00:00:00.000Z`)
}

export const endOfDayUTC = (dateStr: string): Date => {
  return new Date(`${dateStr}T23:59:59.999Z`)
}

export const startOfTodayUTC = (): Date => {
  const iso = new Date().toISOString()
  const day = iso.split('T')[0]
  return startOfDayUTC(day)
}

export const endOfTodayUTC = (): Date => {
  const iso = new Date().toISOString()
  const day = iso.split('T')[0]
  return endOfDayUTC(day)
}
