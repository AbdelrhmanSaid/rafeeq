<script setup>
import surahs from '@/database/quran-surahs.js';
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="surahs">
    <RouterLink class="surah-card" v-for="surah in surahs" :key="surah.id" :to="`/quran/${surah.id}`">
      <span class="surah-title quran-font">{{ surah.name }}</span>

      <small class="surah-meta">
        {{ surah.numberOfAyahs }}
        <span v-if="surah.numberOfAyahs > 1 && surah.numberOfAyahs < 11">آيات</span>
        <span v-else>آية</span>
      </small>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.surahs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  justify-content: center;
  padding: 1rem;

  .surah-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    background-color: #fcf3e9;
    border: 1px solid #f8e9d6;
    border-radius: 5px;

    padding: 1rem;
    white-space: nowrap;
    text-align: center;

    &:hover {
      background-color: #f8e9d6;
    }

    .surah-title {
      font-weight: bold;
    }

    .surah-meta {
      font-size: 0.8em;
      color: #666;
    }
  }
}
</style>
