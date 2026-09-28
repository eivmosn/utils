import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import isYesterday from 'dayjs/plugin/isYesterday'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import relativeTime from 'dayjs/plugin/relativeTime'
import weekOfYear from 'dayjs/plugin/weekOfYear'

// 插件统一在此注册，其余模块从这个实例引入，避免各模块插件状态不一致
dayjs.extend(customParseFormat)
dayjs.extend(dayOfYear)
dayjs.extend(duration)
dayjs.extend(isBetween)
dayjs.extend(isLeapYear)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(isToday)
dayjs.extend(isTomorrow)
dayjs.extend(isYesterday)
dayjs.extend(isoWeek)
dayjs.extend(quarterOfYear)
dayjs.extend(relativeTime)
dayjs.extend(weekOfYear)

export default dayjs
export type { Dayjs } from 'dayjs'
