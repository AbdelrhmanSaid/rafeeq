<script setup>
const prayers = [
  {
    before: 2,
    name: 'الفجر',
    after: '-',
  },
  {
    before: 4,
    name: 'الظهر',
    after: 4,
  },
  {
    before: '-',
    name: 'العصر',
    after: '-',
  },
  {
    before: '-',
    name: 'المغرب',
    after: 2,
  },
  {
    before: '-',
    name: 'العشاء',
    after: 2,
  },
]
</script>

<template>
  <table class="table table-bordered text-center">
    <thead>
      <tr>
        <th scope="col">قبل</th>
        <th scope="col">الصلاة</th>
        <th scope="col">بعد</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="prayer in prayers" :key="prayer.name">
        <td>{{ prayer.before }}</td>
        <th scope="row">{{ prayer.name }}</th>
        <td>{{ prayer.after }}</td>
      </tr>
    </tbody>
  </table>
</template>
