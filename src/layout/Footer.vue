<script setup>
import Logo from '@/shared/ui/Logo.vue'
import { IconBrandGithub, IconBrandTelegram, IconHeart } from '@tabler/icons-vue'

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
  <footer class="app-footer">
    <div class="container">
      <div class="row g-4 g-lg-5">
        <div class="col-lg-5">
          <Logo :size="34" class="app-footer__logo mb-3" />
          <p class="text-body-secondary mb-3 app-footer__blurb">
            تطبيق رفيق، تطبيق إسلامي مفتوح المصدر، لا توجد حقوق على المواد المستخدمة داخل الموقع، يمكنك استخدامها أو
            إعادة نشرها دون الرجوع إلينا مطلقًا، ولكن لا تنسانا من صالح دعائك.
          </p>
          <div class="d-flex gap-2">
            <a
              href="https://github.com/AbdelrhmanSaid/rafeeq"
              target="_blank"
              class="btn btn-soft btn-icon rounded-circle"
              aria-label="GitHub"
            >
              <IconBrandGithub size="1.2rem" />
            </a>
            <a
              href="https://t.me/rafeeqme"
              target="_blank"
              class="btn btn-soft btn-icon rounded-circle"
              aria-label="قناة التليجرام"
            >
              <IconBrandTelegram size="1.2rem" />
            </a>
            <a
              href="https://buymeacoffee.com/abdelrhmansaid"
              target="_blank"
              class="btn btn-soft btn-icon rounded-circle"
              aria-label="دعم المطور"
            >
              <IconHeart size="1.2rem" />
            </a>
          </div>
        </div>

        <div class="col-6 col-lg-3 offset-lg-1">
          <p class="app-footer__title">المواد المستخدمة</p>
          <ul class="list-unstyled app-footer__list">
            <li v-for="(resource, index) in resources" :key="index">
              <a :href="resource.link" class="footer-link" target="_blank">
                {{ resource.title }}
              </a>
            </li>
          </ul>
        </div>

        <div class="col-6 col-lg-3">
          <p class="app-footer__title">الدعم والمساهمة</p>
          <ul class="list-unstyled app-footer__list">
            <li v-for="(item, index) in support" :key="index">
              <a :href="item.link" class="footer-link" target="_blank">
                {{ item.title }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="app-footer__bottom">
        <span>صُنع بحب لوجه الله</span>
        <span class="app-footer__dot" aria-hidden="true">·</span>
        <span>لا تنسانا من صالح دعائك</span>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  padding-block: 3.5rem 2rem;
  border-top: 1px solid var(--app-hairline);
  background:
    radial-gradient(40rem 14rem at 0 100%, color-mix(in srgb, var(--bs-primary) 8%, transparent), transparent 70%),
    var(--app-surface);
}

.app-footer__logo {
  color: var(--bs-primary);
}

.app-footer__blurb {
  max-width: 38rem;
  font-size: 0.925rem;
  line-height: 1.8;
}

.app-footer__title {
  margin-bottom: 0.75rem;
  font-family: var(--bs-headings-font-family, inherit);
  font-size: 1rem;
  font-weight: 700;
}

.app-footer__list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  font-size: 0.9rem;
}

.footer-link {
  color: var(--bs-secondary-color);
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--bs-primary);
  }
}

.app-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--app-hairline);
  color: var(--bs-secondary-color);
  font-size: 0.82rem;
}

.app-footer__dot {
  opacity: 0.5;
}
</style>
