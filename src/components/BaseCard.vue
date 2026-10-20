<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  sub: { type: String, default: '' }
})
</script>

<template>
  <section class="base-card">
    <header v-if="eyebrow || title || sub || $slots.actions" class="base-card-head">
      <div>
        <div v-if="eyebrow" class="eyebrow">{{ eyebrow }}</div>
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="sub" class="muted">{{ sub }}</p>
      </div>
      <div v-if="$slots.actions" class="base-card-actions"><slot name="actions" /></div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.base-card {
  background: var(--c-card);
  border: 1px solid #EBEFEB;
  border-radius: var(--radius);
  padding: 19px;
  box-shadow: var(--shadow);
}
.base-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}
.base-card-head h2 { margin: 4px 0; }
.base-card-actions { flex: none; }
</style>
