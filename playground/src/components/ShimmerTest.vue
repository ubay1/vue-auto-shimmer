<template>
  <div
    class="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center justify-center"
  >
    <div
      v-for="item in 4"
      :key="item"
      class="border border-gray-100 rounded-lg p-3 space-y-1"
    >
      <div
        class="grid grid-cols-[auto_40px] items-center gap-2 justify-between"
      >
        <h3
          class="w-32 h-5 rounded text-sm font-semibold tracking-[0.5px] leading-[125%] text-[#62686F] placeholder bg-gray-200"
        ></h3>
        <div
          class="w-10 h-10 flex justify-center items-center rounded-xl placeholder bg-gray-200"
        >
          <div
            class="w-4 h-4 rounded-full opacity-50 placeholder bg-gray-400"
          />
        </div>
      </div>
      <div class="mt-4 flex items-center gap-2">
        <h1
          class="w-16 h-6 rounded font-bold text-lg tracking-[0.5px] leading-[125%] text-[#313336] placeholder bg-gray-200"
        ></h1>
        <div
          class="rounded-[8px] h-[20px] w-[55px] mt-1 flex items-center justify-center px-2 placeholder bg-gray-200"
        ></div>
      </div>

      <div class="mt-4">
        <span
          class="inline-block w-48 h-4 rounded text-sm tracking-[0.25px] leading-[150%] text-[#62686F] placeholder bg-gray-200"
        ></span>
      </div>
    </div>
  </div>
</template>
