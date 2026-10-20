<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PlannerModule from './modules/PlannerModule.vue'
import ScheduleModule from './modules/ScheduleModule.vue'
import TasksModule from './modules/TasksModule.vue'
import CheckinModule from './modules/CheckinModule.vue'
import ExperimentModule from './modules/ExperimentModule.vue'
import StatsModule from './modules/StatsModule.vue'
import { state, fillDemo } from './store.js'

const tabs = [
  { id: 'today', title: 'Сегодня', icon: '◷', modules: [PlannerModule],
    sub: 'Не нужно успеть всё. Давай выберем, что сегодня важнее.' },
  { id: 'schedule', title: 'Расписание', icon: '▦', modules: [ScheduleModule],
    eyebrow: 'Расписание', head: 'Не сверяйся с тремя источниками',
    sub: 'Добавь расписание пар один раз и проверь распознанные занятия.' },
  { id: 'tasks', title: 'Дела', icon: '☰', modules: [TasksModule],
    eyebrow: 'Дела', head: 'Начни с малого',
    sub: 'Большую задачу можно начать с одного маленького шага.' },
  { id: 'checkin', title: 'Чек-ин', icon: '♡', modules: [CheckinModule],
    eyebrow: 'Чек-ин', head: 'Как ты сегодня?',
    sub: 'Полминуты. Отметка только для тебя, можно пропустить.' },
  { id: 'experiment', title: 'Эксперимент', icon: '✳', modules: [ExperimentModule],
    eyebrow: 'Лаборатория личного ритма', head: 'Попробуй свой способ',
    sub: 'Выбери одно изменение на неделю. Цель — понять, что помогает именно тебе.' },
  { id: 'stats', title: 'Статистика', icon: '◉', modules: [StatsModule],
    eyebrow: 'Наблюдения', head: 'Твой ритм',
    sub: 'Как менялись настроение, сон и нагрузка. Наблюдение, а не оценка.' }
]

// вкладка хранится в адресе (#tasks), чтобы после f5 не кидало на первую
function fromHash() {
  const id = location.hash.slice(1)
  return tabs.some(t => t.id === id) ? id : tabs[0].id
}

const activeId = ref(fromHash())
const active = computed(() => tabs.find(t => t.id === activeId.value))

function select(id) {
  activeId.value = id
  history.replaceState(null, '', '#' + id)
  scrollTo({ top: 0 })
}

function onHashChange() { activeId.value = fromHash() }
onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))

// у «сегодня» шапка живая: дата и приветствие по времени суток
const now = new Date()
const todayEyebrow = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).replace(', ', ' · ')
const h = now.getHours()
const greeting = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'

const eyebrow = computed(() => active.value.id === 'today' ? todayEyebrow : active.value.eyebrow)
const head = computed(() => active.value.id === 'today' ? greeting : active.value.head)

const hasData = computed(() =>
  state.lessons.length + state.tasks.length + state.checkins.length + state.experiments.length > 0
)

function demo() {
  if (hasData.value && !confirm('Заменить твои данные демонстрационными?')) return
  fillDemo()
}
</script>

<template>
  <div class="app-layout">
    <aside class="app-side">
      <div class="app-brand">
        <div class="app-logo">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <path d="M5 23c6 0 6-11 13-11s7 12 13 12" fill="none" stroke="#EFF5DA" stroke-width="2.8" stroke-linecap="round" />
            <path d="M5 17c5 0 6-8 12-8 5 0 7 8 14 8" fill="none" stroke="#FFFFFF" stroke-opacity=".72" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </div>
        ритм
      </div>

      <div class="eyebrow app-navlabel">Твоё пространство</div>
      <nav class="app-nav" aria-label="Разделы">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="app-tab"
          :class="{ active: t.id === activeId }"
          :aria-current="t.id === activeId ? 'page' : null"
          @click="select(t.id)"
        ><i aria-hidden="true">{{ t.icon }}</i>{{ t.title }}</button>
      </nav>

      <div class="app-side-foot">
        Данные хранятся только на этом устройстве.
      </div>
    </aside>

    <main class="app-main">
      <div class="app-top">
        <span class="eyebrow">Твой учебный ритм</span>
        <button class="app-demo" @click="demo">Заполнить демо</button>
      </div>

      <header class="app-head">
        <div class="eyebrow">{{ eyebrow }}</div>
        <h1>{{ head }}</h1>
        <p>{{ active.sub }}</p>
      </header>

      <div class="app-content">
        <component :is="m" v-for="(m, i) in active.modules" :key="activeId + i" />
      </div>
    </main>
  </div>
</template>
