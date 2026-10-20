<script setup>
defineProps({ variant: { type: String, default: 'primary' } })
</script>

<template>
  <button type="button" class="base-btn" :class="variant"><slot /></button>
</template>

<style scoped>
.base-btn {
  border-radius: var(--radius-sm);
  padding: 11px 14px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid transparent;
}
.primary { background: var(--c-primary); color: #fff; }
.primary:hover { background: var(--c-primary-deep); }
.ghost { background: var(--c-card); border-color: var(--c-border); padding: 9px 12px; font-weight: 650; }
.ghost:hover { border-color: #C9DBCE; color: var(--c-primary); }
.link { background: none; color: var(--c-primary); padding: 6px; }
.link:hover { text-decoration: underline; }
.base-btn:disabled { opacity: 0.5; cursor: default; }
</style>
