import { SearchCode, PlusCircle } from 'lucide-react';

export default function Selection({ setReportType, setView, setSelectedImage }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 animate-in zoom-in duration-300">
      <h2 className="text-3xl font-bold mb-12 tracking-tight">Welcome! What would you like to do?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button onClick={() => { setReportType('lost'); setView('report'); setSelectedImage(null); }} className="group p-12 rounded-[2rem] bg-slate-800 border-4 border-transparent hover:border-rose-500 transition-all flex flex-col items-center gap-6 shadow-2xl">
          <SearchCode size={64} className="text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black uppercase">I LOST SOMETHING</span>
        </button>
        <button onClick={() => { setReportType('found'); setView('report'); setSelectedImage(null); }} className="group p-12 rounded-[2rem] bg-slate-800 border-4 border-transparent hover:border-emerald-500 transition-all flex flex-col items-center gap-6 shadow-2xl">
          <PlusCircle size={64} className="text-emerald-500 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black uppercase">I FOUND SOMETHING</span>
        </button>
      </div>
    </div>
  );
}