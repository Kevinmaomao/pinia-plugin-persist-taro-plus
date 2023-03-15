# Custom cache

默认缓存时间24小时，你可以通过设置timer字段来自定义缓存时长。

```typescript
// store/use-user-store.ts
export const useUserStore = defineStore('storeUser', {
  state() {
    return {
      firstName: 'alllen',
      lastName: 'ttk',
      accessToken: 'xxxxxxxxxxxxx',
    }
  },
  persist: {
    enabled: true,
    timer: 1,
    strategies: [
      {
        key: 'user',
      },
    ],
  },
})
```
