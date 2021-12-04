import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import IndexPage from '../views/index/index.vue';
import LoginPage from '../views/login/index.vue';
import ExperimentPage from '../views/experiment/index.vue';
import ExperimentRecords from '../views/experiment/records/index.vue';

// typings.d.ts or router.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    noAuth?: boolean
    title?: string
  }
}

// const gameRoutes: RouteRecordRaw[] = [
//   {
//     name: 'typing',
//     path: '/typing',
//     component: TypingGame
//   }
// ]

const experimentRoutes: RouteRecordRaw[] = [
  {
    name: 'experiment',
    path: '/experiment',
    component: ExperimentPage,
    children: [
      {
        name: 'experiment-records',
        path: 'records',
        component: ExperimentRecords,
        meta: {
          title: '#userName#的实验记录'
        }
      }
    ]
  }
]

// const blogRoutes: RouteRecordRaw[] = [
//   {
//     name: 'post',
//     path: '/post',
//     component: PostPage
//   }
// ]

const routes: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    component: IndexPage,
  },
  {
    name: 'login',
    path: '/login',
    component: LoginPage,
    meta: {
      noAuth: true
    }
  },
  ...experimentRoutes
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
