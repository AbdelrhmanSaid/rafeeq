<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import ZakatCalculatorCard from '@/features/zakat/components/ZakatCalculatorCard.vue'
import {
  IconCoins,
  IconWheat,
  IconGift,
  IconBuildingStore,
  IconDiamond,
  IconPlant2,
  IconUsersGroup,
  IconHeartHandshake,
} from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { formatNumber, formatCurrency } from '@/shared/utils/format'
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
      :size="2"
      class="mb-4"
      title="حاسبة الزكاة"
      subtitle="خذ من أموالهم صدقة تطهرهم وتزكيهم بها"
      :share="true"
    />

    <div class="zakat-layout">
      <!-- Tabs Navigation -->
      <nav class="zakat-nav tab-pills" aria-label="أنواع الزكاة">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="{ name: 'zakat', params: { tab: tab.id } }"
          class="zakat-nav-item tab-pill"
          :class="{ active: activeTab === tab.id }"
        >
          <component :is="tab.icon" :size="20" />
          <span>{{ tab.title }}</span>
        </RouterLink>
      </nav>

      <div class="zakat-content">
        <!-- Money/Savings -->
        <ZakatCalculatorCard
          v-if="activeTab === 'money'"
          :icon="IconCoins"
          title="زكاة المال والمدخرات"
          :result="{ value: formatCurrency(moneyResult), hint: '٢.٥% من إجمالي المال' }"
          conditions-title="شروط زكاة المال:"
          :conditions="conditions.money"
        >
          <div class="mb-3">
            <label class="form-label">سعر جرام الذهب (عيار ٢٤) بالجنيه المصري</label>
            <input
              v-model="goldPrice"
              type="number"
              class="form-control"
              placeholder="أدخل السعر الحالي"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label class="form-label">إجمالي المال والمدخرات</label>
            <input
              v-model="moneyAmount"
              type="number"
              class="form-control"
              placeholder="أدخل المبلغ"
              min="0"
              step="0.01"
            />
            <div class="form-text" v-if="goldPrice">النصاب: {{ formatCurrency(moneyNisab) }} جنيه مصري</div>
          </div>
        </ZakatCalculatorCard>

        <!-- Gold -->
        <ZakatCalculatorCard
          v-if="activeTab === 'gold'"
          :icon="IconGift"
          title="زكاة الذهب"
          :result="{ value: `${formatNumber(goldResult)} جرام`, hint: '٢.٥% من وزن الذهب' }"
          conditions-title="شروط زكاة الذهب:"
          :conditions="conditions.gold"
        >
          <label class="form-label">وزن الذهب (بالجرام)</label>
          <input v-model="goldWeight" type="number" class="form-control" placeholder="أدخل الوزن" min="0" step="0.1" />
          <div class="form-text">النصاب: {{ toArabicNumerals(NISAB.gold) }} جرام</div>
        </ZakatCalculatorCard>

        <!-- Silver -->
        <ZakatCalculatorCard
          v-if="activeTab === 'silver'"
          :icon="IconDiamond"
          title="زكاة الفضة"
          :result="{ value: `${formatNumber(silverResult)} جرام`, hint: '٢.٥% من وزن الفضة' }"
          conditions-title="شروط زكاة الفضة:"
          :conditions="conditions.silver"
        >
          <label class="form-label">وزن الفضة (بالجرام)</label>
          <input
            v-model="silverWeight"
            type="number"
            class="form-control"
            placeholder="أدخل الوزن"
            min="0"
            step="0.1"
          />
          <div class="form-text">النصاب: {{ toArabicNumerals(NISAB.silver) }} جرام</div>
        </ZakatCalculatorCard>

        <!-- Livestock -->
        <ZakatCalculatorCard
          v-if="activeTab === 'livestock'"
          :icon="IconUsersGroup"
          title="زكاة الأنعام"
          :result="{ value: `${toArabicNumerals(livestockResult)} رأس`, hint: 'حسب الأنصبة الشرعية' }"
          conditions-title="شروط زكاة الأنعام:"
          :conditions="conditions.livestock"
        >
          <div class="row g-3">
            <div class="col-sm-4">
              <label class="form-label">عدد الأبقار</label>
              <input v-model="livestockCows" type="number" class="form-control" placeholder="٠" min="0" />
              <div class="form-text">النصاب: {{ toArabicNumerals(NISAB.cows) }}</div>
            </div>

            <div class="col-sm-4">
              <label class="form-label">عدد الأغنام</label>
              <input v-model="livestockSheep" type="number" class="form-control" placeholder="٠" min="0" />
              <div class="form-text">النصاب: {{ toArabicNumerals(NISAB.sheep) }}</div>
            </div>

            <div class="col-sm-4">
              <label class="form-label">عدد الإبل</label>
              <input v-model="livestockCamels" type="number" class="form-control" placeholder="٠" min="0" />
              <div class="form-text">النصاب: {{ toArabicNumerals(NISAB.camels) }}</div>
            </div>
          </div>
        </ZakatCalculatorCard>

        <!-- Crops -->
        <ZakatCalculatorCard
          v-if="activeTab === 'crops'"
          :icon="IconPlant2"
          title="زكاة الزروع والثمار"
          :result="{
            value: `${formatNumber(cropsResult)} ~ ${formatNumber(cropsResult * 2)} كجم`,
            hint: '١٠% (مطرية) أو ٥% (مروية)',
          }"
          conditions-title="شروط زكاة الزروع:"
          :conditions="conditions.crops"
        >
          <label class="form-label">كمية المحصول (بالكيلوجرام)</label>
          <input
            v-model="cropsAmount"
            type="number"
            class="form-control"
            placeholder="أدخل الكمية"
            min="0"
            step="0.1"
          />
          <div class="form-text">النصاب: {{ toArabicNumerals(NISAB.crops) }} كيلوجرام</div>
        </ZakatCalculatorCard>

        <!-- Business -->
        <ZakatCalculatorCard
          v-if="activeTab === 'business'"
          :icon="IconBuildingStore"
          title="زكاة عروض التجارة"
          :result="{ value: formatCurrency(businessResult), hint: '٢.٥% من قيمة البضائع' }"
          conditions-title="شروط زكاة التجارة:"
          :conditions="conditions.business"
        >
          <div class="mb-3">
            <label class="form-label">سعر جرام الذهب (عيار ٢٤) بالجنيه المصري</label>
            <input
              v-model="goldPrice"
              type="number"
              class="form-control"
              placeholder="أدخل السعر الحالي"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label class="form-label">قيمة البضائع والأصول التجارية (بالجنيه المصري)</label>
            <input
              v-model="businessAmount"
              type="number"
              class="form-control"
              placeholder="أدخل القيمة"
              min="0"
              step="0.01"
            />
            <div class="form-text" v-if="goldPrice">النصاب: {{ formatCurrency(businessNisab) }} جنيه مصري</div>
          </div>
        </ZakatCalculatorCard>

        <!-- General Information -->
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card h-100 zakat-info">
              <div class="card-body">
                <div class="zakat-info__header">
                  <span class="icon-tile zakat-info__icon"><IconHeartHandshake :size="18" /></span>
                  <h4 class="zakat-info__title">مصارف الزكاة الثمانية</h4>
                </div>
                <ol class="zakat-info__list">
                  <li v-for="(item, index) in recipients" :key="index">
                    <span class="zakat-info__num">{{ toArabicNumerals(index + 1) }}</span>
                    <span>{{ item }}</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card h-100 zakat-info">
              <div class="card-body">
                <div class="zakat-info__header">
                  <span class="icon-tile zakat-info__icon"><IconWheat :size="18" /></span>
                  <h4 class="zakat-info__title">أهمية الزكاة</h4>
                </div>
                <ol class="zakat-info__list">
                  <li v-for="(item, index) in importance" :key="index">
                    <span class="zakat-info__num">{{ toArabicNumerals(index + 1) }}</span>
                    <span>{{ item }}</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.zakat-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.zakat-nav {
  flex-direction: column;
  gap: 0.25rem;
  overflow-x: visible;
  padding: 0;
  margin: 0;
  position: sticky;
  top: calc(var(--navbar-height) + 1rem);
}

.zakat-nav-item {
  width: 100%;
  flex-shrink: 1;
  padding-block: 0.7rem;
  border-color: transparent;
  font-size: 0.9rem;
}

.zakat-content {
  min-width: 0;
}

.zakat-content > :deep(.zakat-card) {
  margin-bottom: 1.5rem;
}

.zakat-info__header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1rem;
}

.zakat-info__icon {
  color: var(--bs-primary);
}

[data-bs-theme='dark'] .zakat-info__icon {
  color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
}

.zakat-info__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.zakat-info__list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
}

.zakat-info__list li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.zakat-info__num {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--app-tint);
  color: var(--bs-primary);
  font-size: 0.75rem;
  font-weight: 700;
}

[data-bs-theme='dark'] .zakat-info__num {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

@media (max-width: 767.98px) {
  .zakat-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .zakat-nav {
    flex-direction: row;
    position: static;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    margin-inline: -0.25rem;
    padding-inline: 0.25rem;
  }

  .zakat-nav-item {
    width: auto;
    flex-shrink: 0;
    border-color: var(--bs-border-color);
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
  }

  .zakat-nav-item.active {
    border-color: transparent;
  }
}
</style>
