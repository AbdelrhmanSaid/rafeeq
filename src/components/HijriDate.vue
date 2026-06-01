<script setup>
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { IconMoon } from '@tabler/icons-vue'
import { formatHijriDate } from '@/utilities/arabic'

// Refresh every minute so the date stays correct if the app is left open past midnight.
const now = useNow({ interval: 60 * 1000 })

const hijriDate = computed(() => formatHijriDate(now.value))
</script>

<template>
  <div class="d-inline-flex align-items-center gap-2 text-secondary">
    <IconMoon size="18" />
    <span>{{ hijriDate }}</span>
  </div>
</template>
