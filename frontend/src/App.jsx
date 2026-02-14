import { useState } from 'react';
import './index.css';
import Gatekeeper from './components/Gatekeeper';

function App() {
  const [view, setView] = useState('landing'); // landing, signin, login

  if (view === 'signin' || view === 'login') {
    return <Gatekeeper type={view} onBack={() => setView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800">
        <div className="text-3xl font-black text-indigo-500 tracking-tighter">FindIT</div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setView('signin')}
            className="px-5 py-2 rounded-xl font-bold border border-slate-700 hover:bg-slate-800 transition"
          >
            Sign In
          </button>
          <button 
            onClick={() => setView('login')}
            className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
          >
            Log In
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex flex-col items-center justify-center mt-32 px-6 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight">
          University <span className="text-indigo-500">Lost & Found</span>
        </h1>
        <p className="mt-6 text-slate-400 text-lg max-w-xl">
          A secure, privacy-first platform designed exclusively for the Faculty of Engineering.
        </p>
      </main>
    </div>
  );
}

export default App;