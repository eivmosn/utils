interface StorageOption {
  /** 键名前缀，默认 `'$$'` */
  prefix: string
  /** 存储类型 */
  type: 'localStorage' | 'sessionStorage'
}

/**
 * 带命名前缀的本地存储读写（值以 JSON 序列化，附带写入时间戳）
 *
 * 依赖浏览器 `localStorage`/`sessionStorage`，SSR 环境不可用。
 *
 * @param option 可选配置，见 {@link StorageOption}
 * @example
 * const { setStorage, getStorage } = useStorage({ prefix: 'app_' })
 * setStorage('token', 'abc')
 * getStorage('token')  // 'abc'
 */
export function useStorage(option?: Partial<StorageOption>) {
  const { prefix = '$$', type = 'localStorage' } = option || {}

  function _setItem(key: string, value: string) {
    return type === 'localStorage'
      ? localStorage.setItem(`${prefix}${key}`, value)
      : sessionStorage.setItem(`${prefix}${key}`, value)
  }

  function _getItem(key: string) {
    return type === 'localStorage' ? localStorage.getItem(`${prefix}${key}`) : sessionStorage.getItem(`${prefix}${key}`)
  }

  /**
   * 写入键值，内部转成 `{ value, timestamp }` 后序列化
   *
   * @param key 键名（不含前缀）
   * @param value 任意可序列化的值
   */
  function setStorage<V>(key: string, value: V) {
    const serializedValue = JSON.stringify({
      value,
      timestamp: Date.now(),
    })
    _setItem(key, serializedValue)
  }

  /**
   * 读取键值，未命中返回 `null`
   *
   * @param key 键名（不含前缀）
   */
  function getStorage<V>(key: string): V | null {
    const serializedValue = _getItem(key)
    if (!serializedValue) {
      return null
    }
    return (JSON.parse(serializedValue) as { value: V }).value
  }

  return {
    getStorage,
    setStorage,
  }
}
