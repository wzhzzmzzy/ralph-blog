<template>
  <router-view v-slot="{ Component }">
    <template v-if="Component">
      <transition mode="out-in">
        <keep-alive>
          <suspense timeout="0">
            <component :is="Component" />
            <template #fallback>
              <div>
                Loading...
              </div>
            </template>
          </suspense>
        </keep-alive>
      </transition>
    </template>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
})
</script>
