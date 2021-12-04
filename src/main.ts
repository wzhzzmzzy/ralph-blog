import {createApp} from 'vue';
import {createPinia} from "pinia";
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';
import router from './router';
import App from './App.vue';
import { setupAuthHooks } from './lib/hooks/auth';

const store = createPinia();

createApp(App)
  .use(router)
  .use(store)
  .use(ArcoVue)
  .use(ArcoVueIcon)
  .mount('#app');

setupAuthHooks(router);
