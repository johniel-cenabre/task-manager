/**
 * Repeat and deadline-from-repeat utilities.
 * repeat: null | 'daily' | { type: 'weekdays', days: number[] } | { type: 'monthly', day: number }
 * days: 0 = Sunday, 1 = Monday, ... 6 = Saturday
 */

export function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isUpdatedYesterday(updatedAt) {
  if (!updatedAt) return false
  const updated = new Date(updatedAt)
  if (Number.isNaN(updated.getTime())) return false
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return toDateString(updated) === toDateString(yesterday)
}

/**
 * True if updatedAt is more than `days` days ago (strictly).
 */
export function isUpdatedMoreThanDaysAgo(updatedAt, days) {
  if (!updatedAt || days < 0) return false
  const updated = new Date(updatedAt)
  if (Number.isNaN(updated.getTime())) return false
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)
  return updated.getTime() < cutoff.getTime()
}

/**
 * For a done task with repeat: true if the repeat occurrence date (when it was completed)
 * is yesterday or has already passed. Used to reset task to todo so the next occurrence applies.
 */
export function isRepeatOccurrencePast(task) {
  if (!hasRepeat(task) || !task.updatedAt) return false
  const updated = new Date(task.updatedAt)
  if (Number.isNaN(updated.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const occurrenceDate = new Date(updated.getFullYear(), updated.getMonth(), updated.getDate())
  return occurrenceDate < today
}

export function hasRepeat(task) {
  if (!task || !task.repeat) return false
  if (task.repeat === 'daily') return true
  if (task.repeat && typeof task.repeat === 'object') {
    if (task.repeat.type === 'weekdays' && Array.isArray(task.repeat.days)) return true
    if (task.repeat.type === 'monthly' && typeof task.repeat.day === 'number') return true
  }
  return false
}

/**
 * Returns the next occurrence date (YYYY-MM-DD) based on repeat rules, or null.
 */
export function getNextDeadlineFromRepeat(task) {
  if (!hasRepeat(task) || !task.deadlineFromRepeat) return null
  const repeat = task.repeat
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (repeat === 'daily') {
    return toDateString(today)
  }

  if (repeat.type === 'weekdays' && Array.isArray(repeat.days) && repeat.days.length > 0) {
    const dayOfWeek = today.getDay()
    const days = repeat.days.slice().sort((a, b) => a - b)
    for (let i = 0; i <= 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + i)
      if (days.includes(d.getDay())) {
        return toDateString(d)
      }
    }
    return null
  }

  if (repeat.type === 'monthly' && typeof repeat.day === 'number') {
    const day = Math.min(31, Math.max(1, Math.floor(repeat.day)))
    const lastDayOfMonth = (y, m) => new Date(y, m + 1, 0).getDate()
    const thisMonth = today.getMonth()
    const thisYear = today.getFullYear()
    const safeDay = Math.min(day, lastDayOfMonth(thisYear, thisMonth))
    const candidate = new Date(thisYear, thisMonth, safeDay)
    if (candidate >= today) return toDateString(candidate)
    const nextMonth = today.getMonth() + 1
    const nextYear = nextMonth > 11 ? thisYear + 1 : thisYear
    const nextMonthIdx = nextMonth % 12
    const nextSafeDay = Math.min(day, lastDayOfMonth(nextYear, nextMonthIdx))
    const nextDate = new Date(nextYear, nextMonthIdx, nextSafeDay)
    return toDateString(nextDate)
  }

  return null
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
