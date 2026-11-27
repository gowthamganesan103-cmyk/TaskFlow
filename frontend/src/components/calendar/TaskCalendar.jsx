import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toIsoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

const fromIsoDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const getTodayIso = () => toIsoDate(new Date())

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const gridStart = new Date(year, month, 1 - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    )
    return date
  })
}

function TaskCalendar({ tasks, getTaskStatus, onEditTask }) {
  const todayIso = getTodayIso()
  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(todayIso)

  const calendarDays = useMemo(() => getCalendarDays(viewMonth), [viewMonth])

  const tasksByDate = useMemo(() => {
    const grouped = new Map()

    tasks.forEach((task) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(task.due || '')) return
      const existing = grouped.get(task.due) || []
      grouped.set(task.due, [...existing, task])
    })

    return grouped
  }, [tasks])

  const selectedTasks = tasksByDate.get(selectedDate) || []

  const changeMonth = (offset) => {
    setViewMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    )
  }

  const goToToday = () => {
    const today = new Date()
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(todayIso)
  }

  const monthLabel = viewMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
      <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{monthLabel}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select a date to view its deadlines
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((date) => {
                const isoDate = toIsoDate(date)
                const dayTasks = tasksByDate.get(isoDate) || []
                const isCurrentMonth = date.getMonth() === viewMonth.getMonth()
                const isToday = isoDate === todayIso
                const isSelected = isoDate === selectedDate

                return (
                  <button
                    type="button"
                    key={isoDate}
                    onClick={() => setSelectedDate(isoDate)}
                    aria-label={`${date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}, ${dayTasks.length} task${dayTasks.length === 1 ? '' : 's'}`}
                    aria-pressed={isSelected}
                    className={`min-h-24 border-b border-r border-gray-100 p-2 text-left transition sm:min-h-28 ${
                      isSelected
                        ? 'bg-indigo-50'
                        : isCurrentMonth
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50/70 hover:bg-gray-100'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isCurrentMonth
                            ? 'text-gray-700'
                            : 'text-gray-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <div className="mt-1 space-y-1">
                      {dayTasks.slice(0, 3).map((task) => {
                        const status = getTaskStatus(task.id)
                        const isCompleted = status === 'Completed'
                        const isOverdue =
                          !isCompleted && isoDate < todayIso

                        return (
                          <span
                            key={task.id}
                            className={`block truncate rounded-md px-1.5 py-1 text-[10px] font-semibold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-700 line-through'
                                : isOverdue
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </span>
                        )
                      })}
                      {dayTasks.length > 3 && (
                        <span className="block text-[10px] font-semibold text-gray-500">
                          +{dayTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <CalendarDays size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {fromIsoDate(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            <p className="text-xs text-gray-500">
              {selectedTasks.length} task{selectedTasks.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {selectedTasks.length > 0 ? (
          <div className="space-y-2">
            {selectedTasks.map((task) => {
              const status = getTaskStatus(task.id)
              const isCompleted = status === 'Completed'
              const isOverdue = !isCompleted && selectedDate < todayIso

              return (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className={`w-full rounded-xl border p-3 text-left transition hover:shadow-sm ${
                    isOverdue
                      ? 'border-rose-200 bg-rose-50/60'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-gray-200 bg-gray-50/70'
                  }`}
                  aria-label={`Edit ${task.title}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted
                            ? 'text-gray-400 line-through'
                            : 'text-gray-800'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{task.subject}</p>
                    </div>
                    <Pencil size={14} className="shrink-0 text-gray-400" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-gray-600">
                      {status}
                    </span>
                    {isOverdue && (
                      <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-700">
                        Overdue
                      </span>
                    )}
                    {isCompleted && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">No tasks due</p>
            <p className="mt-1 text-xs text-gray-500">
              Select another date or add a task.
            </p>
          </div>
        )}
      </aside>
    </section>
  )
}

export default TaskCalendar
