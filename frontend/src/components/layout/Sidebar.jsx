
import { useState } from 'react'
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Clock,
  Settings,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My Tasks', icon: CheckSquare },
  { label: 'Today', icon: Clock },
  { label: 'Upcoming', icon: CalendarDays },
  { label: 'Calendar', icon: CalendarDays },
]

function Sidebar({ activePage, setActivePage }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavigation = (page) => {
    setActivePage(page)
    setMobileOpen(false)
  }

  const sidebarContent = (
    <>
      <div className="flex h-[76px] items-center gap-3 border-b border-gray-100 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
          T
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          TaskFlow
        </span>
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
                onClick={() => handleNavigation(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-100 p-4">
        <button
          onClick={() => handleNavigation('Settings')}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
            activePage === 'Settings'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings size={18} />
          Settings
        </button>

        <button className="mt-4 flex w-full items-center gap-3 rounded-xl bg-gray-50 p-3 text-left transition hover:bg-gray-100">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            GG
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              Gowtham
            </p>
            <p className="truncate text-xs text-gray-400">Student account</p>
          </div>
          <ChevronDown size={16} className="ml-auto text-gray-400" />
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/40 transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute right-3 top-4">
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-gray-200 bg-white md:flex">
        {sidebarContent}
      </aside>
    </>
  )
}

export default Sidebar
