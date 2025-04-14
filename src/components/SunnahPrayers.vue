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
  <table class="table table-bordered">
    <thead>
      <tr>
        <th></th>
        <th v-for="(prayer, index) in prayers" :key="index">
          {{ prayer.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>قبل</th>
        <td v-for="(prayer, index) in prayers" :key="index">
          {{ prayer.before === '-' ? '-' : prayer.before === 2 ? 'ركعتان' : prayer.before + ' ركعات' }}
        </td>
      </tr>
      <tr>
        <th>بعد</th>
        <td v-for="(prayer, index) in prayers" :key="index">
          {{ prayer.after === '-' ? '-' : prayer.after === 2 ? 'ركعتان' : prayer.after + ' ركعات' }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
table {
  outline: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  overflow: hidden;

  thead tr:first-child {
    border-top: none !important;
  }

  tbody tr:last-child {
    border-bottom: none !important;
  }

  th:first-child,
  th:last-child,
  td:first-child,
  td:last-child {
    border: none !important;
  }

  th,
  td {
    text-align: center;
    vertical-align: middle;
  }

  th {
    background-color: var(--bs-tertiary-bg);
  }
}
</style>
