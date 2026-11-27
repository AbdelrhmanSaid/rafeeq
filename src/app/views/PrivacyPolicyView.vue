<script setup>
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
// Written out, since a dashed date in Arabic numerals reads in the wrong order.
const lastUpdated = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long' }).format(new Date(2025, 7, 18))
</script>

<template>
  <Page>
    <Heading
      subtitle-desktop-only
      title="سياسة الخصوصية"
      subtitle="نلتزم بحماية خصوصيتك وشرح كيفية تعاملنا مع بياناتك"
    />

    <p class="policy__updated">آخر تحديث: {{ lastUpdated }}</p>

    <article class="policy">
      <p class="policy__intro">
        نُقدّم تطبيق «رفيق» كخدمة مجانية ومفتوحة المصدر للمستخدمين. تهدف هذه السياسة إلى توضيح كيفية جمع البيانات
        واستخدامها والاحتفاظ بها ومشاركتها عند استخدامك للتطبيق.
      </p>

      <section>
        <h2>البيانات التي نجمعها</h2>
        <ul>
          <li>
            <strong>الموقع الجغرافي (اختياري):</strong>
            نستخدم <bdi dir="ltr" class="policy__term">navigator.geolocation</bdi> — بعد موافقتك — للحصول على موقعك
            التقريبي لحساب مواقيت الصلاة. تتم هذه العملية على جهازك محليًا ولا نُرسل إحداثيات موقعك إلى خادم مملوك لنا.
          </li>
          <li>
            <strong>إعدادات محلية على جهازك:</strong>
            نخزن بعض التفضيلات مثل وضع الواجهة (فاتح/داكن) وإعدادات الإشعارات باستخدام
            <bdi dir="ltr" class="policy__term">localStorage</bdi> على جهازك فقط.
          </li>
        </ul>
      </section>

      <section>
        <h2>كيف نستخدم البيانات</h2>
        <ul>
          <li>حساب مواقيت الصلاة وعرض المحتوى المناسب لبلدك أو مدينتك (باستخدام الموقع الجغرافي على جهازك).</li>
          <li>تذكيرك بالأذكار عبر إشعارات محلية على جهازك بعد منح الإذن.</li>
          <li>تحسين الأداء وتجربة الاستخدام بالاستفادة من بيانات التحليلات المجمّعة.</li>
        </ul>
      </section>

      <section>
        <h2>الإشعارات</h2>
        <p>
          يستخدم التطبيق واجهة إشعارات المتصفح/النظام بعد طلب إذنك الصريح. قد يُجدول التطبيق إشعارات للأذكار (صباحًا
          ومساءً) محليًا على جهازك. يمكنك التحكم بهذه الإشعارات أو إيقافها من إعدادات التطبيق أو إعدادات النظام.
        </p>
      </section>

      <section>
        <h2>الجهات الخارجية والخدمات المستخدمة</h2>
        <ul>
          <li>
            <strong>مواقيت الصلاة:</strong>
            تُحسب مواقيت الصلاة واتجاه القبلة محليًا على جهازك باستخدام مكتبة
            <a href="https://github.com/batoulapps/adhan-js" target="_blank" rel="noopener">Adhan</a>
            مفتوحة المصدر، ولا يُرسل موقعك إلى أي خادم لهذا الغرض.
          </li>
          <li>
            <strong>إذاعات القرآن الكريم:</strong>
            يستخدم التطبيق مصادر عامة مثل
            <a href="https://api.mp3quran.net/radios/radio_arabic.json" target="_blank" rel="noopener">MP3Quran</a>
            لجلب بيانات محطات الإذاعة.
          </li>
        </ul>
      </section>

      <section>
        <h2>تخزين البيانات والاحتفاظ بها</h2>
        <ul>
          <li>لا نخزن بيانات شخصية على خوادمنا. تبقى تفضيلاتك على جهازك المحلي.</li>
          <li>تحتفظ خدمات التحليلات التابعة لجهات خارجية ببيانات الاستخدام وفق سياساتها الخاصة.</li>
        </ul>
      </section>

      <section>
        <h2>مشاركة البيانات</h2>
        <p>لا نبيع أو نتاجر في بياناتك. قد تتم مشاركة بيانات الاستخدام المجمّعة مع مزودي الخدمات بغرض تحسين التطبيق.</p>
      </section>

      <section>
        <h2>أمان المعلومات</h2>
        <p>نبذل جهدًا معقولًا لحماية بياناتك. لكن لا توجد وسيلة نقل أو تخزين عبر الإنترنت آمنة بنسبة ١٠٠%.</p>
      </section>

      <section>
        <h2>خصوصية الأطفال</h2>
        <p>لا يستهدف التطبيق الأطفال دون سن ١٣ عامًا بصفة خاصة ولا يجمع عن قصد معلومات شخصية منهم.</p>
      </section>

      <section>
        <h2>حقوقك</h2>
        <ul>
          <li>يمكنك سحب الإذن بالموقع الجغرافي أو الإشعارات من إعدادات المتصفح/النظام.</li>
          <li>
            يمكنك حذف بيانات التفضيلات من المتصفح عبر مسح بيانات الموقع أو
            <bdi dir="ltr" class="policy__term">localStorage</bdi>.
          </li>
        </ul>
      </section>

      <section>
        <h2>التغييرات على هذه السياسة</h2>
        <p>قد نقوم بتحديث هذه السياسة من حين لآخر. سنُحدّث تاريخ "آخر تحديث" أدناه عند حدوث أي تغيير جوهري.</p>
      </section>

      <section>
        <h2>التواصل</h2>
        <p>
          لأي استفسار حول الخصوصية، يُرجى فتح تذكرة عبر
          <a href="https://github.com/AbdelrhmanSaid/rafeeq/issues" target="_blank" rel="noopener"
            >صفحة المشاكل على GitHub</a
          >.
        </p>
      </section>
    </article>
  </Page>
</template>

<style lang="scss" scoped>
/* A reading column: body-size text with room between lines, muted section titles' weight from the app's lists. */
.policy__updated {
  margin: -0.5rem 0 1.25rem;
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
}

.policy {
  max-width: 42rem;
  font-size: 1rem;
  line-height: 1.9;

  p,
  ul {
    margin: 0;
  }

  p + p,
  p + ul,
  ul + p {
    margin-top: 0.5rem;
  }

  section {
    margin-top: 1.75rem;
  }

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.5;
  }

  ul {
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    padding-inline-start: 1.1rem;
  }

  li + li {
    margin-top: 0.5rem;
  }

  /* A drawn dot: a text bullet sits off-centre against Arabic glyphs. */
  li::before {
    content: '';
    position: absolute;
    inset-inline-start: 0.15rem;
    top: 0.8em;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: var(--bs-primary);
    opacity: 0.6;
  }

  strong {
    font-weight: 600;
  }
}

.policy__intro {
  color: var(--bs-secondary-color);
}

.policy__term {
  padding: 0.05rem 0.35rem;
  border-radius: var(--bs-border-radius-sm);
  background-color: var(--app-tint);
  font-size: 0.875em;
}
</style>
