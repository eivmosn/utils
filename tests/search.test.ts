import { describe, expect, it } from 'vitest'
import { escapeHtml, highlight, searchList } from '../src/search'

const list = [
  { id: 1, app: '信访工作台', name: '测试应用' },
  { id: 2, app: '视图测试', name: '测试应用' },
  { id: 3, app: '客户主数据', name: '生产应用' },
]

describe('searchList', () => {
  it('逐字段 indexOf 匹配，保持原顺序', () => {
    const results = searchList(list, '测试', { fields: ['app', 'name'] })
    expect(results.map(r => r.item.id)).toEqual([1, 2])
    expect(results[0].field).toBe('name')
    expect(results[0].text).toBe('测试应用')
    expect(results[0].matchedFields).toEqual(['name'])
  })

  it('多字段命中时记录全部字段', () => {
    const results = searchList(list, '视图', { fields: ['app', 'name'] })
    expect(results[0].matchedFields).toEqual(['app'])
  })

  it('默认忽略大小写', () => {
    expect(searchList([{ code: 'ABC' }], 'abc', { fields: ['code'] })).toHaveLength(1)
    expect(searchList([{ code: 'ABC' }], 'abc', { fields: ['code'], caseSensitive: true })).toHaveLength(0)
  })

  it('只按传入字段匹配，值先转成字符串', () => {
    // 数字字段传了就能搜到（值统一 String() 后比较）
    expect(searchList([{ id: 1234 }], '1234', { fields: ['id'] })[0].item.id).toBe(1234)
    // 没传的字段不参与
    expect(searchList([{ app: '测试', name: 'x' }], '测试', { fields: ['name'] })).toEqual([])
  })

  it('空关键词/空字段/空数据返回空', () => {
    expect(searchList(list, '  ', { fields: ['app'] })).toEqual([])
    expect(searchList(list, '测试', { fields: [] })).toEqual([])
    expect(searchList([], '测试', { fields: ['app'] })).toEqual([])
  })

  it('limit 生效，limit<=0 视为不限', () => {
    expect(searchList(list, '测试', { fields: ['name'], limit: 1 })).toHaveLength(1)
    expect(searchList(list, '应用', { fields: ['name'], limit: 0 })).toHaveLength(3)
  })
})

describe('highlight', () => {
  it('命中字符包 span，默认内联红', () => {
    expect(highlight('测试应用', '测试')).toBe('<span style="color:#f5222d;font-weight:600">测试</span>应用')
  })

  it('多次命中全部高亮', () => {
    expect(highlight('测试a测试', '测试')).toBe(
      '<span style="color:#f5222d;font-weight:600">测试</span>a<span style="color:#f5222d;font-weight:600">测试</span>',
    )
  })

  it('忽略大小写，但高亮的是原文', () => {
    expect(highlight('Application', 'app')).toBe('<span style="color:#f5222d;font-weight:600">App</span>lication')
  })

  it('自定义样式与 class', () => {
    expect(highlight('测试应用', '测试', { style: 'color:#1677ff' })).toBe(
      '<span style="color:#1677ff">测试</span>应用',
    )
    expect(highlight('测试应用', '测试', { style: '', class: 'hl' })).toBe('<span class="hl">测试</span>应用')
  })

  it('默认转义，防注入', () => {
    expect(highlight('<img src=x onerror=alert(1)>', 'img')).toBe(
      '&lt;<span style="color:#f5222d;font-weight:600">img</span> src=x onerror=alert(1)&gt;',
    )
  })

  it('未命中/空文本返回转义后的原文', () => {
    expect(highlight('abc', 'z')).toBe('abc')
    expect(highlight('<b>', '')).toBe('&lt;b&gt;')
    expect(highlight('', 'a')).toBe('')
  })

  it('emoji 不会被切开', () => {
    expect(highlight('中文😀emoji', '😀')).toBe('中文<span style="color:#f5222d;font-weight:600">😀</span>emoji')
  })

  it('escapeHtml 覆盖危险字符', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;')
  })
})
