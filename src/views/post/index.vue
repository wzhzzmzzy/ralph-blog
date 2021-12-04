<template>
  <PostDocument />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import hljs from 'highlight.js/lib/core'
import cpp from 'highlight.js/lib/languages/cpp'
import PostDocument from '../../assets/posts/2017-03-29-《背包九讲》笔记.md';

hljs.registerLanguage('cpp', cpp)

export default defineComponent({
  name: 'post',
  components: {
    PostDocument
  },
  setup(){
    return {
      hljs
    }
  }
})
</script>
