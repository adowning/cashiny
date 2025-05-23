import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import UsersView from '../views/UsersView.vue';
import ProductsView from '../views/ProductsView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/users',
    name: 'users',
    component: UsersView
  },
  {
    path: '/products',
    name: 'products',
    component: ProductsView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;