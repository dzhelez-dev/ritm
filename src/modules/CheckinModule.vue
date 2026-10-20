<script setup>
import { ref, computed } from 'vue'
import { state, saveCheckin, getCheckin, todayStr } from '../store.js'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseChip from '../components/BaseChip.vue'
import BaseNote from '../components/BaseNote.vue'

// Данные за сегодня
const today = todayStr()
const existingToday = getCheckin(today)

const mood = ref(existingToday ? existingToday.mood : null)
const sleep = ref(existingToday ? existingToday.sleep : 7)
const load = ref(existingToday ? existingToday.load : null)

const savedNotice = ref(false)

// Простейшая проверка для активации кнопки
const isFormValid = computed(() => mood.value !== null && load.value !== null)

const handleSave = () => {
  if (!isFormValid.value) return
  saveCheckin({
    date: today,
    mood: mood.value,
    sleep: sleep.value,
    load: load.value
  })
  savedNotice.value = true
  setTimeout(() => {
    savedNotice.value = false
  }, 3000)
}
</script>

<template>
  <div class="stack">
    <div class="grid-2">
      <BaseCard eyebrow="ТВОЁ СОСТОЯНИЕ" title="Как ты себя чувствуешь?" sub="Отметка за сегодня.">
        <div class="stack" style="margin-top: 14px;">
          <!-- Форма будет расширена на следующих этапах -->
          <div v-if="existingToday" class="muted" style="margin-bottom: 8px;">
            Сегодня ты уже отмечался, можно поправить
          </div>
          <BaseButton
            variant="primary"
            :disabled="!isFormValid"
            @click="handleSave"
          >
            Сохранить
          </BaseButton>
          <div v-if="savedNotice" class="pill" style="margin-top: 8px; background: var(--c-primary-soft); color: var(--c-primary);">
            Записано. Спасибо, что проверил себя
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
</style>