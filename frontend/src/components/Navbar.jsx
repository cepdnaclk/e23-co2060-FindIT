import { LogOut, Bell, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ view, setView, handleLogout, notifications, onNotificationClick, currentUser }) {
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
        
        {/* Admin Link - Only visible if user is admin and not on landing/auth pages */}
        {view !== 'landing' && view !== 'signin' && view !== 'login' && currentUser?.isAdmin && (
          <button 
            onClick={() => setView('admin')} 
            className={`flex items-center gap-2 text-sm font-bold transition px-3 py-2 rounded-lg ${
              view === 'admin' 
                ? 'text-indigo-400 bg-indigo-500/10' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck size={18} />
            Admin Panel
          </button>
        )}

        {/* Bell Icon & Notifications Dropdown */}
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

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Notifications</h3>
                </div>
                
                {/* 🛑 START OF SCROLLABLE WRAPPER 🛑 */}
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications?.length > 0 ? (
                    notifications.map((notif, index) => (
                      <div 
                        key={index}
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
                {/* 🛑 END OF SCROLLABLE WRAPPER 🛑 */}

              </div>
            )}
          </div>
        )}

        {view === 'landing' ? (
          <div className="flex space-x-4">
            <button onClick={() => setView('signin')} className="px-5 py-2 rounded-xl font-bold border border-slate-700 hover:bg-slate-800 transition">Sign Up</button>
            <button onClick={() => setView('login')} className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-lg">Log In</button>
          </div>
        ) : (
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 font-bold transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}