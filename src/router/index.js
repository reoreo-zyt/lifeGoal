import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import ArticlesPage from '../views/ArticlesPage.vue';
import PersonTimeline from '../components/PersonTimeline.vue';

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
  },
  {
    path: '/character-list',
    name: 'PersonTimeline',
    component: PersonTimeline
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
