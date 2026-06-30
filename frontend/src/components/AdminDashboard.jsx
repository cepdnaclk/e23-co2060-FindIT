import React, { useState, useEffect } from 'react';
import { Trash2, ShieldCheck, Package, AlertCircle, CheckCircle2, Search, X, Calendar, Clock, MapPin, Tag } from 'lucide-react';
import { getApiUrl } from '../config';

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingAlert, setViewingAlert] = useState(null); 
  const [activeFilter, setActiveFilter] = useState('All');

  const apiUrl = `${getApiUrl()}/admin/items`;

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

  const handleOverride = async (alertRecord) => {
    if (!window.confirm(`Force approve claim and override verification for this match?`)) return;

    try {
      const response = await fetch(`${getApiUrl()}/admin/force-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          found_item_id: alertRecord.found_item?.id,
          claimer_email: alertRecord.claimer_email
        })
      });

      if (response.ok) {
        window.alert("Verification overridden successfully! Notification sent to user.");
        setViewingAlert(null);
        fetchData();
      } else {
        const err = await response.json();
        window.alert(`Failed to override: ${err.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error executing override:", error);
      window.alert("Network error executing override request.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this report permanently?")) return;

    try {
      const response = await fetch(`${apiUrl}/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
      } else {
        window.alert("Failed to delete the report.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Filter items matching the search input and the type filters (All, Lost, Found)
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const type = (item.item_type || item.type || '').toLowerCase();
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Lost') return matchesSearch && type === 'lost';
    if (activeFilter === 'Found') return matchesSearch && type === 'found';
    return matchesSearch;
  });

  const lostCount = items.filter(i => (i.item_type || i.type || '').toLowerCase() === 'lost').length;
  const foundCount = items.filter(i => (i.item_type || i.type || '').toLowerCase() === 'found').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-white min-h-screen">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-950 p-8 rounded-3xl border border-slate-700/60 shadow-xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-indigo-400" size={38} />
            Admin Control Center
          </h1>
          <p className="text-slate-400 mt-2">Manage user lockouts, override verification claims, and review system reports.</p>
        </div>
        
        {/* Statistics Widgets */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={<Package className="text-indigo-400" />} label="Total Records" value={items.length} />
          <StatCard icon={<AlertCircle className="text-rose-400" />} label="Lost Reports" value={lostCount} />
          <StatCard icon={<CheckCircle2 className="text-emerald-400" />} label="Found Reports" value={foundCount} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left/Middle Column: Global System Reports Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
              {['All', 'Lost', 'Found'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
                    activeFilter === filter 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search global feed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center p-20 text-slate-500 font-medium">Loading records...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center p-20 bg-slate-800/50 border border-dashed border-slate-700 rounded-3xl text-slate-500">
              No matching records found in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col group relative">
                  
                  {/* Badge Row */}
                  <div className="p-4 pb-0 flex justify-between items-start z-10">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                      (item.item_type || item.type || '').toLowerCase() === 'lost' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {item.item_type || item.type}
                    </span>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 bg-slate-900/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700/50 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="p-5 pt-3 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold line-clamp-1 text-white group-hover:text-indigo-400 transition mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                    
                    <div className="space-y-2 pt-3 border-t border-slate-700/60 text-xs text-slate-300">
                      <div className="flex items-center gap-2"><Tag size={13} className="text-indigo-400" /> <span>{item.category}</span></div>
                      <div className="flex items-center gap-2"><MapPin size={13} className="text-sky-400" /> <span>{item.location}</span></div>
                      <div className="flex items-center gap-2"><Calendar size={13} className="text-emerald-400" /> <span>{item.date}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Action Messages Box */}
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <h2 className="text-lg font-black tracking-wider uppercase text-indigo-400 mb-4 flex items-center gap-2">
              <AlertCircle size={18} /> Verification Warnings
            </h2>
            
            {alerts.length === 0 ? (
              <div className="text-slate-500 text-sm py-6 text-center border border-dashed border-slate-700 rounded-xl">
                No locked out verification messages at this time.
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div 
                    key={index}
                    onClick={() => setViewingAlert(alert)}
                    className="p-4 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition flex flex-col gap-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">VERIFICATION LOCKED</span>
                      <span className="text-[11px] text-slate-500 font-mono">ID Match #{alert.found_item?.id || '?' }</span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium group-hover:text-white line-clamp-2">
                      User matching verification locked out on item <strong>"{alert.found_item?.title}"</strong>. Click to inspect match and override.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Side-by-Side Verification Match & Override Modal */}
      {viewingAlert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-5xl rounded-[2rem] border border-slate-700 shadow-2xl p-8 max-h-[90vh] overflow-y-auto flex flex-col relative">
            
            <button 
              onClick={() => setViewingAlert(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-white">Compare Matching Reports</h2>
              <p className="text-slate-400 text-sm mt-1">Review the side-by-side details below. You can override the lock mechanism to bridge communication channels.</p>
            </div>

            {/* Twin Item Layout Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mb-8">
              <FullItemView title="Lost Item Report" item={viewingAlert.lost_item} accent="rose" />
              <FullItemView title="Found Item Report" item={viewingAlert.found_item} accent="emerald" />
            </div>

            {/* Bottom Actions Frame */}
            <div className="flex items-center justify-end gap-4 border-t border-slate-800 pt-6">
              <button 
                onClick={() => setViewingAlert(null)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition"
              >
                Close View
              </button>
              <button 
                onClick={() => handleOverride(viewingAlert)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black shadow-lg shadow-indigo-600/20 transition"
              >
                Approve Claim & Override Lock
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function FullItemView({ item, title, accent }) {
  if (!item) return <div className="text-slate-500 p-10 text-center border border-slate-800 bg-slate-900/50 rounded-2xl flex items-center justify-center italic">Report details unavailable</div>;
  
  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col">
      <h3 className={`font-black text-xs uppercase tracking-widest mb-3 ${accent === 'rose' ? 'text-rose-400' : 'text-emerald-400'}`}>
        {title}
      </h3>
      {item.image_url && (
        <img src={item.image_url} alt={item.title} className="w-full h-44 object-cover rounded-xl mb-4 border border-slate-700" />
      )}
      <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
      <p className="text-slate-300 text-sm flex-1 mb-4 leading-relaxed">{item.description}</p>
      
      <div className="p-4 bg-slate-900/60 rounded-xl space-y-2 border border-slate-700/50 text-xs text-slate-300">
        <p><strong className="text-slate-400">Reporter Email:</strong> {item.owner_email || 'Not provided'}</p>
        <p><strong className="text-slate-400">Contact Number:</strong> {item.contact_number || 'Not provided'}</p>
        <p><strong className="text-slate-400">Category:</strong> {item.category}</p>
        <p><strong className="text-slate-400">Location Context (Venue):</strong> {item.location}</p>
        <p><strong className="text-slate-400">Date/Time:</strong> {item.date} {item.time}</p>
        
        {item.secret_question && (
          <div className="pt-2 mt-2 border-t border-slate-800">
            <p className="text-amber-400 font-semibold">Secret Verification Question:</p>
            <p className="text-slate-400 italic font-mono">"{item.secret_question}"</p>
          </div>
        )}
        {item.secret_answer && (
          <div className="pt-1">
            <p className="text-emerald-400 font-semibold">Secret Verification Answer:</p>
            <p className="text-slate-400 italic font-mono">"{item.secret_answer}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center min-w-[100px]">
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">{label}</span>
      <span className="text-xl font-black text-white mt-0.5">{value}</span>
    </div>
  );
}
