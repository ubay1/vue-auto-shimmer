<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  useSlots,
} from "vue";

// SSR guard — cache hanya di client, hindari state pollution di server
const shimmerCache: Map<string, any[]> | null =
  typeof window !== "undefined" ? new Map() : null;

/**
 * Inject keyframes animation sekali saja (singleton).
 * Ini menghindari ketergantungan pada external CSS file.
 */
const KEYFRAME_ID = "vue-auto-shimmer-keyframes";
const ensureKeyframes = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAME_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAME_ID;
  style.textContent = `@keyframes vue-auto-shimmer-move{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(style);
};

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
 * Tunggu browser paint dengan double-rAF pattern.
 * Double rAF memastikan satu full frame telah dipaint sebelum mengukur.
 * Penting untuk SSR hydration di mana CSS/fonts mungkin belum fully applied.
 */
const waitForPaint = (): Promise<void> =>
  new Promise((res) =>
    requestAnimationFrame(() => requestAnimationFrame(() => res())),
  );

/**
 * Tunggu fonts loaded (jika API tersedia).
 * Font yang belum load menyebabkan text elements punya dimensi berbeda.
 */
const waitForFonts = async (): Promise<void> => {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
};

/**
 * Mengukur posisi elemen di dalam innerRef.
 * @param skipDelays - true saat dipanggil dari ResizeObserver (layout sudah stabil)
 */
const measureElements = async (skipDelays = false) => {
  if (!innerRef.value || typeof window === "undefined") return [];

  if (!skipDelays) {
    await nextTick();
    await waitForFonts();
    await waitForPaint();
  }

  const containerRect = innerRef.value.getBoundingClientRect();
  if (containerRect.width < 1) return [];

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

    if (
      el.className &&
      typeof el.className === "string" &&
      el.className.includes("placeholder")
    ) {
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
  if (!innerRef.value || typeof window === "undefined") return;

  if (props.loading) {
    if (
      hasLoadedOnce.value &&
      props.cacheKey &&
      shimmerCache?.has(props.cacheKey)
    ) {
      blocks.value = shimmerCache.get(props.cacheKey)!;
      await nextTick();
      await waitForPaint();
      if (props.loading && innerRef.value) {
        const fresh = await measureElements(true);
        if (fresh.length > 0) {
          blocks.value = fresh;
          shimmerCache.set(props.cacheKey, fresh);
        }
      }
      return;
    }
    if (slots.skeleton) {
      blocks.value = await measureElements();
    }
    return;
  }

  hasLoadedOnce.value = true;
  const real = await measureElements();
  blocks.value = [];
  if (props.cacheKey && real.length > 0) {
    shimmerCache?.set(props.cacheKey, real);
  }
};

const handleResize = async () => {
  if (!innerRef.value || measuring) return;
  measuring = true;
  try {
    if (props.loading && (slots.skeleton || blocks.value.length > 0)) {
      const fresh = await measureElements(true);
      blocks.value = fresh;
      if (props.cacheKey && fresh.length > 0) {
        shimmerCache?.set(props.cacheKey, fresh);
      }
    }
  } finally {
    measuring = false;
  }
};

watch(() => props.loading, update);

onMounted(async () => {
  ensureKeyframes();
  await update();

  if (innerRef.value && typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      handleResize();
    });
    ro.observe(innerRef.value);
    onBeforeUnmount(() => ro.disconnect());
  }
});

// --- Inline style objects (no external CSS dependency) ---
const outerStyle = {
  width: "100%",
};

const innerStyle = {
  position: "relative" as const,
  width: "100%",
  minHeight: "10px",
};

const layerStyle = {
  position: "relative" as const,
  zIndex: 1,
};

const waveStyle = {
  position: "absolute" as const,
  inset: "0",
  background:
    "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.8) 50%, transparent 75%)",
  animation: "vue-auto-shimmer-move 1.2s infinite linear",
  backgroundSize: "200% 100%",
};
</script>

<template>
  <div
    :style="[
      outerStyle,
      {
        border: border || '1px solid #e5e7eb',
        borderRadius: borderRadius || '8px',
        boxShadow: boxShadow || '0 2px 8px rgba(0,0,0,0.05)',
        backgroundColor: bgColor || '#ffffff',
        padding: padding || '1.5rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      },
    ]"
  >
    <div ref="innerRef" :style="innerStyle">
      <!-- SKELETON: Tampil saat loading pertama (belum pernah load data) -->
      <div
        v-if="loading && slots.skeleton && !hasLoadedOnce"
        :style="layerStyle"
      >
        <slot name="skeleton" />
      </div>

      <!-- CONTENT: Tampil saat !loading ATAU saat loading+sudah pernah load -->
      <div v-else :style="layerStyle">
        <slot />
      </div>

      <!-- SHIMMER BLOCKS -->
      <template v-if="loading && blocks.length > 0">
        <div
          v-for="b in blocks"
          :key="b.id"
          :style="{
            position: 'absolute',
            zIndex: 2,
            pointerEvents: 'none',
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
          <div :style="waveStyle" />
        </div>
      </template>
    </div>
  </div>
</template>
