<template lang="pug">
a-layout.arco-layout
  a-layout-header
    arco-page-header
  a-layout-content
    slot
</template>

<script lang="ts">
import {defineComponent, provide, watchEffect} from "vue";
import { useMediaQuery } from '@vueuse/core'
import ArcoMenu from "./menu.vue";
import ArcoPageHeader from "./page-header.vue";
import { useGlobalStore } from "../../store/global";

export default defineComponent({
  name: 'ArcoLayout',
  components: {ArcoPageHeader, ArcoMenu},
  setup() {
    const isMobile = useMediaQuery('(min-width: 800)')
    provide('isMobile', isMobile);
    const globalStore = useGlobalStore();
    const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)');
    if (isPreferredDark.value) {
      globalStore.$patch({
        currentTheme: 'dark'
      })
    }
    watchEffect(() => {
      document.body.setAttribute('arco-theme', globalStore.currentTheme)
    })
  }
});
</script>

<style lang="scss">
.arco-layout {
  width: 100vw;
  height: 100vh;
  background-color: var(--color-bg-1);
  color: var(--color-text-2);
}
</style>
