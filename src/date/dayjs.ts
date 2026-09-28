import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import dayOfYear from 'dayjs/plugin/dayOfYear.js'
import duration from 'dayjs/plugin/duration.js'
import isBetween from 'dayjs/plugin/isBetween.js'
import isLeapYear from 'dayjs/plugin/isLeapYear.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import isToday from 'dayjs/plugin/isToday.js'
import isTomorrow from 'dayjs/plugin/isTomorrow.js'
import isYesterday from 'dayjs/plugin/isYesterday.js'
import quarterOfYear from 'dayjs/plugin/quarterOfYear.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'

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
