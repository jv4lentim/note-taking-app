<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

async function handleLogout() {
  await auth.logout();
  router.push("/login");
}
</script>

<template>
  <div class="page">
    <div class="container">
      <div class="top-bar">
        <span class="user-email">{{ auth.user?.email }}</span>
        <button class="btn-logout" @click="handleLogout">{{ t("auth.logout") }}</button>
      </div>
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

.top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.user-email {
  font-size: 0.9rem;
  color: #6b7280;
}

.btn-logout {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.375rem 1rem;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
}
</style>
