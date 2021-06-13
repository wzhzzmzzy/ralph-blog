<template lang="pug">
main.type-racer
  p
    span {{ timing.toFixed(2) }} s;&nbsp
    span(v-if="passText") {{ (100 - errorNumber / passText.length).toFixed(2) }} %;&nbsp
    span(v-if="passText") {{ speed }} wpm
  p
    span.pass-text {{ passText }}
    span.correct {{ correctInput }}
    span.error {{ errorInput }}
    span.residue {{ residueWord }}{{ residueText }}
input.user-input(@input="handleInput" :disabled="gameStatus === GameStatus.FINISH")
</template>

<script lang="ts">
import {defineComponent, ref, watchEffect} from "vue";
import tail from 'lodash/tail';

const DEMO_TEXT = 'Creating a Single-page';

/**
 * get longest common prefix
 * @param s {string} sub
 * @param p {string} parent
 */
const getLCP: (s: string, p: string) => number = (s, p) => {
  let i = 0;
  for (; i < s.length; ) {
    if (s[i] === p[i]) i++;
    else break;
  }
  return i;
}

const getParagraphHead = (s: string) => {
 const l = s.split(' ');
 return l.length === 1 ? l[0] : l[0] + ' ';
}

const getParagraphTail = (s: string) => tail(s.split(' ')).join(' ');

enum GameStatus {
  RUNNING = Symbol('running'),
  PENDING = Symbol('pending'),
  FINISH = Symbol('finish')
}

export default defineComponent({
  name: 'TypingGame',
  setup() {
    const text = DEMO_TEXT;
    const residueText = ref<string>(text);
    const passText = ref<string>('');

    const gameStatus = ref<GameStatus>(GameStatus.PENDING);
    const timing = ref<number>(0);
    const errorNumber = ref<number>(0);
    const speed = ref<number>(0);

    let timingInterval = 0;
    watchEffect(() => {
      switch (gameStatus.value) {
        case GameStatus.PENDING:
          // initial timing
          timing.value = 0;
          errorNumber.value = 0;
          speed.value = 0;
          break;
        case GameStatus.RUNNING:
          // start timing
          timingInterval = setInterval(() => {
            speed.value = Math.round(passText.value.split(' ').length / timing.value * 60);
            timing.value += 0.01;
          }, 10);
          break;
        case GameStatus.FINISH:
          // end timing
          clearInterval(timingInterval);
          break;
        default:
          throw new Error('Unknown Game Status');
      }
    });
    const currentWord = ref<string>('');
    const correctInput = ref<string>('');
    const errorInput = ref<string>('');
    const residueWord = ref<string>(currentWord.value);
    const increaseWord = (initial = false) => {
      if (!initial) {
        passText.value += currentWord.value;
        if (!residueText.value) {
          currentWord.value = '';
          residueWord.value = '';
          correctInput.value = '';
          errorInput.value = '';
          gameStatus.value = GameStatus.FINISH;
          return;
        }
      }
      currentWord.value = getParagraphHead(residueText.value);
      residueText.value = getParagraphTail(residueText.value);
      correctInput.value = '';
      errorInput.value = '';
      residueWord.value = currentWord.value;
    }
    const handleInput = e => {
      if (gameStatus.value === GameStatus.PENDING) {
        gameStatus.value = GameStatus.RUNNING;
        increaseWord(true);
      }
      const rawInput = e.target.value;
      if (rawInput === currentWord.value) {
        increaseWord();
        e.target.value = '';
        return;
      }
      const lastIndex = getLCP(rawInput, currentWord.value);
      correctInput.value = rawInput.substring(0, lastIndex);
      errorInput.value = rawInput.substring(lastIndex);
      if (errorInput.value) {
        errorNumber.value += 1;
      }
      if (rawInput.length <= currentWord.value.length) {
        residueWord.value = currentWord.value.substring(rawInput.length);
      }
    }
    return {
      timing,
      errorNumber,
      speed,
      GameStatus,
      gameStatus,
      text,
      passText,
      correctInput,
      currentWord,
      errorInput,
      residueWord,
      residueText,
      handleInput
    }
  }
})
</script>

<style lang="scss" src="./style.scss" />
