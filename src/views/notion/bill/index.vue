<template lang="pug">
BillForm
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BillForm from "../components/bill-form/bill-form.vue";

export default defineComponent({
  name: 'BillPage',
  components: { BillForm }
});
</script>

<style lang="scss" module src="./style.scss" />
