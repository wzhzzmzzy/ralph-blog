<template lang="pug">
  section.food-map-container
    n-grid(x-gap="12" :y-gap="8" cols="2 s:3 m:4 l:4 xl:5 2xl:5" responsive="screen")
      template(v-for="tip in tips" :key="tip.name")
        n-gi: RestaurantCard(v-bind="tip")
</template>

<script lang="ts">
import {cloneDeep} from 'lodash-es';
import {defineComponent, ref} from "vue";
import {NGrid, NGridItem} from 'naive-ui';
import RestaurantCard from '../components/restaurant-card/restaurant-card.vue';
import foods from './foods.json';

interface RestaurantTip {
  name: String,
  comment: String,
  score: String,
  tag: String
}

export default defineComponent({
  name: 'FoodMapPage',
  components: {
    RestaurantCard,
    NGrid,
    NGridItem
  },
  setup() {
    const tips = ref<RestaurantTip[]>(cloneDeep(foods.map(i => {
      i.score = Number(/^(.*?)\/10$/.exec(i.score)[1]);
      return i;
    })));
    return {
      tips
    }
  }
})
</script>

<style>
.food-map-container {
  margin: 15px;
}
</style>
