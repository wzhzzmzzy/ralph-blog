<template>
  <n-config-provider :theme="theme">
    <slot/>
  </n-config-provider>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from "vue";
import {NConfigProvider, darkTheme, useOsTheme} from 'naive-ui';
import {useGlobalStore} from "../../store/global";

export default defineComponent({
  name: 'DefaultLayout',
  components: {
    NConfigProvider
  },
  setup() {
    const globalStore = useGlobalStore();
    const osThemeRef = useOsTheme();
    const theme = ref<any>(null);
    watch(() => ({
      currentTheme: globalStore.currentTheme,
    }), ({currentTheme}) => {
      theme.value = currentTheme === 'dark' ? darkTheme : null;
    });
    if (osThemeRef.value === 'dark') {
      globalStore.$patch({
        currentTheme: osThemeRef.value
      })
    }
    return {
      theme
    }
  }
});
</script>
