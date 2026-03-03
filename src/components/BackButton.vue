<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { IconArrowLeft } from '@tabler/icons-vue'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
  label: {
    type: String,
    default: 'العودة',
  },
  buttonClass: {
    type: [String, Array, Object],
    default: 'btn-flat',
  },
})

const route = useRoute()
const isEmbedRoute = computed(() => route.path.startsWith('/embed'))
</script>

<template>
  <RouterLink
    v-if="!isEmbedRoute"
    :to="props.to"
    class="btn d-inline-flex align-items-center gap-2"
    :class="props.buttonClass"
  >
    <IconArrowLeft size="1.25rem" />
    <span>{{ props.label }}</span>
  </RouterLink>
</template>
