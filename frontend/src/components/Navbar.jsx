import { LogOut, Bell, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, Badge } from './ui';

export default function Navbar({ view, setView, handleLogout, notifications, onNotificationClick, currentUser }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/95 px-4 py-4 shadow-lg shadow-slate-950/20 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div
          className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 transition-all duration-200 hover:scale-[1.01]"
          onClick={() => setView('landing')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/15 text-lg font-black text-indigo-400 shadow-[0_0_0_1px_rgba(99,102,241,0.12)]">
            F
          </div>
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight text-white">FindIT</div>
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              Lost & Found
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Admin Link - Only visible if user is admin and not on landing/auth pages */}
          {view !== 'landing' && view !== 'signin' && view !== 'login' && currentUser?.isAdmin && (
            <Button
              onClick={() => setView('admin')}
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                view === 'admin'
                  ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </Button>
          )}

          {/* Bell Icon & Notifications Dropdown */}
          {view !== 'landing' && view !== 'signin' && view !== 'login' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Toggle notifications"
                aria-expanded={showDropdown}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/70 text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <Bell size={18} />
                {notifications?.length > 0 && (
                  <Badge variant="verified" className="absolute -right-1 -top-1 min-h-5 min-w-5 rounded-full border-0 bg-rose-500 px-1 py-0 text-[10px] font-bold text-white">
                    {notifications.length}
                  </Badge>
                )}
              </button>

              {showDropdown && (
                <Card className="absolute right-0 mt-3 w-80 overflow-hidden border-slate-700/80 bg-slate-900/95 p-0 shadow-2xl shadow-slate-950/40">
                  <div className="border-b border-slate-800 bg-slate-950/60 px-4 py-3">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications?.length > 0 ? (
                      notifications.map((notif, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setShowDropdown(false);
                            onNotificationClick(notif);
                          }}
                          className="w-full border-b border-slate-800/80 px-4 py-3 text-left transition-all duration-200 hover:bg-slate-800/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 last:border-0"
                        >
                          <p className="text-sm leading-6 text-slate-300">{notif.message}</p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-5 text-center text-sm text-slate-500">
                        No new notifications
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {view === 'landing' ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={() => setView('signin')}
                variant="secondary"
                size="sm"
                className="border-slate-700/80 bg-slate-800/80 text-slate-100 hover:bg-slate-700"
              >
                Sign Up
              </Button>
              <Button onClick={() => setView('login')} variant="primary" size="sm">
                Log In
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}