import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { differenceInCalendarDays } from 'date-fns'

const TZ = 'Asia/Kolkata'

/**
 * Formats a given date string or Date object directly into Indian Standard Time (Asia/Kolkata).
 * Prevents Vercel server components from defaulting to UTC format.
 */
export function formatIST(date: string | Date | null | undefined, fmt: string = 'PPp', fallback: string = 'Unknown Date'): string {
  if (!date) return fallback
  
  try {
    return formatInTimeZone(new Date(date), TZ, fmt)
  } catch (error) {
    console.error('Date formatting error:', error)
    return fallback
  }
}

/**
 * Calculates days remaining until a target date, specifically in IST.
 * Uses calendar days (00:00 to 00:00) to ensure consistency.
 */
export function getDaysRemaining(targetDate: string | Date | null | undefined): number {
  if (!targetDate) return 0
  
  try {
    const now = new Date()
    const nowIST = toZonedTime(now, TZ)
    const targetIST = toZonedTime(new Date(targetDate), TZ)
    
    const diff = differenceInCalendarDays(targetIST, nowIST)
    return Math.max(0, diff)
  } catch (error) {
    console.error('Error calculating days remaining:', error)
    return 0
  }
}
