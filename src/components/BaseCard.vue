<script setup>
defineProps({ title: { type: String, default: '' } })
</script>

<template>
  <section class="base-card">
    <header v-if="title || $slots.actions" class="base-card-head">
      <h3 v-if="title">{{ title }}</h3>
      <div v-if="$slots.actions" class="base-card-actions"><slot name="actions" /></div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.base-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 20px;
}
.base-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.base-card-head h3 { margin: 0; }
</style>
