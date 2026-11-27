<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import ZakatCalculatorCard from '@/features/zakat/components/ZakatCalculatorCard.vue'
import ZakatInputRow from '@/features/zakat/components/ZakatInputRow.vue'
import { IconCoins, IconGift, IconBuildingStore, IconDiamond, IconPlant2, IconUsersGroup } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { formatNumber } from '@/shared/utils/format'
import {
  NISAB,
  goldPriceNisab,
  moneyZakat,
  goldZakat,
  silverZakat,
  cropsZakat,
  businessZakat,
  livestockZakat,
} from '@/features/zakat/lib/zakat'

const route = useRoute()

const goldPrice = ref('')
const moneyAmount = ref('')
const goldWeight = ref('')
const silverWeight = ref('')
const livestockCows = ref('')
const livestockSheep = ref('')
const livestockCamels = ref('')
const cropsAmount = ref('')
const businessAmount = ref('')

const moneyNisab = computed(() => goldPriceNisab(goldPrice.value, NISAB.money))
const businessNisab = computed(() => goldPriceNisab(goldPrice.value, NISAB.business))

const moneyResult = computed(() => moneyZakat(moneyAmount.value, moneyNisab.value))
const goldResult = computed(() => goldZakat(goldWeight.value))
const silverResult = computed(() => silverZakat(silverWeight.value))
const cropsResult = computed(() => cropsZakat(cropsAmount.value))
const businessResult = computed(() => businessZakat(businessAmount.value, businessNisab.value))
const livestockResult = computed(() =>
  livestockZakat({ cows: livestockCows.value, sheep: livestockSheep.value, camels: livestockCamels.value }),
)

// Amounts are written as a plain number plus unit; Intl's currency format scrambles in RTL.
const money = (value) => `${formatNumber(value)} ج.م`
const hasValue = (value) => parseFloat(value) > 0
const statusOf = (reached) => (reached ? 'reached' : 'below')

const results = computed(() => ({
  money: {
    value: money(moneyResult.value),
    hint: hasValue(goldPrice.value)
      ? `٢٫٥٪ · النصاب ${money(moneyNisab.value)}`
      : '٢٫٥٪ · أدخل سعر الذهب لمعرفة النصاب',
    status:
      hasValue(goldPrice.value) && hasValue(moneyAmount.value)
        ? statusOf(parseFloat(moneyAmount.value) >= moneyNisab.value)
        : null,
  },
  gold: {
    value: `${formatNumber(goldResult.value)} جرام`,
    hint: `٢٫٥٪ · النصاب ${toArabicNumerals(NISAB.gold)} جرام`,
    status: hasValue(goldWeight.value) ? statusOf(parseFloat(goldWeight.value) >= NISAB.gold) : null,
  },
  silver: {
    value: `${formatNumber(silverResult.value)} جرام`,
    hint: `٢٫٥٪ · النصاب ${toArabicNumerals(NISAB.silver)} جرام`,
    status: hasValue(silverWeight.value) ? statusOf(parseFloat(silverWeight.value) >= NISAB.silver) : null,
  },
  livestock: {
    value: `${toArabicNumerals(livestockResult.value)} رأس`,
    hint: 'حسب الأنصبة الشرعية لكل نوع',
    status: [livestockCows, livestockSheep, livestockCamels].some((count) => hasValue(count.value))
      ? statusOf(livestockResult.value > 0)
      : null,
  },
  crops: {
    value: `${formatNumber(cropsResult.value)} ~ ${formatNumber(cropsResult.value * 2)} كجم`,
    hint: `٥٪ للمروية · ١٠٪ للمطرية · النصاب ${toArabicNumerals(NISAB.crops)} كجم`,
    status: hasValue(cropsAmount.value) ? statusOf(parseFloat(cropsAmount.value) >= NISAB.crops) : null,
  },
  business: {
    value: money(businessResult.value),
    hint: hasValue(goldPrice.value)
      ? `٢٫٥٪ · النصاب ${money(businessNisab.value)}`
      : '٢٫٥٪ · أدخل سعر الذهب لمعرفة النصاب',
    status:
      hasValue(goldPrice.value) && hasValue(businessAmount.value)
        ? statusOf(parseFloat(businessAmount.value) >= businessNisab.value)
        : null,
  },
}))

const tabs = [
  { id: 'money', title: 'المال والمدخرات', icon: IconCoins },
  { id: 'gold', title: 'الذهب', icon: IconGift },
  { id: 'silver', title: 'الفضة', icon: IconDiamond },
  { id: 'livestock', title: 'الأنعام', icon: IconUsersGroup },
  { id: 'crops', title: 'الزروع والثمار', icon: IconPlant2 },
  { id: 'business', title: 'التجارة', icon: IconBuildingStore },
]

const activeTab = computed(() => (tabs.some((tab) => tab.id === route.params.tab) ? route.params.tab : 'money'))

const recipients = [
  'الفقراء والمساكين',
  'العاملين عليها',
  'المؤلفة قلوبهم',
  'في الرقاب',
  'الغارمين',
  'في سبيل الله',
  'ابن السبيل',
]

const importance = [
  'ركن من أركان الإسلام الخمسة',
  'تطهير للنفس والمال',
  'تحقيق العدالة الاجتماعية',
  'تنمية وبركة في المال',
]

const infoCards = [
  { title: 'مصارف الزكاة الثمانية', items: recipients },
  { title: 'أهمية الزكاة', items: importance },
]

const conditions = {
  money: ['أن يبلغ النصاب', 'أن يحول عليه الحول الهجري (سنة قمرية)', 'أن يكون زائداً عن الحاجات الأساسية'],
  gold: [
    `أن يبلغ النصاب (${toArabicNumerals(NISAB.gold)} جرام)`,
    'أن يحول عليه الحول الهجري',
    'لا زكاة في الذهب المُستعمل للزينة المعتادة',
  ],
  silver: [
    `أن يبلغ النصاب (${toArabicNumerals(NISAB.silver)} جرام)`,
    'أن يحول عليه الحول الهجري',
    'لا زكاة في الفضة المُستعملة للزينة المعتادة',
  ],
  livestock: [
    'أن تكون سائمة (ترعى بدون علف مشترى)',
    'أن تبلغ النصاب المحدد لكل نوع',
    'أن يحول عليها الحول الهجري',
    'ألا تكون عاملة (للحرث أو الركوب)',
  ],
  crops: [
    'أن تكون من الحبوب أو الثمار القابلة للادخار',
    `أن تبلغ النصاب (${toArabicNumerals(NISAB.crops)} كجم)`,
    'العشر (١٠%) فيما سقي بماء المطر أو الأنهار',
    'نصف العشر (٥%) فيما سقي بالآلات والتكلفة',
  ],
  business: [
    'أن تكون البضائع معدة للبيع والتجارة',
    'أن تبلغ قيمتها النصاب',
    'أن يحول عليها الحول الهجري',
    'تُقيم البضائع بسعر السوق وقت وجوب الزكاة',
  ],
}
</script>

<template>
  <Page>
    <Heading
      class="mb-4"
      subtitle-desktop-only
      title="حاسبة الزكاة"
      subtitle="خذ من أموالهم صدقة تطهرهم وتزكيهم بها"
      :share="true"
    />

    <div class="zakat-layout">
      <nav class="zakat-nav tab-pills" aria-label="أنواع الزكاة">
        <!-- Avoid stacking tab changes in browser history. -->
        <RouterLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="{ name: 'zakat', params: { tab: tab.id } }"
          replace
          class="zakat-nav-item tab-pill"
          :class="{ active: activeTab === tab.id }"
          :aria-current="activeTab === tab.id ? 'page' : undefined"
        >
          <component :is="tab.icon" :size="20" />
          <span>{{ tab.title }}</span>
        </RouterLink>
      </nav>

      <ZakatCalculatorCard
        :result="results[activeTab]"
        :status="results[activeTab].status"
        :conditions="conditions[activeTab]"
      >
        <template v-if="activeTab === 'money'">
          <ZakatInputRow v-model="goldPrice" label="سعر جرام الذهب (عيار ٢٤)" unit="ج.م" />
          <ZakatInputRow v-model="moneyAmount" label="إجمالي المال والمدخرات" unit="ج.م" />
        </template>

        <ZakatInputRow v-else-if="activeTab === 'gold'" v-model="goldWeight" label="وزن الذهب" unit="جرام" />

        <ZakatInputRow v-else-if="activeTab === 'silver'" v-model="silverWeight" label="وزن الفضة" unit="جرام" />

        <template v-else-if="activeTab === 'livestock'">
          <ZakatInputRow v-model="livestockCows" label="عدد الأبقار" unit="رأس" step="1" />
          <ZakatInputRow v-model="livestockSheep" label="عدد الأغنام" unit="رأس" step="1" />
          <ZakatInputRow v-model="livestockCamels" label="عدد الإبل" unit="رأس" step="1" />
        </template>

        <ZakatInputRow v-else-if="activeTab === 'crops'" v-model="cropsAmount" label="كمية المحصول" unit="كجم" />

        <template v-else-if="activeTab === 'business'">
          <ZakatInputRow v-model="goldPrice" label="سعر جرام الذهب (عيار ٢٤)" unit="ج.م" />
          <ZakatInputRow v-model="businessAmount" label="قيمة البضائع والأصول التجارية" unit="ج.م" />
        </template>
      </ZakatCalculatorCard>

      <section v-for="card in infoCards" :key="card.title" class="zakat-info">
        <h2 class="list-title">{{ card.title }}</h2>
        <ol class="list-group">
          <li v-for="(item, index) in card.items" :key="index" class="list-group-item zakat-info__row">
            <span class="list-index">{{ toArabicNumerals(index + 1) }}</span>
            <span>{{ item }}</span>
          </li>
        </ol>
      </section>
    </div>
  </Page>
</template>

<style scoped>
/* One column with a scrollable row of tabs on every screen size; pages are capped at 40rem. */
.zakat-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: start;
}

.zakat-nav {
  flex-direction: row;
  gap: 0.5rem;
  overflow-x: auto;
  margin: 0 -0.25rem;
  padding: 0 0.25rem 0.35rem;
}

.zakat-nav-item {
  width: auto;
  flex-shrink: 0;
  border-color: var(--app-hairline);
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
}

.zakat-nav-item.active {
  border-color: transparent;
}

.zakat-info {
  margin-top: 0.5rem;
}

.zakat-info__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3rem;
}
</style>
