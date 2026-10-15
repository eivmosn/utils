/**
 * 通用工具：路径读写、类型判断、数组与树处理等与具体领域无关的纯函数
 */

/**
 * 按路径读取对象属性，路径支持 `a.b[0].c` 形式
 *
 * @param source 源对象
 * @param path 属性路径，数组下标用 `[]`，如 `'list[0].name'`
 * @param defaultValue 取不到时的返回值，默认 `undefined`
 * @example
 * get({ a: { b: 1 } }, 'a.b')          // 1
 * get({ a: [{ b: 1 }] }, 'a[0].b')     // 1
 * get({}, 'a.b', 0)                    // 0
 */
export function get<T extends object>(source: T, path: string, defaultValue: any = undefined) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  const result = keys.reduce((obj, key) => {
    return Object(obj)[key]
  }, source)
  return result === undefined ? defaultValue : result
}

/**
 * 按路径写入对象属性，中间层级不存在时自动创建**普通对象**（不会创建数组）
 *
 * @param source 源对象（原地修改）
 * @param path 属性路径，规则同 {@link get}
 * @param value 要写入的值
 * @example
 * const obj: any = {}
 * set(obj, 'a.b', 1)  // obj => { a: { b: 1 } }
 * set(obj, 'a.c', 2)  // obj => { a: { b: 1, c: 2 } }
 */
export function set<T extends object>(source: T, path: string, value: any) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((obj, key) => {
    if (!Object.hasOwn(Object(obj), key))
      Object(obj)[key] = {}
    return Object(obj)[key]
  }, source)
  if (lastKey)
    target[lastKey as keyof T] = value
}

/**
 * 浅合并：把 `source` 中不为 `undefined` 的自有属性写入 `target`
 *
 * 原地修改 `target` 并返回它，值不做递归合并。
 *
 * @param target 目标对象
 * @param source 来源对象
 * @example
 * merge({ a: 1 }, { a: undefined, b: 2 })  // { a: 1, b: 2 }
 */
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

/**
 * 按对象的某个字段去重，保留首次出现的元素
 *
 * @param arr 源数组
 * @param key 用于判重的字段
 * @example
 * uniq([{ id: 1 }, { id: 1 }, { id: 2 }], 'id')  // [{ id: 1 }, { id: 2 }]
 */
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

/**
 * 把单个值包装成数组
 *
 * `null`/`undefined` 返回 `[]`，数组原样返回，其余包成单元素数组。
 *
 * @example
 * toArray(null)     // []
 * toArray(1)        // [1]
 * toArray([1, 2])   // [1, 2]
 */
export function toArray<T>(val: T) {
  if (val === undefined || val === null) {
    return []
  }
  if (Array.isArray(val))
    return val
  return [val]
}

/**
 * 转布尔值
 *
 * 字符串仅 `'true'`（忽略大小写）为 `true`，其余一律走 `!!` 转换。
 *
 * @example
 * toBoolean('TRUE')  // true
 * toBoolean('no')    // false（非 'true' 字符串）
 * toBoolean(0)       // false
 */
export function toBoolean(value?: string | boolean | number | null | undefined) {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return !!value
}

/**
 * 返回值的内部类型字符串，等价于 `Object.prototype.toString` 的标签
 *
 * @example
 * toTypeString([])     // 'Array'
 * toTypeString({})     // 'Object'
 * toTypeString(null)   // 'Null'
 */
export function toTypeString(val: unknown): string {
  return Object.prototype.toString.call(val).slice(8, -1)
}

/**
 * 判断是否为空值
 *
 * `undefined`、`null`、`''`、`[]`、`{}` 视为空，函数一律视为非空。
 *
 * @example
 * isEmptyValue([])        // true
 * isEmptyValue({})        // true
 * isEmptyValue('')        // true
 * isEmptyValue(() => {})  // false
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

/**
 * 扁平数组转树（单遍循环）
 *
 * 通过 `key`/`parent` 建立父子关系，无父节点或父节点不存在的元素作为根节点。
 * 只遍历一次：父节点尚未出现时先建占位节点，遇到本体再补字段，因此子节点先于父节点也支持。
 *
 * @param arr 扁平数组
 * @param options 关系配置
 * @param options.key 主键字段
 * @param options.parent 父级字段
 * @param options.children 子节点字段名
 * @example
 * toTree(
 *   [{ id: 1, pid: null }, { id: 2, pid: 1 }],
 *   { key: 'id', parent: 'pid', children: 'children' },
 * )
 * // [{ id: 1, pid: null, children: [{ id: 2, pid: 1, children: [] }] }]
 */
export function toTree<T>(arr: T[], options: {
  key: string
  parent: string
  children: string
}): TreeNode<T>[] {
  const { key, parent, children } = options
  const nodes = new Map<any, TreeNode<T>>()
  const tree: TreeNode<T>[] = []

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    const id = item[key as keyof T]
    let node = nodes.get(id)
    if (node === undefined) {
      node = { ...item, [children]: [] } as TreeNode<T>
      nodes.set(id, node)
    }
    else {
      // 作为父节点被提前引用的占位节点：补齐字段，但保留已挂载的子节点
      const mounted = node[children]
      Object.assign(node, item)
      node[children] = mounted
    }

    const parentKey = item[parent as keyof T]
    if (parentKey === undefined || parentKey === null || parentKey === '') {
      tree.push(node)
    }
    else {
      let parentNode = nodes.get(parentKey)
      if (parentNode === undefined) {
        parentNode = { [key]: parentKey, [children]: [] } as TreeNode<T>
        nodes.set(parentKey, parentNode)
      }
      (parentNode[children] as TreeNode<T>[]).push(node)
    }
  }

  return tree
}

/**
 * 递归展开树为扁平数组，节点自身会被保留（迭代实现，避免深树爆栈）
 *
 * @param tree 树节点数组
 * @param children 子节点字段名，默认 `'children'`
 */
export function flattenList<T>(tree: TreeNode<T>[], children = 'children'): T[] {
  const result: T[] = []
  const stack: TreeNode<T>[] = tree.slice().reverse()
  while (stack.length) {
    const node = stack.pop() as TreeNode<T>
    result.push(node as T)
    const kids = node[children] as TreeNode<T>[] | undefined
    if (kids) {
      // 逆序入栈，保证出栈顺序仍是先序遍历
      for (let i = kids.length - 1; i >= 0; i--) {
        stack.push(kids[i])
      }
    }
  }
  return result
}

/** {@link flattenList} 的别名 */
export const treeToList = flattenList

/**
 * 深度优先查找第一个满足条件的节点
 *
 * @param arr 树节点数组
 * @param callbackfn 判定函数
 * @param children 子节点字段名，默认 `'children'`
 * @example
 * findNode(tree, node => node.id === 2)
 */
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

// 解码：`+` 视为空格，`%xx` 解码；非法编码原样返回，不抛错
function decodeParam(value: string): string {
  if (!value)
    return ''
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  }
  catch {
    return value
  }
}

// 可选：把 'true'/'false'（忽略大小写）转成布尔，其余保持字符串
function toParamValue(value: string, useBoolean: boolean): string | boolean {
  if (useBoolean) {
    const lower = value.toLowerCase()
    if (lower === 'true')
      return true
    if (lower === 'false')
      return false
  }
  return value
}

/**
 * 解析 URL 查询参数为普通对象（纯字符串切分，不依赖 `URL` 构造器）
 *
 * 取 `?` 与 `#` 之间的部分，按 `&`、`=` 切分；`%xx` 会解码、`+` 视为空格；
 * 同名参数保留最后一个；无 `=` 的参数值为 `''`；无查询串返回 `{}`。
 *
 * @param url URL 或带查询串的路径
 * @param options 可选配置
 * @param options.boolean 为 `true` 时把 `'true'`/`'false'`（忽略大小写）转成布尔，默认 `false`
 * @example
 * getUrlParams('https://a.com?x=1&y=2')                 // { x: '1', y: '2' }
 * getUrlParams('/api/list?page=2')                      // { page: '2' }
 * getUrlParams('?a=1&a=2')                               // { a: '2' }
 * getUrlParams('?on=true&off=false', { boolean: true }) // { on: true, off: false }
 */
export function getUrlParams(url: string, options?: { boolean?: false }): Record<string, string>
export function getUrlParams(url: string, options: { boolean: true }): Record<string, string | boolean>
export function getUrlParams(url: string, options: { boolean?: boolean }): Record<string, string | boolean>
export function getUrlParams(url: string, options: { boolean?: boolean } = {}): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {}
  if (!url) {
    return result
  }

  // 先截掉 hash，避免 `#` 里的 `?` 被误当成查询串
  const hashIndex = url.indexOf('#')
  const withoutHash = hashIndex === -1 ? url : url.slice(0, hashIndex)
  const queryIndex = withoutHash.indexOf('?')
  if (queryIndex === -1) {
    return result
  }

  const query = withoutHash.slice(queryIndex + 1)
  if (!query) {
    return result
  }

  const useBoolean = options.boolean === true
  for (const pair of query.split('&')) {
    if (!pair) {
      continue
    }
    const eqIndex = pair.indexOf('=')
    const key = eqIndex === -1 ? pair : pair.slice(0, eqIndex)
    const value = eqIndex === -1 ? '' : pair.slice(eqIndex + 1)
    result[decodeParam(key)] = toParamValue(decodeParam(value), useBoolean)
  }

  return result
}
