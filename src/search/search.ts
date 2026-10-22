import type { SearchField, SearchOptions, SearchResult } from './types'

/**
 * 数组对象的字段模糊匹配
 *
 * 逐字段 `indexOf` 判断是否包含关键词(默认忽略大小写)，命中即保留；
 * 顺序与入参一致，不做相关度排序。
 *
 * @param list 待搜索的数组
 * @param keyword 关键词，首尾空白会被裁剪
 * @param options 搜索配置，见 {@link SearchOptions}
 * @returns 命中结果，含命中的数据、下标与字段
 * @example
 * ```ts
 * const results = searchList(list, '测试', { fields: ['app', 'name'] })
 * results[0].item  // 命中的数据
 * results[0].text  // 命中字段的文本，交给 highlight 上色
 * ```
 */
export function searchList<T extends Record<string, any>>(
  list: ReadonlyArray<T>,
  keyword: string,
  options: SearchOptions,
): SearchResult<T>[] {
  const { fields } = options
  const kw = keyword.trim()
  if (!fields.length || !kw) {
    return []
  }

  const needle = options.caseSensitive ? kw : kw.toLowerCase()
  const limit = options.limit && options.limit > 0 ? options.limit : Number.POSITIVE_INFINITY

  const results: SearchResult<T>[] = []
  for (let index = 0; index < list.length && results.length < limit; index++) {
    const item = list[index]
    let matchedFields: SearchField[] | undefined
    let text = ''

    for (const field of fields) {
      const value = item[field]
      if (value == null) {
        continue
      }
      const content = String(value)
      if (options.caseSensitive ? !content.includes(needle) : !content.toLowerCase().includes(needle)) {
        continue
      }
      ;(matchedFields ??= []).push(field)
      text ||= content
    }

    if (matchedFields) {
      results.push({ item, index, field: matchedFields[0], text, matchedFields })
    }
  }

  return results
}
