import React, { useState, useEffect, useMemo } from 'react';
import { Tag, MapPin, Loader2, Calendar, Clock } from 'lucide-react';
import LostItemDetails from './LostItemDetails';

export default function Dashboard({ onViewMatches, onCreateReport, currentUser, showMatches = false, matchedPairs = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const categories = ['All', 'Electronics', 'IDs/Documents', 'Keys', 'Wallets/Bags', 'Books/Stationary', 'Other'];

  // State for the new detail view
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch real items from your FastAPI backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:8000/items/");
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

  // Filter items to only show 'Lost' items and apply the category filter
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Backend uses item_type ('Lost' or 'Found')
      const isLost = item.item_type?.toLowerCase() === 'lost' || item.type?.toLowerCase() === 'lost';
      const categoryMatch = activeFilter === 'All' || item.category === activeFilter;
      return isLost && categoryMatch;
    });
  }, [items, activeFilter]);

  // Handler for opening the detail view
  const handleItemClick = (item) => {
    setSelectedLostItem(item);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10 font-sans">
      <header className="mb-10 pb-6 border-b border-slate-700/50">
        <h1 className="text-4xl font-black text-indigo-400">Lost&Found Hub</h1>
      </header>

      {/* Main Lost Items Grid */}
      <section>
        {/* Filter Chips */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-3 scrollbar-hide">
          {categories.map(category => (
            <button 
              key={category} 
              onClick={() => setActiveFilter(category)} 
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold transition border ${
                activeFilter === category 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="font-semibold">Loading items from database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium">
            No lost items found for this category.
          </div>
        ) : (
          /* Item Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {(filteredItems || []).map(item => (
              <div 
                key={item.id} 
                className="bg-slate-950/50 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl transition hover:shadow-indigo-500/10 hover:border-indigo-500/50 flex flex-col group cursor-pointer" 
                onClick={() => handleItemClick(item)}
              >
                
                {/* 1. Image Section with Category & Status Tags */}
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center border-b border-slate-700/50 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title || "Lost Item"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-slate-600 font-bold text-sm">No Image</span>
                  )}
                  {/* LOST Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-orange-500/90 text-white shadow-sm backdrop-blur-sm">
                      LOST
                  </span>
                  {/* Category Badge */}
                  {item.category && (
                    <span className="absolute top-4 right-4 flex items-center gap-1 text-white text-[10px] font-bold bg-slate-800/90 px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
                      <Tag size={12} className="text-slate-300"/> {item.category}
                    </span>
                  )}
                </div>

                {/* 2. Middle Body: Title, Description, Date/Time */}
                <div className="p-5 flex-grow flex flex-col">
                   <div className="mb-4">
                       <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition truncate">{item.title}</h3>
                       {/* Line-clamp-2 keeps the description to exactly 2 lines so cards stay the same height */}
                       <p className="text-slate-400 text-sm line-clamp-2 mt-1.5 leading-relaxed">{item.description}</p>
                   </div>

                   {/* Date & Time at the bottom of the middle section */}
                   <div className="flex items-center gap-4 text-slate-300 text-xs mt-auto pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-emerald-400"/>
                          <span className="font-medium">{item.date || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-sky-400"/>
                          <span className="font-medium">{item.time || "N/A"}</span>
                      </div>
                   </div>
                </div>

                {/* 3. Bottom Footer: Location */}
                <div className="p-4 bg-slate-900/50 border-t border-slate-700/50 flex items-center text-slate-200">
                  <div className="flex items-center gap-2.5 w-full">
                      <div className="p-1.5 bg-slate-800 rounded-md"><MapPin size={16} className="text-indigo-400"/></div>
                      <p className="text-sm font-bold truncate">{item.location}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
        </section>
     
       {/* Conditionally Render the Detail Modal */}
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