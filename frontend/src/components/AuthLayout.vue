<script setup lang="ts">
defineProps<{ heading: string }>();
</script>

<template>
  <div class="page">
    <div class="container">
      <h1 class="heading">{{ heading }}</h1>
      <hr class="divider" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.container {
  width: 100%;
  max-width: 720px;
}

.heading {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
}

.divider {
  border: none;
  border-top: 1px solid #d1d5db;
  margin: 0 0 1.5rem;
}
</style>
