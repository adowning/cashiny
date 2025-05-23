import type {
  RouteLocationNormalizedGeneric,
  RouteRecordNameGeneric,
  RouteRecordRaw,
} from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const whiteListByPath: string[] = ['/login']
const whiteListByName: RouteRecordNameGeneric[] = []
export function isWhiteList(to: RouteLocationNormalizedGeneric) {
  return whiteListByPath.includes(to.path) || whiteListByName.includes(to.name)
}

const VITE_PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
    name: 'Login',
    meta: {
      title: '登录',
    },
    // beforeEnter: requireCheckLogin,
  },
  {
    path: '/',
    redirect: '/home',
  },

  {
    path: '/home',
    component: () => import('@/views/HomeView.vue'),
    name: 'Home',
    meta: {
      title: '首页',
      layout: {
        navBar: {
          showNavBar: false,
          showLeftArrow: false,
        },
        tabbar: {
          showTabbar: true,
          icon: 'home-o',
        },
      },
    },
    // beforeEnter: requireAuth,
  },
  // {
  //   path: '/games/nolimit',
  //   name: 'Nolmiit',
  //   component: () => import('@/views/games/NoLimit.vue'),
  // },
]

/** 路由实例 */
export const router = createRouter({
  history: createWebHistory(VITE_PUBLIC_PATH),
  // VITE_ROUTER_HISTORY === 'hash'
  //   ? createWebHashHistory(VITE_PUBLIC_PATH)
  //   : createWebHistory(VITE_PUBLIC_PATH),
  routes: [...routes],
})
router.beforeEach((_to, _from, next) => {
  // globalStore.startLoading()
  next()
})

router.afterEach(() => {
  // const globalStore = useGlobalStore()
  // globalStore.finishLoading()
})
