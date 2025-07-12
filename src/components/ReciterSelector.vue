<template>
  <div class="reciter-selector">
    <div class="dropdown">
      <button 
        class="btn btn-outline-primary dropdown-toggle" 
        type="button" 
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <IconMicrophone2 size="1rem" />
        {{ currentReciter.name }}
      </button>
      
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <h6 class="dropdown-header">اختيار القارئ</h6>
        </li>
        <li><hr class="dropdown-divider"></li>
        
        <li v-for="reciter in reciters" :key="reciter.identifier">
          <button 
            class="dropdown-item" 
            :class="{ active: reciter.identifier === selectedReciter }"
            @click="selectReciter(reciter.identifier)"
          >
            <div class="reciter-info">
              <div class="reciter-name">{{ reciter.name }}</div>
              <div class="reciter-english-name">{{ reciter.englishName }}</div>
            </div>
            <IconCheck 
              v-if="reciter.identifier === selectedReciter" 
              size="1rem" 
              class="ms-auto text-primary"
            />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAudioStore } from '@/stores/audio'
import { IconMicrophone2, IconCheck } from '@tabler/icons-vue'

const audioStore = useAudioStore()

const reciters = computed(() => audioStore.reciters)
const selectedReciter = computed(() => audioStore.selectedReciter)
const currentReciter = computed(() => audioStore.currentReciter)

const selectReciter = (reciterIdentifier) => {
  audioStore.setReciter(reciterIdentifier)
}
</script>

<style scoped>
.reciter-selector {
  position: relative;
}

.dropdown-menu {
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: right;
}

.dropdown-item:hover {
  background-color: var(--bs-dropdown-link-hover-bg);
}

.dropdown-item.active {
  background-color: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
}

.reciter-info {
  flex: 1;
  text-align: right;
}

.reciter-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--bs-body-color);
}

.reciter-english-name {
  font-size: 0.8rem;
  color: var(--bs-text-muted);
  margin-top: 0.125rem;
}

.dropdown-item.active .reciter-name {
  color: var(--bs-primary);
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .dropdown-menu {
    min-width: 280px;
  }
  
  .reciter-name {
    font-size: 0.85rem;
  }
  
  .reciter-english-name {
    font-size: 0.75rem;
  }
}
</style>