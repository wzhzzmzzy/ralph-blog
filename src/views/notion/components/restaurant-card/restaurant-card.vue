<template lang="pug">
n-card.restaurant-card(hoverable)
  template(v-slot:header)
    span.restaurant-card__name {{ name }}
    n-gradient-text(:gradient="calcGradientByScore(score)") {{ score.toFixed(1) }}
  template(v-slot:header-extra v-if="link")
    n-button.external-link-btn(text @click="openDianPingLink(link)"): n-icon: external-link
  template(v-slot:default)
    div {{ comment }}
</template>

<script setup lang="ts">
import {defineProps, toRefs} from "vue";
import {NCard, NTag, NGradientText, NButton, NIcon} from 'naive-ui';
import {useEnv} from '../../../../hooks';
import {ExternalLink} from '@vicons/carbon';

const props = defineProps<{
  name: string,
  score: number,
  tag: string,
  comment: string,
  link: string
}>();

const DIANPING_MOBILE_LINK = 'https://m.dianping.com/shopshare/';
const DIANPING_PC_LINK = 'https://www.dianping.com/shop/';

const {name, score, tag, comment, link} = toRefs(props);

const calcGradientByScore = (score: number) => {
  const red = 255 - (10 - score) * (score > 7 ? 20 : 30);
  const green = 0;
  const blue = 50 + (10 - score) * 30;
  return {
    deg: 270,
    from: `rgb(${red}, ${green}, ${blue})`,
    to: `rgb(${red - 30}, ${green + 15}, ${blue + 15})`
  };
}

const openDianPingLink = (shopId: string) => {
  const {isMobile} = useEnv();
  console.log(isMobile);
  const linkPrefix = isMobile ? DIANPING_MOBILE_LINK : DIANPING_PC_LINK;
  window.open(linkPrefix + shopId);
}

</script>

<style lang="scss">
.restaurant-card {
  height: 200px;

  &__name {
    margin-right: 10px;
  }

  .external-link-btn {
    font-size: 20px;
    color: #333333;
  }
}

</style>
