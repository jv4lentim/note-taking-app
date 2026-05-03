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

:deep(.form) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

:deep(.field) {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: start;
  gap: 0.5rem;
}

:deep(.label) {
  font-size: 1rem;
  color: #374151;
  padding-top: 0.5rem;
}

:deep(.input-wrap) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

:deep(.input) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9375rem;
  color: #1e293b;
  background: #ffffff;
  box-sizing: border-box;
}

:deep(.input)::placeholder {
  color: #9ca3af;
}

:deep(.input--error) {
  border-color: #ef4444;
}

:deep(.field-error) {
  font-size: 0.8125rem;
  color: #ef4444;
}

:deep(.actions) {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

:deep(.btn-primary) {
  background: #3b6fd4;
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.625rem 2.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

:deep(.btn-primary:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

:deep(.form-error) {
  text-align: center;
  color: #ef4444;
  font-size: 0.9rem;
  margin: 0;
}

:deep(.alt-link) {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #374151;
}

:deep(.alt-link a) {
  color: #3b6fd4;
  text-decoration: none;
}
</style>
