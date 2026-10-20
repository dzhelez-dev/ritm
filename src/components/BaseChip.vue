<script setup>
defineProps({ active: { type: Boolean, default: false } })
</script>

<template>
  <button type="button" class="base-chip" :class="{ active }" :aria-pressed="active"><slot /></button>
</template>

<style scoped>
.base-chip {
  border: 1px solid var(--c-border);
  background: var(--c-card);
  border-radius: 99px;
  padding: 6px 11px;
  font-size: 12px;
  color: #718079;
}
.base-chip:hover { border-color: #C9DBCE; }
.active { background: var(--c-primary-soft); border-color: #C9DBCE; color: var(--c-primary); font-weight: 600; }
</style>
