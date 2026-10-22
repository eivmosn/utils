import type { MaybeRefOrGetter } from 'vue'
import type { SearchResult, UseSearchOptions } from '../search/types'
import { debounce } from 'es-toolkit'
import { computed, onScopeDispose, ref, shallowRef, toRaw, toValue, watch } from 'vue'
import { searchList } from '../search/search'

/**
 * 数组对象字段搜索 composable
 *
 * `data`/`options` 支持 ref/getter；`keyword` 是 `Ref<string>`，可直接 `v-model`。
 *
 * @param data 数据源，支持 ref/getter
 * @param options 搜索配置，见 {@link UseSearchOptions}
 * @returns `keyword`（可直接 v-model）与 `results`（搜索结果）
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { keyword, results } = useSearch(list, { fields: ['app', 'name'] })
 * </script>
 *
 * <template>
 *   <input v-model="keyword">
 *   <div v-for="r in results" :key="r.index" v-html="highlight(r.text, keyword)" />
 * </template>
 * ```
 */
export function useSearch<T extends Record<string, any>>(
  data: MaybeRefOrGetter<ReadonlyArray<T>>,
  options: MaybeRefOrGetter<UseSearchOptions>,
) {
  const config = computed(() => toValue(options))
  const keyword = ref(config.value.keyword ?? '')
  const results = shallowRef<SearchResult<T>[]>([])

  function runSearch() {
    const list = toValue(data)
    const { fields, limit, caseSensitive } = config.value
    results.value = searchList(list ? toRaw(list) : [], keyword.value, { fields, limit, caseSensitive })
  }

  // 数据或配置变化时重新搜索；deep 支持 reactive 数组原地增删
  watch(
    () => [toValue(data), config.value.fields, config.value.caseSensitive, config.value.limit] as const,
    runSearch,
    { deep: true },
  )

  // 防抖用 es-toolkit；delay 变化时重建，scope 销毁时 abort 取消内部定时器
  const controller = new AbortController()
  let debounced: (() => void) | undefined

  watch(
    computed(() => config.value.debounce ?? 0),
    delay => {
      debounced = delay > 0 ? debounce(runSearch, delay, { signal: controller.signal }) : undefined
    },
    { immediate: true },
  )

  watch(keyword, () => (debounced ? debounced() : runSearch()))
  onScopeDispose(() => controller.abort())

  runSearch()

  return {
    /** 关键词，可直接 v-model */
    keyword,
    /** 搜索结果 */
    results,
  }
}
