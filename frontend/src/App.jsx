
import { useEffect, useRef, useState } from 'react'
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
  Pencil,
} from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import { stats, tasks as initialTasks, priorityStyles } from './data/dashboardData'

const statusStyles = {
  Pending: 'border-gray-200 bg-gray-100 text-gray-600',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-700',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const getDueDateValue = (due) => {
  if (!due) return Number.MAX_SAFE_INTEGER

  if (/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    const [year, month, day] = due.split('-').map(Number)
    return new Date(year, month - 1, day).getTime()
  }

  const parsed = new Date(due)
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime()

  const currentYear = new Date().getFullYear()
  const parsedWithYear = new Date(`${due}, ${currentYear}`)

  return Number.isNaN(parsedWithYear.getTime())
    ? Number.MAX_SAFE_INTEGER
    : parsedWithYear.getTime()
}

const toIsoDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const normalizeSeedDueDate = (due) => {
  const today = getToday()

  if (/^\d{4}-\d{2}-\d{2}$/.test(due)) return due
  if (due === 'Today') return toIsoDate(today)
  if (due === 'Tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return toIsoDate(tomorrow)
  }

  const parsed = new Date(`${due}, ${today.getFullYear()}`)
  if (Number.isNaN(parsed.getTime())) return ''
  if (parsed < today) parsed.setFullYear(parsed.getFullYear() + 1)
  return toIsoDate(parsed)
}

const getDeadlineUrgency = (due, status) => {
  if (!due || status === 'Completed') return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let deadline

  if (/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    const [year, month, day] = due.split('-').map(Number)
    deadline = new Date(year, month - 1, day)
  } else {
    deadline = new Date(`${due}, ${today.getFullYear()}`)
    if (Number.isNaN(deadline.getTime())) return null

    const daysDifference = (deadline - today) / (1000 * 60 * 60 * 24)
    if (daysDifference < -180) deadline.setFullYear(deadline.getFullYear() + 1)
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

const formatDueDate = (date) => {
  if (!date) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return date
}

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [taskList, setTaskList] = useState(() => {
    try {
      const savedTasks = window.localStorage.getItem('taskflow.tasks')
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        if (Array.isArray(parsedTasks)) return parsedTasks
      }
    } catch {
      // Ignore unavailable or invalid local storage and use the seed tasks.
    }

    return initialTasks.map((task, index) => ({
      ...task,
      id: `task-${index}`,
      due: normalizeSeedDueDate(task.due),
    }))
  })

  const [taskStatuses, setTaskStatuses] = useState(() => {
    try {
      const savedStatuses = window.localStorage.getItem('taskflow.statuses')
      if (savedStatuses) {
        const parsedStatuses = JSON.parse(savedStatuses)
        if (parsedStatuses && typeof parsedStatuses === 'object') {
          return parsedStatuses
        }
      }
    } catch {
      // Ignore unavailable or invalid local storage and use default statuses.
    }
    return {}
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskFilter, setTaskFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const submitLock = useRef(false)

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    due: '',
    priority: 'Medium',
  })

  // Form validation errors
  const [formErrors, setFormErrors] = useState({})

  const getTaskStatus = (taskId) => taskStatuses[taskId] || 'Pending'

  useEffect(() => {
    try {
      window.localStorage.setItem('taskflow.tasks', JSON.stringify(taskList))
      window.localStorage.setItem('taskflow.statuses', JSON.stringify(taskStatuses))
    } catch {
      // The app remains usable when storage is blocked or unavailable.
    }
  }, [taskList, taskStatuses])

  useEffect(() => {
    if (!showAddTask) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowAddTask(false)
        setEditingTask(null)
        setFormErrors({})
        setNewTask({ title: '', subject: '', due: '', priority: 'Medium' })
        submitLock.current = false
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showAddTask])

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

  const overdueCount = taskList.filter(
    (task) =>
      getTaskStatus(task.id) !== 'Completed' &&
      getDeadlineUrgency(task.due, getTaskStatus(task.id)) === 'Overdue',
  ).length

  const dueTodayCount = taskList.filter(
    (task) =>
      getTaskStatus(task.id) !== 'Completed' &&
      getDeadlineUrgency(task.due, getTaskStatus(task.id)) === 'Due Today',
  ).length

  const upcomingCount = taskList.filter(
    (task) =>
      getTaskStatus(task.id) !== 'Completed' &&
      getDeadlineUrgency(task.due, getTaskStatus(task.id)) !== null,
  ).length

  const updateTaskStatus = (taskId, status) => {
    setTaskStatuses((prev) => ({ ...prev, [taskId]: status }))
  }

  const toggleTask = (taskId) => {
    const currentStatus = getTaskStatus(taskId)
    updateTaskStatus(
      taskId,
      currentStatus === 'Completed' ? 'Pending' : 'Completed',
    )
  }

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

  const getPriorityBadge = (priority) => {
    const styles = {
      High: 'border border-rose-200 bg-rose-50 text-rose-700 ring-1 ring-rose-100',
      Medium:
        'border border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-100',
      Low: 'border border-emerald-200 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    }

    return styles[priority] || priorityStyles[priority] || 'bg-gray-100 text-gray-600'
  }

  // Validate the task form
  const validateTaskForm = () => {
    const errors = {}

    if (!newTask.title.trim()) {
      errors.title = 'Task name is required.'
    } else if (newTask.title.trim().length < 3) {
      errors.title = 'Task name must be at least 3 characters.'
    }

    if (!newTask.subject.trim()) {
      errors.subject = 'Subject is required.'
    }

    if (!newTask.due) {
      errors.due = 'Due date is required.'
    } else {
      const selectedDate = new Date(`${newTask.due}T00:00:00`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (Number.isNaN(selectedDate.getTime())) {
        errors.due = 'Please enter a valid date.'
      } else if (
        selectedDate < today &&
        (!editingTask || normalizeSeedDueDate(editingTask.due) !== newTask.due)
      ) {
        errors.due = 'Due date cannot be in the past.'
      }
    }

    if (!['Low', 'Medium', 'High'].includes(newTask.priority)) {
      errors.priority = 'Please select a valid priority.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Edit an existing task
  const handleEditTask = (task) => {
    setEditingTask(task)
    setFormErrors({})
    setNewTask({
      title: task.title,
      subject: task.subject,
      due: normalizeSeedDueDate(task.due),
      priority: task.priority,
    })
    setShowAddTask(true)
  }

  // Reset and close task modal
  const closeTaskModal = () => {
    setShowAddTask(false)
    setEditingTask(null)
    setFormErrors({})
    setNewTask({ title: '', subject: '', due: '', priority: 'Medium' })
    submitLock.current = false
  }

  // Add new task with validation
  const handleAddTask = (event) => {
    event.preventDefault()
    if (!validateTaskForm()) return
    if (submitLock.current) return
    submitLock.current = true

    const duplicate = taskList.some(
      (task) =>
        task.title.toLowerCase() === newTask.title.trim().toLowerCase() &&
        task.subject.toLowerCase() === newTask.subject.trim().toLowerCase() &&
        normalizeSeedDueDate(task.due) === newTask.due,
    )

    if (duplicate) {
      submitLock.current = false
      setFormErrors({
        title: 'A matching task already exists.',
      })
      return
    }

    const taskId =
      typeof crypto.randomUUID === 'function'
        ? `task-${crypto.randomUUID()}`
        : `task-${Date.now()}`

    const taskToAdd = {
      ...newTask,
      title: newTask.title.trim(),
      subject: newTask.subject.trim(),
      id: taskId,
      due: newTask.due,
    }

    setTaskList((prev) => [taskToAdd, ...prev])
    setTaskStatuses((prev) => ({ ...prev, [taskId]: 'Pending' }))
    closeTaskModal()
  }

  // Update existing task with validation
  const handleUpdateTask = (event) => {
    event.preventDefault()
    if (!validateTaskForm() || !editingTask) return
    if (submitLock.current) return
    submitLock.current = true

    const updatedTask = {
      ...editingTask,
      title: newTask.title.trim(),
      subject: newTask.subject.trim(),
      due: newTask.due,
      priority: newTask.priority,
    }

    setTaskList((prev) =>
      prev.map((task) =>
        task.id === editingTask.id ? updatedTask : task,
      ),
    )

    closeTaskModal()
  }

  // Update form field and clear its error
  const handleFieldChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const filteredTasks = taskList.filter((task) => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchesSearch = `${task.title} ${task.subject}`
      .toLowerCase()
      .includes(normalizedSearch)

    const matchesFilter =
      taskFilter === 'All' || getTaskStatus(task.id) === taskFilter
    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter
    const urgency = getDeadlineUrgency(task.due, getTaskStatus(task.id))
    const matchesPage =
      activePage === 'Today'
        ? urgency === 'Due Today'
        : activePage === 'Upcoming'
          ? urgency === 'Upcoming'
          : activePage === 'Calendar'
            ? urgency !== null
            : true

    return matchesSearch && matchesFilter && matchesPriority && matchesPage
  })

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

  const filterCounts = {
    All: totalCount,
    Pending: pendingCount,
    'In Progress': inProgressCount,
    Completed: completedCount,
  }

  const resetFilters = () => {
    setSearchTerm('')
    setActivePage('Overview')
    setTaskFilter('All')
    setPriorityFilter('All')
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
                  aria-expanded={notificationsOpen}
                  className="relative rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-100"
                >
                  <Bell size={19} />
                  {(overdueCount > 0 || dueTodayCount > 0) && (
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
                      {overdueCount} overdue · {dueTodayCount} due today
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setEditingTask(null)
                  setFormErrors({})
                  setNewTask({ title: '', subject: '', due: '', priority: 'Medium' })
                  setShowAddTask(true)
                }}
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
                      : stat.title === 'Upcoming'
                        ? upcomingCount
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
                  {/* Status Filters */}
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

                  {/* Sorting */}
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    aria-label="Filter tasks by priority"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="All">All priorities</option>
                    <option value="High">High priority</option>
                    <option value="Medium">Medium priority</option>
                    <option value="Low">Low priority</option>
                  </select>
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
                        {/* Completion */}
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

                        {/* Details */}
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
                              {task.subject} · Due {formatDueDate(task.due)}
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

                        {/* Status */}
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

                        {/* Priority */}
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 ${getPriorityBadge(task.priority)}`}
                        >
                          {task.priority}
                        </span>

                        {/* Edit */}
                        <button
                          onClick={() => handleEditTask(task)}
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                          className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Pencil size={16} />
                        </button>

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
                .sort((a, b) => getDueDateValue(a.due) - getDueDateValue(b.due))
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
                          Due {formatDueDate(task.due)}
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

            {taskList.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">
                No deadlines to show yet.
              </p>
            )}

            {taskList.length > 0 &&
              taskList.every((task) => getTaskStatus(task.id) === 'Completed') && (
              <p className="py-6 text-center text-sm text-emerald-600">
                All tasks completed! Great work 🎉
              </p>
            )}
          </section>
        </div>
      </main>

      {/* Add / Edit Task Modal */}
      {(showAddTask || editingTask) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTaskModal()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 id="task-modal-title" className="text-lg font-bold text-gray-900">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {editingTask ? 'Update your task details' : 'Add a task to your planner'}
                </p>
              </div>
              <button
                onClick={closeTaskModal}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={editingTask ? handleUpdateTask : handleAddTask}
              className="space-y-4"
              noValidate
            >
              {/* Task name */}
              <div>
                <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-gray-700">
                  Task name
                </label>
                <input
                  id="task-title"
                  autoFocus
                  value={newTask.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g. Finish assignment"
                  aria-invalid={Boolean(formErrors.title)}
                  aria-describedby={formErrors.title ? 'task-title-error' : undefined}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 ${
                    formErrors.title
                      ? 'border-rose-400 focus:border-rose-400'
                      : 'border-gray-200 focus:border-indigo-400'
                  }`}
                />
                {formErrors.title && (
                  <p id="task-title-error" className="mt-1 text-xs text-rose-500">{formErrors.title}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="task-subject" className="mb-1 block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  id="task-subject"
                  value={newTask.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  placeholder="e.g. Computer Science"
                  aria-invalid={Boolean(formErrors.subject)}
                  aria-describedby={formErrors.subject ? 'task-subject-error' : undefined}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 ${
                    formErrors.subject
                      ? 'border-rose-400 focus:border-rose-400'
                      : 'border-gray-200 focus:border-indigo-400'
                  }`}
                />
                {formErrors.subject && (
                  <p id="task-subject-error" className="mt-1 text-xs text-rose-500">{formErrors.subject}</p>
                )}
              </div>

              {/* Due date */}
              <div>
                <label htmlFor="task-due" className="mb-1 block text-sm font-medium text-gray-700">
                  Due date
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={newTask.due}
                  onChange={(e) => handleFieldChange('due', e.target.value)}
                  min={toIsoDate(getToday())}
                  aria-invalid={Boolean(formErrors.due)}
                  aria-describedby={formErrors.due ? 'task-due-error' : undefined}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 ${
                    formErrors.due
                      ? 'border-rose-400 focus:border-rose-400'
                      : 'border-gray-200 focus:border-indigo-400'
                  }`}
                />
                {formErrors.due && (
                  <p id="task-due-error" className="mt-1 text-xs text-rose-500">{formErrors.due}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={newTask.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  aria-invalid={Boolean(formErrors.priority)}
                  aria-describedby={formErrors.priority ? 'task-priority-error' : undefined}
                  className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 ${
                    formErrors.priority
                      ? 'border-rose-400 focus:border-rose-400'
                      : 'border-gray-200 focus:border-indigo-400'
                  }`}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                {formErrors.priority && (
                  <p id="task-priority-error" className="mt-1 text-xs text-rose-500">{formErrors.priority}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  {editingTask ? 'Save Changes' : 'Add Task'}
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
