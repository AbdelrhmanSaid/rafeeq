<script setup>
import { ref, computed } from 'vue'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import ZakatCalculatorCard from '@/features/zakat/components/ZakatCalculatorCard.vue'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
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
} from '@/features/zakat/lib/zakat'

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

// A tab strip that scrolls to the screen edge instead of being clipped inside
// the page gutters, using the app's selected-state wash for the active pill.
const tabsListClass =
  'no-scrollbar -mx-4 flex h-auto w-full justify-start gap-2 overflow-x-auto rounded-none bg-transparent px-4 py-1'

const tabTriggerClass = [
  'h-11 flex-none gap-2 rounded-full border-0 bg-muted px-4 text-sm font-medium text-muted-foreground',
  'transition hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
  'data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:shadow-none',
  'dark:text-muted-foreground dark:data-[state=active]:bg-primary/12 dark:data-[state=active]:text-primary',
].join(' ')

// Number entry on a phone wants a big field and the decimal keypad, so the
// shared field/label/hint classes live here instead of on nine inputs.
const fieldClass = 'h-12 rounded-2xl border-0 bg-muted px-4 text-base shadow-none md:text-base dark:bg-muted'
const labelClass = 'mb-2 px-1 text-sm font-medium text-muted-foreground'
const hintClass = 'mt-2 px-1 text-sm text-muted-foreground'

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
  <Page class="space-y-6 md:space-y-8">
    <Heading :size="2" title="حاسبة الزكاة" subtitle="خذ من أموالهم صدقة تطهرهم وتزكيهم بها" :share="true" />

    <Tabs v-model="activeTab" class="gap-4">
      <!-- Tabs Navigation -->
      <TabsList :class="tabsListClass">
        <TabsTrigger v-for="tab in tabs" :key="tab.id" :value="tab.id" :class="tabTriggerClass">
          <component :is="tab.icon" class="size-4" />
          <span>{{ tab.title }}</span>
        </TabsTrigger>
      </TabsList>

      <!-- Money/Savings -->
      <TabsContent value="money">
        <ZakatCalculatorCard
          :icon="IconCoins"
          title="زكاة المال والمدخرات"
          :result="{ value: formatCurrency(moneyResult), hint: '٢.٥% من إجمالي المال' }"
          conditions-title="شروط زكاة المال:"
          :conditions="conditions.money"
        >
          <div class="mb-4">
            <Label for="zakat-money-gold-price" :class="labelClass">سعر جرام الذهب (عيار ٢٤) بالجنيه المصري</Label>
            <Input
              id="zakat-money-gold-price"
              v-model="goldPrice"
              type="number"
              inputmode="decimal"
              placeholder="أدخل السعر الحالي"
              min="0"
              step="0.01"
              :class="fieldClass"
            />
          </div>

          <div>
            <Label for="zakat-money-amount" :class="labelClass">إجمالي المال والمدخرات</Label>
            <Input
              id="zakat-money-amount"
              v-model="moneyAmount"
              type="number"
              inputmode="decimal"
              placeholder="أدخل المبلغ"
              min="0"
              step="0.01"
              :class="fieldClass"
            />
            <p :class="hintClass" v-if="goldPrice">النصاب: {{ formatCurrency(moneyNisab) }} جنيه مصري</p>
          </div>
        </ZakatCalculatorCard>
      </TabsContent>

      <!-- Gold -->
      <TabsContent value="gold">
        <ZakatCalculatorCard
          :icon="IconGift"
          title="زكاة الذهب"
          :result="{ value: `${formatNumber(goldResult)} جرام`, hint: '٢.٥% من وزن الذهب' }"
          conditions-title="شروط زكاة الذهب:"
          :conditions="conditions.gold"
        >
          <Label for="zakat-gold-weight" :class="labelClass">وزن الذهب (بالجرام)</Label>
          <Input
            id="zakat-gold-weight"
            v-model="goldWeight"
            type="number"
            inputmode="decimal"
            placeholder="أدخل الوزن"
            min="0"
            step="0.1"
            :class="fieldClass"
          />
          <p :class="hintClass">النصاب: {{ toArabicNumerals(NISAB.gold) }} جرام</p>
        </ZakatCalculatorCard>
      </TabsContent>

      <!-- Silver -->
      <TabsContent value="silver">
        <ZakatCalculatorCard
          :icon="IconGift"
          title="زكاة الفضة"
          :result="{ value: `${formatNumber(silverResult)} جرام`, hint: '٢.٥% من وزن الفضة' }"
          conditions-title="شروط زكاة الفضة:"
          :conditions="conditions.silver"
        >
          <Label for="zakat-silver-weight" :class="labelClass">وزن الفضة (بالجرام)</Label>
          <Input
            id="zakat-silver-weight"
            v-model="silverWeight"
            type="number"
            inputmode="decimal"
            placeholder="أدخل الوزن"
            min="0"
            step="0.1"
            :class="fieldClass"
          />
          <p :class="hintClass">النصاب: {{ toArabicNumerals(NISAB.silver) }} جرام</p>
        </ZakatCalculatorCard>
      </TabsContent>

      <!-- Livestock -->
      <TabsContent value="livestock">
        <ZakatCalculatorCard
          :icon="IconWheat"
          title="زكاة الأنعام"
          :result="{ value: `${toArabicNumerals(livestockResult)} رأس`, hint: 'حسب الأنصبة الشرعية' }"
          conditions-title="شروط زكاة الأنعام:"
          :conditions="conditions.livestock"
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label for="zakat-livestock-cows" :class="labelClass">عدد الأبقار</Label>
              <Input
                id="zakat-livestock-cows"
                v-model="livestockCows"
                type="number"
                inputmode="numeric"
                placeholder="٠"
                min="0"
                :class="fieldClass"
              />
              <p :class="hintClass">النصاب: {{ toArabicNumerals(NISAB.cows) }}</p>
            </div>

            <div>
              <Label for="zakat-livestock-sheep" :class="labelClass">عدد الأغنام</Label>
              <Input
                id="zakat-livestock-sheep"
                v-model="livestockSheep"
                type="number"
                inputmode="numeric"
                placeholder="٠"
                min="0"
                :class="fieldClass"
              />
              <p :class="hintClass">النصاب: {{ toArabicNumerals(NISAB.sheep) }}</p>
            </div>

            <div>
              <Label for="zakat-livestock-camels" :class="labelClass">عدد الإبل</Label>
              <Input
                id="zakat-livestock-camels"
                v-model="livestockCamels"
                type="number"
                inputmode="numeric"
                placeholder="٠"
                min="0"
                :class="fieldClass"
              />
              <p :class="hintClass">النصاب: {{ toArabicNumerals(NISAB.camels) }}</p>
            </div>
          </div>
        </ZakatCalculatorCard>
      </TabsContent>

      <!-- Crops -->
      <TabsContent value="crops">
        <ZakatCalculatorCard
          :icon="IconWheat"
          title="زكاة الزروع والثمار"
          :result="{
            value: `${formatNumber(cropsResult)} ~ ${formatNumber(cropsResult * 2)} كجم`,
            hint: '١٠% (مطرية) أو ٥% (مروية)',
          }"
          conditions-title="شروط زكاة الزروع:"
          :conditions="conditions.crops"
        >
          <Label for="zakat-crops-amount" :class="labelClass">كمية المحصول (بالكيلوجرام)</Label>
          <Input
            id="zakat-crops-amount"
            v-model="cropsAmount"
            type="number"
            inputmode="decimal"
            placeholder="أدخل الكمية"
            min="0"
            step="0.1"
            :class="fieldClass"
          />
          <p :class="hintClass">النصاب: {{ toArabicNumerals(NISAB.crops) }} كيلوجرام</p>
        </ZakatCalculatorCard>
      </TabsContent>

      <!-- Business -->
      <TabsContent value="business">
        <ZakatCalculatorCard
          :icon="IconBuildingStore"
          title="زكاة عروض التجارة"
          :result="{ value: formatCurrency(businessResult), hint: '٢.٥% من قيمة البضائع' }"
          conditions-title="شروط زكاة التجارة:"
          :conditions="conditions.business"
        >
          <div class="mb-4">
            <Label for="zakat-business-gold-price" :class="labelClass">سعر جرام الذهب (عيار ٢٤) بالجنيه المصري</Label>
            <Input
              id="zakat-business-gold-price"
              v-model="goldPrice"
              type="number"
              inputmode="decimal"
              placeholder="أدخل السعر الحالي"
              min="0"
              step="0.01"
              :class="fieldClass"
            />
          </div>

          <div>
            <Label for="zakat-business-amount" :class="labelClass">
              قيمة البضائع والأصول التجارية (بالجنيه المصري)
            </Label>
            <Input
              id="zakat-business-amount"
              v-model="businessAmount"
              type="number"
              inputmode="decimal"
              placeholder="أدخل القيمة"
              min="0"
              step="0.01"
              :class="fieldClass"
            />
            <p :class="hintClass" v-if="goldPrice">النصاب: {{ formatCurrency(businessNisab) }} جنيه مصري</p>
          </div>
        </ZakatCalculatorCard>
      </TabsContent>
    </Tabs>

    <!-- General Information -->
    <div class="rounded-2xl bg-card p-5 text-card-foreground shadow-sm">
      <h5 class="mb-4 text-lg">معلومات مهمة عن الزكاة</h5>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <h6 class="mb-2 text-base">مصارف الزكاة الثمانية:</h6>
          <ul class="list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-muted-foreground">
            <li>الفقراء والمساكين</li>
            <li>العاملين عليها</li>
            <li>المؤلفة قلوبهم</li>
            <li>في الرقاب</li>
            <li>الغارمين</li>
            <li>في سبيل الله</li>
            <li>ابن السبيل</li>
          </ul>
        </div>
        <div>
          <h6 class="mb-2 text-base">أهمية الزكاة:</h6>
          <ul class="list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-muted-foreground">
            <li>ركن من أركان الإسلام الخمسة</li>
            <li>تطهير للنفس والمال</li>
            <li>تحقيق العدالة الاجتماعية</li>
            <li>تنمية وبركة في المال</li>
          </ul>
        </div>
      </div>
    </div>
  </Page>
</template>
