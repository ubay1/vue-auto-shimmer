<script setup lang="ts">
import { ref, onMounted } from "vue";
import Shimmer from "../../../src/components/Shimmer.vue";
import ShimmerTest from "../components/ShimmerTest.vue";
// import { Shimmer } from "@ubay182/vue-auto-shimmer";

const loading = ref(true);
const user = ref<any>(null);

const cardData = ref([
  {
    title: "Total Percobaan Login",
    icon: "material-symbols:login-rounded",
    iconColor: "#2B7FFF",
    bgIconColor: "#F8FAFC",
    value: 0,
    percentage: 0,
    description: "vs 1 Januari 2026 - 31 Januari 2026",
  },
  {
    title: "Login Sukses",
    icon: "material-symbols:check-rounded",
    iconColor: "#40AE87",
    bgIconColor: "#F4FFFB",
    value: 0,
    percentage: 0,
    description: "vs 1 Januari 2026 - 31 Januari 2026",
  },
  {
    title: "Login Gagal",
    icon: "material-symbols:close-rounded",
    iconColor: "#D43030",
    bgIconColor: "#FFF4F4",
    value: 0,
    percentage: 0,
    description: "vs 1 Januari 2026 - 31 Januari 2026",
  },
  {
    title: "Tingkat Keberhasilan",
    icon: "material-symbols:percent-rounded",
    iconColor: "#2B7FFF",
    bgIconColor: "#F8FAFC",
    value: 0,
    percentage: 0,
    percentageColor: "#007A55",
    bgPercentageColor: "#ECFDF5",
    description: "vs 1 Januari 2026 - 31 Januari 2026",
  },
]);

const fetchData = () => {
  loading.value = true;
  // Simulasi data dinamis
  const names = ["Ubaidillah Rahman", "Budi Santoso", "Siti Aminah"];
  const randomName = names[Math.floor(Math.random() * names.length)];

  setTimeout(() => {
    user.value = {
      name: randomName,
      bio: "Fullstack Developer & Vue.js Enthusiast.",
      avatar: "https://placehold.co/100x100/e2e8f0/475569?text=UR",
      tags: ["Vue 3", "TypeScript", "UI/UX", "Frontend", "Backend", "DevOps"], // Added more tags to test wrap
    };
    loading.value = false;
  }, 5000);
};

onMounted(() => fetchData());
</script>

<template>
  <div>
    <div class="playground-container">
      <Shimmer
        :loading="loading"
        cache-key="login-activity-card"
        border="1px solid #e5e7eb"
        border-radius="12px"
        box-shadow="0 4px 12px rgba(0,0,0,0.05)"
        bg-color="#ffffff"
        padding="1.5rem"
      >
        <div
          class="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center justify-center"
        >
          <div
            v-for="item in cardData"
            :key="item.title"
            class="border border-gray-100 rounded-lg p-3 space-y-1"
          >
            <div
              class="grid grid-cols-[auto_40px] items-center gap-2 justify-between"
            >
              <h3
                class="text-sm font-semibold tracking-[0.5px] leading-[125%] text-[#62686F]"
              >
                {{ item.title }}
              </h3>
              <div
                class="w-10 h-10 flex justify-center items-center rounded-xl"
                :style="{ backgroundColor: item.bgIconColor }"
              >
                <Icon
                  :name="item.icon"
                  :style="{
                    color: item.iconColor,
                    width: '20px',
                    height: '20px',
                  }"
                />
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <h1
                class="font-bold text-lg tracking-[0.5px] leading-[125%] text-[#313336]"
              >
                {{ item.value }}
              </h1>
              <div
                :style="{
                  backgroundColor: item.percentage >= 0 ? '#ECFDF5' : '#FEF2F2',
                }"
                class="rounded-[8px] h-[20px] mt-1 flex items-center justify-center px-2 gap-1"
              >
                <Icon
                  v-if="item.percentage >= 0"
                  name="material-symbols:arrow-outward"
                  :style="{ color: '#007A55', width: '14px', height: '14px' }"
                />
                <Icon
                  v-else
                  name="material-symbols:arrow-outward"
                  :style="{
                    color: '#C10007',
                    width: '14px',
                    height: '14px',
                    transform: 'rotate(90deg)',
                  }"
                />
                <span
                  :style="{
                    color: item.percentage >= 0 ? '#007A55' : '#C10007',
                  }"
                  class="text-xs leading-[16px] font-semibold"
                >
                  {{ item.percentage }} %
                </span>
              </div>
            </div>

            <div class="mt-4">
              <span
                class="text-sm tracking-[0.25px] leading-[150%] text-[#62686F]"
                >{{ item.description }}</span
              >
            </div>
          </div>
        </div>

        <template #skeleton>
          <ShimmerTest />
        </template>
      </Shimmer>
    </div>

    <div class="playground-container">
      <div class="controls">
        <button @click="fetchData" :disabled="loading" class="btn primary">
          {{ loading ? "Loading..." : "Refresh Data" }}
        </button>
      </div>

      <Shimmer
        :loading="loading"
        cache-key="user-profile"
        border="1px solid #e5e7eb"
        border-radius="12px"
        box-shadow="0 4px 12px rgba(0,0,0,0.05)"
        bg-color="#ffffff"
        padding="1.5rem"
      >
        <!-- KONTEN ASLI -->
        <div class="flex-col-center">
          <img v-if="user?.avatar" :src="user.avatar" class="avatar" />
          <h2 class="title">{{ user?.name || "Loading Name..." }}</h2>
          <p class="bio">{{ user?.bio || "Loading bio..." }}</p>

          <!-- Tags Container dengan Flex Wrap -->
          <div class="tags">
            <span v-for="tag in user?.tags || []" :key="tag" class="tag">{{
              tag
            }}</span>
          </div>

          <button class="btn action">
            <RouterLink to="/profile" style="color: white">
              View Profile
            </RouterLink>
          </button>
        </div>

        <!-- SKELETON BLUEPRINT -->
        <template #skeleton>
          <div class="flex-col-center">
            <div class="avatar-placeholder"></div>
            <h2 class="title-placeholder"></h2>
            <p class="bio-placeholder"></p>
            <div class="tags">
              <span class="tag-placeholder"></span>
              <span class="tag-placeholder"></span>
              <span class="tag-placeholder"></span>
              <span class="tag-placeholder"></span>
              <span class="tag-placeholder"></span>
              <span class="tag-placeholder"></span>
            </div>

            <button class="btn action">View Profile</button>
          </div>
        </template>
      </Shimmer>
    </div>
  </div>
</template>

<style scoped>
/* Container Playground Responsif */
.playground-container {
  padding: 2rem;
  /* max-width: 800px;
  width: 100%; */
  margin: 0 auto;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.controls {
  margin-bottom: 1.5rem;
  text-align: center;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background: #2563eb;
  color: white;
}

.action {
  background: #4f46e5;
  color: white;
  margin-top: 0.5rem;
}

/* Wrapper Utama */
.flex-col-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

/* Konten Asli */
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  width: 100%;
}

.bio {
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 1rem;
  width: 100%;
}

/* Tags Container - FLEX WRAP DITAMBAHKAN DISINI */
.tags {
  display: flex;
  flex-wrap: wrap; /* Aktifkan wrap */
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
  width: 100%;
}

.tag {
  background: #eef2ff;
  color: #3730a3;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap; /* Agar teks tag tidak turun ke baris baru sendirian */
}

/* Skeleton Placeholders */
.avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e5e7eb;
  margin-bottom: 1rem;
}

.title-placeholder {
  width: 60%;
  height: 24px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.bio-placeholder {
  width: 100%;
  height: 16px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* Tags Placeholder - FLEX WRAP DITAMBAHKAN DISINI */
.tags {
  display: flex;
  flex-wrap: wrap; /* Sinkron dengan konten asli */
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
  width: 100%;
}

.tag-placeholder {
  display: inline-block;
  width: 60px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 999px;
}
</style>
