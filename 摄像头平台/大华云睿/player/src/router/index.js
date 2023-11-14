import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "VideoDemo" */ '../views/VideoDemo.vue')
  },
  {
    path: '/videoDemo',
    name: 'videoDemo',
    component: () => import(/* webpackChunkName: "VideoDemo" */ '../views/VideoDemo.vue')
  },
  {
    path: '/videoDemoMul',
    name: 'videoDemoMul',
    component: () => import(/* webpackChunkName: "VideoDemoMul" */ '../views/VideoDemoMul.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
