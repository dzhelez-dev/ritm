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
  { id: 'today',      title: 'Сегодня',     modules: [PlannerModule] },
  { id: 'schedule',   title: 'Расписание',  modules: [ScheduleModule] },
  { id: 'tasks',      title: 'Дела',        modules: [TasksModule] },
  { id: 'checkin',    title: 'Чек-ин',      modules: [CheckinModule] },
  { id: 'experiment', title: 'Эксперимент', modules: [ExperimentModule] },
  { id: 'stats',      title: 'Статистика',  modules: [StatsModule] }
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
}

function onHashChange() { activeId.value = fromHash() }
onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))

const hasData = computed(() =>
  state.lessons.length + state.tasks.length + state.checkins.length + state.experiments.length > 0
)

function demo() {
  if (hasData.value && !confirm('Заменить твои данные демонстрационными?')) return
  fillDemo()
}
</script>

<template>
  <header class="app-header">
    <div class="app-wrap app-header-inner">
      <div class="app-brand">
        <span class="app-logo" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <span class="app-name">Ритм</span>
      </div>
      <span class="app-tagline">Расписание, дела и силы в одном месте</span>
      <button class="app-demo" @click="demo">Заполнить демо</button>
    </div>

    <nav class="app-wrap app-tabs" aria-label="Разделы">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="app-tab"
        :class="{ active: t.id === activeId }"
        :aria-current="t.id === activeId ? 'page' : null"
        @click="select(t.id)"
      >{{ t.title }}</button>
    </nav>
  </header>

  <main class="app-wrap app-main">
    <component :is="m" v-for="(m, i) in active.modules" :key="activeId + i" />
  </main>

  <footer class="app-wrap app-footer">
    Данные хранятся только на этом устройстве. Это наблюдение о своём опыте, а не медицинский вывод.
  </footer>
</template>
