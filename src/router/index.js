import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import ArticlesPage from '../views/ArticlesPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/articles',
    name: 'Articles',
    component: ArticlesPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
