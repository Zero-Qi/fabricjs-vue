import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
  //hash 模式使用URL哈希来模拟完整的URL，以便在URL更改时不会重新加载页面。 history 模式利用 HTML5 History API 来实现URL导航，也是无需重新加载页面。
  linkExactActiveClass: 'active', //配置高亮
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../view/Login/index.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../view/Home/index.vue')
    },

    {
      path: '/dataAnnotations',
      name: 'dataAnnotations',
      component: () => import('../view/dataAnnotations/index.vue')
    },
    {
      path: '/serverdataManagement',
      name: 'serverdataManagement',
      component: () => import('../view/serverdataManagement/index.vue')
    },
    {
      path: '/dataTraining',
      name: 'dataTraining',
      component: () => import('../view/dataTraining/index.vue')
    },
    {
      path: '/dataManagement',
      name: 'dataManagement',
      component: () => import('../view/dataManagement/index.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../view/404.vue')
    },
    {
      path: '/',
      redirect: '/home'
    }
  ]
})
// 路由守卫 beforeEach 传入一个函数
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    let token = localStorage.getItem('token')
    if (token == null || token === '') {
      next('/login')
    } else {
      next()
    }
  }
  // next() // 继续向下执行 不写next, 路由不会跳转的
})
export default router
