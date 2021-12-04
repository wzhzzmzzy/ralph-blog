<template>
  <arco-layout>
    <wrapped-router-view/>
  </arco-layout>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import WrappedRouterView from "./components/wrapped-router-view.vue";
import ArcoLayout from "./layout/arco/index.vue";

export default defineComponent({
  name: 'App',
  components: {
    ArcoLayout,
    WrappedRouterView,
  },
})
</script>
