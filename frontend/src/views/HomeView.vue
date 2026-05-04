<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import NoteForm from "@/components/NoteForm.vue";
import NoteList from "@/components/NoteList.vue";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

async function handleLogout() {
  await auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="min-h-screen bg-white flex justify-center px-6 py-12">
    <div class="w-full max-w-[720px]">
      <div class="flex justify-end items-center gap-4 mb-8">
        <span class="text-sm text-gray-500">{{ auth.user?.email }}</span>
        <button
          class="bg-transparent border border-gray-300 rounded py-1.5 px-4 text-sm text-gray-700 cursor-pointer"
          @click="handleLogout"
        >
          {{ t("auth.logout") }}
        </button>
      </div>
      <NoteForm />
      <hr class="border-0 border-t border-gray-300 my-8" />
      <NoteList />
    </div>
  </div>
</template>
