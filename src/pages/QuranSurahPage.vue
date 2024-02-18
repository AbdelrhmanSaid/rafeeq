<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

const route = useRoute();
const router = useRouter();
const surahId = route.params.surah;

if (isNaN(surahId) || surahId < 1 || surahId > 114) {
  router.push('/quran');
}

const surah = ref(null);

onBeforeMount(() => {
  fetch(`https://api.alquran.cloud/v1/surah/${surahId}`)
    .then((response) => response.json())
    .then((data) => (surah.value = data.data));
});
</script>

<template>
  <div v-if="surah" class="quran-page">
    <header>
      <h3 class="quran-font">{{ surah.name }}</h3>

      <RouterLink :to="{ name: 'quran' }">
        ← رجوع
      </RouterLink>
    </header>

    <span class="ayah quran-font" v-for="ayah in surah.ayahs" :key="ayah.number">
      <span class="ayah-text">
        {{ ayah.text.trim() }}
      </span>

      <span class="ayah-number">﴿{{ ayah.numberInSurah.toLocaleString('ar-EG') }}﴾</span>
    </span>
  </div>

  <div v-else aria-busy="true" role="alert">جاري تحميل السورة...</div>
</template>

<style lang="scss" scoped>
.quran-page {
  max-width: 600px;
  margin: 0 auto;
  text-align: justify;
}

.quran-page header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block: 2rem;
}

.quran-page header * {
  margin: 0;
}

.ayah-number {
  padding-inline: 5px;
  font-size: 0.8em;
  vertical-align: middle;
}

[aria-busy='true'] {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
