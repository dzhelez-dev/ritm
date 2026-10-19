<script setup>
defineProps({ type: { type: String, default: 'info' } })
</script>

<template>
  <div class="base-note" :class="type"><slot /></div>
</template>

<style scoped>
.base-note {
  border-radius: 12px;
  padding: 12px 16px;
}
.info { background: var(--c-primary-soft); }
.warn { background: var(--c-accent-soft); }
</style>
