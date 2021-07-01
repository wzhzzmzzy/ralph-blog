import { createRouter, createWebHistory } from "vue-router";
import IndexPage from '../views/index/index.vue';
import NotionPage from '../views/notion/index.vue';
import NotionBillPage from '../views/notion/bill/index.vue';
import NotionFoodMapPage from '../views/notion/food-map/index.vue';
import TypingGame from '../views/typing/index.vue';

const gameRoutes = [
  {
    name: 'typing',
    path: '/typing',
    component: TypingGame
  }
]

const routes = [
  {
    name: 'index',
    path: '/',
    component: IndexPage
  },
  {
    name: 'notion',
    path: '/notion',
    component: NotionPage,
    children: [
      {
        name: 'notion-bill',
        path: 'bill',
        component: NotionBillPage
      },
      {
        name: 'food-map',
        path: 'food-map',
        component: NotionFoodMapPage
      }
    ]
  },
  ...gameRoutes
];

export default createRouter({
  history: createWebHistory(),
  routes
})
