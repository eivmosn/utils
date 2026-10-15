import type { CalendarDay } from '../src/date'
import { describe, expect, it } from 'vitest'
import { Calendar, dayjs } from '../src/date'

function findDay(data: CalendarDay[][], fullDate: string) {
  return data.flat().find(day => day.fullDate === fullDate)
}

describe('calendar', () => {
  it('固定返回 6 行 7 列', () => {
    const data = new Calendar({ date: dayjs('2024-01-15') }).getCalendarData()
    expect(data).toHaveLength(6)
    data.forEach(week => expect(week).toHaveLength(7))
  })

  it('默认周日为一周起始，首格落在上个月', () => {
    const firstWeek = new Calendar({ date: dayjs('2024-01-15') }).getCalendarData()[0]
    expect(firstWeek[0].fullDate).toBe('2023-12-31')
    expect(firstWeek[0].isCurrentMonth).toBe(false)
    expect(firstWeek[0].isWeekend).toBe(true)
  })

  it('weekStart=1 时首格为周一', () => {
    const data = new Calendar({ date: dayjs('2024-01-15'), weekStart: 1 }).getCalendarData()
    expect(data[0][0].fullDate).toBe('2024-01-01')
    expect(data[0][0].isCurrentMonth).toBe(true)
  })

  it('getWeekOrder 随 weekStart 变化', () => {
    expect(new Calendar().getWeekOrder()).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(new Calendar({ weekStart: 1 }).getWeekOrder()).toEqual([1, 2, 3, 4, 5, 6, 0])
  })

  it('单次查询的 weekStart 不污染实例', () => {
    const calendar = new Calendar({ date: dayjs('2024-01-15') })
    calendar.getCalendarData({ weekStart: 1 })
    expect(calendar.getWeekStart()).toBe(0)
  })

  it('setWeekStart 非法值回退到 0，且支持链式调用', () => {
    const calendar = new Calendar()
    expect(calendar.setWeekStart(3).getWeekStart()).toBe(3)
    expect(calendar.setWeekStart(9 as any).getWeekStart()).toBe(0)
  })

  it('包含农历信息', () => {
    const day = findDay(new Calendar({ date: dayjs('2024-02-10') }).getCalendarData(), '2024-02-10')
    expect(day?.lunarDate.month).toBe(1)
    expect(day?.lunarDate.day).toBe(1)
    expect(day?.lunar).toBe(day?.lunarDate.dayName)
  })

  it('节气与节日', () => {
    const day = findDay(new Calendar({ date: dayjs('2024-04-04') }).getCalendarData(), '2024-04-04')
    expect(day?.solarTerm).toBe('清明')
    expect(day?.holidays).toContain('清明节')
  })

  it('月份切换链式调用', () => {
    const calendar = new Calendar({ date: dayjs('2024-01-15') })
    expect(calendar.nextMonth().getCurrentDate().format('YYYY-MM')).toBe('2024-02')
    expect(calendar.prevMonth().getCurrentDate().format('YYYY-MM')).toBe('2024-01')
  })
})
