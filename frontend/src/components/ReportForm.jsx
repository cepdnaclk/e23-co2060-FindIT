import { ArrowLeft, Camera, X, Lock } from 'lucide-react';

export default function ReportForm({ 
  reportType, setView, selectedImage, setSelectedImage, handleImageChange, 
  formData, handleInputChange, handleSubmit, CATEGORIES 
}) {
  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-3xl shadow-2xl my-10 border border-slate-700 animate-in slide-in-from-bottom-4">
      <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition font-bold"><ArrowLeft size={20} /> Back</button>
      <h2 className="text-3xl font-black mb-8 text-indigo-400 uppercase italic">Report {reportType} Item</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-500 uppercase">Item Image {reportType === 'found' && '*'}</label>
          <div className="relative group flex items-center justify-center w-full h-48 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all">
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:scale-110 transition">
                  <X size={16} />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-indigo-400 w-full h-full">
                <Camera size={40} className="mb-2" />
                <span className="font-bold">Upload Image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Item Name (e.g. Blue Backpack)" className="col-span-2 bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none focus:border-indigo-500" required />
          <select name="category" value={formData.category} onChange={handleInputChange} className="col-span-2 bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none" required>
            <option value="" disabled>Select Category</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none" required />
          <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none" required />
          <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (e.g. Library 2nd Floor)" className="col-span-2 bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none" required />
        </div>

        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Detailed Description (Color, brand, identifying marks...)" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none min-h-[120px]" required></textarea>
        
        <input 
          type="tel" 
          name="phone" 
          value={formData.phone} 
          onChange={handleInputChange}
          placeholder="Your Phone Number (e.g. 0771234567)" 
          className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none" 
          required 
        />

        {/*Security Verification box*/}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 space-y-4">
          <p className="text-xs font-black text-indigo-500 uppercase flex items-center gap-2"><Lock size={14} /> Security Verification</p>
          <input 
            type="text" 
            name="secretQ" 
            value={formData.secretQ} 
            onChange={handleInputChange} 
            placeholder="Secret Question (e.g. What is the wallpaper?)" 
            className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" 
            required 
          />
          <input 
            type="text" 
            name="secretA" 
            value={formData.secretA} 
            onChange={handleInputChange} 
            placeholder="Secret Answer" 
            className="w-full border border-slate-700 p-3 bg-slate-900 rounded-xl" 
            required 
          />
        </div>
        
        {/* --- SUBMIT BUTTON --- */}
        <button type="submit" className="w-full py-4 rounded-xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all bg-indigo-600 hover:bg-indigo-500 text-white">
          Submit Report
        </button>
      </form>
    </div>
  );
}