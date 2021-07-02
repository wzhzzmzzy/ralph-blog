<template lang="pug">
  n-config-provider(:theme="theme")
    slot
    n-config-provider(:theme="reverseTheme" namespace="reverse")
      n-affix.switch-theme-affix(:bottom="120" :trigger-bottom="60")
        n-button.switch-theme-affix__btn(circle :size="large" type="primary" @click="switchTheme")
          template(#icon)
            n-icon
              moon-stars(v-if="currentTheme === 'light'")
              sun(v-else)
</template>

<script lang="ts">
import {defineComponent, ref, toRefs, watch} from "vue";
import {NConfigProvider, NAffix, NButton, NIcon, darkTheme, useOsTheme} from 'naive-ui';
import {MoonStars, Sun} from '@vicons/carbon';
import {useGlobalStore} from "../../store/global";

export default defineComponent({
  name: 'DefaultLayout',
  components: {
    NConfigProvider,
    NAffix,
    NButton,
    NIcon,
    MoonStars,
    Sun
  },
  setup() {
    const globalStore = useGlobalStore();
    const osThemeRef = useOsTheme();
    const theme = ref<any>(null);
    const reverseTheme = ref<any>(darkTheme);
    const {currentTheme} = toRefs(globalStore);
    watch(() => ({
      currentTheme: globalStore.currentTheme,
    }), ({currentTheme}) => {
      theme.value = currentTheme === 'dark' ? darkTheme : null;
      reverseTheme.value = currentTheme === 'dark' ? null : darkTheme;
    });
    if (osThemeRef.value === 'dark') {
      globalStore.$patch({
        currentTheme: osThemeRef.value
      })
    }
    return {
      theme,
      reverseTheme,
      currentTheme,
      switchTheme() {
        globalStore.$patch({
          currentTheme: currentTheme.value === 'light' ? 'dark' : 'light'
        })
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.switch-theme-affix {
  right: 60px;

  &__btn {
    font-size: 30px;
  }
}
</style>
