import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, reactive, ref } from 'vue'
import { useSearch } from '../src/vue'

interface Row {
  id: number
  app: string
  name: string
}

function createList(): Row[] {
  return [
    { id: 1, app: '信访工作台', name: '测试应用' },
    { id: 2, app: '视图测试', name: '测试应用' },
    { id: 3, app: '客户主数据', name: '生产应用' },
  ]
}

let scope: ReturnType<typeof effectScope> | undefined

function run<T>(factory: () => T): T {
  scope = effectScope()
  return scope.run(factory) as T
}

afterEach(() => {
  scope?.stop()
  scope = undefined
  vi.useRealTimers()
})

describe('useSearch', () => {
  it('初始无关键词时结果为空，输入后按字段匹配', async () => {
    const list = ref<Row[]>(createList())
    const { keyword, results } = run(() => useSearch(list, { fields: ['app'] }))

    expect(results.value).toEqual([])

    keyword.value = '测试'
    await nextTick()
    expect(results.value.map(r => r.item.id)).toEqual([2])
  })

  it('reactive 数组原地增删会重算', async () => {
    const list = reactive<Row[]>(createList())
    const { keyword, results } = run(() => useSearch<Row>(list, { fields: ['app'] }))

    keyword.value = '测试'
    await nextTick()
    expect(results.value).toHaveLength(1)

    list.push({ id: 4, app: '新增测试', name: '' })
    await nextTick()
    expect(results.value.map(r => r.item.id)).toEqual([2, 4])
  })

  it('支持初始关键词与 getter 数据源', async () => {
    const list = ref<Row[]>(createList())
    const { results } = run(() => useSearch(() => list.value, { fields: ['app'], keyword: '视图' }))
    expect(results.value.map(r => r.item.id)).toEqual([2])
  })

  it('debounce 合并连续输入，销毁后不再执行', async () => {
    vi.useFakeTimers()
    const list = ref<Row[]>(createList())
    const { keyword, results } = run(() => useSearch<Row>(list, { fields: ['app'], debounce: 100 }))

    keyword.value = '视'
    await nextTick()
    keyword.value = '视图'
    await nextTick()
    vi.advanceTimersByTime(50)
    expect(results.value).toEqual([])

    vi.advanceTimersByTime(100)
    expect(results.value.map(r => r.item.id)).toEqual([2])
  })

  it('scope 销毁取消待执行的 debounce', async () => {
    vi.useFakeTimers()
    const list = ref<Row[]>(createList())
    const { keyword, results } = run(() => useSearch<Row>(list, { fields: ['app'], debounce: 100 }))

    keyword.value = '视图'
    await nextTick()
    scope?.stop()
    vi.advanceTimersByTime(500)
    expect(results.value).toEqual([])
  })
})
