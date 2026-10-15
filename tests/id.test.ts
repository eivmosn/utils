import { describe, expect, it } from 'vitest'
import { createId } from '../src/id'

describe('createId', () => {
  it('默认长度 21', () => {
    expect(createId()).toHaveLength(21)
  })

  it('默认只含字母和数字，不含 - 和 _ 等特殊字符', () => {
    for (let i = 0; i < 100; i++) {
      expect(createId()).toMatch(/^[A-Z0-9]+$/i)
    }
  })

  it('支持传数字自定义长度', () => {
    expect(createId(10)).toHaveLength(10)
    expect(createId(0)).toBe('')
  })

  it('支持对象配置长度', () => {
    expect(createId({ size: 10 })).toHaveLength(10)
  })

  it('specialChars: true 时使用 nanoid 默认字符集，可能出现 - 和 _', () => {
    const ids = Array.from({ length: 200 }, () => createId({ specialChars: true }))
    ids.forEach(id => expect(id).toMatch(/^[\w-]+$/))
    expect(ids.some(id => /[_-]/.test(id))).toBe(true)
  })

  it('支持自定义字符集，且优先于 specialChars', () => {
    for (let i = 0; i < 50; i++) {
      expect(createId({ alphabet: '01' })).toMatch(/^[01]+$/)
      expect(createId({ alphabet: 'abc', size: 5, specialChars: true })).toMatch(/^[abc]{5}$/)
    }
  })
})
