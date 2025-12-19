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
</script>

<template>
  <footer class="py-5 border-top">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-5">
          <p class="text-muted text-center text-md-start mb-0">
            تطبيق رفيق، تطبيق إسلامي مفتوح المصدر، لا توجد حقوق على المواد المستخدمة داخل الموقع، يمكنك استخدامها أو
            إعادة نشرها دون الرجوع إلينا مطلقًا، ولكن لا تنسانا من صالح دعائك.
          </p>
        </div>

        <div class="col-md-3 offset-md-1">
          <p class="h5">المواد المستخدمة</p>
          <ul class="list-unstyled text-small">
            <li v-for="(resource, index) in resources" :key="index">
              <a :href="resource.link" class="text-muted text-decoration-none" target="_blank">
                {{ resource.title }}
              </a>
            </li>
          </ul>
        </div>

        <div class="col-md-3">
          <p class="h5">الدعم والمساهمة</p>
          <ul class="list-unstyled text-small">
            <li v-for="(item, index) in support" :key="index">
              <a :href="item.link" class="text-muted text-decoration-none" target="_blank">
                {{ item.title }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>
