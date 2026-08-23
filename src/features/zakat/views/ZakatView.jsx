import { useState } from 'react'
import { IconCoins, IconWheat, IconGift, IconBuildingStore } from '@tabler/icons-react'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import ZakatCalculatorCard from '@/features/zakat/components/ZakatCalculatorCard'
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
import { toArabicNumerals } from '@/shared/utils/arabic'
import { formatNumber, formatCurrency } from '@/shared/utils/format'

const TABS = [
  { id: 'money', title: 'المال والمدخرات', icon: IconCoins },
  { id: 'gold', title: 'الذهب', icon: IconGift },
  { id: 'silver', title: 'الفضة', icon: IconGift },
  { id: 'livestock', title: 'الأنعام', icon: IconWheat },
  { id: 'crops', title: 'الزروع والثمار', icon: IconWheat },
  { id: 'business', title: 'التجارة', icon: IconBuildingStore },
]

const CONDITIONS = {
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

const EMPTY_FORM = {
  goldPrice: '',
  money: '',
  gold: '',
  silver: '',
  cows: '',
  sheep: '',
  camels: '',
  crops: '',
  business: '',
}

export default function ZakatView() {
  const [activeTab, setActiveTab] = useState('money')
  const [form, setForm] = useState(EMPTY_FORM)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const moneyNisab = goldPriceNisab(form.goldPrice, NISAB.money)
  const businessNisab = goldPriceNisab(form.goldPrice, NISAB.business)

  const cropsResult = cropsZakat(form.crops)
  const livestockResult = livestockZakat({ cows: form.cows, sheep: form.sheep, camels: form.camels })

  const goldPriceField = (
    <div className="mb-3">
      <label className="form-label">سعر جرام الذهب (عيار ٢٤) بالجنيه المصري</label>
      <input
        value={form.goldPrice}
        onChange={update('goldPrice')}
        type="number"
        className="form-control"
        placeholder="أدخل السعر الحالي"
        min="0"
        step="0.01"
      />
    </div>
  )

  return (
    <Page>
      <Heading size={2} className="mb-4" title="حاسبة الزكاة" subtitle="خذ من أموالهم صدقة تطهرهم وتزكيهم بها" share />

      <div className="tab-pills mb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size="1.1rem" />
            <span>{tab.title}</span>
          </button>
        ))}
      </div>

      {activeTab === 'money' && (
        <ZakatCalculatorCard
          icon={IconCoins}
          title="زكاة المال والمدخرات"
          result={{ value: formatCurrency(moneyZakat(form.money, moneyNisab)), hint: '٢.٥% من إجمالي المال' }}
          conditionsTitle="شروط زكاة المال:"
          conditions={CONDITIONS.money}
        >
          {goldPriceField}

          <div>
            <label className="form-label">إجمالي المال والمدخرات</label>
            <input
              value={form.money}
              onChange={update('money')}
              type="number"
              className="form-control"
              placeholder="أدخل المبلغ"
              min="0"
              step="0.01"
            />
            {form.goldPrice && <div className="form-text">النصاب: {formatCurrency(moneyNisab)} جنيه مصري</div>}
          </div>
        </ZakatCalculatorCard>
      )}

      {activeTab === 'gold' && (
        <ZakatCalculatorCard
          icon={IconGift}
          title="زكاة الذهب"
          result={{ value: `${formatNumber(goldZakat(form.gold))} جرام`, hint: '٢.٥% من وزن الذهب' }}
          conditionsTitle="شروط زكاة الذهب:"
          conditions={CONDITIONS.gold}
        >
          <label className="form-label">وزن الذهب (بالجرام)</label>
          <input
            value={form.gold}
            onChange={update('gold')}
            type="number"
            className="form-control"
            placeholder="أدخل الوزن"
            min="0"
            step="0.1"
          />
          <div className="form-text">النصاب: {toArabicNumerals(NISAB.gold)} جرام</div>
        </ZakatCalculatorCard>
      )}

      {activeTab === 'silver' && (
        <ZakatCalculatorCard
          icon={IconGift}
          title="زكاة الفضة"
          result={{ value: `${formatNumber(silverZakat(form.silver))} جرام`, hint: '٢.٥% من وزن الفضة' }}
          conditionsTitle="شروط زكاة الفضة:"
          conditions={CONDITIONS.silver}
        >
          <label className="form-label">وزن الفضة (بالجرام)</label>
          <input
            value={form.silver}
            onChange={update('silver')}
            type="number"
            className="form-control"
            placeholder="أدخل الوزن"
            min="0"
            step="0.1"
          />
          <div className="form-text">النصاب: {toArabicNumerals(NISAB.silver)} جرام</div>
        </ZakatCalculatorCard>
      )}

      {activeTab === 'livestock' && (
        <ZakatCalculatorCard
          icon={IconWheat}
          title="زكاة الأنعام"
          result={{ value: `${toArabicNumerals(livestockResult)} رأس`, hint: 'حسب الأنصبة الشرعية' }}
          conditionsTitle="شروط زكاة الأنعام:"
          conditions={CONDITIONS.livestock}
        >
          <div className="row g-3">
            {[
              { field: 'cows', label: 'عدد الأبقار', nisab: NISAB.cows },
              { field: 'sheep', label: 'عدد الأغنام', nisab: NISAB.sheep },
              { field: 'camels', label: 'عدد الإبل', nisab: NISAB.camels },
            ].map(({ field, label, nisab }) => (
              <div key={field} className="col-sm-4">
                <label className="form-label">{label}</label>
                <input
                  value={form[field]}
                  onChange={update(field)}
                  type="number"
                  className="form-control"
                  placeholder="٠"
                  min="0"
                />
                <div className="form-text">النصاب: {toArabicNumerals(nisab)}</div>
              </div>
            ))}
          </div>
        </ZakatCalculatorCard>
      )}

      {activeTab === 'crops' && (
        <ZakatCalculatorCard
          icon={IconWheat}
          title="زكاة الزروع والثمار"
          result={{
            value: `${formatNumber(cropsResult)} ~ ${formatNumber(cropsResult * 2)} كجم`,
            hint: '١٠% (مطرية) أو ٥% (مروية)',
          }}
          conditionsTitle="شروط زكاة الزروع:"
          conditions={CONDITIONS.crops}
        >
          <label className="form-label">كمية المحصول (بالكيلوجرام)</label>
          <input
            value={form.crops}
            onChange={update('crops')}
            type="number"
            className="form-control"
            placeholder="أدخل الكمية"
            min="0"
            step="0.1"
          />
          <div className="form-text">النصاب: {toArabicNumerals(NISAB.crops)} كيلوجرام</div>
        </ZakatCalculatorCard>
      )}

      {activeTab === 'business' && (
        <ZakatCalculatorCard
          icon={IconBuildingStore}
          title="زكاة عروض التجارة"
          result={{ value: formatCurrency(businessZakat(form.business, businessNisab)), hint: '٢.٥% من قيمة البضائع' }}
          conditionsTitle="شروط زكاة التجارة:"
          conditions={CONDITIONS.business}
        >
          {goldPriceField}

          <div>
            <label className="form-label">قيمة البضائع والأصول التجارية (بالجنيه المصري)</label>
            <input
              value={form.business}
              onChange={update('business')}
              type="number"
              className="form-control"
              placeholder="أدخل القيمة"
              min="0"
              step="0.01"
            />
            {form.goldPrice && <div className="form-text">النصاب: {formatCurrency(businessNisab)} جنيه مصري</div>}
          </div>
        </ZakatCalculatorCard>
      )}

      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">معلومات مهمة عن الزكاة</h5>
          <div className="row g-4">
            <div className="col-md-6">
              <h6 className="mb-2">مصارف الزكاة الثمانية:</h6>
              <ul className="mb-0">
                <li>الفقراء والمساكين</li>
                <li>العاملين عليها</li>
                <li>المؤلفة قلوبهم</li>
                <li>في الرقاب</li>
                <li>الغارمين</li>
                <li>في سبيل الله</li>
                <li>ابن السبيل</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6 className="mb-2">أهمية الزكاة:</h6>
              <ul className="mb-0">
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
  )
}
