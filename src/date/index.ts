import type { Dayjs } from './dayjs'
import dayjs from './dayjs'

export * from './calendar'

/** 日期入参：可被 dayjs 解析的任意值 */
export type DateInput = string | number | Date | Dayjs | null | undefined

/** 仅日期格式，如 `2024-01-05` */
export const DATE_FORMAT = 'YYYY-MM-DD'
/** 仅时间格式，如 `13:05:00` */
export const TIME_FORMAT = 'HH:mm:ss'
/** 日期时间格式，如 `2024-01-05 13:05:00` */
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export { dayjs }
export type { Dayjs }

// 非法输入一律返回 null，由各函数转成空值，避免调用方到处 try/catch
function toDayjs(value?: DateInput): Dayjs | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const parsed = dayjs(value as dayjs.ConfigType)
  return parsed.isValid() ? parsed : null
}

/**
 * 判断是否为合法日期
 *
 * @example
 * isValidDate('2024-01-05')  // true
 * isValidDate('abc')         // false
 */
export function isValidDate(date: DateInput): boolean {
  return toDayjs(date) !== null
}

/**
 * 当前日期字符串，格式 `YYYY-MM-DD`
 *
 * @example
 * currentDate()  // '2024-01-05'
 */
export function currentDate(): string {
  return dayjs().format(DATE_FORMAT)
}

/**
 * 当前时间字符串，格式 `HH:mm:ss`
 */
export function currentTime(): string {
  return dayjs().format(TIME_FORMAT)
}

/**
 * 当前日期时间字符串，格式 `YYYY-MM-DD HH:mm:ss`
 */
export function currentDateTime(): string {
  return dayjs().format(DATE_TIME_FORMAT)
}

/** 当前年份 */
export function currentYear(): number {
  return dayjs().year()
}

/** 当前月份（1-12） */
export function currentMonth(): number {
  return dayjs().month() + 1
}

/** 当前日（1-31） */
export function currentDay(): number {
  return dayjs().date()
}

/**
 * 格式化日期
 *
 * 非法输入返回空字符串。
 *
 * @param date 日期入参
 * @param format 目标格式，默认 `YYYY-MM-DD`
 * @example
 * formatDate('2024-01-05', 'MM/DD')  // '01/05'
 */
export function formatDate(date: DateInput, format = DATE_FORMAT): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.format(format) : ''
}

/**
 * 解析日期为 dayjs 对象，失败返回 `null`
 *
 * 传入 `format` 时启用严格模式，`'2024-1-5'` 不会被当作 `YYYY-MM-DD`。
 *
 * @example
 * parseDate('2024-01-05')                  // Dayjs
 * parseDate('2024-1-5', 'YYYY-MM-DD')      // null（严格模式）
 */
export function parseDate(date: DateInput, format?: string): Dayjs | null {
  if (date === null || date === undefined || date === '') {
    return null
  }
  const parsed = format ? dayjs(date as dayjs.ConfigType, format, true) : dayjs(date as dayjs.ConfigType)
  return parsed.isValid() ? parsed : null
}

/**
 * 两个日期相差的自然天数（忽略时分秒）
 *
 * 任一非法输入返回 `NaN`。
 *
 * @example
 * diffDays('2024-01-05', '2024-01-03')  // 2
 */
export function diffDays(a: DateInput, b: DateInput): number {
  const left = toDayjs(a)
  const right = toDayjs(b)
  if (!left || !right) {
    return Number.NaN
  }
  return left.startOf('day').diff(right.startOf('day'), 'day')
}

/**
 * 日期加若干天，返回 `YYYY-MM-DD`；非法输入返回空字符串
 *
 * @example
 * addDays('2024-01-05', 3)  // '2024-01-08'
 */
export function addDays(date: DateInput, days: number): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.add(days, 'day').format(DATE_FORMAT) : ''
}

/**
 * 日期减若干天，返回 `YYYY-MM-DD`
 *
 * @example
 * subDays('2024-01-05', 3)  // '2024-01-02'
 */
export function subDays(date: DateInput, days: number): string {
  return addDays(date, -days)
}

/**
 * 日期加若干月，返回 `YYYY-MM-DD`；非法输入返回空字符串
 *
 * @example
 * addMonths('2024-01-31', 1)  // '2024-02-29'
 */
export function addMonths(date: DateInput, months: number): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.add(months, 'month').format(DATE_FORMAT) : ''
}

/**
 * 日期减若干月，返回 `YYYY-MM-DD`
 */
export function subMonths(date: DateInput, months: number): string {
  return addMonths(date, -months)
}

/**
 * 当天的起始时刻，返回 `YYYY-MM-DD HH:mm:ss`
 *
 * @example
 * startOfDay('2024-01-05 13:00')  // '2024-01-05 00:00:00'
 */
export function startOfDay(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.startOf('day').format(DATE_TIME_FORMAT) : ''
}

/**
 * 当天的结束时刻，返回 `YYYY-MM-DD HH:mm:ss`
 *
 * @example
 * endOfDay('2024-01-05 13:00')  // '2024-01-05 23:59:59'
 */
export function endOfDay(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.endOf('day').format(DATE_TIME_FORMAT) : ''
}

/**
 * 当月第一天，返回 `YYYY-MM-DD`
 */
export function startOfMonth(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.startOf('month').format(DATE_FORMAT) : ''
}

/**
 * 当月最后一天，返回 `YYYY-MM-DD`
 */
export function endOfMonth(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.endOf('month').format(DATE_FORMAT) : ''
}

/**
 * 本周第一天（周日为一周起始），返回 `YYYY-MM-DD`
 */
export function startOfWeek(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.startOf('week').format(DATE_FORMAT) : ''
}

/**
 * 本周最后一天（周六为一周结束），返回 `YYYY-MM-DD`
 */
export function endOfWeek(date: DateInput): string {
  const parsed = toDayjs(date)
  return parsed ? parsed.endOf('week').format(DATE_FORMAT) : ''
}

/**
 * 当月天数；非法输入返回 `NaN`
 *
 * @example
 * daysInMonth('2024-02-01')  // 29
 */
export function daysInMonth(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.daysInMonth() : Number.NaN
}

/**
 * 是否闰年；非法输入返回 `false`
 */
export function isLeapYear(date: DateInput): boolean {
  const parsed = toDayjs(date)
  return parsed ? parsed.isLeapYear() : false
}

/**
 * 是否周末（周六或周日）；非法输入返回 `false`
 */
export function isWeekend(date: DateInput): boolean {
  const parsed = toDayjs(date)
  if (!parsed) {
    return false
  }
  const weekday = parsed.day()
  return weekday === 0 || weekday === 6
}

/** 是否今天 */
export function isToday(date: DateInput): boolean {
  return toDayjs(date)?.isToday() ?? false
}

/** 是否明天 */
export function isTomorrow(date: DateInput): boolean {
  return toDayjs(date)?.isTomorrow() ?? false
}

/** 是否昨天 */
export function isYesterday(date: DateInput): boolean {
  return toDayjs(date)?.isYesterday() ?? false
}

/** 两个日期是否为同一天 */
export function isSameDay(a: DateInput, b: DateInput): boolean {
  const left = toDayjs(a)
  const right = toDayjs(b)
  return !!left && !!right && left.isSame(right, 'day')
}

/** `a` 是否等于或早于 `b` */
export function isSameOrBefore(a: DateInput, b: DateInput): boolean {
  const left = toDayjs(a)
  const right = toDayjs(b)
  return !!left && !!right && left.isSameOrBefore(right)
}

/** `a` 是否等于或晚于 `b` */
export function isSameOrAfter(a: DateInput, b: DateInput): boolean {
  const left = toDayjs(a)
  const right = toDayjs(b)
  return !!left && !!right && left.isSameOrAfter(right)
}

/**
 * `date` 是否严格位于 `start` 与 `end` 之间（默认不含端点）
 */
export function isBetween(date: DateInput, start: DateInput, end: DateInput): boolean {
  const target = toDayjs(date)
  const from = toDayjs(start)
  const to = toDayjs(end)
  return !!target && !!from && !!to && target.isBetween(from, to)
}

/**
 * 本地周数（周日为一周起始）；非法输入返回 `NaN`
 */
export function weekOfYear(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.week() : Number.NaN
}

/**
 * ISO 周数（周一为一周起始）；非法输入返回 `NaN`
 */
export function isoWeek(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.isoWeek() : Number.NaN
}

/** 所在季度（1-4）；非法输入返回 `NaN` */
export function quarterOfYear(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.quarter() : Number.NaN
}

/** 一年中的第几天；非法输入返回 `NaN` */
export function dayOfYear(date: DateInput): number {
  const parsed = toDayjs(date)
  return parsed ? parsed.dayOfYear() : Number.NaN
}

/**
 * 相对现在的描述，如「3 天前」；非法输入返回空字符串
 */
export function fromNow(date: DateInput): string {
  return toDayjs(date)?.fromNow() ?? ''
}

/**
 * 到现在的描述，如「3 天后」；非法输入返回空字符串
 */
export function toNow(date: DateInput): string {
  return toDayjs(date)?.toNow() ?? ''
}

/**
 * 按整年计算年龄；`at` 省略时取当前时间
 *
 * @example
 * age('2000-01-01', '2024-01-01')  // 24
 */
export function age(birthday: DateInput, at?: DateInput): number {
  const birth = toDayjs(birthday)
  const base = at === undefined ? dayjs() : toDayjs(at)
  if (!birth || !base) {
    return Number.NaN
  }
  return base.diff(birth, 'year')
}

/**
 * 转为原生 `Date`；非法输入返回 `null`
 */
export function toDate(date: DateInput): Date | null {
  const parsed = toDayjs(date)
  return parsed ? parsed.toDate() : null
}

/**
 * 转为毫秒时间戳；非法输入返回 `NaN`
 */
export function toTimestamp(date: DateInput): number {
  return toDayjs(date)?.valueOf() ?? Number.NaN
}
