/**
 * 给数字或数字字符串补上单位
 *
 * 非数字（`NaN`）按 `0` 处理；字符串会先 `parseFloat`，原有单位会被丢弃后重拼 `unit`。
 *
 * @param value 数值或含数字的字符串
 * @param unit 单位，默认 `'px'`
 * @example
 * normalizeUnit(10)         // '10px'
 * normalizeUnit('1.5', 'em') // '1.5em'
 * normalizeUnit('1.5rem')    // '1.5px'
 * normalizeUnit('abc')       // '0px'
 */
export function normalizeUnit(value: string | number, unit = 'px') {
  const toNumber = typeof value === 'string' ? Number.parseFloat(value) : value
  return `${Number.isNaN(toNumber) ? 0 : toNumber}${unit}`
}
