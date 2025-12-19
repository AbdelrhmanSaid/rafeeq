<script setup>
useSeoMeta({
  title: 'الرئيسية - رفيق',
  ogTitle: 'الرئيسية - رفيق',
  description: 'تطبيق رفيق هو رفيقك المسلم، يوفر لك المصحف الكريم، الأذكار، مواقيت الصلاة، وإذاعات القرآن الكريم في مكان واحد.',
  ogDescription: 'تطبيق رفيق هو رفيقك المسلم، يوفر لك المصحف الكريم، الأذكار، مواقيت الصلاة، وإذاعات القرآن الكريم في مكان واحد.',
  keywords: 'إسلام, أذكار, قرآن, مواقيت الصلاة, رفيق, تطبيق إسلامي',
})
</script>

<template>
  <Page>
    <Heading :size="2" class="mb-4" title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا." />
    <PrayerTimes class="mb-5" />

    <Heading :size="2" class="mb-4" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />
    <SunnahPrayers class="mb-5" />

    <Heading :size="2" class="mb-4" title="الأذكار" subtitle="لا يزال لسانك رطباً من ذكر الله" />
    <QuickAzkar />
  </Page>
</template>

<style lang="scss" scoped>
.icon-container {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-primary);
}
</style>

