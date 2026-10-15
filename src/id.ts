import { customAlphabet, nanoid } from 'nanoid'

export interface CreateIdOptions {
  /** ID 长度，默认 21 */
  size?: number
  /** 自定义字符集；传入后忽略 `specialChars`，完全按此字符集生成 */
  alphabet?: string
  /** 是否包含 `-`、`_` 等特殊字符（nanoid 默认的 URL 安全字符集），默认 `false` */
  specialChars?: boolean
}

const DEFAULT_SIZE = 21
// 默认规则：大小写字母 + 数字，剔除 - 和 _，兼容对特殊字符敏感的系统
const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const defaultGenerate = customAlphabet(DEFAULT_ALPHABET, DEFAULT_SIZE)
const generators = new Map<string, (size?: number) => string>()

function getGenerator(alphabet: string) {
  let generator = generators.get(alphabet)
  if (!generator) {
    generator = customAlphabet(alphabet, DEFAULT_SIZE)
    generators.set(alphabet, generator)
  }
  return generator
}

/**
 * 生成唯一 ID
 *
 * 默认只用字母和数字，不含 `-`、`_` 等特殊字符；可传长度，或用对象自定义字符集。
 *
 * @param options 长度（number）或选项对象（{@link CreateIdOptions}）
 * @example
 * createId()                              // 纯字母数字，长度 21
 * createId(10)                            // 纯字母数字，长度 10
 * createId({ specialChars: true })        // 允许 - 和 _
 * createId({ alphabet: '01' })            // 自定义字符集
 */
export function createId(options: number | CreateIdOptions = {}): string {
  const { size = DEFAULT_SIZE, alphabet, specialChars = false }
    = typeof options === 'number' ? { size: options } : options

  if (alphabet) {
    return getGenerator(alphabet)(size)
  }
  return specialChars ? nanoid(size) : defaultGenerate(size)
}
