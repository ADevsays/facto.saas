<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

/* Offset para que las secciones no queden tapadas por el navbar fijo */
#solution, #process, #faq, #contact {
  scroll-margin-top: 120px;
}
</style>
