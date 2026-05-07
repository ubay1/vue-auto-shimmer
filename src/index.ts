import type { App } from 'vue'
import Shimmer from './components/Shimmer.vue'

export { Shimmer }

export default {
  install(app: App) {
    app.component('Shimmer', Shimmer)
  }
}