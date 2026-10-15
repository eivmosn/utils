import type { HighlightOptions } from './types'

/** 默认高亮色：内联 style，不用引任何 CSS */
export const HIGHLIGHT_STYLE = 'color:#f5222d;font-weight:600'

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
}

/**
 * HTML 转义，交给 `v-html` 前必须做
 *
 * @param text 原始文本
 * @example
 * escapeHtml('<b>')  // '&lt;b&gt;'
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, char => ESCAPE_MAP[char])
}

/**
 * 把关键词命中的字符包成 `<span>`，返回可直接给 `v-html` 的 HTML
 *
 * @param text 原始文本
 * @param keyword 关键词，空串时原样返回（仍会按需转义）
 * @param options 高亮配置，见 {@link HighlightOptions}
 * @example
 * ```html
 * <span v-html="highlight(r.text, keyword)" />
 * ```
 */
export function highlight(
  text: string,
  keyword: string,
  options: HighlightOptions = {},
): string {
  const esc = options.escape === false ? (value: string) => value : escapeHtml
  const pattern = keyword.trim()
  if (!text || !pattern) {
    return esc(text)
  }
  return wrap(text, pattern, options, esc)
}

function wrap(
  text: string,
  pattern: string,
  options: HighlightOptions,
  esc: (text: string) => string,
): string {
  const style = options.style ?? HIGHLIGHT_STYLE
  const attrs = (options.class ? ` class="${esc(options.class)}"` : '')
    + (style ? ` style="${esc(style)}"` : '')
  const open = `<span${attrs}>`
  const close = '</span>'

  const haystack = options.caseSensitive ? text : text.toLowerCase()
  const needle = options.caseSensitive ? pattern : pattern.toLowerCase()

  let html = ''
  let cursor = 0
  let at = haystack.indexOf(needle)
  while (at !== -1) {
    // 高亮内容取自原文，大小写不敏感时也保持原样
    html += esc(text.slice(cursor, at)) + open + esc(text.slice(at, at + needle.length)) + close
    cursor = at + needle.length
    at = haystack.indexOf(needle, cursor)
  }
  return cursor ? html + esc(text.slice(cursor)) : esc(text)
}
