<script setup>
import { ref } from 'vue'
import { IconRefreshDot } from '@tabler/icons-vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'

const sebha = ref(0)
</script>

<template>
  <Page>
    <Heading
      class="mb-4"
      title="السبحة الإلكترونية"
      subtitle="السبحة الإلكترونية هي تطبيق يساعدك على ذكر الله في أي وقت ومكان."
    />

    <div class="sebha-shell">
      <div class="sebha-meta">
        <span class="sebha-total">{{ sebha }}</span>
        <span class="sebha-subtitle">كل ضغطة = تسبيحة</span>
      </div>

      <button @click="sebha++" class="sebha-btn">
        <span class="sebha-count">{{ sebha }}</span>
        <span class="sebha-label">اضغط للتسبيح</span>
      </button>

      <div class="sebha-actions">
        <button @click="sebha = 0" class="btn btn-outline-primary">
          <IconRefreshDot class="me-2" size="1.25rem" />
          <span>إعادة العداد</span>
        </button>
        <span class="sebha-hint">استمر بالذكر، واحتسب الأجر</span>
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.sebha-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  padding: 2rem 1rem 3rem;
  text-align: center;
}

.sebha-meta {
  display: grid;
  gap: 0.35rem;
  color: var(--bs-secondary-color);
}

.sebha-total {
  font-size: clamp(2.25rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--bs-primary);
}

.sebha-subtitle {
  font-size: 0.9rem;
}

.sebha-btn {
  width: min(220px, 70vw);
  height: min(220px, 70vw);
  border-radius: 50%;
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  color: var(--bs-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
}

.sebha-btn:hover {
  transform: translateY(-3px);
  border-color: var(--bs-primary);
  box-shadow: 0 18px 30px rgba(16, 24, 40, 0.12);
}

.sebha-btn:active {
  transform: translateY(0);
}

.sebha-count {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
}

.sebha-label {
  font-size: 0.95rem;
  color: var(--bs-secondary-color);
}

.sebha-actions {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}

.sebha-hint {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
}
</style>
