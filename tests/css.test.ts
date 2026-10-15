import { describe, expect, it } from 'vitest'
import { normalizeUnit } from '../src/css'

describe('normalizeUnit', () => {
  it('补默认单位 px', () => {
    expect(normalizeUnit(10)).toBe('10px')
  })

  it('自定义单位', () => {
    expect(normalizeUnit(1.5, 'em')).toBe('1.5em')
  })

  it('字符串先 parseFloat，原单位被替换', () => {
    expect(normalizeUnit('1.5rem')).toBe('1.5px')
  })

  it('非数字按 0 处理', () => {
    expect(normalizeUnit('abc')).toBe('0px')
  })
})
