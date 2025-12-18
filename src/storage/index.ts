interface StorageOption {
  prefix: string
  timeout: number
  type: 'localStorage' | 'sessionStorage'
}

export function useStorage(option?: Partial<StorageOption>) {
  const {
    prefix = '$$',
    type = 'localStorage',
  } = option || {}

  function _setItem(key: string, value: string) {
    return type === 'localStorage'
      ? localStorage.setItem(`${prefix}${key}`, value)
      : sessionStorage.setItem(`${prefix}${key}`, value)
  }

  function _getItem(key: string) {
    return type === 'localStorage'
      ? localStorage.getItem(`${prefix}${key}`)
      : sessionStorage.getItem(`${prefix}${key}`)
  }

  function setStorage<V>(key: string, value: V) {
    const serializedValue = JSON.stringify({
      value,
      timestamp: new Date().getTime(),
    })
    _setItem(key, serializedValue)
  }

  function getStorage<V>(key: string): V | null {
    const serializedValue = _getItem(key)
    return serializedValue ? JSON.parse(serializedValue) : null
  }

  return {
    getStorage,
    setStorage,
  }
}
