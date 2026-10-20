<script setup>
import { ref, computed } from 'vue'
import { state, saveCheckin, getCheckin, todayStr } from '../store.js'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseChip from '../components/BaseChip.vue'
import BaseNote from '../components/BaseNote.vue'

const today = todayStr()
const existingToday = getCheckin(today)

const mood = ref(existingToday ? existingToday.mood : null)
const sleep = ref(existingToday ? existingToday.sleep : 7)
const load = ref(existingToday ? existingToday.load : null)

const savedNotice = ref(false)

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
      <BaseCard eyebrow="ТВОЁ СОСТОЯНИЕ" title="Как ты себя чувствуешь?" sub="Отметка за сегодня. Сохраняется только в твоем браузере.">
        <div class="stack" style="margin-top: 14px;">
          <!-- Смайлики настроения -->
          <div class="field">
            <span>Настроение</span>
            <div class="row" style="gap: 10px;">
              <button
                v-for="(emoji, index) in ['😣', '😕', '😐', '🙂', '😄']"
                :key="index"
                type="button"
                :aria-label="`Настроение ${index + 1} из 5`"
                class="mood-btn"
                :class="{ active: mood === index + 1 }"
                @click="mood = index + 1"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <!-- Ползунок сна -->
          <div class="field">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Сон прошлой ночью</span>
              <strong style="font-size: 13px; color: var(--c-primary);">{{ String(sleep).replace('.', ',') }} ч</strong>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              v-model.number="sleep"
            />
          </div>

          <!-- Чипы нагрузки -->
          <div class="field">
            <span>Нагрузка сегодня</span>
            <div class="chips">
              <BaseChip
                :active="load === 'light'"
                @click="load = 'light'"
              >
                Лёгкая
              </BaseChip>
              <BaseChip
                :active="load === 'normal'"
                @click="load = 'normal'"
              >
                Обычная
              </BaseChip>
              <BaseChip
                :active="load === 'heavy'"
                @click="load = 'heavy'"
              >
                Тяжёлая
              </BaseChip>
            </div>
          </div>

          <!-- Кнопка сохранения -->
          <div style="margin-top: 6px;">
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
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.mood-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--c-border);
  background: var(--c-card);
  border-radius: 50%;
  font-size: 18px;
  display: grid;
  place-items: center;
  transition: all 0.15s ease;
}

.mood-btn:hover {
  border-color: #79A08D;
  background: var(--c-primary-soft);
}

.mood-btn.active {
  border-color: var(--c-primary);
  background: var(--c-primary-soft);
  box-shadow: 0 0 0 3px rgba(37, 78, 67, 0.15);
}
</style>