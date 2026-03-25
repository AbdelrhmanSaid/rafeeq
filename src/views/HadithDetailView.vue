<script setup>
import { ref, computed, watch } from 'vue'
import { useRouteParams } from '@vueuse/router'
import { useOnline } from '@vueuse/core'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import BackButton from '@/components/BackButton.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import OfflineState from '@/components/OfflineState.vue'
import HadithCard from '@/components/HadithCard.vue'
import { useMeta } from '@/utilities/head'
import { useHadithService } from '@/services/hadithService'

const id = useRouteParams('id')
const online = useOnline()
const { fetchHadith } = useHadithService()

const hadith = ref(null)
const isFetching = ref(true)
const error = ref(null)

async function loadHadith() {
  isFetching.value = true
  error.value = null

  try {
    hadith.value = await fetchHadith(id.value)
  } catch (e) {
    error.value = e
  } finally {
    isFetching.value = false
  }
}

loadHadith()

watch(hadith, (val) => {
  if (val) {
    useMeta({
      title: val.title,
      description: val.text?.substring(0, 160),
      keywords: ['حديث', 'الأربعون النووية', val.title, 'رفيق'],
    })
  }
})

const descriptionParagraphs = computed(() => hadith.value?.description?.split('\n').map((p) => p.trim()))
</script>

<template>
  <Page>
    <LoadingState v-if="isFetching" message="جاري تحميل الحديث..." />

    <template v-else-if="error">
      <OfflineState v-if="!online" />
      <ErrorState :code="404" message="الحديث غير موجود." v-else />
    </template>

    <template v-else-if="hadith">
      <Heading class="mb-4" :title="hadith.title" :share="true" />

      <HadithCard class="mb-3" :title="hadith.title" :text="hadith.text" />

      <div v-if="hadith.description" class="border rounded p-4 mb-3">
        <div style="text-align: justify">
          <p
            v-for="(paragraph, i) in descriptionParagraphs"
            :key="i"
            class="fs-6 lh-lg text-muted">
            {{ paragraph }}
          </p>
        </div>
      </div>

      <div class="d-flex justify-content-center">
        <BackButton :to="{ name: 'hadith' }" button-class="btn-primary" />
      </div>
    </template>
  </Page>
</template>
