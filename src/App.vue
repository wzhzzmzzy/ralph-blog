<template>
  <n-loading-bar-provider>
    <router-view v-slot="{ Component }">
      <template v-if="Component">
        <transition mode="out-in">
          <keep-alive>
            <suspense @pending="startLoading" @resolve="finishLoading">
              <component :is="Component"/>
            </suspense>
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </n-loading-bar-provider>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {NLoadingBarProvider, useLoadingBar} from "naive-ui";

export default defineComponent({
  name: 'App',
  components: {
    NLoadingBarProvider
  },
  setup() {
    // const loadingBar = useLoadingBar();
    // const startLoading = () => loadingBar.start();
    // const finishLoading = () => loadingBar.finish();
    // const errorLoading = () => loadingBar.error();
    return {
      // startLoading,
      // finishLoading,
      // errorLoading
    }
  }
})
</script>
