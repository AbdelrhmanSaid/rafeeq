<script setup>
import { ref, computed } from 'vue'
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import { IconCoins, IconWheat, IconGift, IconBuildingStore } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/utilities/arabic'

const activeTab = ref('money')
const moneyAmount = ref('')
const goldWeight = ref('')
const silverWeight = ref('')
const livestockCows = ref('')
const livestockSheep = ref('')
const livestockCamels = ref('')
const cropsAmount = ref('')
const businessAmount = ref('')

// dynamic gold price and nisab calculations
const goldPrice = ref('')

const moneyNisab = computed(() => {
  const price = parseFloat(goldPrice.value)
  return price && price > 0 ? price * nisabValues.gold : nisabValues.money
})

const businessNisab = computed(() => {
  const price = parseFloat(goldPrice.value)
  return price && price > 0 ? price * nisabValues.gold : nisabValues.business
})

// Nisab values (minimum thresholds)
const nisabValues = {
  money: 2156.25, // Equivalent to 85 grams of gold in USD (approximate)
  gold: 85, // grams
  silver: 595, // grams
  cows: 30,
  sheep: 40,
  camels: 5,
  crops: 653, // kg (equivalent to 5 wasq)
  business: 2156.25, // Same as money
}

// Zakat rates
const zakatRates = {
  money: 0.025, // ٢.٥%
  gold: 0.025,
  silver: 0.025,
  business: 0.025,
  crops: 0.05, // ٥% for rain-fed crops, ١٠% for irrigated
}

// Money/Savings Zakat calculation
const moneyZakat = computed(() => {
  const amount = parseFloat(moneyAmount.value) || 0
  if (amount < moneyNisab.value) return 0
  return amount * zakatRates.money
})

// Gold Zakat calculation
const goldZakat = computed(() => {
  const weight = parseFloat(goldWeight.value) || 0
  if (weight < nisabValues.gold) return 0
  return weight * zakatRates.gold
})

// Silver Zakat calculation
const silverZakat = computed(() => {
  const weight = parseFloat(silverWeight.value) || 0
  if (weight < nisabValues.silver) return 0
  return weight * zakatRates.silver
})

// Livestock Zakat calculation
const livestockZakat = computed(() => {
  const cows = parseInt(livestockCows.value) || 0
  const sheep = parseInt(livestockSheep.value) || 0
  const camels = parseInt(livestockCamels.value) || 0

  let zakatAmount = 0

  // Cows calculation
  if (cows >= 30) {
    zakatAmount += Math.floor(cows / 30) * 1 // 1 young cow per 30 cows
  }

  // Sheep calculation
  if (sheep >= 40) {
    if (sheep >= 40 && sheep <= 120) zakatAmount += 1
    else if (sheep >= 121 && sheep <= 200) zakatAmount += 2
    else if (sheep >= 201 && sheep <= 399) zakatAmount += 3
    else if (sheep >= 400) zakatAmount += Math.floor(sheep / 100)
  }

  // Camels calculation
  if (camels >= 5) {
    if (camels >= 5 && camels <= 9) {
      zakatAmount += 1
    } else if (camels >= 10 && camels <= 14) {
      zakatAmount += 2
    } else if (camels >= 15 && camels <= 19) {
      zakatAmount += 3
    } else if (camels >= 20 && camels <= 24) {
      zakatAmount += 4
    } else if (camels >= 25) {
      zakatAmount += Math.floor(camels / 25)
    }
  }

  return zakatAmount
})

// Crops Zakat calculation
const cropsZakat = computed(() => {
  const amount = parseFloat(cropsAmount.value) || 0
  return amount < nisabValues.crops ? 0 : amount * zakatRates.crops
})

// Business Zakat calculation
const businessZakat = computed(() => {
  const amount = parseFloat(businessAmount.value) || 0
  return amount < businessNisab.value ? 0 : amount * zakatRates.business
})

const tabs = [
  { id: 'money', title: 'المال والمدخرات', icon: IconCoins },
  { id: 'gold', title: 'الذهب', icon: IconGift },
  { id: 'silver', title: 'الفضة', icon: IconGift },
  { id: 'livestock', title: 'الأنعام', icon: IconWheat },
  { id: 'crops', title: 'الزروع والثمار', icon: IconWheat },
  { id: 'business', title: 'التجارة', icon: IconBuildingStore },
]

const formatNumber = (num) => {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatCurrency = (num) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
  }).format(num)
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
    <div class="btn-group-toggle flex-wrap mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="btn-toggle"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" size="1.1rem" />
        <span>{{ tab.title }}</span>
      </button>
    </div>

    <!-- Money/Savings Calculator -->
    <div v-if="activeTab === 'money'" class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3 mb-4">
          <span class="icon-container"><IconCoins /></span>
          <h5 class="card-title mb-0">زكاة المال والمدخرات</h5>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
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
          </div>

          <div class="col-lg-5">
            <div class="zakat-result h-100">
              <span class="zakat-result-label">مقدار الزكاة</span>
              <span class="zakat-result-value">{{ formatCurrency(moneyZakat) }}</span>
              <span class="zakat-result-hint">٢.٥% من إجمالي المال</span>
            </div>
          </div>
        </div>

        <div class="zakat-note mt-4">
          <h6 class="mb-2">شروط زكاة المال:</h6>
          <ul class="mb-0">
            <li>أن يبلغ النصاب</li>
            <li>أن يحول عليه الحول الهجري (سنة قمرية)</li>
            <li>أن يكون زائداً عن الحاجات الأساسية</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Gold Calculator -->
    <div v-if="activeTab === 'gold'" class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3 mb-4">
          <span class="icon-container"><IconGift /></span>
          <h5 class="card-title mb-0">زكاة الذهب</h5>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <label class="form-label">وزن الذهب (بالجرام)</label>
            <input
              v-model="goldWeight"
              type="number"
              class="form-control"
              placeholder="أدخل الوزن"
              min="0"
              step="0.1"
            />
            <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.gold) }} جرام</div>
          </div>

          <div class="col-lg-5">
            <div class="zakat-result h-100">
              <span class="zakat-result-label">مقدار الزكاة</span>
              <span class="zakat-result-value">{{ formatNumber(goldZakat) }} جرام</span>
              <span class="zakat-result-hint">٢.٥% من وزن الذهب</span>
            </div>
          </div>
        </div>

        <div class="zakat-note mt-4">
          <h6 class="mb-2">شروط زكاة الذهب:</h6>
          <ul class="mb-0">
            <li>أن يبلغ النصاب ({{ toArabicNumerals(nisabValues.gold) }} جرام)</li>
            <li>أن يحول عليه الحول الهجري</li>
            <li>لا زكاة في الذهب المُستعمل للزينة المعتادة</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Silver Calculator -->
    <div v-if="activeTab === 'silver'" class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3 mb-4">
          <span class="icon-container"><IconGift /></span>
          <h5 class="card-title mb-0">زكاة الفضة</h5>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <label class="form-label">وزن الفضة (بالجرام)</label>
            <input
              v-model="silverWeight"
              type="number"
              class="form-control"
              placeholder="أدخل الوزن"
              min="0"
              step="0.1"
            />
            <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.silver) }} جرام</div>
          </div>

          <div class="col-lg-5">
            <div class="zakat-result h-100">
              <span class="zakat-result-label">مقدار الزكاة</span>
              <span class="zakat-result-value">{{ formatNumber(silverZakat) }} جرام</span>
              <span class="zakat-result-hint">٢.٥% من وزن الفضة</span>
            </div>
          </div>
        </div>

        <div class="zakat-note mt-4">
          <h6 class="mb-2">شروط زكاة الفضة:</h6>
          <ul class="mb-0">
            <li>أن يبلغ النصاب ({{ toArabicNumerals(nisabValues.silver) }} جرام)</li>
            <li>أن يحول عليه الحول الهجري</li>
            <li>لا زكاة في الفضة المُستعملة للزينة المعتادة</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Livestock Calculator -->
    <div v-if="activeTab === 'livestock'" class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3 mb-4">
          <span class="icon-container"><IconWheat /></span>
          <h5 class="card-title mb-0">زكاة الأنعام</h5>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <div class="row g-3">
              <div class="col-sm-4">
                <label class="form-label">عدد الأبقار</label>
                <input v-model="livestockCows" type="number" class="form-control" placeholder="٠" min="0" />
                <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.cows) }}</div>
              </div>

              <div class="col-sm-4">
                <label class="form-label">عدد الأغنام</label>
                <input v-model="livestockSheep" type="number" class="form-control" placeholder="٠" min="0" />
                <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.sheep) }}</div>
              </div>

              <div class="col-sm-4">
                <label class="form-label">عدد الإبل</label>
                <input v-model="livestockCamels" type="number" class="form-control" placeholder="٠" min="0" />
                <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.camels) }}</div>
              </div>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="zakat-result h-100">
              <span class="zakat-result-label">مقدار الزكاة</span>
              <span class="zakat-result-value">{{ toArabicNumerals(livestockZakat) }} رأس</span>
              <span class="zakat-result-hint">حسب الأنصبة الشرعية</span>
            </div>
          </div>
        </div>

        <div class="zakat-note mt-4">
          <h6 class="mb-2">شروط زكاة الأنعام:</h6>
          <ul class="mb-0">
            <li>أن تكون سائمة (ترعى بدون علف مشترى)</li>
            <li>أن تبلغ النصاب المحدد لكل نوع</li>
            <li>أن يحول عليها الحول الهجري</li>
            <li>ألا تكون عاملة (للحرث أو الركوب)</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Crops Calculator -->
    <div v-if="activeTab === 'crops'" class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3 mb-4">
          <span class="icon-container"><IconWheat /></span>
          <h5 class="card-title mb-0">زكاة الزروع والثمار</h5>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <label class="form-label">كمية المحصول (بالكيلوجرام)</label>
            <input
              v-model="cropsAmount"
              type="number"
              class="form-control"
              placeholder="أدخل الكمية"
              min="0"
              step="0.1"
            />
            <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.crops) }} كيلوجرام</div>
          </div>

          <div class="col-lg-5">
            <div class="zakat-result h-100">
              <span class="zakat-result-label">مقدار الزكاة</span>
              <span class="zakat-result-value">
                {{ formatNumber(cropsZakat) }} ~ {{ formatNumber(cropsZakat * 2) }} كجم
              </span>
              <span class="zakat-result-hint">١٠% (مطرية) أو ٥% (مروية)</span>
            </div>
          </div>
        </div>

        <div class="zakat-note mt-4">
          <h6 class="mb-2">شروط زكاة الزروع:</h6>
          <ul class="mb-0">
            <li>أن تكون من الحبوب أو الثمار القابلة للادخار</li>
            <li>أن تبلغ النصاب ({{ toArabicNumerals(nisabValues.crops) }} كجم)</li>
            <li>العشر (١٠%) فيما سقي بماء المطر أو الأنهار</li>
            <li>نصف العشر (٥%) فيما سقي بالآلات والتكلفة</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Business Calculator -->
    <div v-if="activeTab === 'business'" class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3 mb-4">
          <span class="icon-container"><IconBuildingStore /></span>
          <h5 class="card-title mb-0">زكاة عروض التجارة</h5>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
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
          </div>

          <div class="col-lg-5">
            <div class="zakat-result h-100">
              <span class="zakat-result-label">مقدار الزكاة</span>
              <span class="zakat-result-value">{{ formatCurrency(businessZakat) }}</span>
              <span class="zakat-result-hint">٢.٥% من قيمة البضائع</span>
            </div>
          </div>
        </div>

        <div class="zakat-note mt-4">
          <h6 class="mb-2">شروط زكاة التجارة:</h6>
          <ul class="mb-0">
            <li>أن تكون البضائع معدة للبيع والتجارة</li>
            <li>أن تبلغ قيمتها النصاب</li>
            <li>أن يحول عليها الحول الهجري</li>
            <li>تُقيم البضائع بسعر السوق وقت وجوب الزكاة</li>
          </ul>
        </div>
      </div>
    </div>

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

<style lang="scss" scoped>
.btn-group-toggle .btn-toggle {
  flex: 0 1 auto;
}

.icon-container {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--bs-border-color);
  color: var(--bs-primary);

  :deep(svg) {
    width: 24px;
    height: 24px;
  }
}

.zakat-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  text-align: center;
  padding: 1.5rem;
  border-radius: var(--bs-border-radius-lg);
  background-color: rgba(var(--bs-primary-rgb), 0.07);
  border: 1px solid color-mix(in srgb, var(--bs-primary) 25%, transparent);
}

.zakat-result-label {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
}

.zakat-result-value {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--bs-primary);
}

.zakat-result-hint {
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
}

.zakat-note {
  padding: 1rem 1.25rem;
  border-radius: var(--bs-border-radius);
  background-color: var(--bs-tertiary-bg);
  font-size: 0.9rem;
}

[data-bs-theme='dark'] .zakat-note {
  background-color: rgba(var(--bs-secondary-rgb), 0.1);
}
</style>
