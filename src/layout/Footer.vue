<script setup>
const resources = [
  {
    title: 'مواقيت الصلاة',
    link: 'https://aladhan.com/prayer-times-api',
  },
  {
    title: 'قاعدة بيانات الأذكار',
    link: 'https://github.com/osamayy/azkar-db',
  },
  {
    title: 'إذاعات القرآن الكريم',
    link: 'https://api.mp3quran.net/radios/radio_arabic.json',
  },
]

const support = [
  {
    title: 'المساهمة في التطوير',
    link: 'https://github.com/AbdelrhmanSaid/rafeeq',
  },
  {
    title: 'الإبلاغ عن مشكلة',
    link: 'https://github.com/AbdelrhmanSaid/rafeeq/issues',
  },
  {
    title: 'دعم المطور',
    link: 'https://buymeacoffee.com/abdelrhmansaid',
  },
  {
    title: 'سياسة الخصوصية',
    link: '/privacy',
  },
]

// Muted by default, accented on hover; in dark mode the accent is too dim
// against the surface, so the hover lands on the plain foreground instead.
const footerLinkClass = 'text-muted-foreground transition-colors hover:text-primary dark:hover:text-foreground'
</script>

<template>
  <footer class="border-t py-12">
    <div class="container-page grid grid-cols-1 gap-6 md:grid-cols-12">
      <div class="md:col-span-5">
        <p class="text-center text-muted-foreground md:text-start">
          تطبيق رفيق، تطبيق إسلامي مفتوح المصدر، لا توجد حقوق على المواد المستخدمة داخل الموقع، يمكنك استخدامها أو إعادة
          نشرها دون الرجوع إلينا مطلقًا، ولكن لا تنسانا من صالح دعائك.
        </p>
      </div>

      <div class="md:col-span-3 md:col-start-7">
        <p class="font-serif text-xl font-medium">المواد المستخدمة</p>
        <ul class="mt-2 space-y-1 text-sm">
          <li v-for="(resource, index) in resources" :key="index">
            <a :href="resource.link" :class="footerLinkClass" target="_blank">
              {{ resource.title }}
            </a>
          </li>
        </ul>
      </div>

      <div class="md:col-span-3">
        <p class="font-serif text-xl font-medium">الدعم والمساهمة</p>
        <ul class="mt-2 space-y-1 text-sm">
          <li v-for="(item, index) in support" :key="index">
            <a :href="item.link" :class="footerLinkClass" target="_blank">
              {{ item.title }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
