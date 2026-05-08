<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  useSlots,
} from "vue";

// Cache disimpan di luar component agar persist antar re-render
// dan bisa di-share antar instance dengan cacheKey yang sama
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
const innerRef = ref<HTMLElement | null>(null);
const blocks = ref<any[]>([]);

// Per-instance: apakah data sudah pernah load (real content pernah tampil)
const hasLoadedOnce = ref(false);

// Guard agar tidak ada concurrent measurement
let measuring = false;

/**
 * Mengukur posisi elemen di dalam innerRef.
 * @param skipDelays - true saat dipanggil dari ResizeObserver (layout sudah stabil)
 */
const measureElements = async (skipDelays = false) => {
  if (!innerRef.value) return [];

  if (!skipDelays) {
    // Tunggu DOM update + browser paint (wajib untuk layout yang stabil pada mount awal)
    await nextTick();
    await new Promise((res) => requestAnimationFrame(res));
  }

  const containerRect = innerRef.value.getBoundingClientRect();
  const selector =
    'img, h1, h2, h3, h4, h5, h6, p, span:not([data-shimmer-ignore]), button, a[role="button"], .tag, .badge, [class*="-placeholder"], [class*="placeholder"], div[class*="placeholder"]';

  const elements = Array.from(
    innerRef.value.querySelectorAll(selector),
  ) as HTMLElement[];

  const measured = [];
  for (const el of elements) {
    if (el.closest("[data-shimmer-skip]")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;

    const style = getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    const textRects = el.getClientRects();

    let top = rect.top - containerRect.top;
    let left = rect.left - containerRect.left;
    let width = rect.width;
    let height = rect.height;

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

    width = Math.min(width, containerRect.width - left);

    let radius = style.borderRadius || "0px";
    let color = "#e5e7eb";

    if (tag === "button" || el.classList.contains("btn")) {
      radius = "8px";
      const bg = style.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") color = bg;
    } else if (tag === "img") {
      radius = style.borderRadius || "50%";
      if (!el.getAttribute("src")) {
        color = "#e5e7eb";
      }
    }

    // Pastikan placeholder punya background
    if (el.className && el.className.includes("placeholder")) {
      const bg = style.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        color = bg;
      }
    }

    measured.push({
      id: `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      top: Math.round(top),
      left: Math.round(left),
      width: Math.round(width),
      height: Math.round(height),
      borderRadius: radius,
      background: color,
    });
  }
  return measured;
};

const update = async () => {
  if (!innerRef.value) return;

  if (props.loading) {
    // 1️⃣ Prioritas: Cache (data pernah load sebelumnya di instance ini)
    if (
      hasLoadedOnce.value &&
      props.cacheKey &&
      shimmerCache.has(props.cacheKey)
    ) {
      // Set cached blocks langsung untuk tampilan instant
      blocks.value = shimmerCache.get(props.cacheKey)!;
      // Re-measure setelah DOM settle (real content di-render ulang)
      await nextTick();
      await new Promise((res) => requestAnimationFrame(res));
      if (props.loading && innerRef.value) {
        const fresh = await measureElements(true);
        if (fresh.length > 0) {
          blocks.value = fresh;
          shimmerCache.set(props.cacheKey, fresh);
        }
      }
      return;
    }
    // 2️⃣ Fallback: First load → ukur skeleton
    if (slots.skeleton) {
      blocks.value = await measureElements();
    }
    return;
  }

  // 3️⃣ Data muncul: ukur real content & simpan ke cache
  hasLoadedOnce.value = true;
  const real = await measureElements();
  blocks.value = [];
  if (props.cacheKey && real.length > 0) {
    shimmerCache.set(props.cacheKey, real);
  }
};

/**
 * Handler resize — langsung re-measure tanpa debounce.
 * ResizeObserver fires post-layout, jadi skipDelays=true aman.
 * Guard `measuring` mencegah concurrent measurement.
 */
const handleResize = async () => {
  if (!innerRef.value || measuring) return;
  measuring = true;
  try {
    if (props.loading && (slots.skeleton || blocks.value.length > 0)) {
      const fresh = await measureElements(true);
      blocks.value = fresh;
      // Update cache juga saat resize
      if (props.cacheKey && fresh.length > 0) {
        shimmerCache.set(props.cacheKey, fresh);
      }
    }
  } finally {
    measuring = false;
  }
};

watch(() => props.loading, update);

onMounted(async () => {
  await update();

  if (innerRef.value) {
    const ro = new ResizeObserver(() => {
      handleResize();
    });
    ro.observe(innerRef.value);
    onBeforeUnmount(() => ro.disconnect());
  }
});
</script>

<template>
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
      position: 'relative',
    }"
  >
    <div ref="innerRef" class="shimmer-inner">
      <!-- SKELETON: Tampil saat loading pertama (belum pernah load data) -->
      <div
        v-if="loading && slots.skeleton && !hasLoadedOnce"
        class="shimmer-layer"
      >
        <slot name="skeleton" />
      </div>

      <!-- CONTENT: Tampil saat !loading ATAU saat loading+sudah pernah load
           (data lama tetap di-render, tapi ditutupi shimmer overlay) -->
      <div v-else class="shimmer-layer">
        <slot />
      </div>

      <!-- SHIMMER BLOCKS -->
      <template v-if="loading && blocks.length > 0">
        <div
          v-for="b in blocks"
          :key="b.id"
          class="shimmer-block"
          :style="{
            position: 'absolute',
            top: b.top + 'px',
            left: b.left + 'px',
            width: b.width + 'px',
            height: b.height + 'px',
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
    rgba(255, 255, 255, 0.8) 50%,
    transparent 75%
  );
  animation: shimmer-move 1.2s infinite linear;
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
