import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
  //hash 模式使用URL哈希来模拟完整的URL，以便在URL更改时不会重新加载页面。 history 模式利用 HTML5 History API 来实现URL导航，也是无需重新加载页面。
  linkExactActiveClass: 'active', //配置高亮
  routes: [
    {
      path: '/',
      name: 'dataAnnotations',
      component: () => import('../view/dataAnnotations/index.vue')
    },

  ]
})
export default router
