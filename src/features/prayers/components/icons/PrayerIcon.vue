<script setup>
import { computed } from 'vue'
import { prayerIcons } from './prayerIcons'

const props = defineProps({
  name: { type: String, required: true },
})

const icon = computed(() => prayerIcons[props.name] ?? null)
</script>

<template>
  <svg
    v-if="icon"
    xmlns="http://www.w3.org/2000/svg"
    :width="icon.width"
    :height="icon.height"
    :viewBox="icon.viewBox"
    v-html="icon.inner"
  />
</template>
