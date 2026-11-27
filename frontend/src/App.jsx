
import { useState } from 'react'
import {
  Bell,
  Plus,
  Search,
  CheckCircle2,
  X,
  CalendarDays,
  Trash2,
  ListTodo,
  RotateCcw,
} from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import { stats, tasks as initialTasks, priorityStyles } from './data/dashboardData'

const statusStyles = {
  Pending: 'border-gray-200 bg-gray-100 text-gray-600',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-700',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

// Converts due dates like "Nov 27" or "2026-11-27" to sortable timestamps
const getDueDateValue = (due) => {
  if (!due) return Number.MAX_SAFE_INTEGER

  if (/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    const [year, month, day] = due.split('-').map(Number)
    return new Date(year, month - 1, day).getTime()
  }

  const parsed = new Date(due)

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime()
  }

  const currentYear = new Date().getFullYear()
  const parsedWithYear = new Date(`${due}, ${currentYear}`)

  return Number.isNaN(parsedWithYear.getTime())
    ? Number.MAX_SAFE_INTEGER
    : parsedWithYear.getTime()
}

// Determines deadline urgency
const getDeadlineUrgency = (due, status) => {
  if (!due || status === 'Completed') return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let deadline

  // Parse ISO date without timezone conversion
  if (/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    const [year, month, day] = due.split('-').map(Number)
    deadline = new Date(year, month - 1, day)
  } else {
    // Parse dates like "Nov 27"
    deadline = new Date(`${due}, ${today.getFullYear()}`)

    if (Number.isNaN(deadline.getTime())) return null

    // Treat dates far in the past as next year's deadline
    const daysDifference = (deadline - today) / (1000 * 60 * 60 * 24)

    if (daysDifference < -180) {
      deadline.setFullYear(deadline.getFullYear() + 1)
    }
  }

  deadline.setHours(0, 0, 0, 0)

  if (deadline < today) return 'Overdue'
  if (deadline.getTime() === today.getTime()) return 'Due Today'

  return 'Upcoming'
}

const urgencyStyles = {
  Overdue: 'border-rose-200 bg-rose-50 text-rose-600',
  'Due Today': 'border-amber-200 bg-amber-50 text-amber-700',
  Upcoming: 'border-indigo-200 bg-indigo-50 text-indigo-600',
}

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [taskList, setTaskList] = useState(
    initialTasks.map((task, index) => ({ ...task, id: `task-${index}` })),
  )

  const [taskStatuses, setTaskStatuses] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskFilter, setTaskFilter] = useState('All')
  const [sortBy, setSortBy] = useState('default')

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    due: '',
    priority: 'Medium',
  })

  const getTaskStatus = (taskId) => taskStatuses[taskId] || 'Pending'

  const completedCount = taskList.filter(
    (task) => getTaskStatus(task.id) === 'Completed',
  ).length

  const inProgressCount = taskList.filter(
    (task) => getTaskStatus(task.id) === 'In Progress',
  ).length

  const pendingCount = taskList.filter(
    (task) => getTaskStatus(task.id) === 'Pending',
  ).length

  const totalCount = taskList.length

  const progress = taskList.length
    ? Math.round((completedCount / taskList.length) * 100)
    : 0

  // Update task status
  const updateTaskStatus = (taskId, status) => {
    setTaskStatuses((prev) => ({ ...prev, [taskId]: status }))
  }

  // Toggle task completion
  const toggleTask = (taskId) => {
    const currentStatus = getTaskStatus(taskId)
    updateTaskStatus(
      taskId,
      currentStatus === 'Completed' ? 'Pending' : 'Completed',
    )
  }

  // Delete a task
  const deleteTask = (taskId) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?')

    if (!confirmed) return

    setTaskList((prev) => prev.filter((task) => task.id !== taskId))
    setTaskStatuses((prev) => {
      const updated = { ...prev }
      delete updated[taskId]
      return updated
    })
  }

  // Priority badge styles
  const getPriorityBadge = (priority) => {
    const styles = {
      High: 'border border-rose-200 bg-rose-50 text-rose-700 ring-1 ring-rose-100',
      Medium:
        'border border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-100',
      Low: 'border border-emerald-200 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    }

    return styles[priority] || priorityStyles[priority] || 'bg-gray-100 text-gray-600'
  }

  // Reusable deadline badge
  const renderUrgencyBadge = (task, status) => {
    const urgency = getDeadlineUrgency(task.due, status)

    if (!urgency) return null

    return (
      <span
        className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${urgencyStyles[urgency]}`}
      >
        {urgency}
      </span>
    )
  }

  // Search and status filters
  const filteredTasks = taskList.filter((task) => {
    const matchesSearch = `${task.title} ${task.subject}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesFilter =
      taskFilter === 'All' || getTaskStatus(task.id) === taskFilter

    return matchesSearch && matchesFilter
  })

  // Sort filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 }
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
    }

    if (sortBy === 'due') {
      return getDueDateValue(a.due) - getDueDateValue(b.due)
    }

    if (sortBy === 'newest') {
      const getTaskTimestamp = (task) => {
        const idNumber = Number(task.id.replace('task-', ''))
        return Number.isNaN(idNumber) ? 0 : idNumber
      }

      return getTaskTimestamp(b) - getTaskTimestamp(a)
    }

    return 0
  })

  // Add new task
  const handleAddTask = (event) => {
    event.preventDefault()

    const taskId = `task-${Date.now()}`

    const taskToAdd = {
      ...newTask,
      id: taskId,
      due: new Date(`${newTask.due}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }

    setTaskList((prev) => [taskToAdd, ...prev])
    setTaskStatuses((prev) => ({ ...prev, [taskId]: 'Pending' }))
    setNewTask({ title: '', subject: '', due: '', priority: 'Medium' })
    setShowAddTask(false)
  }

  // Task filter counts
  const filterCounts = {
    All: totalCount,
    Pending: pendingCount,
    'In Progress': inProgressCount,
    Completed: completedCount,
  }

  // Reset search, filter, and sorting
  const resetFilters = () => {
    setSearchTerm('')
    setTaskFilter('All')
    setSortBy('default')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="min-h-screen px-5 py-8 md:ml-64 md:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4 pl-12 md:pl-0">
            <div>
              <p className="text-sm text-gray-500">Student Workspace</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {activePage === 'Overview' ? 'Dashboard Overview' : activePage}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Stay organized and make every day productive.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {searchOpen && (
                <div className="relative">
                  <input
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-36 rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-48"
                  />

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      aria-label="Clear search"
                      title="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Search tasks"
                className={`rounded-xl border p-2.5 transition ${
                  searchOpen
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Search size={19} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="relative rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-100"
                >
                  <Bell size={19} />
                  {taskList.length - completedCount > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      You have {taskList.length - completedCount} tasks remaining.
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {pendingCount} pending · {inProgressCount} in progress
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:px-4"
              >
                <Plus size={18} />
                <span>New Task</span>
              </button>
            </div>
          </header>

          {/* Stats */}
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const value =
                stat.title === 'Total Tasks'
                  ? taskList.length
                  : stat.title === 'Completed'
                    ? completedCount
                    : stat.title === 'In Progress'
                      ? inProgressCount
                      : pendingCount

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        {value}
                      </h2>
                    </div>
                    <div className={`rounded-xl p-2 ${stat.color}`}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              )
            })}
          </section>

          {/* Main Dashboard */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Task List */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Keep track of your assignments
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filters with Counters */}
                  <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
                    {['All', 'Pending', 'In Progress', 'Completed'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTaskFilter(filter)}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                          taskFilter === filter
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <span>{filter}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            taskFilter === filter
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {filterCounts[filter]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Sorting Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort tasks"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="default">Default order</option>
                    <option value="priority">Priority (High first)</option>
                    <option value="due">Due date</option>
                    <option value="newest">Newest first</option>
                  </select>
                </div>
              </div>

              {/* Tasks or Empty State */}
              {sortedTasks.length > 0 ? (
                <div className="space-y-3">
                  {sortedTasks.map((task) => {
                    const status = getTaskStatus(task.id)
                    const isCompleted = status === 'Completed'
                    const urgency = getDeadlineUrgency(task.due, status)

                    return (
                      <div
                        key={task.id}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50"
                      >
                        {/* Completion Toggle */}
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                            isCompleted
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-gray-300 hover:border-indigo-500'
                          }`}
                          aria-label={isCompleted ? 'Reopen task' : 'Complete task'}
                        >
                          {isCompleted && <CheckCircle2 size={14} />}
                        </button>

                        {/* Task Details */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium ${
                              isCompleted
                                ? 'text-gray-400 line-through'
                                : 'text-gray-800'
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {task.subject} · Due {task.due}
                            </span>

                            {urgency && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${urgencyStyles[urgency]}`}
                              >
                                {urgency}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          aria-label={`Status for ${task.title}`}
                          className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-100 ${statusStyles[status]}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>

                        {/* Priority Badge */}
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 ${getPriorityBadge(task.priority)}`}
                        >
                          {task.priority}
                        </span>

                        {/* Delete */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                          className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                    <ListTodo size={26} />
                  </div>

                  <h3 className="text-base font-semibold text-gray-800">
                    No tasks found
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-gray-500">
                    No tasks match your current search or filter. Try adjusting
                    them to see your tasks again.
                  </p>

                  <button
                    onClick={resetFilters}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <RotateCcw size={16} />
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
              <p className="mt-1 text-sm text-gray-500">Task completion overview</p>

              <div className="my-8 flex justify-center">
                <div
                  className="relative flex h-44 w-44 items-center justify-center rounded-full transition-all"
                  style={{
                    background: `conic-gradient(#6366f1 ${progress}%, #eef0f5 ${progress}% 100%)`,
                  }}
                >
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-4xl font-bold text-gray-900">
                      {progress}%
                    </span>
                    <span className="mt-1 text-xs text-gray-500">Completed</span>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">Completed tasks</span>
                <span className="font-semibold">
                  {completedCount} / {taskList.length}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-medium text-gray-700">{pendingCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-600">In Progress</span>
                  <span className="font-medium text-gray-700">{inProgressCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-600">Completed</span>
                  <span className="font-medium text-gray-700">{completedCount}</span>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">
                Keep up the great work! Small steps lead to big results.
              </p>
            </div>
          </section>

          {/* Upcoming Tasks */}
          <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
              <p className="mt-1 text-sm text-gray-500">
                Don't miss your important submissions
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {taskList
                .filter((task) => getTaskStatus(task.id) !== 'Completed')
                .slice(0, 4)
                .map((task, index) => {
                  const status = getTaskStatus(task.id)
                  const urgency = getDeadlineUrgency(task.due, status)

                  return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-gray-100 p-4 transition hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <CalendarDays size={13} />
                        Deadline {index + 1}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${getPriorityBadge(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">{task.title}</h3>
                    <p className="mt-2 text-xs text-gray-500">{task.subject}</p>
                    <p className="mt-2 text-xs font-medium">
                      <span className={`rounded-full border px-2 py-1 ${statusStyles[status]}`}>
                        {status}
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-indigo-600">
                        Due {task.due}
                      </p>
                      {urgency && (
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-semibold ${urgencyStyles[urgency]}`}
                        >
                          {urgency}
                        </span>
                      )}
                    </div>
                  </div>
                  )
                })}
            </div>

            {taskList.every((task) => getTaskStatus(task.id) === 'Completed') && (
              <p className="py-6 text-center text-sm text-emerald-600">
                All tasks completed! Great work 🎉
              </p>
            )}
          </section>
        </div>
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create New Task</h2>
                <p className="mt-1 text-sm text-gray-500">Add a task to your planner</p>
              </div>
              <button
                onClick={() => setShowAddTask(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Task name</label>
                <input
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Finish assignment"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
                <input
                  required
                  value={newTask.subject}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Due date</label>
                <input
                  required
                  type="date"
                  value={newTask.due}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, due: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
