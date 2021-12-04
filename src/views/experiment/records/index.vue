<template lang="pug">
a-row(justify="center" v-if="experimentRecords.length")
  a-col(
    :xs="{ span: 24 }"
    :md="{ span: 12 }"
  )
    a-collapse(:bordered="!isMobile")
      record-item(
        v-for="(record, i) in experimentRecords"
        :key="i"
        :record="record"
      )
a-empty(v-else)
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import RecordItem from "./components/record-item.vue";

export default defineComponent({
  name: 'ExperimentRecords',
  components: {RecordItem},
  setup() {
    const isMobile = inject('isMobile');
    const experimentRecords = [
      {
        title: '2021-12-04'
      },
      {
        title: '2021-12-03'
      }
    ];
    return {
      isMobile,
      experimentRecords
    }
  }
});
</script>
