
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Clock,
  Settings,
  ChevronDown,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My Tasks', icon: CheckSquare },
  { label: 'Today', icon: Clock },
  { label: 'Upcoming', icon: CalendarDays },
  { label: 'Calendar', icon: CalendarDays },
]

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[250px] border-r border-gray-200 bg-white md:flex md:flex-col">
      <div className="flex h-[76px] items-center gap-3 border-b border-gray-100 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
          T
        </div>
        <span className="text-lg font-bold tracking-tight">TaskFlow</span>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-gray-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map(({ label, icon: Icon }) => {
            const isActive = activePage === label

            return (
              <button
                key={label}
                onClick={() => setActivePage(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-100 p-4">
        <button
          onClick={() => setActivePage('Settings')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
        >
          <Settings size={18} />
          Settings
        </button>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            GG
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Gowtham</p>
            <p className="truncate text-xs text-gray-400">Student account</p>
          </div>
          <ChevronDown size={16} className="ml-auto text-gray-400" />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
