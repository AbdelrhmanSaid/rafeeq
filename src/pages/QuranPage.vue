<script setup>
import surahs from '@/database/quran-surahs.js';
</script>

<template>
  <div class="surahs">
    <a class="surah-card" v-for="surah in surahs" :key="surah.id" :href="`/quran/${surah.id}`">
      <span class="surah-title quran-font">{{ surah.name }}</span>

      <small class="surah-meta">
        {{ surah.numberOfAyahs }}
        <span v-if="surah.numberOfAyahs > 1 && surah.numberOfAyahs < 11">آيات</span>
        <span v-else>آية</span>
      </small>
    </a>
  </div>
</template>

<style lang="scss" scoped>
.surahs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
}

.surahs .surah-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  background-color: #fcf3e9;

  padding: 1rem;
  white-space: nowrap;
  text-align: center;
  border-radius: 0.5rem;
}

.surahs .surah-card:hover {
  background-color: #f8e9d6;
}

.surahs .surah-title {
  font-weight: bold;
}

.surahs .surah-meta {
  font-size: 0.8em;
  color: #666;
}
</style>
