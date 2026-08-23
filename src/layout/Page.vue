<template>
  <!-- The shared page shell. It owns the app's horizontal gutters (1rem on the
       phone, via `container-page`) and the vertical rhythm every view sits in;
       views bring their own between-section spacing, so this sets padding only
       — a `space-y-*` here would double up with the gap a view already sets on
       its own root. -->
  <main class="container-page py-6 md:py-10">
    <slot />
  </main>
</template>
