<script setup>
import { RouterLink } from 'vue-router'
import { IconBrandTelegram, IconChevronLeft, IconExternalLink, IconSettings } from '@tabler/icons-vue'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import Logo from '@/shared/ui/Logo.vue'
import { navigation } from '@/layout/navigation'
import { TELEGRAM_URL, supportLinks } from '@/layout/links'

const tools = navigation.filter((item) => item.menus.includes('more'))

const links = [{ title: 'قناة التليجرام', link: TELEGRAM_URL, icon: IconBrandTelegram }, ...supportLinks].map(
  (item) => ({ ...item, external: /^https?:/.test(item.link) }),
)
</script>

<template>
  <Page>
    <Heading class="mb-4" title="المزيد" />

    <section class="more-section" aria-labelledby="more-tools">
      <h2 id="more-tools" class="list-title">الأدوات</h2>
      <div class="more-list">
        <RouterLink v-for="item in tools" :key="item.name" :to="{ name: item.name }" class="more-row">
          <span class="icon-tile more-row__icon"><component :is="item.icon" aria-hidden="true" /></span>
          <span class="more-row__label">{{ item.label }}</span>
          <IconChevronLeft class="more-row__trail" aria-hidden="true" />
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
      <h2 id="more-links" class="list-title">تواصل ودعم</h2>
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

.more-list {
  overflow: hidden;
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-lg);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-card);
}

/* px chrome, so at a large text size the longest label still fits one line on a 320px phone. */
.more-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 3.5rem;
  padding: 0.625rem 16px;
  color: var(--bs-body-color);
  text-decoration: none;

  & + & {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      inset-inline: 0;
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
  .more-row:hover {
    background: var(--app-surface-hover);
  }
}

.more-row__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  color: var(--app-primary-ink);

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
}

.more-row__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-row__trail {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  color: var(--bs-secondary-color);
}

[data-bs-theme='dark'] {
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
