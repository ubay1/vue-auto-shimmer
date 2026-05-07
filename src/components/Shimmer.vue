<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  useSlots,
} from "vue";

const shimmerCache = new Map<string, any[]>();

const props = defineProps<{
  loading?: boolean;
  cacheKey?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  bgColor?: string;
  padding?: string;
}>();

const slots = useSlots();
// Ref untuk Inner Wrapper (Area setelah padding)
const innerRef = ref<HTMLElement | null>(null);
const blocks = ref<any>([]);

const measureElements = async () => {
  if (!innerRef.value) return [];

  // 1. Tunggu DOM update
  await nextTick();
  // 2. Tunggu Browser Paint (Wajib untuk layout yang stabil)
  await new Promise((res) => requestAnimationFrame(res));

  // Ukur relatif terhadap INNER (0,0 adalah pojok kiri atas setelah padding)
  const containerRect = innerRef.value.getBoundingClientRect();
  const selector =
    'img, h1, h2, h3, h4, h5, h6, p, span:not([data-shimmer-ignore]), button, a[role="button"], .tag, .badge';

  // Query hanya elemen yang VISIBLE (v-if memastikan ini aman)
  const elements = Array.from(
    innerRef.value.querySelectorAll(selector),
  ) as HTMLElement[];

  const measured = [];
  for (const el of elements) {
    if (el.closest("[data-shimmer-skip]")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;

    const style = getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    const textRects = el.getClientRects();

    // Hitung koordinat relatif terhadap Inner Container
    let top = rect.top - containerRect.top;
    let left = rect.left - containerRect.left;
    let width = rect.width;
    let height = rect.height;

    // Fix centering untuk teks pendek
    if (
      ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span"].includes(tag) &&
      textRects.length > 0
    ) {
      const tRect = textRects[0];
      if (tRect.width < rect.width * 0.9) {
        width = tRect.width;
        left = tRect.left - containerRect.left;
      }
    }

    // Clamp width agar tidak keluar batas
    width = Math.min(width, containerRect.width - left);

    let radius = style.borderRadius || "0px";
    let color = "#e5e7eb";

    if (tag === "button" || el.classList.contains("btn")) {
      radius = "8px";
      const bg = style.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") color = bg;
    } else if (tag === "img") {
      radius = style.borderRadius || "4px";
    }

    measured.push({
      id: `${tag}-${Math.random().toString(36).slice(2, 8)}`,
      top,
      left,
      width,
      height,
      borderRadius: radius,
      background: color,
    });
  }
  return measured;
};

const update = async () => {
  if (!innerRef.value) return;

  if (props.loading) {
    // 1️ Prioritas: Cache (jika data pernah load)
    if (props.cacheKey && shimmerCache.has(props.cacheKey)) {
      blocks.value = shimmerCache.get(props.cacheKey);
      return;
    }
    // 2️⃣ Fallback: First Load (ukur Skeleton)
    if (slots.skeleton) {
      blocks.value = await measureElements();
      return;
    }
    blocks.value = [];
    return;
  }

  // 3️⃣ Data Muncul: Ukur Konten Asli & Update Cache
  const real = await measureElements();
  blocks.value = [];
  if (props.cacheKey) {
    shimmerCache.set(props.cacheKey, real);
  }
};

watch(() => props.loading, update);

onMounted(async () => {
  await update();
  if (innerRef.value) {
    const ro = new ResizeObserver(() => {
      if (!props.loading) update();
    });
    ro.observe(innerRef.value);
    onBeforeUnmount(() => ro.disconnect());
  }
});
</script>

<template>
  <!-- OUTER: Mengurus Border, Radius, Shadow, Padding -->
  <div
    class="shimmer-outer"
    :style="{
      border: border || '1px solid #e5e7eb',
      borderRadius: borderRadius || '8px',
      boxShadow: boxShadow || '0 2px 8px rgba(0,0,0,0.05)',
      backgroundColor: bgColor || '#ffffff',
      padding: padding || '1.5rem',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }"
  >
    <!-- INNER: Area Koordinat (0,0) untuk Shimmer & Konten -->
    <div ref="innerRef" class="shimmer-inner">
      <!-- 1. SKELETON (Tampil saat Loading & Belum Cache) -->
      <div
        v-if="
          loading &&
          slots.skeleton &&
          (!cacheKey || !shimmerCache.has(cacheKey))
        "
        class="shimmer-layer"
      >
        <slot name="skeleton" />
      </div>

      <!-- 2. KONTEN ASLI (Tampil saat !Loading) -->
      <div v-else class="shimmer-layer">
        <slot />
      </div>

      <!-- 3. SHIMMER BLOCKS (Overlay di atas Inner) -->
      <template v-if="loading && blocks.length > 0">
        <div
          v-for="b in blocks"
          :key="b.id"
          class="shimmer-block"
          :style="{
            position: 'absolute',
            top: `${b.top}px`,
            left: `${b.left}px`,
            width: `${b.width}px`,
            height: `${b.height}px`,
            borderRadius: b.borderRadius,
            background: b.background,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }"
        >
          <div class="shimmer-wave" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.shimmer-outer {
  width: 100%;
}
.shimmer-inner {
  position: relative;
  width: 100%;
  min-height: 10px;
}
.shimmer-layer {
  position: relative;
  z-index: 1;
}
.shimmer-block {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}
.shimmer-wave {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 25%,
    rgba(255, 255, 255, 0.7) 50%,
    transparent 75%
  );
  animation: shimmer-move 1.5s infinite linear;
  background-size: 200% 100%;
}
@keyframes shimmer-move {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
