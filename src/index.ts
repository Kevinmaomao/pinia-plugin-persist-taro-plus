import { PiniaPluginContext } from 'pinia'
import Taro from '@tarojs/taro'
console.log('🚀 ~ file: index.ts:3 ~ Taro', Taro)

setTimeout(() => {
  import('@tarojs/taro').then(res => {
    console.log('🚀 ~ file: index.ts:8 ~ import ~ myTaro', res)
  })
}, 1500)

const isH5 = typeof alert === 'function'

export interface PersistStrategy {
  key?: string
  storage?: Storage
  paths?: string[]
}

export interface PersistOptions {
  enabled: true
  detached?: true
  enforceCustomStorage?: boolean
  H5Storage?: Storage
  strategies?: PersistStrategy[]
  timer?: number
}

type Store = PiniaPluginContext['store']
type PartialState = Partial<Store['$state']>

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions
  }
}

const updateStorage = (strategy: PersistStrategy, store: Store, options?: PersistOptions) => {
  const storage = strategy.storage
  const storeKey = strategy.key || store.$id
  // 是否需要执行自定义存储
  const isCustomStorage = isH5 || options?.enforceCustomStorage

  if (strategy.paths) {
    const partialState = strategy.paths.reduce((finalObj, key) => {
      finalObj[key] = store.$state[key]
      return finalObj
    }, {} as PartialState)
    const stateWithTimeStamp = addTimeStamp(partialState, options?.timer)

    if (isCustomStorage && storage) {
      storage.setItem(storeKey, JSON.stringify(stateWithTimeStamp))
    } else {
      Taro.setStorage({
        key: storeKey,
        data: JSON.stringify(stateWithTimeStamp),
      })
    }
  } else if (isCustomStorage && storage) {
    storage.setItem(storeKey, JSON.stringify(addTimeStamp(store.$state, options?.timer)))
  } else {
    Taro.setStorage({
      key: storeKey,
      data: JSON.stringify(addTimeStamp(store.$state, options?.timer)),
    })
  }
}

/**
 * 缓存数据添加时间戳
 * @param data{any}
 * @param timer{number} 缓存时间，单位小时
 * @returns {{data: *, timer: number, createAt: number}}
 * @example 
 * addTimeStamp({a: 1}, 24) => {data: {a: 1}, timer: 86400000, createAt: 1620000000000}
 */
const addTimeStamp = (data, timer = 24) => {
  return {
    data,
    timer: timer * 60 * 60 * 1e3,
    createAt: new Date().getTime(),
  }
}

/**
 * 判断缓存是否过期
 * @param data{any}
 * @returns {boolean}
 * @example
 * judgeTimeStamp({data: {a: 1}, timer: 86400000, createAt: 1620000000000}) => false
 */
const judgeTimeStamp = data => {
  return data.createAt != null && data.createAt + data.timer <= new Date().getTime()
}

export default ({ options, store }: PiniaPluginContext): void => {
  if (options.persist?.enabled) {
    const defaultStrat: PersistStrategy[] = [
      {
        key: store.$id,
        storage: options.persist?.H5Storage || window?.sessionStorage,
      },
    ]

    const strategies = options.persist?.strategies?.length
      ? options.persist?.strategies
      : defaultStrat

    strategies.forEach(strategy => {
      const storage = strategy.storage || options.persist?.H5Storage || window?.sessionStorage
      const storeKey = strategy.key || store.$id
      let storageResult: string | null
      if (isH5 || options.persist?.enforceCustomStorage) {
        storageResult = storage.getItem(storeKey)
      } else {
        storageResult = Taro.getStorageSync(storeKey)
      }

      if (storageResult) {
        // 去掉时间戳
        const hasTimeOut = judgeTimeStamp(JSON.parse(storageResult))
        if (hasTimeOut) {
          Taro.removeStorage({ key: storeKey })
        } else {
          store.$patch(JSON.parse(storageResult)?.data)
          updateStorage(strategy, store, options.persist)
        }
      }
    })

    store.$subscribe(
      () => {
        strategies.forEach((strategy) => {
          updateStorage(strategy, store, options.persist)
        })
      },
      { detached: options.persist?.detached ? true : false }
    )
  }
}
