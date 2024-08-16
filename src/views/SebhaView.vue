<script setup>
import { ref } from 'vue'
import { IconRefreshDot } from '@tabler/icons-vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import Heading from '@/components/Heading.vue'

const sebha = ref(0)
</script>

<template>
  <PageLayout>
    <Heading
      class="mb-4"
      title="السبحة الإلكترونية"
      subtitle="السبحة الإلكترونية هي تطبيق يساعدك على ذكر الله في أي وقت ومكان."
    />

    <div class="d-flex align-items-center justify-content-center my-5">
      <button @click="sebha++" class="sebha-btn">
        <span>{{ sebha }}</span>
      </button>
    </div>

    <div class="d-flex justify-content-center">
      <button @click="sebha = 0" class="btn btn-primary">
        <IconRefreshDot class="me-2" size="1.25rem" />
        <span>إعادة العداد</span>
      </button>
    </div>
  </PageLayout>
</template>

<style lang="scss" scoped>
.sebha-btn {
  width: 150px;
  height: 150px;
  background-color: var(--bs-body-bg);
  color: var(--bs-primary);
  border: 1px solid var(--bs-primary);
  border-radius: 50%;
  transition: transform 150ms;

  &:hover {
    transform: scale(1.1);
  }

  span {
    font-size: 2rem;
  }
}
</style>
