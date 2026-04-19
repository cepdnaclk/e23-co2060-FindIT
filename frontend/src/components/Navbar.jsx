import { LogOut, Bell } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ view, setView, handleLogout, notifications, onNotificationClick }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div 
        className="text-3xl font-black text-indigo-500 tracking-tighter cursor-pointer" 
        onClick={() => setView('landing')}
      >
        FindIT
      </div>
      <div className="flex items-center space-x-6">
        
        {/* Bell Icon & Notifications Dropdown (Hidden on landing/login pages) */}
        {view !== 'landing' && view !== 'signin' && view !== 'login' && (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="relative text-slate-400 hover:text-white transition p-2"
            >
              <Bell size={24} />
              {notifications?.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-slate-900">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2">
                <h3 className="px-4 py-2 text-sm font-bold text-slate-300 border-b border-slate-700/50 mb-1">Notifications</h3>
                {notifications?.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        setShowDropdown(false);
                        onNotificationClick(notif);
                      }}
                      className="px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition border-b border-slate-700/50 last:border-0 group"
                    >
                      <p className="text-sm text-slate-300 group-hover:text-white leading-tight">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-slate-500 text-center">No new notifications</div>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'landing' ? (
          <div className="flex space-x-4">
            <button onClick={() => setView('signin')} className="px-5 py-2 rounded-xl font-bold border border-slate-700 hover:bg-slate-800 transition">Sign In</button>
            <button onClick={() => setView('login')} className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-lg">Log In</button>
          </div>
        ) : (
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 font-bold transition">
            <LogOut size={18} /> Logout
          </button>
        )}
      </div>
    </nav>
  );
}