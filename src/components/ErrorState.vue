<script setup>
defineProps(['code', 'message'])
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-6 text-center">
        <h1 class="display-1">{{ code }}</h1>
        <p class="lead">{{ message }}</p>
      </div>
    </div>
  </div>
</template>
