import { ArrowLeft, Camera, X, Lock } from 'lucide-react';

export default function ReportForm({ 
  reportType, setView, selectedImage, setSelectedImage, handleImageChange, 
  formData, handleInputChange, handleSubmit, CATEGORIES 
}) {
  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-3xl shadow-2xl my-10 border border-slate-700 animate-in slide-in-from-bottom-4">
      <button onClick={() => setView('selection')} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition font-bold"><ArrowLeft size={20} /> Back</button>
      <h2 className="text-3xl font-black mb-8 text-indigo-400 uppercase italic">Report {reportType} Item</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-500 uppercase">Item Image {reportType === 'found' && '*'}</label>
          <div className="relative group flex items-center justify-center w-full h-48 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all">
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-rose-600 p-1 rounded-full shadow-lg"><X size={16} /></button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Camera size={40} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm text-slate-500">Tap to capture / upload</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} required={reportType === 'found'} />
              </label>
            )}
          </div>
        </div>

        <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-indigo-500">
          <option value="">Select Category *</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat.toLowerCase()}>{cat}</option>)}
        </select>

        <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Title (e.g. Silver Laptop)" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none" required />

        <div className="grid grid-cols-2 gap-4">
          <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="bg-slate-900 border border-slate-700 p-4 rounded-xl" required />
          <input type="time" name="time" value={formData.time} onChange={handleInputChange} step="1800" className="bg-slate-900 border border-slate-700 p-4 rounded-xl" required />
        </div>

        <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (e.g. Canteen)" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl" required />

        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Unique details (colors, stickers, brand)..." className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl h-32" required />

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 space-y-4">
          <p className="text-xs font-black text-indigo-500 uppercase flex items-center gap-2"><Lock size={14} /> Security Verification</p>
          <input type="text" name="secretQ" value={formData.secretQ} onChange={handleInputChange} placeholder="Secret Question" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" required />
          <input type="text" name="secretA" value={formData.secretA} onChange={handleInputChange} placeholder="Secret Answer" className="w-full border border-slate-700 p-3 bg-slate-900 rounded-xl" required />
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-500 transition shadow-lg">
          {reportType === 'found' ? 'SUBMIT FOUND ITEM' : 'SEARCH FOR MATCHES'}
        </button>
      </form>
    </div>
  );
}