<script setup>
import { computed } from 'vue'
import { prayerIcons } from './prayerIcons'

const props = defineProps({
  name: { type: String, required: true },
})

const icon = computed(() => prayerIcons[props.name] ?? null)
</script>

<template>
  <!-- The glyph is sized in `em` rather than the icon's intrinsic pixel box, so
       it follows the surrounding type (and the app's 80–130% font-scale
       setting) by default while a caller's `size-*` class still overrides it.
       Decorative everywhere it is used: the prayer name always sits beside it. -->
  <svg
    v-if="icon"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="icon.viewBox"
    width="1em"
    height="1em"
    class="shrink-0"
    aria-hidden="true"
    focusable="false"
    v-html="icon.inner"
  />
</template>
