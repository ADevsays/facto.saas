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

.glass-fluid-btn {
    color: #fff;
    background: linear-gradient(
        120deg, 
        rgba(255, 255, 255, 0) 30%, 
        rgba(255, 255, 255, 0.15) 50%, 
        rgba(255, 255, 255, 0) 70%
    );
    background-size: 200% auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: shine 12s ease-in-out infinite;
    transition: all 0.4s ease;
}

.glass-fluid-btn:hover {
    border-color: rgba(0, 212, 255, 0.5);
    background-color: rgba(0, 212, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

@keyframes shine {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
}
</style>
