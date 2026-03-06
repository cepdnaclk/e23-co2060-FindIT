import { LogOut } from 'lucide-react';

export default function Navbar({ view, setView, handleLogout }) {
  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div 
        className="text-3xl font-black text-indigo-500 tracking-tighter cursor-pointer" 
        onClick={() => setView('landing')}
      >
        FindIT
      </div>
      <div className="flex space-x-4">
        {view === 'landing' ? (
          <>
            <button onClick={() => setView('signin')} className="px-5 py-2 rounded-xl font-bold border border-slate-700 hover:bg-slate-800 transition">Sign In</button>
            <button onClick={() => setView('login')} className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-lg">Log In</button>
          </>
        ) : (
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 font-bold transition">
            <LogOut size={18} /> Logout
          </button>
        )}
      </div>
    </nav>
  );
}