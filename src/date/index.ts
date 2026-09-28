import type { Dayjs } from './dayjs'
import dayjs from './dayjs'

export type DateInput = string | number | Date | Dayjs | null | undefined

export const DATE_FORMAT = 'YYYY-MM-DD'
export const TIME_FORMAT = 'HH:mm:ss'
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

// 非法输入一律返回 null，由各函数转成空值，避免调用方到处 try/catch
function toDayjs(value?: DateInput): Dayjs | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const parsed = dayjs(value as dayjs.ConfigType)
  return parsed.isValid() ? parsed : null
}

export function isValidDate(date: DateInput): boolean {
  return toDayjs(date) !== null
}

export function currentDate(): string {
  return dayjs().format(DATE_FORMAT)
}

export function currentTime(): string {
  return dayjs().format(TIME_FORMAT)
}

export function currentDateTime(): string {
  return dayjs().format(DATE_TIME_FORMAT)
}

export function currentYear(): number {
  return dayjs().year()
}

export function currentMonth(): number {
  return dayjs().month() + 1
}

export function currentDay(): number {
  return dayjs().date()
}

export function formatDate(date: DateInput, format = DATE_FORMAT): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.format(format) : ''
}

// 传 format 时启用严格模式，'2024-1-5' 不会被当成 YYYY-MM-DD
export function parseDate(date: DateInput, format?: string): Dayjs | null {
  if (date === null || date === undefined || date === '') {
    return null
  }
  const parsed = format ? dayjs(date as dayjs.ConfigType, format, true) : dayjs(date as dayjs.ConfigType)
  return parsed.isValid() ? parsed : null
}

// 按自然日相减，忽略时分秒
export function diffDays(a: DateInput, b: DateInput): number {
  const left = toDayjs(a)
  const right = toDayjs(b)
  if (!left || !right) {
    return Number.NaN
  }
  return left.startOf('day').diff(right.startOf('day'), 'day')
}

export function addDays(date: DateInput, days: number): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.add(days, 'day').format(DATE_FORMAT) : ''
}

export function subDays(date: DateInput, days: number): string {
  return addDays(date, -days)
}

export function addMonths(date: DateInput, months: number): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.add(months, 'month').format(DATE_FORMAT) : ''
}

export function subMonths(date: DateInput, months: number): string {
  return addMonths(date, -months)
}

export function startOfDay(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.startOf('day').format(DATE_TIME_FORMAT) : ''
}

export function endOfDay(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.endOf('day').format(DATE_TIME_FORMAT) : ''
}

export function startOfMonth(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.startOf('month').format(DATE_FORMAT) : ''
}

export function endOfMonth(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.endOf('month').format(DATE_FORMAT) : ''
}

// 周日为一周起始
export function startOfWeek(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.startOf('week').format(DATE_FORMAT) : ''
}

export function endOfWeek(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.endOf('week').format(DATE_FORMAT) : ''
}

export function daysInMonth(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.daysInMonth() : Number.NaN
}

export function isLeapYear(date: DateInput): boolean {
  const parsed = toDayjs(date)
  return parsed ? parsed.isLeapYear() : false
}

// 周六或周日
export function isWeekend(date: DateInput): boolean {
  const parsed = toDayjs(date)
  if (!parsed) {
    return false
  }
  const weekday = parsed.day()
  return weekday === 0 || weekday === 6
}

export function isToday(date: DateInput): boolean {
  return toDayjs(date)?.isToday() ?? false
}

export function isTomorrow(date: DateInput): boolean {
  return toDayjs(date)?.isTomorrow() ?? false
}

export function isYesterday(date: DateInput): boolean {
  return toDayjs(date)?.isYesterday() ?? false
}

export function isSameDay(a: DateInput, b: DateInput): boolean {
  const left = toDayjs(a)
  const right = toDayjs(b)
  return !!left && !!right && left.isSame(right, 'day')
}

export function isSameOrBefore(a: DateInput, b: DateInput): boolean {
  const left = toDayjs(a)
  const right = toDayjs(b)
  return !!left && !!right && left.isSameOrBefore(right)
}

export function isSameOrAfter(a: DateInput, b: DateInput): boolean {
  const left = toDayjs(a)
  const right = toDayjs(b)
  return !!left && !!right && left.isSameOrAfter(right)
}

// 默认不含端点
export function isBetween(date: DateInput, start: DateInput, end: DateInput): boolean {
  const target = toDayjs(date)
  const from = toDayjs(start)
  const to = toDayjs(end)
  return !!target && !!from && !!to && target.isBetween(from, to)
}

// 本地周数(周日为一周起始)
export function weekOfYear(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.week() : Number.NaN
}

// ISO 周数(周一为一周起始)
export function isoWeek(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.isoWeek() : Number.NaN
}

export function quarterOfYear(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.quarter() : Number.NaN
}

export function dayOfYear(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.dayOfYear() : Number.NaN
}

export function fromNow(date: DateInput): string {
  return toDayjs(date)?.fromNow() ?? ''
}

export function toNow(date: DateInput): string {
  return toDayjs(date)?.toNow() ?? ''
}

// 按整年计算，at 省略时取当前时间
export function age(birthday: DateInput, at?: DateInput): number {
  const birth = toDayjs(birthday)
  const base = at === undefined ? dayjs() : toDayjs(at)
  if (!birth || !base) {
    return Number.NaN
  }
  return base.diff(birth, 'year')
}

export function toDate(date: DateInput): Date | null {
  const parsed = toDayjs(date)
  return parsed ? parsed.toDate() : null
}

export function toTimestamp(date: DateInput): number {
  return toDayjs(date)?.valueOf() ?? Number.NaN
}
