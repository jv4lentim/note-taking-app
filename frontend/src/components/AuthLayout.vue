<script setup lang="ts">
defineProps<{ heading: string }>();
</script>

<template>
  <div class="min-h-screen bg-white flex justify-center px-6 py-12">
    <div class="w-full max-w-[720px]">
      <h1 class="text-xl font-bold text-slate-800 mb-4">{{ heading }}</h1>
      <hr class="border-0 border-t border-gray-300 mb-6" />
      <slot />
    </div>
  </div>
</template>
