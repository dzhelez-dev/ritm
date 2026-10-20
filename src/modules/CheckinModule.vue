<script setup>
import { ref, computed } from 'vue'
import { state, saveCheckin, getCheckin, todayStr, addDays, weekday } from '../store.js'
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

// Переключатель периода графика
const chartMode = ref('week')

const chartDays = computed(() => {
  const count = chartMode.value === 'week' ? 7 : 30
  const list = []
  for (let i = count - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    const checkin = getCheckin(d)
    const wdNum = weekday(d)
    const weekNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    list.push({
      date: d,
      dayName: weekNames[wdNum],
      isToday: d === today,
      mood: checkin ? checkin.mood : null,
      sleep: checkin ? checkin.sleep : null,
      load: checkin ? checkin.load : null,
      hasRecord: !!checkin
    })
  }
  return list
})

const chartStats = computed(() => {
  const records = state.checkins.filter(c => c.sleep != null && c.mood != null)
  if (records.length === 0) return { avgSleep: 0, goodDaysCount: 0, totalRecords: 0 }
  
  const totalSleep = records.reduce((acc, r) => acc + r.sleep, 0)
  const avgSleep = (totalSleep / records.length).toFixed(1).replace('.', ',')
  
  const goodDaysCount = records.filter(r => r.mood >= 4).length
  return {
    avgSleep,
    goodDaysCount,
    totalRecords: records.length
  }
})
</script>

<template>
  <div class="stack">
    <div class="grid-2">
      <!-- Карточка 1 -->
      <BaseCard eyebrow="ТВОЁ СОСТОЯНИЕ" title="Как ты себя чувствуешь?" sub="Отметка за сегодня. Сохраняется только в твоем браузере.">
        <div class="stack" style="margin-top: 14px;">
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

          <div class="field">
            <span>Нагрузка сегодня</span>
            <div class="chips">
              <BaseChip :active="load === 'light'" @click="load = 'light'">Лёгкая</BaseChip>
              <BaseChip :active="load === 'normal'" @click="load = 'normal'">Обычная</BaseChip>
              <BaseChip :active="load === 'heavy'" @click="load = 'heavy'">Тяжёлая</BaseChip>
            </div>
          </div>

          <div style="margin-top: 6px;">
            <div v-if="existingToday" class="muted" style="margin-bottom: 8px;">
              Сегодня ты уже отмечался, можно поправить
            </div>
            <BaseButton variant="primary" :disabled="!isFormValid" @click="handleSave">
              Сохранить
            </BaseButton>
            <div v-if="savedNotice" class="pill" style="margin-top: 8px; background: var(--c-primary-soft); color: var(--c-primary);">
              Записано. Спасибо, что проверил себя
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Карточка 2: Твоя неделя -->
      <BaseCard eyebrow="ДИНАМИКА" title="Твоя неделя" sub="Настроение за последние дни.">
        <template #actions>
          <div class="chips">
            <BaseChip :active="chartMode === 'week'" @click="chartMode = 'week'">Неделя</BaseChip>
            <BaseChip :active="chartMode === 'month'" @click="chartMode = 'month'">Месяц</BaseChip>
          </div>
        </template>

        <div class="stack" style="margin-top: 14px;">
          <div class="chart-container" :class="{ 'month-mode': chartMode === 'month' }">
            <div
              v-for="item in chartDays"
              :key="item.date"
              class="bar-col"
              :title="item.hasRecord ? `${item.date}: настроение ${item.mood}/5, сон ${item.sleep}ч, нагрузка: ${item.load || 'нет'}` : `${item.date}: нет отметок`"
            >
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :class="{
                    'mood-high': item.mood >= 4,
                    'mood-low': item.mood !== null && item.mood <= 3,
                    'empty': !item.hasRecord
                  }"
                  :style="{ height: item.mood ? `${(item.mood / 5) * 100}%` : '8px' }"
                ></div>
              </div>
              <span v-if="chartMode === 'week'" class="bar-label" :class="{ 'today-label': item.isToday }">
                {{ item.dayName }}
              </span>
            </div>
          </div>

          <div class="muted" style="text-align: center; font-size: 11px;">
            Средний сон {{ chartStats.avgSleep }} ч · хороших дней {{ chartStats.goodDaysCount }} из {{ chartStats.totalRecords }}
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

.chart-container {
  height: 120px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--c-border);
}

.chart-container.month-mode {
  gap: 3px;
}

.bar-col {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.bar-track {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar-fill {
  width: 100%;
  max-width: 24px;
  border-radius: 4px 4px 2px 2px;
  transition: height 0.3s ease;
}

.chart-container.month-mode .bar-fill {
  max-width: 8px;
  border-radius: 2px 2px 1px 1px;
}

.bar-fill.mood-high {
  background: var(--c-primary);
}

.bar-fill.mood-low {
  background: var(--c-accent);
}

.bar-fill.empty {
  background: transparent;
  border: 1px dashed var(--c-border);
  opacity: 0.5;
}

.bar-label {
  font-size: 10px;
  color: var(--c-muted);
}

.bar-label.today-label {
  font-weight: 700;
  color: var(--c-text);
}
</style>