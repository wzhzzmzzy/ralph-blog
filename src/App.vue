<template>
  <n-loading-bar-provider>
    <default-layout>
      <wrapped-router-view/>
    </default-layout>
  </n-loading-bar-provider>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {NLoadingBarProvider} from "naive-ui";
import WrappedRouterView from "./components/wrapped-router-view.vue";
import DefaultLayout from "./layout/default/index.vue";

export default defineComponent({
  name: 'App',
  components: {
    DefaultLayout,
    WrappedRouterView,
    NLoadingBarProvider
  },
  setup() {

  }
})
</script>
