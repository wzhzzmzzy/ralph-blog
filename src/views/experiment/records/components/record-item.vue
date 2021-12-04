<template lang="pug">
a-collapse-item(
  :header="record.title"
  :key="record.title"
)
  p {{ record.title }}
  a-row(justify="end"): a-col(:span="8")
    a-button(@click="enterRecord")
      template(#icon): icon-arrow-right
      | 查看详情
</template>

<script setup lang="ts">
const props = defineProps<{
  record: unknown,
  key: Number
}>()

const enterRecord = () => {

}
</script>
