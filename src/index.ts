export function get<T extends object>(source: T, path: string, defaultValue = undefined) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  const result = keys.reduce((obj, key) => {
    return Object(obj)[key]
  }, source)
  return result === undefined ? defaultValue : result
}

export function set<T extends object>(source: T, path: string, value: any) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((obj, key) => {
    if (!Object.hasOwn(obj, key))
      Object(obj)[key] = {}
    return Object(obj)[key]
  }, source)
  if (lastKey)
    target[lastKey as keyof T] = value
}

export function toBoolean(value?: string | boolean | number | null | undefined) {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return !!value
}

export function uniqueId() {
  return Math.random().toString(36).slice(2)
}

/**
 * Get the type of a value as a string
 * @param val
 */
export function toTypeString(val: unknown): string {
  return Object.prototype.toString.call(val).slice(8, -1)
}

/**
 * Check if a value is an empty value
 *
 * An empty value is either `undefined`, `null`, `''`, `[]`, or `{}`
 * @param val
 */
export function isEmptyValue<T>(val: T) {
  if (Array.isArray(val)) {
    return val.length === 0
  }
  if (toTypeString(val) === 'Object') {
    return Object.keys(val as object).length === 0
  }
  if (typeof val === 'function') {
    return false
  }
  return val === undefined || val === null || val === ''
}

interface TreeNode<T> {
  [key: string]: any
  children?: TreeNode<T>[]
}

export function toTree<T>(arr: T[], options: {
  key: string
  parent: string
  children: string
}): TreeNode<T>[] {
  const { key, parent, children } = options

  const map = new Map()

  arr.forEach(item => map.set(item[key as keyof T], { ...item, [children]: [] }))

  const tree: TreeNode<T>[] = []

  arr.forEach((item) => {
    const _key = item[key as keyof T]
    const parentKey = item[parent as keyof T]

    if (isEmptyValue(parentKey)) {
      tree.push(map.get(_key))
    }
    else {
      const parent = map.get(parentKey)
      if (parent) {
        (parent[children]).push(map.get(_key))
      }
    }
  })

  return tree
}

export function flattenList<T>(tree: TreeNode<T>[], children = 'children'): T[] {
  const result: T[] = []
  tree.forEach((node) => {
    result.push(node as T)
    if (node[children]) {
      result.push(...flattenList(node[children] as TreeNode<T>[], children))
    }
  })
  return result
}

export function getUrlParams(url: string) {
  const params = new URL(url).searchParams
  const result: Record<string, string> = {}
  for (const [key, value] of params.entries()) {
    result[key] = value
  }
  return result
}

export const treeToList = flattenList

export function findNode<T>(
  arr: T[],
  callbackfn: (item: T) => boolean,
  children: keyof T = 'children' as keyof T,
): T | undefined {
  for (const item of arr) {
    if (callbackfn(item)) {
      return item
    }
    const _children = item[children as keyof T]
    if (Array.isArray(_children)) {
      const result = findNode(_children, callbackfn, children)
      if (result) {
        return result
      }
    }
  }
  return undefined
}

export function uniq<T>(arr: T[], key: keyof T) {
  const result: T[] = []
  const map = new Map()
  for (const item of arr) {
    const _key = item[key as keyof T]
    if (!map.has(_key)) {
      result.push(item)
      map.set(_key, true)
    }
  }
  return result
}

export function merge<T extends object>(target: T, source: Partial<T>): T {
  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      const value = source[key]
      if (value !== undefined) {
        target[key as keyof T] = value
      }
    }
  }
  return target
}

export * from './date'
export { Calendar } from './date/calendar'
export type { CalendarDay, CalendarOptions, CalendarQueryOptions, LunarDate, WeekStart } from './date/calendar'
