import {defineStore} from "pinia";

export const useGlobalStore = defineStore({
  id: 'global',
  state: () => ({
    useOsTheme: true,
    currentTheme: 'light'
  })
});
