<template lang="pug">
a-page-header(v-if="pageTitle" :title="pageTitle")
</template>

<script lang="ts">
import { useTitle } from "@vueuse/core";
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import {useAuthStore} from "../../store/auth";

export default defineComponent({
  name: 'ArcoPageHeader',
  setup() {
    const route = useRoute();
    const authStore = useAuthStore();
    const pageTitle = computed(() => {
      let title = route.meta.title || '';
      if (/#userName#/.test(title) && authStore.userName) {
        title = title.replace(/#userName#/, authStore.userName);
      }
      return title;
    });
    useTitle(pageTitle)

    return {
      route,
      pageTitle
    }
  }
})
</script>
