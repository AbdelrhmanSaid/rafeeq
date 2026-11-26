<script setup>
import { RouterLink } from 'vue-router'
import {
  IconBrandGithub,
  IconBrandTelegram,
  IconBug,
  IconChevronLeft,
  IconExternalLink,
  IconHeart,
  IconSettings,
  IconShieldLock,
} from '@tabler/icons-vue'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import Logo from '@/shared/ui/Logo.vue'
import { navigation } from '@/layout/navigation'
import { TELEGRAM_URL, supportLinks } from '@/layout/links'

const tools = navigation.filter((item) => item.menus.includes('more'))

const SUPPORT_ICONS = [IconBrandGithub, IconBug, IconHeart, IconShieldLock]

const links = [
  { title: 'قناة التليجرام', link: TELEGRAM_URL, icon: IconBrandTelegram },
  ...supportLinks.map((item, index) => ({ ...item, icon: SUPPORT_ICONS[index] })),
].map((item) => ({ ...item, external: /^https?:/.test(item.link) }))
</script>

<template>
  <Page>
    <Heading class="mb-4" title="المزيد" />

    <section class="more-section" aria-labelledby="more-tools">
      <h2 id="more-tools" class="more-section__title">الأدوات</h2>
      <div class="more-tools">
        <RouterLink v-for="item in tools" :key="item.name" :to="{ name: item.name }" class="more-tool">
          <span class="icon-tile more-tool__icon"><component :is="item.icon" aria-hidden="true" /></span>
          <span class="more-tool__label">{{ item.label }}</span>
        </RouterLink>
      </div>
    </section>

    <section class="more-section">
      <div class="more-list">
        <RouterLink :to="{ name: 'settings' }" class="more-row">
          <span class="icon-tile more-row__icon"><IconSettings aria-hidden="true" /></span>
          <span class="more-row__label">الإعدادات</span>
          <IconChevronLeft class="more-row__trail" aria-hidden="true" />
        </RouterLink>
      </div>
    </section>

    <section class="more-section" aria-labelledby="more-links">
      <h2 id="more-links" class="more-section__title">تواصل ودعم</h2>
      <div class="more-list">
        <template v-for="item in links" :key="item.link">
          <a v-if="item.external" :href="item.link" target="_blank" rel="noopener" class="more-row">
            <span class="icon-tile more-row__icon"><component :is="item.icon" aria-hidden="true" /></span>
            <span class="more-row__label">{{ item.title }}</span>
            <IconExternalLink class="more-row__trail" aria-hidden="true" />
          </a>
          <RouterLink v-else :to="item.link" class="more-row">
            <span class="icon-tile more-row__icon"><component :is="item.icon" aria-hidden="true" /></span>
            <span class="more-row__label">{{ item.title }}</span>
            <IconChevronLeft class="more-row__trail" aria-hidden="true" />
          </RouterLink>
        </template>
      </div>
    </section>

    <footer class="more-about">
      <Logo :size="32" />
      <p class="mb-0">تطبيق إسلامي مفتوح المصدر، صُنع بحب لوجه الله.</p>
      <p class="mb-0">لا تنسانا من صالح دعائك</p>
    </footer>
  </Page>
</template>

<style lang="scss" scoped>
.more-section {
  margin-bottom: 1.5rem;
}

.more-section__title {
  margin: 0 0.25rem 0.625rem;
  color: var(--bs-secondary-color);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
}

.more-tools {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
}

.more-tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 0.5rem 0.875rem;
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-xl);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-card);
  color: var(--bs-body-color);
  text-align: center;
  text-decoration: none;

  &:active {
    background: var(--app-surface-active);
  }
}

.more-tool__icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--bs-border-radius-lg);
  color: var(--bs-primary);

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.more-tool__label {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.3;
}

/* An inset grouped list, like a native settings screen. */
.more-list {
  overflow: hidden;
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-xl);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-card);
}

.more-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-height: 3.5rem;
  padding: 0.625rem 1rem;
  color: var(--bs-body-color);
  text-decoration: none;

  /* Separators start after the icon, so the icons read as one column. */
  & + & {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      inset-inline: 4.375rem 0;
      height: 1px;
      background: var(--app-hairline);
    }
  }

  &:active {
    background: var(--app-surface-active);
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -2px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .more-tool:hover,
  .more-row:hover {
    background: var(--app-surface-hover);
  }
}

.more-row__icon {
  width: 2.25rem;
  height: 2.25rem;
  color: var(--bs-primary);

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
}

.more-row__label {
  flex: 1;
  min-width: 0;
  font-weight: 500;
}

.more-row__trail {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  color: var(--bs-secondary-color);
}

[data-bs-theme='dark'] {
  .more-tool__icon,
  .more-row__icon {
    color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
  }
}

.more-about {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding-block: 1rem 0.5rem;
  color: var(--bs-secondary-color);
  font-size: 0.85rem;
  text-align: center;
}
</style>
