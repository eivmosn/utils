import { describe, expect, it } from 'vitest'
import { avg, getMaxNumber, getMinNumber, sum } from '../src/math'

const list = [{ n: 1 }, { n: 2 }, { n: 3 }]
const empty: { n: number }[] = []

describe('math', () => {
  it('sum 求和', () => {
    expect(sum(list, 'n')).toBe(6)
  })

  it('avg 求平均', () => {
    expect(avg(list, 'n')).toBe(2)
  })

  it('getMaxNumber / getMinNumber', () => {
    expect(getMaxNumber(list, 'n')).toBe(3)
    expect(getMinNumber(list, 'n')).toBe(1)
  })

  it('空数组边界', () => {
    expect(sum(empty, 'n')).toBe(0)
    expect(avg(empty, 'n')).toBeNaN()
    expect(getMaxNumber(empty, 'n')).toBe(Number.NEGATIVE_INFINITY)
    expect(getMinNumber(empty, 'n')).toBe(Number.POSITIVE_INFINITY)
  })
})
