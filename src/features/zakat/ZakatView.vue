<script setup>
import { ref, computed } from 'vue'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import ZakatCalculatorCard from '@/features/zakat/ZakatCalculatorCard.vue'
import { IconCoins, IconWheat, IconGift, IconBuildingStore } from '@tabler/icons-vue'
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
} from '@/features/zakat/zakat'

const activeTab = ref('money')

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
  { id: 'silver', title: 'الفضة', icon: IconGift },
  { id: 'livestock', title: 'الأنعام', icon: IconWheat },
  { id: 'crops', title: 'الزروع والثمار', icon: IconWheat },
  { id: 'business', title: 'التجارة', icon: IconBuildingStore },
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

    <!-- Tabs Navigation -->
    <div class="tab-pills mb-3">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab-pill"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" size="1.1rem" />
        <span>{{ tab.title }}</span>
      </button>
    </div>

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
        <input v-model="moneyAmount" type="number" class="form-control" placeholder="أدخل المبلغ" min="0" step="0.01" />
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
      :icon="IconGift"
      title="زكاة الفضة"
      :result="{ value: `${formatNumber(silverResult)} جرام`, hint: '٢.٥% من وزن الفضة' }"
      conditions-title="شروط زكاة الفضة:"
      :conditions="conditions.silver"
    >
      <label class="form-label">وزن الفضة (بالجرام)</label>
      <input v-model="silverWeight" type="number" class="form-control" placeholder="أدخل الوزن" min="0" step="0.1" />
      <div class="form-text">النصاب: {{ toArabicNumerals(NISAB.silver) }} جرام</div>
    </ZakatCalculatorCard>

    <!-- Livestock -->
    <ZakatCalculatorCard
      v-if="activeTab === 'livestock'"
      :icon="IconWheat"
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
      :icon="IconWheat"
      title="زكاة الزروع والثمار"
      :result="{
        value: `${formatNumber(cropsResult)} ~ ${formatNumber(cropsResult * 2)} كجم`,
        hint: '١٠% (مطرية) أو ٥% (مروية)',
      }"
      conditions-title="شروط زكاة الزروع:"
      :conditions="conditions.crops"
    >
      <label class="form-label">كمية المحصول (بالكيلوجرام)</label>
      <input v-model="cropsAmount" type="number" class="form-control" placeholder="أدخل الكمية" min="0" step="0.1" />
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
    <div class="card">
      <div class="card-body">
        <h5 class="card-title mb-3">معلومات مهمة عن الزكاة</h5>
        <div class="row g-4">
          <div class="col-md-6">
            <h6 class="mb-2">مصارف الزكاة الثمانية:</h6>
            <ul class="mb-0">
              <li>الفقراء والمساكين</li>
              <li>العاملين عليها</li>
              <li>المؤلفة قلوبهم</li>
              <li>في الرقاب</li>
              <li>الغارمين</li>
              <li>في سبيل الله</li>
              <li>ابن السبيل</li>
            </ul>
          </div>
          <div class="col-md-6">
            <h6 class="mb-2">أهمية الزكاة:</h6>
            <ul class="mb-0">
              <li>ركن من أركان الإسلام الخمسة</li>
              <li>تطهير للنفس والمال</li>
              <li>تحقيق العدالة الاجتماعية</li>
              <li>تنمية وبركة في المال</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>
