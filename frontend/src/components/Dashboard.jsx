import { Search, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function Dashboard({ showMatches }) {
  return (
    <div className="max-w-6xl mx-auto px-6 pb-20 animate-in fade-in duration-700">
      <div className="relative max-w-3xl mx-auto my-12 group">
        <Search className="absolute left-6 top-6 text-slate-500 group-focus-within:text-indigo-500" />
        <input 
          type="text" 
          placeholder="Search for keys, laptops, etc..." 
          className="w-full bg-slate-800 pl-16 pr-6 py-6 rounded-3xl border-none shadow-2xl text-xl focus:ring-4 focus:ring-indigo-500/20 outline-none" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LOST ITEMS COLUMN */}
        <section>
          <h2 className="text-2xl font-black text-rose-500 mb-8 flex items-center gap-2 uppercase italic">
            <AlertCircle /> Recently Lost
          </h2>
          <div className="space-y-6">
            {[1, 2].map(id => (
              <div key={id} className="bg-slate-800 p-6 rounded-[2rem] shadow-xl border-l-8 border-rose-500 hover:translate-x-2 transition-all">
                <h3 className="text-xl font-bold text-white">Lost Item #{id}</h3>
                <p className="text-slate-400 text-sm mt-1">Last seen: Engineering Canteen</p>
                <button className="mt-4 text-rose-400 font-black text-xs uppercase tracking-widest hover:underline">View Details</button>
              </div>
            ))}
          </div>
        </section>

        {/* FOUND ITEMS COLUMN */}
        <section>
          <h2 className="text-2xl font-black text-emerald-500 mb-8 flex items-center gap-2 uppercase italic">
            <CheckCircle /> Recently Found
          </h2>
          <div className="space-y-6">
            {[1, 2].map(id => (
              <div key={id} className="bg-slate-800 p-6 rounded-[2rem] shadow-xl border-l-8 border-emerald-500 hover:translate-x-2 transition-all">
                <h3 className="text-xl font-bold text-white">Found Item #{id}</h3>
                <p className="text-slate-400 text-sm mt-1">Found at: Library Floor 2</p>
                <button className="mt-4 text-emerald-400 font-black text-xs uppercase tracking-widest hover:underline">View Details</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}