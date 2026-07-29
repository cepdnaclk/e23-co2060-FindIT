import React, { useState, useEffect, useMemo } from 'react';
import { Tag, MapPin, Calendar, Clock, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import LostItemDetails from './LostItemDetails';
import { getApiUrl } from '../config';
import Card from './ui/Card';
import Badge from './ui/Badge';

export default function Dashboard({ currentUser }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const categories = ['All', 'Electronics', 'IDs/Documents', 'Keys', 'Wallets/Bags', 'Books/Stationary', 'Other'];

  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const apiUrl = `${getApiUrl()}/items/`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch error:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const isLost = item.item_type?.toLowerCase() === 'lost' || item.type?.toLowerCase() === 'lost';
      const categoryMatch = activeFilter === 'All' || item.category === activeFilter;
      return isLost && categoryMatch;
    });
  }, [items, activeFilter]);

  const stats = useMemo(() => {
    const totalReports = items.length;
    const lostItems = filteredItems.length;
    const categoriesCount = new Set(items.map(item => item.category).filter(Boolean)).size;

    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const todaysReports = items.filter(item => {
      if (!item.date) return false;
      const parsedDate = new Date(item.date);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0] === todayKey;
      }
      return item.date === todayKey;
    }).length;

    return {
      totalReports,
      lostItems,
      categoriesCount,
      todaysReports
    };
  }, [items, filteredItems]);

  const handleItemClick = (item) => {
    setSelectedLostItem(item);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100 px-4 py-8 sm:px-6 md:px-10 lg:px-12 font-sans">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-[32px] border border-white/10 bg-slate-900/70 px-6 py-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-200">
                <Sparkles size={16} />
                Mission control for lost item reports
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                Lost & Found Hub
              </h1>
              <p className="text-base leading-7 text-slate-300 sm:text-lg">
                Stay on top of the latest reports with a polished view of every item, category, and location in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400 shadow-inner shadow-slate-950/50">
              <div className="flex items-center gap-2 font-medium text-slate-200">
                <ShieldCheck size={16} className="text-emerald-400" />
                Real-time dashboard view
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-slate-900/70">
            <p className="text-sm font-medium text-slate-400">Total Reports</p>
            <p className="mt-3 text-3xl font-black text-white">{stats.totalReports}</p>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/70">
            <p className="text-sm font-medium text-slate-400">Lost Items</p>
            <p className="mt-3 text-3xl font-black text-white">{stats.lostItems}</p>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/70">
            <p className="text-sm font-medium text-slate-400">Categories</p>
            <p className="mt-3 text-3xl font-black text-white">{stats.categoriesCount}</p>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/15 to-slate-900/70">
            <p className="text-sm font-medium text-slate-400">Today&apos;s Reports</p>
            <p className="mt-3 text-3xl font-black text-white">{stats.todaysReports}</p>
          </Card>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeFilter === category
                    ? 'border-indigo-400/50 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10'
                    : 'border-slate-700 bg-slate-800/70 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950/60">
                  <div className="h-40 bg-slate-800/80" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-3/4 rounded bg-slate-800" />
                    <div className="h-3 w-full rounded bg-slate-800" />
                    <div className="h-3 w-2/3 rounded bg-slate-800" />
                    <div className="mt-4 h-10 rounded-xl bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-700 bg-slate-950/50 px-8 py-16 text-center">
              <div className="mb-4 rounded-full border border-indigo-400/30 bg-indigo-500/10 p-4 text-indigo-300">
                <Compass size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white">No lost items in this view</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                There are no reports matching the current category right now. Try another filter to explore the full collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(filteredItems || []).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="group overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950/70 text-left shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title || 'Lost Item'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-600">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <Badge variant="lost" className="border-orange-400/30 bg-orange-500/20 text-orange-200">
                        Lost
                      </Badge>
                    </div>
                    {item.category && (
                      <div className="absolute right-4 top-4">
                        <Badge variant="verified" className="border-white/10 bg-slate-900/70 text-slate-100 backdrop-blur">
                          {item.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 p-5">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white transition group-hover:text-indigo-300">{item.title}</h3>
                      <p className="line-clamp-2 text-sm leading-6 text-slate-400">{item.description}</p>
                    </div>

                    <div className="space-y-3 border-t border-slate-800 pt-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-400" />
                        <span className="font-medium">{item.date || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-indigo-400" />
                        <span className="truncate font-medium">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-sky-400" />
                        <span className="font-medium">{item.time || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {showDetails && selectedLostItem && (
        <LostItemDetails
          item={selectedLostItem}
          onClose={() => setShowDetails(false)}
          currentUserEmail={currentUser}
        />
      )}
    </div>
  );
}