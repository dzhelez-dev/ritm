<script setup>
defineProps({ active: { type: Boolean, default: false } })
</script>

<template>
  <button type="button" class="base-chip" :class="{ active }" :aria-pressed="active"><slot /></button>
</template>

<style scoped>
.base-chip {
  border-radius: 999px;
  padding: 6px 14px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  cursor: pointer;
}
.active {
  background: var(--c-primary-soft);
  border-color: var(--c-primary);
  color: var(--c-primary-deep);
}
</style>
