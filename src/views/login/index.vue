<template lang="pug">
section.login-page
  a-form.login-page__form(
    layout="inline"
    size="large"
    :model="authStore"
    @submit="login"
  )
    h3.login-page__hint
      icon-message
      span 请先回答以下问题
    a-form-item(hide-label)
      a-input-password.token-input(
        allow-clear
        placeholder="暗号是什么？"
        :model-value="authStore.userToken"
        :error="authStore.authFailed"
        @input="handleInputToken"
      )
        template(#prefix)
          icon-user
        template(#suffix)
          a-button(@click="login")
            template(#icon): icon-caret-right
</template>

<script lang="ts">
import { defineComponent, toRef } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../store/auth';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const authStore = useAuthStore();
    const handleInputToken = text => {
      authStore.$patch({
        userToken: text
      })
    }

    const router = useRouter();
    const login = () => {
      const result = authStore.validateUser();
      if (result === true) {
        router.replace({
          name: 'experiment-records'
        })
      }
    }

    return {
      authStore,
      handleInputToken,
      login
    }
  }
});
</script>

<style lang="scss">
.login-page {
  background: var(--color-neutral-1);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .token-input {
    min-width: 250px;
    width: 40vw;
    height: unset;
  }

  &__form {
    justify-content: center;
  }

  &__hint {
    font-weight: 500;

    span {
      margin-left: 10px;
      padding-right: 50px;
    }
  }
}
</style>
