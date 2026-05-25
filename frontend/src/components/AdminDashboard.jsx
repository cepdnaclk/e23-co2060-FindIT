import React, { useState, useEffect } from 'react';
import { Trash2, ShieldCheck, Package, AlertCircle, CheckCircle2, Search, X } from 'lucide-react'; // Added X
import { getApiUrl } from '../config';

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingAlert, setViewingAlert] = useState(null); 

  const apiUrl = `${getApiUrl()}/items/`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, alertsRes] = await Promise.all([
        fetch(apiUrl),
        fetch(`${getApiUrl()}/admin/alerts`)
      ]);
      
      const itemsData = itemsRes.ok ? await itemsRes.json() : [];
      const alertsData = alertsRes.ok ? await alertsRes.json() : [];
      
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (alert) => {
    if (!window.confirm(`Force approve claim for ID #${alert.found_item.id}?`)) return;

    try {
      const response = await fetch(`${getApiUrl()}/admin/force-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          found_item_id: alert.found_item.id,
          claimer_email: alert.claimer_email
        })
      });

      if (response.ok) {
        alert("Override successful!");
        setViewingAlert(null); // Close modal
        fetchData(); // Refresh both lists
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to override");
      }
    } catch (err) { alert("Server error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    const response = await fetch(`${apiUrl}${id}`, { method: 'DELETE' });
    if (response.ok) setItems(items.filter(item => item.id !== id));
  };

  if (loading) return <div className="text-white p-10 text-center">Loading dashboard...</div>;

  const stats = {
    total: items.length,
    lost: items.filter(i => i.item_type?.toLowerCase() === 'lost').length,
    found: items.filter(i => i.item_type?.toLowerCase() === 'found').length,
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="text-indigo-500" size={36} /> Admin Panel
          </h1>
        </div>
        <div className="flex gap-4">
          <StatCard icon={<Package className="text-sky-400" />} label="Total" value={stats.total} />
          <StatCard icon={<AlertCircle className="text-rose-400" />} label="Lost" value={stats.lost} />
          <StatCard icon={<CheckCircle2 className="text-emerald-400" />} label="Found" value={stats.found} />
        </div>
      </div>

      {/* Security Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-rose-900/20 border border-rose-500/30 p-6 rounded-3xl">
          <h2 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
            <AlertCircle /> Active Security Lockouts
          </h2>
          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.alert_id} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center">
                <span><strong>{a.found_item?.title || "Item"}</strong> - {a.claimer_email}</span>
                {/* CHANGED: Review Reports button opens modal */}
                <button 
                  onClick={() => setViewingAlert(a)} 
                  className="bg-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-500"
                >
                  Review Reports
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden">
        <input 
          className="w-full bg-slate-900 p-4 outline-none text-white" 
          placeholder="Search items..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
            <tr><th className="p-6">Item</th><th>Type</th><th>Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td className="p-6">{item.title}</td>
                <td className="p-6">{item.item_type}</td>
                <td className="p-6">
                  <button onClick={() => handleDelete(item.id)} className="text-rose-500"><Trash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD THIS MODAL AT THE BOTTOM --- */}
      {viewingAlert && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <button onClick={() => setViewingAlert(null)} className="mb-6 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
              <X size={32} />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FullItemView item={viewingAlert.lost_item} title="Lost Item Report" />
              <FullItemView item={viewingAlert.found_item} title="Found Item Report" />
            </div>
            
            <button 
              onClick={() => handleOverride(viewingAlert)} 
              className="mt-8 w-full py-4 bg-emerald-600 rounded-xl font-black text-xl hover:bg-emerald-500 transition"
            >
              Approve Claim & Override
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- ADD THIS HELPER COMPONENT AT THE BOTTOM ---
function FullItemView({ item, title }) {
  if (!item) return <div className="text-slate-500 p-10 text-center border border-slate-700 rounded-3xl">Report missing</div>;
  return (
    <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
      <h3 className="text-indigo-400 font-black uppercase tracking-widest mb-4">{title}</h3>
      {item.image_url && <img src={item.image_url} className="w-full h-64 object-cover rounded-2xl mb-6" />}
      <h2 className="text-2xl font-bold text-white">{item.title}</h2>
      <p className="text-slate-400 mt-2 mb-6">{item.description}</p>
      <div className="space-y-2 text-sm text-slate-300">
        <p><strong>Category:</strong> {item.category}</p>
        <p><strong>Location:</strong> {item.location}</p>
        <p><strong>Date/Time:</strong> {item.date} {item.time}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-800 p-4 rounded-2xl flex items-center gap-4">
      <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
      <div>
        <div className="text-xs text-slate-500 font-bold uppercase">{label}</div>
        <div className="text-xl font-black">{value}</div>
      </div>
    </div>
  );
}