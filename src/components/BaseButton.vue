<script setup>
defineProps({ variant: { type: String, default: 'primary' } })
</script>

<template>
  <button type="button" class="base-btn" :class="variant"><slot /></button>
</template>

<style scoped>
.base-btn {
  border-radius: 10px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--c-primary-deep);
}
.primary { background: var(--c-primary-deep); color: #fff; }
.ghost { background: none; color: var(--c-primary-deep); }
.base-btn:disabled { opacity: 0.5; cursor: default; }
</style>
