<template>
  <div></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {NButton, NSpace, NCard} from "naive-ui";
import {useGlobalStore} from "../../store/global";

export default defineComponent({
  name: 'IndexPage',
  components: {
    NButton,
    NSpace,
    NCard
  },
  setup() {
    const globalStore = useGlobalStore();
    const switchTheme = () => {
      globalStore.$patch({
        currentTheme: globalStore.currentTheme === 'light' ? 'dark' : 'light'
      });
    }
    return {
      switchTheme
    }
  }
})
</script>
