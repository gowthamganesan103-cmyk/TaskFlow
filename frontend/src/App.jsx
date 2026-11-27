
import { useState } from 'react'
import { Bell, Plus, Search, CheckCircle2 } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import { stats, tasks, priorityStyles } from './data/dashboardData'

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [completedTasks, setCompletedTasks] = useState([])

  const progress = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0

  const toggleTask = (index) => {
    setCompletedTasks((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    )
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
                {activePage === 'Overview'
                  ? 'Dashboard Overview'
                  : activePage}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Stay organized and make every day productive.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-100">
                <Search size={19} />
              </button>
              <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-100">
                <Bell size={19} />
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
                <Plus size={18} />
                <span>New Task</span>
              </button>
            </div>
          </header>

          {/* Stats */}
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                      {stat.title === 'Total Tasks'
                        ? tasks.length
                        : stat.title === 'Completed'
                          ? completedTasks.length
                          : stat.value}
                    </h2>
                  </div>
                  <div className={`rounded-xl p-2 ${stat.color}`}>
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            ))}
          </section>

          {/* Main Dashboard */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Task List */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    My Tasks
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Keep track of your assignments
                  </p>
                </div>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {tasks.map((task, index) => {
                  const isCompleted = completedTasks.includes(index)

                  return (
                    <div
                      key={task.title}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50"
                    >
                      <button
                        onClick={() => toggleTask(index)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-gray-300 hover:border-indigo-500'
                        }`}
                        aria-label={
                          isCompleted ? 'Reopen task' : 'Complete task'
                        }
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
              </div>
            </div>

            {/* Progress */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Progress
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Daily task completion
              </p>

              <div className="my-8 flex justify-center">
                <div
                  className="relative flex h-44 w-44 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#6366f1 ${progress}%, #eef0f5 ${progress}% 100%)`,
                  }}
                >
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-4xl font-bold text-gray-900">
                      {progress}%
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">Completed tasks</span>
                <span className="font-semibold">
                  {completedTasks.length} / {tasks.length}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
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
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Deadlines
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Don't miss your important submissions
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {tasks.map((task, index) => (
                <div
                  key={task.title}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
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
                  <h3 className="text-sm font-semibold text-gray-800">
                    {task.title}
                  </h3>
                  <p className="mt-2 text-xs text-gray-500">{task.subject}</p>
                  <p className="mt-3 text-sm font-medium text-indigo-600">
                    Due {task.due}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
