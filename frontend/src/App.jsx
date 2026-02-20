import { useState } from 'react';
import './index.css';
import Gatekeeper from './components/Gatekeeper';
import { Search, Sparkles, MapPin, Clock, Lock, ArrowLeft, PlusCircle, SearchCode, LogOut, Camera, X } from 'lucide-react';

const CATEGORIES = ["Electronics", "IDs/Documents", "Keys", "Wallets/Bags", "Books/Stationary", "Other"];

function App() {
  const [view, setView] = useState('landing'); 
  const [reportType, setReportType] = useState(''); 
  const [showMatches, setShowMatches] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // New state for image

  const handleAuthSuccess = () => {
    setView('selection');
  };

  // Handle Image Selection and Preview
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  if (view === 'signin' || view === 'login') {
    return (
      <Gatekeeper 
        type={view} 
        onBack={() => setView('landing')} 
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="text-3xl font-black text-indigo-500 tracking-tighter cursor-pointer" onClick={() => setView('landing')}>FindIT</div>
        <div className="flex space-x-4">
          {view === 'landing' ? (
            <>
              <button onClick={() => setView('signin')} className="px-5 py-2 rounded-xl font-bold border border-slate-700 hover:bg-slate-800 transition">Sign In</button>
              <button onClick={() => setView('login')} className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-lg">Log In</button>
            </>
          ) : (
            <button onClick={() => {setView('landing'); setShowMatches(false); setSelectedImage(null);}} className="flex items-center gap-2 text-slate-400 hover:text-red-400 font-bold transition">
              <LogOut size={18}/> Logout
            </button>
          )}
        </div>
      </nav>

      {view === 'landing' && (
        <main className="flex flex-col items-center justify-center mt-32 px-6 text-center">
          <h1 className="text-6xl font-extrabold tracking-tight">University <span className="text-indigo-500">Lost & Found</span></h1>
          <p className="mt-6 text-slate-400 text-lg max-w-xl">A secure platform for the Faculty of Engineering.</p>
          <button onClick={() => setView('login')} className="mt-10 px-8 py-4 bg-indigo-600 rounded-2xl font-black text-xl hover:scale-105 transition shadow-xl">GET STARTED</button>
        </main>
      )}

      {view === 'selection' && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 animate-in zoom-in duration-300">
          <h2 className="text-3xl font-bold mb-12 tracking-tight">Welcome! What would you like to do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <button onClick={() => { setReportType('lost'); setView('report'); setSelectedImage(null); }} className="group p-12 rounded-[2rem] bg-slate-800 border-4 border-transparent hover:border-rose-500 transition-all flex flex-col items-center gap-6 shadow-2xl">
              <SearchCode size={64} className="text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black">I LOST SOMETHING</span>
            </button>
            <button onClick={() => { setReportType('found'); setView('report'); setSelectedImage(null); }} className="group p-12 rounded-[2rem] bg-slate-800 border-4 border-transparent hover:border-emerald-500 transition-all flex flex-col items-center gap-6 shadow-2xl">
              <PlusCircle size={64} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black">I FOUND SOMETHING</span>
            </button>
          </div>
        </div>
      )}

      {view === 'report' && (
        <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-3xl shadow-2xl my-10 border border-slate-700 animate-in slide-in-from-bottom-4">
          <button onClick={() => setView('selection')} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition font-bold"><ArrowLeft size={20}/> Back</button>
          <h2 className="text-3xl font-black mb-8 text-indigo-400 uppercase italic">Report {reportType} Item</h2>
          
          <form onSubmit={(e) => { e.preventDefault(); setShowMatches(true); setView('dashboard'); }} className="space-y-6">
            
            {/* IMAGE UPLOAD SECTION (Mandatory for Found) */}
            <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase">Item Image {reportType === 'found' && '*'}</label>
                <div className="relative group flex items-center justify-center w-full h-48 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all">
                    {selectedImage ? (
                        <>
                            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 bg-rose-600 p-1 rounded-full shadow-lg"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2">
                            <Camera size={40} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-sm text-slate-500">Tap to capture / upload</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" // TRIGGERS CAMERA ON MOBILE
                                className="hidden" 
                                onChange={handleImageChange}
                                required={reportType === 'found'} 
                            />
                        </label>
                    )}
                </div>
            </div>

            <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-indigo-500">
              <option value="">Select Category *</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat.toLowerCase()}>{cat}</option>)}
            </select>

            <input type="text" placeholder="Title (e.g. Silver Laptop)" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none" required />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="bg-slate-900 border border-slate-700 p-4 rounded-xl" required />
              <input type="time" step="1800" className="bg-slate-900 border border-slate-700 p-4 rounded-xl" required />
            </div>

            <input type="text" placeholder="Location (e.g. Canteen)" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl" required />
            <textarea placeholder="Unique details (colors, stickers, brand)..." className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl h-32" required />
            
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 space-y-4">
              <p className="text-xs font-black text-indigo-500 uppercase flex items-center gap-2"><Lock size={14}/> Security Verification</p>
              <input type="text" placeholder="Secret Question" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" required />
              <input type="text" placeholder="Secret Answer" className="w-full border border-slate-700 p-3 bg-slate-900 rounded-xl" required />
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-500 transition shadow-lg">
                {reportType === 'found' ? 'SUBMIT FOUND ITEM' : 'SEARCH FOR MATCHES'}
            </button>
          </form>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="max-w-6xl mx-auto px-6 pb-20 animate-in fade-in duration-700">
          <div className="relative max-w-3xl mx-auto my-12 group">
            <Search className="absolute left-6 top-6 text-slate-500 group-focus-within:text-indigo-500" />
            <input type="text" placeholder="Smart Search items..." className="w-full bg-slate-800 pl-16 pr-6 py-6 rounded-3xl border-none shadow-2xl text-xl focus:ring-4 focus:ring-indigo-500/20 outline-none" />
          </div>
          {showMatches && (
            <section className="animate-in slide-in-from-bottom-5">
              <h2 className="text-2xl font-black text-indigo-400 mb-8 flex items-center gap-2 uppercase italic tracking-tighter">
                <Sparkles className="animate-pulse" /> Potential Matches Found
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2].map(id => (
                  <div key={id} className="bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border-t-8 border-indigo-600 hover:translate-y-[-8px] transition-all">
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase px-3 py-1 rounded-full">90% Match</span>
                    <h3 className="text-2xl font-black text-white mt-4 mb-2">Similar Item Found</h3>
                    <button className="mt-4 w-full py-3 bg-indigo-600 text-white font-black rounded-2xl">VIEW DETAILS</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;