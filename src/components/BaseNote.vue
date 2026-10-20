<script setup>
defineProps({ type: { type: String, default: 'info' } })
</script>

<template>
  <div class="base-note" :class="type"><slot /></div>
</template>

<style scoped>
.base-note {
  border-radius: var(--radius-sm);
  padding: 11px 13px;
  font-size: 13px;
  line-height: 1.5;
}
.info { background: var(--c-hint); color: #52695E; }
.warn { background: var(--c-accent-soft); color: var(--c-accent-deep); }
</style>
