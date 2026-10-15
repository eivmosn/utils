import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStorage } from '../src/storage'

function createMockStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
  }
}

let local: ReturnType<typeof createMockStorage>
let session: ReturnType<typeof createMockStorage>

beforeEach(() => {
  local = createMockStorage()
  session = createMockStorage()
  vi.stubGlobal('localStorage', local)
  vi.stubGlobal('sessionStorage', session)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useStorage', () => {
  it('写入/读取，并加上前缀', () => {
    const { setStorage, getStorage } = useStorage({ prefix: 'app_' })
    setStorage('token', 'abc')
    expect(local.getItem('app_token')).toBeTypeOf('string')
    expect(getStorage('token')).toBe('abc')
  })

  it('默认前缀 $$', () => {
    const { setStorage } = useStorage()
    setStorage('k', 1)
    expect(local.getItem('$$k')).toBeTypeOf('string')
  })

  it('支持 sessionStorage 与对象值', () => {
    const { setStorage, getStorage } = useStorage({ type: 'sessionStorage' })
    setStorage('k', { a: 1 })
    expect(session.getItem('$$k')).toBeTypeOf('string')
    expect(getStorage('k')).toEqual({ a: 1 })
  })

  it('未命中返回 null', () => {
    const { getStorage } = useStorage()
    expect(getStorage('missing')).toBeNull()
  })

  it('存储值附带时间戳', () => {
    const { setStorage } = useStorage()
    setStorage('k', 'v')
    const raw = JSON.parse(local.getItem('$$k') as string)
    expect(raw.value).toBe('v')
    expect(typeof raw.timestamp).toBe('number')
  })
})
