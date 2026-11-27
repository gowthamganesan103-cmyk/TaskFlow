
import { useState } from 'react'
import {
  Bell,
  Plus,
  Search,
  CheckCircle2,
  X,
  CalendarDays,
} from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import { stats, tasks as initialTasks, priorityStyles } from './data/dashboardData'

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [taskList, setTaskList] = useState(
    initialTasks.map((task, index) => ({ ...task, id: `task-${index}` })),
  )
  const [completedTasks, setCompletedTasks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskFilter, setTaskFilter] = useState('All')
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    due: '',
    priority: 'Medium',
  })

  const completedCount = completedTasks.length
  const progress = taskList.length
    ? Math.round((completedCount / taskList.length) * 100)
    : 0

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    )
  }

  const filteredTasks = taskList.filter((task) => {
    const matchesSearch = `${task.title} ${task.subject}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesFilter =
      taskFilter === 'All' ||
      (taskFilter === 'Pending' && !completedTasks.includes(task.id)) ||
      (taskFilter === 'Completed' && completedTasks.includes(task.id))

    return matchesSearch && matchesFilter
  })

  const handleAddTask = (event) => {
    event.preventDefault()

    const taskToAdd = {
      ...newTask,
      id: `task-${Date.now()}`,
      due: new Date(`${newTask.due}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }

    setTaskList((prev) => [taskToAdd, ...prev])
    setNewTask({ title: '', subject: '', due: '', priority: 'Medium' })
    setShowAddTask(false)
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
                <input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-36 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-48"
                />
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
                      Keep an eye on your upcoming deadlines.
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
                      ? taskList.length - completedCount
                      : taskList.length - completedCount

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

                <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                  {['All', 'Pending', 'Completed'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTaskFilter(filter)}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                        taskFilter === filter
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const isCompleted = completedTasks.includes(task.id)

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50"
                    >
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
                        <p className="mt-1 text-xs text-gray-500">
                          {task.subject} · Due {task.due}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          priorityStyles[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  )
                })}

                {filteredTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                    <Search className="mx-auto mb-2 text-gray-300" size={24} />
                    <p className="text-sm text-gray-500">No matching tasks found.</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Try another search or filter.
                    </p>
                  </div>
                )}
              </div>
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
                    <span className="text-4xl font-bold text-gray-900">{progress}%</span>
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
                Don&apos;t miss your important submissions
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {taskList.filter((task) => !completedTasks.includes(task.id)).slice(0, 4).map((task, index) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-gray-100 p-4 transition hover:shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <CalendarDays size={13} />
                      Deadline {index + 1}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        priorityStyles[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">{task.title}</h3>
                  <p className="mt-2 text-xs text-gray-500">{task.subject}</p>
                  <p className="mt-3 text-sm font-medium text-indigo-600">Due {task.due}</p>
                </div>
              ))}
            </div>

            {taskList.every((task) => completedTasks.includes(task.id)) && (
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
