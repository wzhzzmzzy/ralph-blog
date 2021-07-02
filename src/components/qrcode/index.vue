<template lang="pug">
canvas(ref="qrcodeEl")
</template>

<script setup lang="ts">
import {defineProps, ref, watchEffect, onUpdated, onMounted} from 'vue';
import {toCanvas} from 'qrcode';

const props = defineProps<{
  text: string,
  qrcodeOptions?: any
}>();

const qrcodeEl = ref<HTMLCanvasElement | null>(null);

const renderQrCode = () => {
  toCanvas(qrcodeEl.value, props.text, {
    errorCorrectionLevel: "quartile",
    scale: 3,
    color: {
      dark: '#111',
    }
  });
}

onMounted(renderQrCode);
onUpdated(renderQrCode);
</script>
