/**
 * 数值聚合工具
 */

/**
 * 求数组中某字段之和
 *
 * @param arr 源数组
 * @param field 求和的字段
 * @example
 * sum([{ n: 1 }, { n: 2 }], 'n')  // 3
 */
export function sum<T>(arr: T[], field: keyof T) {
  return arr.reduce((acc, cur) => acc + (cur[field] as number), 0)
}

/**
 * 求数组中某字段的平均值
 *
 * 空数组返回 `NaN`。
 *
 * @param arr 源数组
 * @param field 求平均的字段
 * @example
 * avg([{ n: 1 }, { n: 2 }], 'n')  // 1.5
 */
export function avg<T>(arr: T[], field: keyof T) {
  return sum(arr, field) / arr.length
}

/**
 * 取数组中某字段的最大值
 *
 * 空数组返回 `-Infinity`。
 *
 * @param arr 源数组
 * @param field 比较的字段
 * @example
 * getMaxNumber([{ n: 1 }, { n: 2 }], 'n')  // 2
 */
export function getMaxNumber<T>(arr: T[], field: keyof T): number {
  return Math.max(...arr.map(item => item[field] as number))
}

/**
 * 取数组中某字段的最小值
 *
 * 空数组返回 `Infinity`。
 *
 * @param arr 源数组
 * @param field 比较的字段
 * @example
 * getMinNumber([{ n: 1 }, { n: 2 }], 'n')  // 1
 */
export function getMinNumber<T>(arr: T[], field: keyof T): number {
  return Math.min(...arr.map(item => item[field] as number))
}
