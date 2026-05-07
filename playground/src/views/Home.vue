<script setup lang="ts">
import { ref, onMounted } from "vue";
import Shimmer from "../../../src/components/Shimmer.vue";

const loading = ref(true);
const user = ref<any>(null);

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
  }, 10000);
};

onMounted(() => fetchData());
</script>

<template>
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

          <!-- Tags Placeholder dengan Flex Wrap (Identik Struktur) -->
          <div class="tags-placeholder">
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
.tags-placeholder {
  display: flex;
  flex-wrap: wrap; /* Sinkron dengan konten asli */
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
  width: 100%;
}

.tag-placeholder {
  width: 60px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 999px;
}
</style>
