<template>
  <wrapped-router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WrappedRouterView from "../../components/wrapped-router-view.vue";

export default defineComponent({
  name: 'ExperimentPage',
  components: {WrappedRouterView}
});
</script>

<script setup>

</script>
