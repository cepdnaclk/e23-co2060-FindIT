import React from 'react';
import { MapPin, Tag, ArrowLeft, Mail, Phone } from 'lucide-react';

export default function RevealedItemDetails({ item, onBack }) {
  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto my-10 bg-slate-800 border border-slate-700 w-full rounded-3xl p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300">
       <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 font-bold">
          <ArrowLeft size={20} /> Back to Dashboard
       </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-700">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-600 font-bold p-6 text-center">No Image Provided</div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-white mb-3">{item.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Found Item Match
              </span>
              {item.category && (
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600">
                    <Tag size={16}/> {item.category}
                  </span>
              )}
            </div>
          </div>

          <p className="text-slate-300 text-lg leading-relaxed">{item.description}</p>
          
          <div className="space-y-4 pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-3 text-slate-200">
              <div className="p-2.5 bg-slate-700 rounded-lg"><MapPin size={20} className="text-indigo-400"/></div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Location Found</div>
                <div className="font-semibold text-lg">{item.location}</div>
              </div>
            </div>
          </div>

          {/* NEW: Prominent Contact Information Box */}
          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl space-y-4 shadow-inner">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-2">Finder's Contact Info</h3>
            
            {item.owner_email && (
              <div className="flex items-center gap-3 text-slate-200">
                <div className="p-2.5 bg-emerald-900/50 rounded-lg border border-emerald-800/50">
                  <Mail size={18} className="text-emerald-400"/>
                </div>
                <div>
                  <div className="text-xs text-emerald-400/70 font-medium">University Email</div>
                  <div className="font-semibold text-md">{item.owner_email}</div>
                </div>
              </div>
            )}

            {item.contact_number && (
              <div className="flex items-center gap-3 text-slate-200">
                <div className="p-2.5 bg-emerald-900/50 rounded-lg border border-emerald-800/50">
                  <Phone size={18} className="text-emerald-400"/>
                </div>
                <div>
                  <div className="text-xs text-emerald-400/70 font-medium">Phone Number</div>
                  <div className="font-semibold text-md">{item.contact_number}</div>
                </div>
              </div>
            )}
            
            {(!item.owner_email && !item.contact_number) && (
               <div className="text-sm text-emerald-400/70 italic">
                 No contact details provided.
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}