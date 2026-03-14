import React from 'react';
import { X, MapPin, Calendar, Clock, Tag } from 'lucide-react';

const LostItemDetails = ({ item, onClose }) => {
  if (!item) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-4xl rounded-3xl p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Image Section */}
          <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-700">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-600 font-bold p-6 text-center">No Image Provided</div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white">{item.title}</h2>
            
            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${item.status === 'lost' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                {item.type} Item
              </span>
              {item.category && (
                 <span className="flex items-center gap-1.5 text-slate-400 text-sm bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600">
                    <Tag size={16}/> {item.category}
                 </span>
              )}
            </div>

            <p className="text-slate-300 text-lg leading-relaxed">{item.description}</p>
            
            <div className="space-y-4 pt-4 border-t border-slate-700/50">
               {/* Location */}
              <div className="flex items-center gap-3 text-slate-200">
                <div className="p-2.5 bg-slate-700 rounded-lg"><MapPin size={20} className="text-indigo-400"/></div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Location Lost</div>
                  <div className="font-semibold text-lg">{item.location}</div>
                </div>
              </div>

               {/* Date & Time */}
              <div className="flex items-center gap-8 text-slate-200">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-700 rounded-lg"><Calendar size={20} className="text-emerald-400"/></div>
                    <div>
                        <div className="text-xs text-slate-400 font-medium">Date Lost</div>
                        <div className="font-semibold text-lg">{formatDate(item.date)}</div>
                    </div>
                 </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-700 rounded-lg"><Clock size={20} className="text-sky-400"/></div>
                    <div>
                        <div className="text-xs text-slate-400 font-medium">Time Lost</div>
                        <div className="font-semibold text-lg">{formatTime(item.time)}</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostItemDetails;