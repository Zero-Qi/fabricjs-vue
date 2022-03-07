import { createApp } from 'vue'
import App from './App.vue'
//引入elementplus组件库
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import './global/normalize.scss'
import './global/elementplus.scss'
import router from './router/router.js'
import locale from 'element-plus/lib/locale/lang/zh-cn' // 中文
import fabric from 'fabric'
import { createPinia } from 'pinia'
import { registerStore } from '@/store/index.js';
const pinia = createPinia()
createApp(App)
.use(ElementPlus, { locale })
.use(router)
.use(fabric)
.use(pinia)
.mount('#app')
registerStore()
