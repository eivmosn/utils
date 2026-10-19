import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addDays,
  addMonths,
  age,
  currentDate,
  currentDateTime,
  currentDay,
  currentMonth,
  currentTime,
  currentYear,
  dayOfYear,
  daysInMonth,
  diffDays,
  diffWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  formatDate,
  fromNow,
  isBetween,
  isLeapYear,
  isoWeek,
  isSameDay,
  isSameOrAfter,
  isSameOrBefore,
  isToday,
  isTomorrow,
  isValidDate,
  isWeekend,
  isYesterday,
  normalizeDate,
  parseDate,
  quarterOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  toDate,
  toNow,
  toTimestamp,
  weekOfYear,
} from '../src/date'

// 固定为 2024-01-05 13:05:00
const NOW = new Date(2024, 0, 5, 13, 5, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('current*', () => {
  it('当前日期/时间', () => {
    expect(currentDate()).toBe('2024-01-05')
    expect(currentTime()).toBe('13:05:00')
    expect(currentDateTime()).toBe('2024-01-05 13:05:00')
    expect(currentYear()).toBe(2024)
    expect(currentMonth()).toBe(1)
    expect(currentDay()).toBe(5)
  })
})

describe('isValidDate', () => {
  it('合法与非法输入', () => {
    expect(isValidDate('2024-01-05')).toBe(true)
    expect(isValidDate('abc')).toBe(false)
    expect(isValidDate(null)).toBe(false)
    expect(isValidDate('')).toBe(false)
  })
})

describe('formatDate / parseDate', () => {
  it('格式化，非法返回空串', () => {
    expect(formatDate('2024-01-05', 'MM/DD')).toBe('01/05')
    expect(formatDate('abc')).toBe('')
  })

  it('解析，传 format 时严格模式', () => {
    expect(parseDate('2024-01-05')?.format('YYYY-MM-DD')).toBe('2024-01-05')
    expect(parseDate('2024-1-5', 'YYYY-MM-DD')).toBeNull()
    expect(parseDate('')).toBeNull()
  })
})

describe('diffDays', () => {
  it('按自然日相减，忽略时分秒', () => {
    expect(diffDays('2024-01-05', '2024-01-03')).toBe(2)
    expect(diffDays('2024-01-05 23:00', '2024-01-05 01:00')).toBe(0)
    expect(diffDays('abc', '2024-01-05')).toBeNaN()
  })
})

describe('normalizeDate', () => {
  it('补零成 YYYY-MM-DD', () => {
    expect(normalizeDate('2026-1-1')).toBe('2026-01-01')
    expect(normalizeDate('2026/1/1')).toBe('2026-01-01')
    expect(normalizeDate('2026-01-01 9:5:3')).toBe('2026-01-01')
    expect(normalizeDate(new Date(2026, 0, 1))).toBe('2026-01-01')
  })

  it('不存在的日期判为非法，不静默进位', () => {
    expect(normalizeDate('2026-2-30')).toBe('')
    expect(normalizeDate('2026-13-01')).toBe('')
    expect(normalizeDate('2026-1-32')).toBe('')
    expect(normalizeDate('2026-0-0')).toBe('')
    expect(normalizeDate('2023-2-29')).toBe('')
  })

  it('真实存在的边界日期照常通过', () => {
    expect(normalizeDate('2024-2-29')).toBe('2024-02-29')
    expect(normalizeDate('2023-2-28')).toBe('2023-02-28')
  })

  it('非法输入返回空串', () => {
    expect(normalizeDate('abc')).toBe('')
    expect(normalizeDate(null)).toBe('')
    expect(normalizeDate('')).toBe('')
  })
})

describe('diffWeeks', () => {
  it('按自然周相减，忽略时分秒', () => {
    expect(diffWeeks('2024-01-19', '2024-01-05')).toBe(2)
    expect(diffWeeks('2024-01-05 23:00', '2023-12-29 01:00')).toBe(1)
  })

  it('不足一周向下取整，反向为 0 而非 -0', () => {
    expect(diffWeeks('2024-01-05', '2024-01-01')).toBe(0)
    expect(diffWeeks('2024-01-01', '2024-01-05')).toBe(0)
  })

  it('非法输入返回 NaN', () => {
    expect(diffWeeks('abc', '2024-01-05')).toBeNaN()
    expect(diffWeeks('2024-01-05', null)).toBeNaN()
  })
})

describe('add / sub', () => {
  it('天', () => {
    expect(addDays('2024-01-05', 3)).toBe('2024-01-08')
    expect(subDays('2024-01-05', 3)).toBe('2024-01-02')
  })

  it('月（自动收敛到月末）', () => {
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
    expect(subMonths('2024-03-31', 1)).toBe('2024-02-29')
  })
})

describe('startOf / endOf', () => {
  it('day', () => {
    expect(startOfDay('2024-01-05 13:00')).toBe('2024-01-05 00:00:00')
    expect(endOfDay('2024-01-05 13:00')).toBe('2024-01-05 23:59:59')
  })

  it('month', () => {
    expect(startOfMonth('2024-01-15')).toBe('2024-01-01')
    expect(endOfMonth('2024-01-15')).toBe('2024-01-31')
  })

  it('week（周日为一周起始）', () => {
    expect(startOfWeek('2024-01-10')).toBe('2024-01-07')
    expect(endOfWeek('2024-01-10')).toBe('2024-01-13')
  })
})

describe('daysInMonth / isLeapYear / isWeekend', () => {
  it('daysInMonth', () => {
    expect(daysInMonth('2024-02-01')).toBe(29)
    expect(daysInMonth('2023-02-01')).toBe(28)
    expect(daysInMonth('abc')).toBeNaN()
  })

  it('isLeapYear', () => {
    expect(isLeapYear('2024-01-01')).toBe(true)
    expect(isLeapYear('2023-01-01')).toBe(false)
  })

  it('isWeekend', () => {
    expect(isWeekend('2024-01-06')).toBe(true) // 周六
    expect(isWeekend('2024-01-07')).toBe(true) // 周日
    expect(isWeekend('2024-01-05')).toBe(false) // 周五
  })
})

describe('关系判断', () => {
  it('today / tomorrow / yesterday', () => {
    expect(isToday('2024-01-05')).toBe(true)
    expect(isTomorrow('2024-01-06')).toBe(true)
    expect(isYesterday('2024-01-04')).toBe(true)
    expect(isToday('2024-01-04')).toBe(false)
  })

  it('same / before / after', () => {
    expect(isSameDay('2024-01-05', '2024-01-05 23:00')).toBe(true)
    expect(isSameOrBefore('2024-01-04', '2024-01-05')).toBe(true)
    expect(isSameOrAfter('2024-01-05', '2024-01-05')).toBe(true)
    expect(isSameOrAfter('2024-01-04', '2024-01-05')).toBe(false)
  })

  it('isBetween 默认不含端点', () => {
    expect(isBetween('2024-01-05', '2024-01-01', '2024-01-10')).toBe(true)
    expect(isBetween('2024-01-01', '2024-01-01', '2024-01-10')).toBe(false)
  })
})

describe('week / quarter / dayOfYear', () => {
  it('isoWeek / quarterOfYear / dayOfYear', () => {
    expect(isoWeek('2024-01-05')).toBe(1)
    expect(quarterOfYear('2024-05-01')).toBe(2)
    expect(dayOfYear('2024-02-01')).toBe(32)
  })

  it('weekOfYear 返回数字', () => {
    expect(typeof weekOfYear('2024-01-05')).toBe('number')
  })
})

describe('相对时间 / 年龄 / 转换', () => {
  it('fromNow / toNow 返回字符串', () => {
    expect(fromNow('2024-01-01')).toBeTypeOf('string')
    expect(toNow('2024-01-10')).toBeTypeOf('string')
  })

  it('age 按整年计算', () => {
    expect(age('2000-01-01', '2024-01-01')).toBe(24)
  })

  it('toDate / toTimestamp', () => {
    expect(toDate('2024-01-05')).toBeInstanceOf(Date)
    expect(toDate('2024-01-05')?.getTime()).toBe(toTimestamp('2024-01-05'))
    expect(toDate('abc')).toBeNull()
    expect(toTimestamp('abc')).toBeNaN()
  })
})
