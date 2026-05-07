<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Shimmer from "../../../src/components/Shimmer.vue";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const profile = ref<any>(null);
const error = ref<string | null>(null);

// Fungsi fetch dari Random User API
const fetchProfile = async (userId?: string) => {
  loading.value = true;
  error.value = null;

  try {
    // RandomUser.me API
    const url = userId
      ? `https://randomuser.me/api/?seed=${userId}&results=1`
      : "https://randomuser.me/api/?results=1";

    const res = await fetch(url);
    const data = await res.json();

    if (data.results?.[0]) {
      const user = data.results[0];
      profile.value = {
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        location: `${user.location.city}, ${user.location.country}`,
        avatar: user.picture.large,
        phone: user.phone,
        tags: [
          `Member since ${new Date(user.registered.date).getFullYear()}`,
          user.gender,
          user.nat,
        ],
      };
    }
  } catch (e) {
    error.value = "Failed to load profile. Please try again.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// Fetch saat component mount atau userId berubah
watch(
  () => route.params.userId,
  (newId) => {
    fetchProfile(newId as string);
  },
  { immediate: true },
);

const goBack = () => router.back();
const refreshProfile = () => fetchProfile(route.params.userId as string);
</script>

<template>
  <div class="profile-container">
    <!-- Header Navigation -->
    <div class="profile-header">
      <button @click="goBack" class="btn secondary">← Back</button>
      <button @click="refreshProfile" :disabled="loading" class="btn primary">
        {{ loading ? "Loading..." : "Refresh" }}
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-box">
      ⚠️ {{ error }}
      <button @click="refreshProfile" class="btn primary">Retry</button>
    </div>

    <!-- Profile Card dengan Shimmer -->
    <Shimmer
      v-else
      :loading="loading"
      cache-key="profile-card"
      border="1px solid #e5e7eb"
      border-radius="16px"
      box-shadow="0 8px 24px rgba(0,0,0,0.08)"
      bg-color="#ffffff"
      padding="2rem"
    >
      <div class="profile-content">
        <img
          v-if="profile?.avatar"
          :src="profile.avatar"
          class="profile-avatar"
        />
        <h1 class="profile-name">{{ profile?.name || "Loading..." }}</h1>
        <p class="profile-location">📍 {{ profile?.location || "..." }}</p>

        <div class="profile-details">
          <div class="detail-item">
            <span class="label">Email</span>
            <span class="value">{{ profile?.email || "..." }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Phone</span>
            <span class="value">{{ profile?.phone || "..." }}</span>
          </div>
        </div>

        <div class="tags">
          <span v-for="tag in profile?.tags || []" :key="tag" class="tag">{{
            tag
          }}</span>
        </div>
      </div>

      <!-- Skeleton Blueprint -->
      <template #skeleton>
        <div class="profile-content">
          <div class="avatar-placeholder"></div>
          <h1 class="name-placeholder"></h1>
          <p class="location-placeholder"></p>

          <div class="profile-details">
            <div class="detail-item">
              <span class="label-placeholder"></span>
              <span class="value-placeholder"></span>
            </div>
            <div class="detail-item">
              <span class="label-placeholder"></span>
              <span class="value-placeholder"></span>
            </div>
          </div>

          <div class="tags-placeholder">
            <span class="tag-placeholder"></span>
            <span class="tag-placeholder"></span>
            <span class="tag-placeholder"></span>
          </div>
        </div>
      </template>
    </Shimmer>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.primary {
  background: #2563eb;
  color: white;
}
.secondary {
  background: #e5e7eb;
  color: #374151;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  object-fit: cover;
  border: 4px solid #f3f4f6;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.profile-location {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.profile-details {
  width: 100%;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.label {
  color: #6b7280;
  font-size: 0.875rem;
}
.value {
  color: #111827;
  font-weight: 500;
  font-size: 0.95rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.tag {
  background: #eef2ff;
  color: #3730a3;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Skeleton Placeholders */
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #e5e7eb;
  margin-bottom: 1.5rem;
}

.name-placeholder {
  width: 70%;
  height: 28px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.location-placeholder {
  width: 50%;
  height: 16px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.label-placeholder {
  width: 40px;
  height: 12px;
  background: #e5e7eb;
  border-radius: 4px;
}

.value-placeholder {
  width: 120px;
  height: 14px;
  background: #e5e7eb;
  border-radius: 4px;
}

.tags-placeholder {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.tag-placeholder {
  width: 70px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 999px;
}
</style>
