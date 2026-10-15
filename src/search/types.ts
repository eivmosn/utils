/** 搜索字段名 */
export type SearchField = string

/** 单条搜索结果 */
export interface SearchResult<T> {
  /** 命中的数据 */
  item: T
  /** 在原始数组中的下标 */
  index: number
  /** 第一个命中字段 */
  field: SearchField
  /** 该字段文本，直接交给 `highlight` 上色 */
  text: string
  /** 全部命中字段 */
  matchedFields: SearchField[]
}

/** 搜索入参 */
export interface SearchOptions {
  /** 搜索字段，必填 */
  fields: ReadonlyArray<SearchField>
  /** 限制返回条数 */
  limit?: number
  /** 是否大小写敏感，默认 false */
  caseSensitive?: boolean
}

/** 高亮入参 */
export interface HighlightOptions {
  /** 内联样式，默认红色加粗；传 `''` 表示只用 class */
  style?: string
  /** 高亮 class */
  class?: string
  /** 是否大小写敏感，默认 false */
  caseSensitive?: boolean
  /** 是否转义文本，默认 true(用 v-html 时不要关) */
  escape?: boolean
}

/** composable 入参 */
export interface UseSearchOptions extends SearchOptions {
  /** 初始关键词 */
  keyword?: string
  /** 关键词防抖(ms)，0(默认)表示实时搜索 */
  debounce?: number
}
