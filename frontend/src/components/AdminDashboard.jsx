import React, { useState, useEffect } from 'react';
import { Trash2, ShieldCheck, Package, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react';

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/items/` 
    : "http://localhost:8000/items/";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this report?")) return;
    try {
      const response = await fetch(`${apiUrl}${id}`, { method: 'DELETE' });
      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      alert("Failed to delete item.");
    }
  };

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === 'lost').length,
    found: items.filter(i => i.type === 'found').length,
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="text-indigo-500" size={36} /> Admin Panel
          </h1>
          <p className="text-slate-400 mt-1">Manage all system reports and user activity.</p>
        </div>
        
        <div className="flex gap-4">
          <StatCard icon={<Package className="text-sky-400" />} label="Total" value={stats.total} />
          <StatCard icon={<AlertCircle className="text-rose-400" />} label="Lost" value={stats.lost} />
          <StatCard icon={<CheckCircle2 className="text-emerald-400" />} label="Found" value={stats.found} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text"
          placeholder="Search by title or location..."
          className="w-full bg-slate-800 border border-slate-700 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold tracking-widest">
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Reported By</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-700/30 transition group">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.location}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    item.type === 'lost' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300 text-sm">{item.category}</td>
                <td className="px-6 py-4 text-slate-300 text-sm">{item.owner_email}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="p-20 text-center text-slate-500 font-medium">No items found matching your search.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center gap-4 min-w-[120px]">
      <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
      <div>
        <div className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{label}</div>
        <div className="text-xl font-black text-white">{value}</div>
      </div>
    </div>
  );
}