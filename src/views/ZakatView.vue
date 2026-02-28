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
    <Heading :size="2" class="mb-4" title="حاسبة الزكاة" subtitle="خذ من أموالهم صدقة تطهرهم وتزكيهم بها" :share="true" />

    <!-- Tabs Navigation -->
    <div class="row g-2 mb-4">
      <div v-for="tab in tabs" :key="tab.id" class="col-6 col-md-4 col-lg-2">
        <button
          @click="activeTab = tab.id"
          :class="[
            'btn w-100 d-flex flex-column align-items-center p-3',
            activeTab === tab.id ? 'btn-primary' : 'btn-outline-primary',
          ]"
        >
          <component :is="tab.icon" size="1.5rem" class="mb-2" />
          <span class="small">{{ tab.title }}</span>
        </button>
      </div>
    </div>

    <!-- Money/Savings Calculator -->
    <div v-if="activeTab === 'money'" class="card">
      <div class="card-body">
        <h5 class="card-title mb-4">
          <IconCoins class="me-2" />
          زكاة المال والمدخرات
        </h5>

        <div class="row gy-3">
          <div class="col-md-8">
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

            <div class="mb-3">
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

          <div class="col-md-4">
            <div class="alert alert-info">
              <h6 class="alert-heading">مقدار الزكاة</h6>
              <div class="display-6 text-primary">
                {{ formatCurrency(moneyZakat) }}
              </div>
              <small class="text-muted">٢.٥% من إجمالي المال</small>
            </div>
          </div>
        </div>

        <div class="alert alert-light mt-3">
          <h6>شروط زكاة المال:</h6>
          <ul class="mb-0">
            <li>أن يبلغ النصاب</li>
            <li>أن يحول عليه الحول الهجري (سنة قمرية)</li>
            <li>أن يكون زائداً عن الحاجات الأساسية</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Gold Calculator -->
    <div v-if="activeTab === 'gold'" class="card">
      <div class="card-body">
        <h5 class="card-title mb-4">
          <IconGift class="me-2" />
          زكاة الذهب
        </h5>

        <div class="row gy-3">
          <div class="col-md-8">
            <div class="mb-3">
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
          </div>

          <div class="col-md-4">
            <div class="alert alert-info">
              <h6 class="alert-heading">مقدار الزكاة</h6>
              <div class="display-6 text-primary">{{ formatNumber(goldZakat) }} جرام</div>
              <small class="text-muted">٢.٥% من وزن الذهب</small>
            </div>
          </div>
        </div>

        <div class="alert alert-light mt-3">
          <h6>شروط زكاة الذهب:</h6>
          <ul class="mb-0">
            <li>أن يبلغ النصاب ({{ toArabicNumerals(nisabValues.gold) }} جرام)</li>
            <li>أن يحول عليه الحول الهجري</li>
            <li>لا زكاة في الذهب المُستعمل للزينة المعتادة</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Silver Calculator -->
    <div v-if="activeTab === 'silver'" class="card">
      <div class="card-body">
        <h5 class="card-title mb-4">
          <IconGift class="me-2" />
          زكاة الفضة
        </h5>

        <div class="row gy-3">
          <div class="col-md-8">
            <div class="mb-3">
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
          </div>

          <div class="col-md-4">
            <div class="alert alert-info">
              <h6 class="alert-heading">مقدار الزكاة</h6>
              <div class="display-6 text-primary">{{ formatNumber(silverZakat) }} جرام</div>
              <small class="text-muted">٢.٥% من وزن الفضة</small>
            </div>
          </div>
        </div>

        <div class="alert alert-light mt-3">
          <h6>شروط زكاة الفضة:</h6>
          <ul class="mb-0">
            <li>أن يبلغ النصاب ({{ toArabicNumerals(nisabValues.silver) }} جرام)</li>
            <li>أن يحول عليه الحول الهجري</li>
            <li>لا زكاة في الفضة المُستعملة للزينة المعتادة</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Livestock Calculator -->
    <div v-if="activeTab === 'livestock'" class="card">
      <div class="card-body">
        <h5 class="card-title mb-4">
          <IconWheat class="me-2" />
          زكاة الأنعام
        </h5>

        <div class="row gy-3">
          <div class="col-md-8">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">عدد الأبقار</label>
                <input v-model="livestockCows" type="number" class="form-control" placeholder="٠" min="0" />
                <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.cows) }}</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">عدد الأغنام</label>
                <input v-model="livestockSheep" type="number" class="form-control" placeholder="٠" min="0" />
                <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.sheep) }}</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">عدد الإبل</label>
                <input v-model="livestockCamels" type="number" class="form-control" placeholder="٠" min="0" />
                <div class="form-text">النصاب: {{ toArabicNumerals(nisabValues.camels) }}</div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="alert alert-info">
              <h6 class="alert-heading">مقدار الزكاة</h6>
              <div class="display-6 text-primary">{{ toArabicNumerals(livestockZakat) }} رأس</div>
              <small class="text-muted">حسب الأنصبة الشرعية</small>
            </div>
          </div>
        </div>

        <div class="alert alert-light mt-3">
          <h6>شروط زكاة الأنعام:</h6>
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
    <div v-if="activeTab === 'crops'" class="card">
      <div class="card-body">
        <h5 class="card-title mb-4">
          <IconWheat class="me-2" />
          زكاة الزروع والثمار
        </h5>

        <div class="row gy-3">
          <div class="col-md-8">
            <div class="mb-3">
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
          </div>

          <div class="col-md-4">
            <div class="alert alert-info">
              <h6 class="alert-heading">مقدار الزكاة</h6>
              <div class="display-6 text-primary">
                {{ formatNumber(cropsZakat) }} ~ {{ formatNumber(cropsZakat * 2) }} كجم
              </div>
              <small class="text-muted">١٠% (مطرية) أو ٥% (مروية)</small>
            </div>
          </div>
        </div>

        <div class="alert alert-light mt-3">
          <h6>شروط زكاة الزروع:</h6>
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
    <div v-if="activeTab === 'business'" class="card">
      <div class="card-body">
        <h5 class="card-title mb-4">
          <IconBuildingStore class="me-2" />
          زكاة عروض التجارة
        </h5>

        <div class="row gy-3">
          <div class="col-md-8">
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

            <div class="mb-3">
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

          <div class="col-md-4">
            <div class="alert alert-info">
              <h6 class="alert-heading">مقدار الزكاة</h6>
              <div class="display-6 text-primary">
                {{ formatCurrency(businessZakat) }}
              </div>
              <small class="text-muted">٢.٥% من قيمة البضائع</small>
            </div>
          </div>
        </div>

        <div class="alert alert-light mt-3">
          <h6>شروط زكاة التجارة:</h6>
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
    <div class="card mt-4">
      <div class="card-body">
        <h5 class="card-title">معلومات مهمة عن الزكاة</h5>
        <div class="row gy-3">
          <div class="col-md-6">
            <h6>مصارف الزكاة الثمانية:</h6>
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
            <h6>أهمية الزكاة:</h6>
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
