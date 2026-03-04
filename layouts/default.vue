<template>
  <div class="min-h-screen bg-[#030305] text-white font-sans selection:bg-cyan-500/30">
    <slot />
  </div>
</template>

<style>
/* Reset global y transiciones base */
html, body {
  margin: 0;
  padding: 0;
  background-color: #030305;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
