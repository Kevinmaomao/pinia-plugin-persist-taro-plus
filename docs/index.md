# Getting started

## Install

`npm i pinia-plugin-persist-taro`

## Setup

### Vue2

```typescript
import Vue from 'vue'
import vueCompositionApi from '@vue/composition-api'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist-taro'
import App from './App.vue'

const pinia = createPinia()
pinia.use(piniaPersist)

Vue.use(vueCompositionApi)
Vue.use(pinia)

new Vue({
  pinia,
  render: (h) => h(App),
}).$mount('#app')
```

### Vue3

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist-taro'

const pinia = createPinia()
pinia.use(piniaPersist)

createApp({}).use(pinia).mount('#app')
```

## Typescript definitions

Add the `pinia-plugin-persist-taro` types definition file to your tsconfig file.

```json
{
  "compilerOptions": {
    "types": ["pinia-plugin-persist-taro"]
  }
}
```
