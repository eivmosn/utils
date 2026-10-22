import { describe, expect, it } from 'vitest'
import {
  findNode,
  flattenList,
  get,
  getUrlParams,
  isEmptyValue,
  merge,
  set,
  toArray,
  toBoolean,
  toTree,
  toTypeString,
  treeToList,
  uniq,
} from '../src/common'

describe('get / set', () => {
  it('按路径读取，支持数组下标', () => {
    expect(get({ a: { b: 1 } }, 'a.b')).toBe(1)
    expect(get({ a: [{ b: 1 }] }, 'a[0].b')).toBe(1)
  })

  it('取不到时返回默认值', () => {
    expect(get({ a: 1 }, 'b')).toBeUndefined()
    expect(get({ a: 1 }, 'a.b.c', 'x')).toBe('x')
  })

  it('按路径写入，自动创建中间对象', () => {
    const obj: any = {}
    set(obj, 'a.b', 1)
    set(obj, 'a.c', 2)
    expect(obj).toEqual({ a: { b: 1, c: 2 } })
  })

  it('写入已存在的数组下标', () => {
    const obj: any = { list: [1, 2, 3] }
    set(obj, 'list[1]', 9)
    expect(obj.list).toEqual([1, 9, 3])
  })
})

describe('merge', () => {
  it('浅合并，忽略 undefined，原地修改并返回 target', () => {
    const target: Record<string, number> = { a: 1, b: 2 }
    const result = merge(target, { a: undefined, b: 3, c: 4 })
    expect(result).toBe(target)
    expect(target).toEqual({ a: 1, b: 3, c: 4 })
  })
})

describe('uniq', () => {
  it('按字段去重，保留首次出现', () => {
    expect(uniq([{ id: 1 }, { id: 1 }, { id: 2 }], 'id')).toEqual([{ id: 1 }, { id: 2 }])
  })
})

describe('toArray', () => {
  it('包装为数组', () => {
    expect(toArray(null)).toEqual([])
    expect(toArray(undefined)).toEqual([])
    expect(toArray(1)).toEqual([1])
    expect(toArray([1, 2])).toEqual([1, 2])
  })
})

describe('toBoolean', () => {
  it('字符串只认 true（忽略大小写）', () => {
    expect(toBoolean('TRUE')).toBe(true)
    expect(toBoolean('true')).toBe(true)
    expect(toBoolean('no')).toBe(false)
  })

  it('非字符串走 !!', () => {
    expect(toBoolean(0)).toBe(false)
    expect(toBoolean(1)).toBe(true)
    expect(toBoolean(null)).toBe(false)
  })
})

describe('toTypeString', () => {
  it('返回内部类型标签', () => {
    expect(toTypeString([])).toBe('Array')
    expect(toTypeString({})).toBe('Object')
    expect(toTypeString(null)).toBe('Null')
    expect(toTypeString(new Date())).toBe('Date')
  })
})

describe('isEmptyValue', () => {
  it('空值判定', () => {
    expect(isEmptyValue(undefined)).toBe(true)
    expect(isEmptyValue(null)).toBe(true)
    expect(isEmptyValue('')).toBe(true)
    expect(isEmptyValue([])).toBe(true)
    expect(isEmptyValue({})).toBe(true)
    expect(isEmptyValue(() => {})).toBe(false)
    expect(isEmptyValue(0)).toBe(false)
  })
})

describe('toTree / flattenList / findNode', () => {
  const list = [
    { id: 1, pid: null },
    { id: 2, pid: 1 },
    { id: 3, pid: 1 },
    { id: 4, pid: 2 },
  ]
  const options = { key: 'id', parent: 'pid', children: 'children' }

  it('扁平数组转树', () => {
    const tree = toTree(list, options) as any[]
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(1)
    expect(tree[0].children.map((n: any) => n.id)).toEqual([2, 3])
    expect(tree[0].children[0].children.map((n: any) => n.id)).toEqual([4])
  })

  it('展开树，treeToList 为别名', () => {
    const tree = toTree(list, options)
    expect(flattenList(tree).map((n: any) => n.id)).toEqual([1, 2, 4, 3])
    expect(treeToList).toBe(flattenList)
  })

  it('深度优先查找第一个匹配节点', () => {
    const tree = toTree(list, options)
    expect(findNode(tree, (n: any) => n.id === 4)?.id).toBe(4)
    expect(findNode(tree, (n: any) => n.id === 99)).toBeUndefined()
  })

  it('子节点先于父节点出现也能正确挂载', () => {
    const flat = [
      { id: 2, pid: 1 },
      { id: 1, pid: null },
      { id: 3, pid: 1 },
    ]
    const tree = toTree(flat, options) as any[]
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(1)
    expect(tree[0].children.map((n: any) => n.id)).toEqual([2, 3])
  })

  it('父节点不存在时该节点被丢弃', () => {
    const flat = [
      { id: 1, pid: null },
      { id: 2, pid: 99 },
    ]
    const tree = toTree(flat, options) as any[]
    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(0)
  })

  it('深树展开顺序为前序且不爆栈', () => {
    const deep = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, pid: i === 0 ? null : i }))
    const tree = toTree(deep, options)
    expect(flattenList(tree).map((n: any) => n.id)).toEqual(deep.map(d => d.id))
  })
})

describe('getUrlParams', () => {
  it('解析查询参数', () => {
    expect(getUrlParams('https://a.com?x=1&y=2')).toEqual({ x: '1', y: '2' })
  })

  it('支持相对路径与纯查询串，不依赖 URL 构造器', () => {
    expect(getUrlParams('/api/list?page=2&size=10')).toEqual({ page: '2', size: '10' })
    expect(getUrlParams('?a=1')).toEqual({ a: '1' })
  })

  it('同名参数保留最后一个', () => {
    expect(getUrlParams('https://a.com?x=1&x=2')).toEqual({ x: '2' })
  })

  it('解码 %xx，且 + 视为空格', () => {
    expect(getUrlParams('?name=%E5%BC%A0%E4%B8%89')).toEqual({ name: '张三' })
    expect(getUrlParams('?q=a+b')).toEqual({ q: 'a b' })
    expect(getUrlParams('?q=%2B')).toEqual({ q: '+' })
  })

  it('无查询串返回空对象，hash 优先截断', () => {
    expect(getUrlParams('https://a.com')).toEqual({})
    expect(getUrlParams('')).toEqual({})
    expect(getUrlParams('https://a.com#?x=1')).toEqual({})
    expect(getUrlParams('https://a.com?x=1#y')).toEqual({ x: '1' })
  })

  it('无 = 的参数值为空串，跳过空片段', () => {
    expect(getUrlParams('?flag&x=1&&y=')).toEqual({ flag: '', x: '1', y: '' })
  })

  it('boolean: true 时把 true/false（忽略大小写）转成布尔，其余保持字符串', () => {
    expect(getUrlParams('?on=true&off=false&x=1', { boolean: true })).toEqual({ on: true, off: false, x: '1' })
    expect(getUrlParams('?a=TRUE&b=False', { boolean: true })).toEqual({ a: true, b: false })
    expect(getUrlParams('?flag=', { boolean: true })).toEqual({ flag: '' })
  })

  it('默认不转换（boolean 默认 false）', () => {
    expect(getUrlParams('?on=true')).toEqual({ on: 'true' })
    expect(getUrlParams('?on=true', { boolean: false })).toEqual({ on: 'true' })
  })
})
