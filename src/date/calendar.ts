import type { Dayjs } from './dayjs'
import lunisolar from 'lunisolar'
import festivals from 'lunisolar/markers/festivals.zh-cn'
import dayjs from './dayjs'

lunisolar.Markers.add(festivals)

export interface LunarDate {
  year: number // 农历年，可能与公历年不同(公历 1 月常属上一年腊月)
  month: number // 1-12，闰月不出现 102 这类编码值
  day: number // 1-30
  leapMonth: number // 该月所属闰月，非闰月为 0
  isLeapMonth: boolean
  monthName: string // 如「八月」「閏二月」
  dayName: string // 如「廿九」
  yearName: string // 如「二〇二四」
}

export interface CalendarDay {
  fullDate: string // YYYY-MM-DD
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean // 周六或周日，与 weekStart 无关
  year: number
  month: number // 1-12
  weekday: number // 0=周日 ... 6=周六，文案由调用方映射
  lunar: string // 农历日名，等价于 lunarDate.dayName
  lunarDate: LunarDate
  holidays: string[] // 已按展示优先级排序，holidays[0] 为最该展示的
  solarTerm?: string // 节气名，非节气日为 undefined
}

export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface CalendarOptions {
  date?: Dayjs // 默认当前日期
  weekStart?: WeekStart // 默认 0(周日)
}

// 单次调用可覆盖的配置，date 由实例持有故不含
export interface CalendarQueryOptions {
  weekStart?: WeekStart
}

function normalizeWeekStart(weekStart?: number): WeekStart {
  if (typeof weekStart !== 'number' || !Number.isInteger(weekStart) || weekStart < 0 || weekStart > 6) {
    return 0
  }
  return weekStart as WeekStart
}

interface LunarLike {
  year: number
  month: number
  day: number
  leapMonth: number
  getMonthName: () => string
  getDayName: () => string
  getYearName: () => string
}

// lunisolar 以 month = 100 + 真实月份 表示闰月(闰二月 => 102)，此处还原
function createLunarDate(lunar: LunarLike): LunarDate {
  const isLeapMonth = lunar.month > 100
  return {
    year: lunar.year,
    month: isLeapMonth ? lunar.month - 100 : lunar.month,
    day: lunar.day,
    leapMonth: lunar.leapMonth,
    isLeapMonth,
    monthName: lunar.getMonthName(),
    dayName: lunar.getDayName(),
    yearName: lunar.getYearName(),
  }
}

function isWeekendDay(weekday: number): boolean {
  return weekday === 0 || weekday === 6
}

function formatDate(date: Dayjs): string {
  return date.format('YYYY-MM-DD')
}

// 展示优先级：中国传统节日 > 中国节日 > 国际节日
const TAG_PRIORITY: string[] = ['traditional', 'cn', 'international']

function festivalRank(marker: { tag?: string[] }): number {
  const index = TAG_PRIORITY.findIndex(tag => marker.tag?.includes(tag))
  return index === -1 ? TAG_PRIORITY.length : index
}

function collectFestivals(markers: { name: string, tag?: string[] }[]): string[] {
  if (markers.length === 0) {
    return []
  }

  // Markers 是全局注册表，重复 add 会让同一节日出现多次
  const unique = [...new Map(markers.map(marker => [marker.name, marker])).values()]

  // 次级按名称排序，保证同优先级下顺序稳定
  unique.sort((a, b) => festivalRank(a) - festivalRank(b) || a.name.localeCompare(b.name))

  return unique.map(marker => marker.name)
}

// 补足 festivals.zh-cn 缺失的传统节日，结果排在数据源节日之前
function deriveTraditionalFestivals(
  lunarDate: LunarDate,
  options: { solarTerm?: string, isLunarYearEve?: boolean } = {},
): string[] {
  const { month, day, isLeapMonth } = lunarDate
  const { solarTerm, isLunarYearEve } = options
  const derived: string[] = []

  // 闰月不参与判定，避免闰腊月等误判
  if (!isLeapMonth) {
    if (month === 1 && day === 15) {
      derived.push('元宵节')
    }

    // 除夕由「次日为正月初一」判定，腊月有 29/30 两种情况
    if (month === 12 && isLunarYearEve) {
      derived.push('除夕')
    }

    // 北方小年为腊月廿三，南方廿四可由调用方自行判断
    if (month === 12 && day === 23) {
      derived.push('小年')
    }
  }

  // 清明是唯一按节气而非农历确定的传统节日
  if (solarTerm === '清明') {
    derived.push('清明节')
  }

  return derived
}

// 视图会跨到邻年，故按实际跨越的年份集合构建
function buildSolarTermMap(years: Iterable<number>): Record<string, string> {
  const solarTerms: Record<string, string> = {}
  const nameList = lunisolar.SolarTerm.getNames()

  for (const year of new Set(years)) {
    const dayOfYearList = lunisolar.SolarTerm.getYearTermDayList(year)

    for (let i = 0; i < 24; i++) {
      // 节气每两个一组对应一个月份
      const month = `${(i >> 1) + 1}`.padStart(2, '0')
      const day = `${dayOfYearList[i]}`.padStart(2, '0')
      solarTerms[`${year}-${month}-${day}`] = nameList[i]
    }
  }

  return solarTerms
}

// 首格可能落在上个月，取决于当月 1 号是周几
function resolveFirstCalendarDay(year: number, month: number, weekStart: WeekStart): Dayjs {
  const firstDayOfMonth = dayjs().year(year).month(month).date(1)
  const offset = (firstDayOfMonth.day() - weekStart + 7) % 7
  return firstDayOfMonth.subtract(offset, 'day')
}

function createCalendarDay(
  date: Dayjs,
  year: number,
  month: number,
  solarTermMap: Record<string, string>,
): CalendarDay {
  const fullDate = formatDate(date)
  const solar = lunisolar(fullDate)
  // 由日期本身推导星期，而非所在列的列下标
  const weekday = date.day()
  const lunarDate = createLunarDate(solar.lunar as unknown as LunarLike)
  const solarTerm = solarTermMap[fullDate]

  // 腊月最后一天即次日为正月初一；不能写成 day >= 29，否则大月的廿九会误判
  const nextLunar = (lunisolar(formatDate(date.add(1, 'day'))).lunar) as unknown as LunarLike
  const isLunarYearEve = !lunarDate.isLeapMonth
    && lunarDate.month === 12
    && nextLunar.month === 1
    && nextLunar.day === 1

  const holidays = [
    ...deriveTraditionalFestivals(lunarDate, { solarTerm, isLunarYearEve }),
    ...collectFestivals(solar.markers.list as { name: string, tag?: string[] }[]),
  ]

  return {
    fullDate,
    day: date.date(),
    isCurrentMonth: date.month() === month,
    isToday: date.isSame(dayjs(), 'day'),
    isWeekend: isWeekendDay(weekday),
    year: date.year(),
    month: date.month() + 1,
    weekday,
    lunar: lunarDate.dayName,
    lunarDate,
    holidays,
    solarTerm,
  }
}

const DAYS_PER_WEEK = 7
const TOTAL_DAYS = 6 * DAYS_PER_WEEK

function chunkIntoWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = []
  for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
    weeks.push(days.slice(i, i + DAYS_PER_WEEK))
  }
  return weeks
}

export class Calendar {
  private currentDate: Dayjs
  private weekStart: WeekStart

  constructor(options?: CalendarOptions) {
    this.currentDate = options?.date ? options.date.clone() : dayjs()
    this.weekStart = normalizeWeekStart(options?.weekStart)
  }

  // 0=周日 1=周一 ... 6=周六；非法值回退到 0
  setWeekStart(weekStart: WeekStart): this {
    this.weekStart = normalizeWeekStart(weekStart)
    return this
  }

  getWeekStart(): WeekStart {
    return this.weekStart
  }

  // 表头顺序必须由它决定，否则与数据列不对齐；weekStart=1 -> [1,2,3,4,5,6,0]
  getWeekOrder(options?: CalendarQueryOptions): WeekStart[] {
    const weekStart = options?.weekStart === undefined
      ? this.weekStart
      : normalizeWeekStart(options.weekStart)
    return Array.from({ length: 7 }, (_, i) => ((weekStart + i) % 7) as WeekStart)
  }

  // 返回 6 行 7 列；options 仅覆盖本次调用，不污染实例
  getCalendarData(options?: CalendarQueryOptions): CalendarDay[][] {
    const weekStart = options?.weekStart === undefined
      ? this.weekStart
      : normalizeWeekStart(options.weekStart)
    const year = this.currentDate.year()
    const month = this.currentDate.month()

    const firstDay = resolveFirstCalendarDay(year, month, weekStart)
    // 末格决定需要哪些年份的节气表
    const lastDay = firstDay.add(TOTAL_DAYS - 1, 'day')
    const solarTermMap = buildSolarTermMap([firstDay.year(), lastDay.year()])

    // 游标自增，避免 add(i, 'day') 每次从起点重算
    const days: CalendarDay[] = []
    let cursor = firstDay
    for (let i = 0; i < TOTAL_DAYS; i++) {
      days.push(createCalendarDay(cursor, year, month, solarTermMap))
      cursor = cursor.add(1, 'day')
    }

    return chunkIntoWeeks(days)
  }

  prevMonth(): this {
    this.currentDate = this.currentDate.subtract(1, 'month')
    return this
  }

  nextMonth(): this {
    this.currentDate = this.currentDate.add(1, 'month')
    return this
  }

  currentMonth(): this {
    this.currentDate = dayjs()
    return this
  }

  getCurrentDate(): Dayjs {
    return this.currentDate
  }
}
