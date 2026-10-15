# @eivmosn/utils

面向 JavaScript / TypeScript 的常用工具集合：日期、搜索、通用对象/数组/树处理、ID、存储等。
纯函数，无副作用（除写明的浏览器 API 外），完整类型，Tree-shakable。

## 安装

```bash
pnpm add @eivmosn/utils
```

```ts
import { formatDate, toTree, createId } from '@eivmosn/utils'

// Vue composable 单独入口（避免纯函数入口依赖 vue）
import { useSearch } from '@eivmosn/utils/vue'
```

## 能力速查（按需求找方法）

| 我要做的事 | 用这些方法 | 模块 |
| --- | --- | --- |
| 格式化日期 / 时间 | `formatDate` `currentDate` `currentTime` `currentDateTime` | date |
| 日期加减 | `addDays` `subDays` `addMonths` `subMonths` | date |
| 算日期间隔 / 年龄 | `diffDays` `age` | date |
| 日期比较 / 区间 / 闰年 / 周末 | `isSameDay` `isSameOrBefore` `isSameOrAfter` `isBetween` `isLeapYear` `isWeekend` | date |
| 取某天的起止（日 / 月 / 周） | `startOfDay` `endOfDay` `startOfMonth` `endOfMonth` `startOfWeek` `endOfWeek` | date |
| 周数 / 季度 / 第几天 | `weekOfYear` `isoWeek` `quarterOfYear` `dayOfYear` | date |
| 解析日期 / 校验日期 | `parseDate` `toDate` `toTimestamp` `isValidDate` | date |
| 相对时间（"3 天前"） | `fromNow` `toNow` | date |
| 日历 / 农历 / 节气 / 节日 | `Calendar` | date |
| 数组按字段模糊搜索 | `searchList` | search |
| 关键词高亮（配 `v-html`） | `highlight` `escapeHtml` | search |
| Vue 搜索输入框（含防抖） | `useSearch` | vue（子路径） |
| 对象路径取值 / 赋值 | `get` `set` | common |
| 对象浅合并 | `merge` | common |
| 扁平数组转树 / 展平 / 查找 | `toTree` `flattenList`(`treeToList`) `findNode` | common |
| 数组按字段去重 | `uniq` | common |
| 包装成数组 / 类型判断 / 空值判断 | `toArray` `toTypeString` `isEmptyValue` | common |
| 转布尔 / 解析 URL 查询参数 | `toBoolean` `getUrlParams` | common |
| 求和 / 平均 / 最值 | `sum` `avg` `getMaxNumber` `getMinNumber` | math |
| 生成唯一 ID（默认无特殊字符） | `createId` | id |
| 本地存储（带前缀） | `useStorage` | storage |
| 数字补单位（px / em …） | `normalizeUnit` | css |

## API 清单

### common — 通用（对象 / 数组 / 树 / 类型）

| 方法 | 说明 |
| --- | --- |
| `get(source, path, defaultValue?)` | 按路径读对象属性，支持 `a.b[0].c` |
| `set(source, path, value)` | 按路径写属性，中间层级自动创建普通对象 |
| `merge(target, source)` | 浅合并，忽略 `undefined`，原地修改并返回 `target` |
| `uniq(arr, key)` | 按字段去重，保留首次出现 |
| `toArray(val)` | `null`/`undefined` → `[]`，数组原样，其余包成单元素数组 |
| `toBoolean(value)` | 转布尔，字符串仅 `'true'`（忽略大小写）为 `true` |
| `toTypeString(val)` | 返回内部类型标签，如 `'Array'` `'Object'` `'Date'` |
| `isEmptyValue(val)` | `undefined`/`null`/`''`/`[]`/`{}` 视为空 |
| `toTree(arr, { key, parent, children })` | 扁平数组转树（单遍，支持子先于父） |
| `flattenList(tree, children?)` | 树展平为数组（前序，迭代实现） |
| `treeToList` | `flattenList` 的别名 |
| `findNode(arr, callbackfn, children?)` | 深度优先查找第一个匹配节点 |
| `getUrlParams(url, options?)` | 解析 URL 查询参数；`{ boolean: true }` 时把 `'true'`/`'false'` 转成布尔 |

### css

| 方法 | 说明 |
| --- | --- |
| `normalizeUnit(value, unit?)` | 数字/数字字符串补单位，默认 `'px'`，非数字按 `0` |

### math

| 方法 | 说明 |
| --- | --- |
| `sum(arr, field)` | 求和 |
| `avg(arr, field)` | 求平均（空数组 `NaN`） |
| `getMaxNumber(arr, field)` | 最大值 |
| `getMinNumber(arr, field)` | 最小值 |

### id

| 方法 | 说明 |
| --- | --- |
| `createId(size?)` | 生成指定长度的唯一 ID，默认 21，纯字母数字 |
| `createId({ size?, alphabet?, specialChars? })` | 允许特殊字符或自定义字符集 |

### storage · 浏览器

| 方法 | 说明 |
| --- | --- |
| `useStorage({ prefix?, type? })` | 带前缀的本地存储，返回 `{ getStorage, setStorage }`；依赖 `localStorage`/`sessionStorage` |

### date

| 方法 | 说明 |
| --- | --- |
| `DATE_FORMAT` `TIME_FORMAT` `DATE_TIME_FORMAT` | 常用格式常量 |
| `isValidDate(date)` | 是否合法日期 |
| `currentDate()` `currentTime()` `currentDateTime()` | 当前日期 / 时间 / 日期时间字符串 |
| `currentYear()` `currentMonth()` `currentDay()` | 当前年 / 月(1-12) / 日 |
| `formatDate(date, format?)` | 格式化，非法输入返回 `''` |
| `parseDate(date, format?)` | 解析为 dayjs，失败返回 `null`；传 `format` 启用严格模式 |
| `diffDays(a, b)` | 相差自然天数，非法输入 `NaN` |
| `addDays` `subDays` `addMonths` `subMonths` | 日期加减 |
| `startOfDay` `endOfDay` `startOfMonth` `endOfMonth` `startOfWeek` `endOfWeek` | 起止时间 |
| `daysInMonth(date)` | 当月天数 |
| `isLeapYear(date)` | 是否闰年 |
| `isWeekend(date)` | 是否周末 |
| `isToday` `isTomorrow` `isYesterday` | 相对今天 |
| `isSameDay` `isSameOrBefore` `isSameOrAfter` `isBetween` | 比较与区间 |
| `weekOfYear` `isoWeek` `quarterOfYear` `dayOfYear` | 周 / 季度 / 年内序号 |
| `fromNow` `toNow` | 相对现在描述 |
| `age(birthday, at?)` | 按整年计算年龄 |
| `toDate(date)` `toTimestamp(date)` | 转原生 `Date` / 毫秒时间戳 |
| `dayjs` | 已注册完整插件的 dayjs 实例 |

### date / Calendar

| 方法 | 说明 |
| --- | --- |
| `new Calendar({ date?, weekStart? })` | 日历实例，`weekStart` 默认 0（周日） |
| `.getCalendarData({ weekStart? })` | 月视图，固定 6×7，含农历 / 节气 / 节日 |
| `.getWeekOrder({ weekStart? })` | 星期表头顺序 |
| `.setWeekStart(n)` `.getWeekStart()` | 设置 / 读取每周起始日（链式） |
| `.prevMonth()` `.nextMonth()` `.currentMonth()` | 月份切换（链式） |
| `.getCurrentDate()` | 当前 dayjs |

### search

| 方法 | 说明 |
| --- | --- |
| `searchList(list, keyword, { fields, limit?, caseSensitive? })` | 逐字段模糊匹配，保持原顺序 |
| `highlight(text, keyword, options?)` | 命中关键词包 `<span>`，返回可交给 `v-html` 的 HTML |
| `escapeHtml(text)` | HTML 转义 |
| `HIGHLIGHT_STYLE` | 默认高亮内联样式 |
| `useSearch(data, options)` | Vue composable，返回 `{ keyword, results }`（子路径 `vue`） |

## 约定

- **失败返回值**：取值型返回 `null`，数值型返回 `NaN`，字符串型返回 `''`。
- **日期入参** `DateInput`：`string | number | Date | Dayjs | null | undefined`，非法输入按上述约定处理。
- **环境**：`useStorage` 依赖浏览器全局；`useSearch` 依赖 `vue`（可选 peer，仅经 `vue` 子路径引入）。
