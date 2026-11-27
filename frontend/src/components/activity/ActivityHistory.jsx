import { useMemo, useState } from 'react'
import {
  ArrowRightLeft,
  History,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react'

const activityTypes = [
  { value: 'created', label: 'Created' },
  { value: 'edited', label: 'Edited' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'category', label: 'Category' },
  { value: 'deleted', label: 'Deleted' },
]

const activityAppearance = {
  created: {
    icon: Plus,
    style: 'bg-emerald-50 text-emerald-600',
  },
  edited: {
    icon: Pencil,
    style: 'bg-indigo-50 text-indigo-600',
  },
  status: {
    icon: ArrowRightLeft,
    style: 'bg-sky-50 text-sky-600',
  },
  priority: {
    icon: Tag,
    style: 'bg-amber-50 text-amber-700',
  },
  category: {
    icon: Tag,
    style: 'bg-violet-50 text-violet-600',
  },
  deleted: {
    icon: Trash2,
    style: 'bg-rose-50 text-rose-600',
  },
}

const formatTimestamp = (timestamp) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))

function ActivityHistory({ activities, tasks, onOpenTask }) {
  const [typeFilter, setTypeFilter] = useState('All')
  const taskIds = useMemo(() => new Set(tasks.map((task) => task.id)), [tasks])

  const filteredActivities = useMemo(
    () =>
      activities
        .filter((activity) => typeFilter === 'All' || activity.type === typeFilter)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
    [activities, typeFilter],
  )

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <History size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Activity History
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                A timeline of changes made to your tasks
              </p>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span>Filter by action</span>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter activities by type"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="All">All activity</option>
            {activityTypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <History size={22} aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">
            {activities.length === 0
              ? 'No task activity yet'
              : 'No activity matches this filter'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activities.length === 0
              ? 'Task additions and updates will appear here.'
              : 'Choose another action type to see more entries.'}
          </p>
        </div>
      ) : (
        <ol
          className="relative space-y-3 before:absolute before:bottom-5 before:left-[19px] before:top-5 before:w-px before:bg-gray-200"
          aria-label="Task activity timeline"
        >
          {filteredActivities.map((activity) => {
            const appearance = activityAppearance[activity.type]
            const Icon = appearance.icon
            const canOpen = taskIds.has(activity.taskId)
            const Entry = canOpen ? 'button' : 'article'

            return (
              <li key={activity.id} className="relative pl-12">
                <span
                  className={`absolute left-0 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white ${appearance.style}`}
                  aria-hidden="true"
                >
                  <Icon size={17} />
                </span>
                <Entry
                  {...(canOpen
                    ? {
                        type: 'button',
                        onClick: () => onOpenTask(activity.taskId),
                        'aria-label': `Open task ${activity.taskTitle}: ${activity.description}`,
                      }
                    : {})}
                  className={`w-full rounded-xl border border-gray-100 p-4 text-left ${
                    canOpen
                      ? 'transition hover:border-indigo-100 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400'
                      : 'bg-gray-50/50'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {activity.taskTitle}
                        {!canOpen && (
                          <span className="ml-2 inline-flex rounded-full bg-gray-200 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                            Deleted
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                    <time
                      dateTime={activity.timestamp}
                      className="shrink-0 text-xs text-gray-400"
                    >
                      {formatTimestamp(activity.timestamp)}
                    </time>
                  </div>
                </Entry>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

export default ActivityHistory
