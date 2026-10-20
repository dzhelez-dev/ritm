<script setup>
import { ref, computed, nextTick } from 'vue'
import { state, addTask, updateTask, removeTask, todayStr, addDays, parseDate } from '../store.js'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseChip from '../components/BaseChip.vue'
import BaseNote from '../components/BaseNote.vue'

// шаблоны для быстрого заполнения формы
const quickTemplates = [
  { title: 'Учёба', minutes: 90 },
  { title: 'Работа', minutes: 240 },
  { title: 'Дорога', minutes: 60 },
  { title: 'Тренировка', minutes: 60 },
  { title: 'Отдых', minutes: 30 }
]

// состояние новой формы
const getEmptyForm = () => ({
  title: '',
  minutes: 30,
  importance: 2,
  flexible: true,
  deadline: '',
  firstStep: '',
  regular: false
})
const form = ref(getEmptyForm())
const formError = ref('')

// состояние редактирования и UI
const editingId = ref(null)
const editForm = ref(null)
const startedTasks = ref(new Set())
const showDone = ref(false)
const editFirstStepInput = ref(null)

// сортировка и фильтрация дел
const undoneTasks = computed(() => {
  return state.tasks
    .filter(t => !t.done)
    .sort((a, b) => {
      // сначала срочные
      if (a.importance !== b.importance) return b.importance - a.importance
      // потом по дедлайну (ближайшие выше, без дедлайна в конце)
      if (a.deadline && !b.deadline) return -1
      if (!a.deadline && b.deadline) return 1
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
      return 0
    })
})

const doneTasks = computed(() => {
  return state.tasks.filter(t => t.done)
})

// форматирование
const formatMin = (m) => {
  if (!m) return '0 мин'
  const h = Math.floor(m / 60)
  const rem = m % 60
  if (h > 0 && rem === 0) return `${h} ч`
  if (h > 0 && rem === 30) return `${h},5 ч`
  if (h > 0) return `${h} ч ${rem} мин`
  return `${m} мин`
}

const getDeadlineText = (d) => {
  if (!d) return ''
  const today = todayStr()
  const tomorrow = addDays(today, 1)
  
  if (d === today) return 'сегодня'
  if (d === tomorrow) return 'завтра'
  if (d < today) return 'срок прошёл'
  return 'до ' + parseDate(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '')
}

// действия с формой
const applyTemplate = (tpl) => {
  form.value.title = tpl.title
  form.value.minutes = tpl.minutes
  form.value.regular = true
  formError.value = ''
}

const submitNewTask = () => {
  if (!form.value.title.trim()) {
    formError.value = 'Напиши название дела, чтобы не забыть суть'
    return
  }
  
  addTask({ ...form.value, deadline: form.value.deadline || null })
  form.value = getEmptyForm()
  formError.value = ''
}

// действия со списком
const toggleDone = (task) => {
  updateTask(task.id, { done: !task.done })
  if (task.done) {
    startedTasks.value.delete(task.id)
  }
}

const confirmAndDelete = (id) => {
  if (window.confirm('Точно удалить это дело?')) {
    removeTask(id)
    startedTasks.value.delete(id)
  }
}

const startTask = (id) => {
  const newSet = new Set(startedTasks.value)
  newSet.add(id)
  startedTasks.value = newSet
}

// редактирование
const openEdit = (task, focusFirstStep = false) => {
  editingId.value = task.id
  editForm.value = { ...task }
  
  if (focusFirstStep) {
    nextTick(() => {
      if (editFirstStepInput.value && editFirstStepInput.value[0]) {
        editFirstStepInput.value[0].focus()
      }
    })
  }
}

const saveEdit = () => {
  if (!editForm.value.title.trim()) return
  updateTask(editingId.value, { ...editForm.value, deadline: editForm.value.deadline || null })
  editingId.value = null
  editForm.value = null
}

const cancelEdit = () => {
  editingId.value = null
  editForm.value = null
}
</script>

<template>
  <div class="grid-2">
    <!-- левая колонка: шаблоны и форма -->
    <div class="stack">
      <div class="chips row" style="flex-wrap: wrap; margin-bottom: 0.5rem">
        <BaseChip 
          v-for="tpl in quickTemplates" 
          :key="tpl.title"
          @click="applyTemplate(tpl)"
        >
          {{ tpl.title }} {{ tpl.minutes }} мин
        </BaseChip>
      </div>

      <BaseCard title="Новое дело">
        <form @submit.prevent="submitNewTask" class="stack">
          <div class="field stack" style="gap: 0.25rem">
            <label>Название</label>
            <input v-model="form.title" type="text" placeholder="Что нужно сделать?">
            <span v-if="formError" class="muted" style="color: var(--c-primary)">{{ formError }}</span>
          </div>

          <div class="field stack" style="gap: 0.25rem">
            <label>Сколько времени</label>
            <div class="chips row" style="flex-wrap: wrap; align-items: center">
              <BaseChip 
                v-for="m in [15, 30, 60, 90, 120]" :key="m"
                :active="form.minutes === m"
                @click="form.minutes = m"
              >
                {{ formatMin(m) }}
              </BaseChip>
              <input v-model.number="form.minutes" type="number" min="1" style="width: 80px; padding: 0.25rem 0.5rem">
              <span class="muted">мин</span>
            </div>
          </div>

          <div class="field stack" style="gap: 0.25rem">
            <label>Важность</label>
            <div class="chips row">
              <BaseChip :active="form.importance === 1" @click="form.importance = 1">Обычное</BaseChip>
              <BaseChip :active="form.importance === 2" @click="form.importance = 2">Важное</BaseChip>
              <BaseChip :active="form.importance === 3" @click="form.importance = 3">Срочное</BaseChip>
            </div>
          </div>

          <div class="field stack" style="gap: 0.25rem">
            <label>Дедлайн (необязательно)</label>
            <div class="row" style="align-items: center">
              <input v-model="form.deadline" type="date">
              <BaseButton v-if="form.deadline" variant="link" type="button" @click="form.deadline = ''">
                Очистить
              </BaseButton>
            </div>
          </div>

          <div class="field stack" style="gap: 0.5rem">
            <label class="row" style="align-items: center; cursor: pointer">
              <input v-model="form.flexible" type="checkbox">
              <span>Можно перенести на другой день</span>
            </label>
            
            <label class="row" style="align-items: center; cursor: pointer">
              <input v-model="form.regular" type="checkbox">
              <span>Повторяется регулярно</span>
            </label>
          </div>

          <div class="field stack" style="gap: 0.25rem">
            <label class="row" style="align-items: baseline; justify-content: space-between">
              <span>Первый шаг</span>
              <span class="muted" style="font-weight: normal">Без таймера, просто начать</span>
            </label>
            <input 
              v-model="form.firstStep" 
              type="text" 
              placeholder="Например: открыть документ и набросать три тезиса"
            >
          </div>

          <div style="margin-top: 0.5rem">
            <BaseButton variant="primary" type="submit">Добавить</BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>

    <!-- правая колонка: список дел -->
    <div class="stack list-col">
      <div v-if="undoneTasks.length === 0" class="muted" style="text-align: center; padding: 2rem 0">
        Пока пусто. Добавь первое дело слева или выбери шаблон, чтобы начать.
      </div>

      <div class="stack" style="gap: 1rem">
        <div v-for="task in undoneTasks" :key="task.id">
          
          <!-- режим редактирования -->
          <BaseCard v-if="editingId === task.id" class="edit-card">
            <div class="stack">
              <div class="eyebrow">Редактирование дела</div>
              <input v-model="editForm.title" type="text" placeholder="Название" style="font-weight: 500">
              
              <div class="row" style="flex-wrap: wrap; align-items: center; gap: 1rem">
                <div class="row" style="align-items: center; gap: 0.5rem">
                  <span class="muted">Минут:</span>
                  <input v-model.number="editForm.minutes" type="number" min="1" style="width: 70px; padding: 0.2rem">
                </div>
                <div class="row" style="align-items: center; gap: 0.5rem">
                  <span class="muted">Важность:</span>
                  <select v-model.number="editForm.importance" style="padding: 0.2rem">
                    <option :value="1">Обычное</option>
                    <option :value="2">Важное</option>
                    <option :value="3">Срочное</option>
                  </select>
                </div>
                <div class="row" style="align-items: center; gap: 0.5rem">
                  <span class="muted">Дедлайн:</span>
                  <input v-model="editForm.deadline" type="date" style="padding: 0.2rem">
                </div>
              </div>

              <div class="row" style="gap: 1.5rem; flex-wrap: wrap">
                <label class="row" style="align-items: center; gap: 0.5rem">
                  <input v-model="editForm.flexible" type="checkbox">
                  <span>Можно переносить</span>
                </label>
                <label class="row" style="align-items: center; gap: 0.5rem">
                  <input v-model="editForm.regular" type="checkbox">
                  <span>Регулярное</span>
                </label>
              </div>

              <div class="stack" style="gap: 0.25rem">
                <span class="muted">Первый шаг:</span>
                <input ref="editFirstStepInput" v-model="editForm.firstStep" type="text" placeholder="С чего начать?">
              </div>

              <div class="row" style="margin-top: 0.5rem">
                <BaseButton variant="primary" @click="saveEdit">Сохранить</BaseButton>
                <BaseButton variant="ghost" @click="cancelEdit">Отмена</BaseButton>
              </div>
            </div>
          </BaseCard>

          <!-- режим просмотра -->
          <div v-else class="task-row">
            <input 
              type="checkbox" 
              class="task-checkbox"
              :checked="task.done" 
              @change="toggleDone(task)"
            >
            
            <div class="stack" style="flex: 1; gap: 0.5rem; margin-top: -2px">
              <div class="row" style="justify-content: space-between; align-items: flex-start">
                <div class="task-title" style="font-size: 1.1rem; font-weight: 500">{{ task.title }}</div>
                <div class="row" style="gap: 0.5rem">
                  <BaseButton variant="link" @click="openEdit(task)">Изменить</BaseButton>
                  <BaseButton variant="link" @click="confirmAndDelete(task.id)">Удалить</BaseButton>
                </div>
              </div>

              <div class="chips row" style="flex-wrap: wrap; gap: 0.5rem">
                <span class="pill muted">{{ formatMin(task.minutes) }}</span>
                <span v-if="task.importance === 3" class="pill orange">Срочное</span>
                <span v-if="task.importance === 1" class="pill muted" style="opacity: 0.7">Обычное</span>
                <span v-if="!task.flexible" class="pill muted">Обязательно сегодня</span>
                <span v-if="task.regular" class="pill muted">Регулярно</span>
                <span v-if="task.deadline" class="pill muted">{{ getDeadlineText(task.deadline) }}</span>
              </div>

              <!-- первый шаг -->
              <div v-if="task.firstStep" style="margin-top: 0.5rem">
                <div v-if="!startedTasks.has(task.id)" class="row" style="align-items: center; justify-content: space-between; background: var(--c-hint); padding: 0.75rem; border-radius: 8px">
                  <div class="stack" style="gap: 0.15rem">
                    <span class="muted">Первый шаг:</span>
                    <span>{{ task.firstStep }}</span>
                  </div>
                  <BaseButton variant="ghost" @click="startTask(task.id)">Начать</BaseButton>
                </div>
                
                <BaseNote v-else>
                  <div class="eyebrow">Первый шаг</div>
                  <div style="font-size: 1.1rem; margin-bottom: 0.75rem">{{ task.firstStep }}</div>
                  <div class="row" style="align-items: center">
                    <BaseButton variant="primary" style="opacity: 0.8; cursor: default" @click.prevent>Начал ✓</BaseButton>
                    <span class="muted">Ты начал — продолжай в своём ритме</span>
                  </div>
                </BaseNote>
              </div>

              <!-- подсказка добавить первый шаг -->
              <div v-else-if="task.minutes >= 60" class="row" style="align-items: center; background: var(--c-hint); padding: 0.5rem 0.75rem; border-radius: 8px; margin-top: 0.25rem">
                <span class="muted">Добавь первый шаг, так проще начать большое дело</span>
                <BaseButton variant="link" @click="openEdit(task, true)">Добавить</BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- выполненные дела -->
      <div v-if="doneTasks.length > 0" class="stack" style="margin-top: 2rem; border-top: 1px solid var(--c-border); padding-top: 1.5rem">
        <div 
          class="row eyebrow" 
          style="cursor: pointer; user-select: none; justify-content: space-between" 
          @click="showDone = !showDone"
        >
          <span>Сделано ({{ doneTasks.length }})</span>
          <span>{{ showDone ? 'Скрыть' : 'Показать' }}</span>
        </div>
        
        <div v-if="showDone" class="stack" style="gap: 1rem; margin-top: 1rem">
          <div v-for="task in doneTasks" :key="task.id" class="task-row done-row">
            <input 
              type="checkbox" 
              checked 
              class="task-checkbox"
              @change="toggleDone(task)"
            >
            <div class="stack" style="flex: 1; gap: 0.25rem; margin-top: -2px">
              <div style="text-decoration: line-through; opacity: 0.6">{{ task.title }}</div>
              <div class="row" style="gap: 0.5rem; opacity: 0.5">
                <span class="muted">{{ formatMin(task.minutes) }}</span>
                <span v-if="task.regular" class="muted">регулярно</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.task-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-bg);
  transition: border-color 0.2s;
}
.task-row:hover {
  border-color: var(--c-muted);
}
.task-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.15rem;
  cursor: pointer;
  accent-color: var(--c-primary);
}
.done-row {
  border-color: transparent;
  background: transparent;
  padding: 0.5rem 0;
}
.done-row:hover {
  border-color: transparent;
}
.edit-card {
  border: 1px solid var(--c-primary);
}
</style>