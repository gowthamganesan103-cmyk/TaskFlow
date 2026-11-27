
import { useState } from 'react'
import { Bell, Plus, Search, CheckCircle2 } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'

const stats = [
  { title: 'Total Tasks', value: '24', subtitle: 'All your tasks', color: 'bg-indigo-50 text-indigo-600' },
  { title: 'Completed', value: '12', subtitle: '50% completion rate', color: 'bg-emerald-50 text-emerald-600' },
  { title: 'In Progress', value: '6', subtitle: 'Keep it going!', color: 'bg-amber-50 text-amber-600' },
  { title: 'Upcoming', value: '4', subtitle: 'Due this week', color: 'bg-sky-50 text-sky-600' },
]

const tasks = [
  { title: 'Complete Data Structures assignment', subject: 'Computer Science', due: 'Today', priority: 'High' },
  { title: 'Prepare Physics lab report', subject: 'Physics', due: 'Tomorrow', priority: 'Medium' },
  { title: 'Review Mathematics chapter 5', subject: 'Mathematics', due: 'Nov 30', priority: 'Low' },
  { title: 'Submit UI/UX project design', subject: 'Design', due: 'Dec 02', priority: 'High' },
]

const priorityStyles = {
  High: 'bg-rose-50 text-rose-600',
  Medium: 'bg-amber-50 text-amber-600',
  Low: 'bg-emerald-50 text-emerald-600',
}

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [completedTasks, setCompletedTasks] = useState([])

  const progress = Math.round((completedTasks.length / tasks.length) * 100)

  const toggleTask = (title) => {
    setCompletedTasks((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-gray-900">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="md:ml-[250px]">
        <header className="flex h-[76px] items-center justify-between border-b border-gray-200 bg-white px-5 md:px-9">
          <div className="text-sm text-gray-500">
            Workspace / <span className="font-semibold text-gray-900">{activePage}</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-400 sm:flex">
              <Search size={16} /> Search
            </button>
            <button className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500" />
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus size={17} /> New Task
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-[1440px] p-5 md:p-9">
          <div className="mb-8">
            <p className="mb-1 text-sm text-gray-400">Welcome back</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Good morning, Gowtham 👋
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Here's what's happening with your tasks today.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <div className={`rounded-xl p-2 ${stat.color}`}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <h2 className="mt-4 text-3xl font-bold">{stat.value}</h2>
                <p className="mt-2 text-xs text-gray-400">{stat.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 xl:col-span-2">
              <div className="mb-5">
                <h2 className="font-semibold">My Tasks</h2>
                <p className="mt-1 text-sm text-gray-400">Stay on top of your work</p>
              </div>

              {tasks.map((task) => {
                const isCompleted = completedTasks.includes(task.title)

                return (
                  <div key={task.title} className="flex items-center gap-3 border-t border-gray-100 py-4">
                    <button
                      onClick={() => toggleTask(task.title)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isCompleted ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 size={14} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : ''}`}>
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">{task.subject}</p>
                    </div>

                    <span className={`hidden rounded-lg px-2.5 py-1 text-xs font-medium sm:inline-flex ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="whitespace-nowrap text-xs text-gray-400">{task.due}</span>
                  </div>
                )
              })}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold">Quick Overview</h2>
              <p className="mt-1 text-sm text-gray-400">Your productivity</p>

              <div className="mt-6 flex justify-center">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-indigo-100">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{progress}%</p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completed tasks</span>
                  <span className="font-semibold">{completedTasks.length} / {tasks.length}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-gray-400">Keep up the good work!</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold">Upcoming Deadlines</h2>
            <p className="mt-1 text-sm text-gray-400">Don't miss what's coming next</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.title} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-indigo-600">{task.subject}</p>
                  <p className="mt-2 text-sm font-semibold">{task.title}</p>
                  <p className="mt-2 text-xs text-gray-400">{task.due}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
