import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";

declare module "vue-router" {
  interface RouteMeta {
    public?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { public: true },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: { public: true },
    },
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const isPublic = to.meta.public === true;

  if (!isPublic && !auth.token) {
    return { name: "login" };
  }

  if (isPublic && auth.token) {
    return { name: "home" };
  }
});

export default router;
