<template lang="pug">
n-card.restaurant-card(hoverable)
  template(v-slot:header)
    span.restaurant-card__name {{ name }}
    n-gradient-text(:gradient="calcGradientByScore(score)") {{ score.toFixed(1) }}
  template(v-slot:header-extra v-if="link")
    n-button.external-link-btn(v-if="isMobile" text @click="openDianPingLink(link)"): n-icon
      external-link
    n-popover(v-else trigger="hover" raw :show-arrow="false")
      template(#trigger)
        n-button.external-link-btn(text @click="openDianPingLink(link)"): n-icon
          external-link
      QRCode(:text="getDianPingLink(link)")
  template(v-slot:default)
    div
      p: n-tag {{ tag }}
      n-ellipsis(:line-clamp="isMobile ? 2 : 3") {{ comment }}
</template>

<script setup lang="ts">
import {defineProps, toRefs} from "vue";
import {NCard, NTag, NGradientText, NButton, NIcon, NEllipsis, NPopover} from 'naive-ui';
import {ExternalLink} from '@vicons/carbon';
import {checkMobile} from '../../../../hooks';
import QRCode from '../../../../components/qrcode/index.vue';

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

const {isMobile} = checkMobile();

const getDianPingLink = (shopId: string) => {
  return DIANPING_MOBILE_LINK + shopId;
}

const openDianPingLink = (shopId: string) => {
  const linkPrefix = isMobile ? DIANPING_MOBILE_LINK : DIANPING_PC_LINK;
  window.open(linkPrefix + shopId);
}

</script>

<style lang="scss">
.restaurant-card {
  height: 240px;

  &__name {
    margin-right: 10px;
  }

  .n-card-header {
    padding-bottom: 0;
  }

  .external-link-btn {
    font-size: 20px;
    color: #333333;
  }
}

</style>
