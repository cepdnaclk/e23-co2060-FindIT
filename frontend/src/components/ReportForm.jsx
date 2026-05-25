import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, X, Lock, Loader2, AlertCircle } from 'lucide-react';
import { compressAndUploadImage } from '../uploadLogic'; // Ensure path is correct
import { getApiUrl } from '../config';

export default function ReportForm({ 
  reportType, setView, selectedImage, setSelectedImage, 
  formData, handleInputChange, handleSubmit, CATEGORIES, setFormData, handleImageChange 
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  // NEW: Auto-fill Date and Time when the form loads
  useEffect(() => {
    // We only auto-fill if the fields are empty
    if (!formData.date || !formData.time) {
      const now = new Date();
      
      // Format Date to YYYY-MM-DD (Required by HTML date inputs)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      // Format Time to HH:MM (Required by HTML time inputs)
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      // Update the form state with the current local time
      setFormData(prev => ({
        ...prev,
        date: prev.date || `${year}-${month}-${day}`,
        time: prev.time || `${hours}:${minutes}`
      }));
    }
  }, []); // The empty array [] means this runs exactly once when the form opens
  // Helper to handle the automatic AI scan for FOUND items
  const handleAutoAIUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Show preview locally
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target.result);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setScanError(null);

    try {
      // 2. Upload to Cloudinary[cite: 2]
      const uploadedUrl = await compressAndUploadImage(file);
      
      // 3. Call Backend for Gemini Analysis
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/items/analyze-found-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: uploadedUrl })
      });

      if (response.ok) {
        const aiData = await response.json();
        // 4. Pre-fill the form with AI results
        setFormData({
          ...formData,
          title: aiData.title || "",
          category: aiData.category || "Other",
          description: aiData.description || "",
          secretQ: aiData.secret_question || "",
          secretA: aiData.secret_answer || "",
          image_url: uploadedUrl
        });
      } else {
        throw new Error("AI analysis failed. Please fill the form manually.");
        setImageFile(file);
      }
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-3xl shadow-2xl my-10 border border-slate-700 animate-in slide-in-from-bottom-4">
      <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition font-bold">
        <ArrowLeft size={20} /> Back
      </button>
      
      <h2 className="text-3xl font-black mb-8 text-indigo-400 uppercase italic">
        Report {reportType} Item
      </h2>

      {/* --- AI SCANNER ZONE (Only for Found Items)[cite: 1] --- */}
      {reportType === 'found' && !selectedImage && (
        <div className="mb-8 p-10 bg-slate-900 rounded-3xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 transition-all flex flex-col items-center text-center">
          {isScanning ? (
            <div className="flex flex-col items-center text-emerald-400 py-4">
              <Loader2 className="animate-spin mb-4" size={48} />
              <span className="text-xl font-bold animate-pulse">Gemini AI is scanning...</span>
              <p className="text-slate-500 text-sm mt-2">Identifying item and generating security questions</p>
            </div>
          ) : (
            <label className="cursor-pointer group">
              <div className="p-6 bg-emerald-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Camera size={50} className="text-emerald-500" />
              </div>
              <span className="text-white text-2xl font-black block">SNAP A PHOTO</span>
              <p className="text-slate-400 mt-2">Let our AI fill the report for you instantly</p>
              <input type="file" accept="image/*" onChange={handleAutoAIUpload} className="hidden" />
            </label>
          )}
        </div>
      )}

      {scanError && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-medium">
          <AlertCircle size={20} /> {scanError}
        </div>
      )}

      {/* --- MANUAL FORM (Visible after image select or for Lost reports) --- */}
      <form onSubmit={handleSubmit} className={`space-y-6 ${(reportType === 'found' && !selectedImage && !isScanning) ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Progress label for Found items[cite: 1] */}
        {reportType === 'found' && selectedImage && (
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-grow bg-slate-700"></div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verify AI Details</span>
            <div className="h-px flex-grow bg-slate-700"></div>
          </div>
        )}

        {/* Image Preview / Manual Upload for Lost[cite: 2] */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Item Image</label>
          <div className="relative group flex items-center justify-center w-full h-56 bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl overflow-hidden hover:border-indigo-500 transition-all">
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-rose-600 p-2 rounded-full text-white hover:bg-rose-500 transition shadow-lg">
                  <X size={20} />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-indigo-400 w-full h-full">
                <Camera size={40} className="mb-2" />
                <span className="font-bold text-sm">Add Photo Manually</span>
                <input type="file" accept="image/*" onChange={(e) => {
                   // For manual mode, use the standard handler
                   handleImageChange(e); 
                }} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Standard Form Inputs[cite: 2] */}
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Item Name" className="col-span-2 bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none focus:border-indigo-500 text-white" required />
          
          <select name="category" value={formData.category} onChange={handleInputChange} className="col-span-2 bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none text-slate-300" required>
            <option value="" disabled>Select Category</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none text-white" required />
          <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none text-white" required />
          
          <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (e.g. Canteen)" className="col-span-2 bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none text-white" required />
        </div>

        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Identifying marks..." className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none min-h-[120px] text-white" required></textarea>
        
        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Contact Number" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none text-white" required />

        {/* Security Section */}
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700 space-y-4">
          <p className="text-xs font-black text-indigo-400 uppercase flex items-center gap-2 tracking-widest"><Lock size={14} /> Security Verification</p>
          <input type="text" name="secretQ" value={formData.secretQ} onChange={handleInputChange} placeholder="Secret Question" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" required />
          <input type="text" name="secretA" value={formData.secretA} onChange={handleInputChange} placeholder="Secret Answer" className="w-full border border-slate-700 p-3 bg-slate-900 rounded-xl text-white outline-none" required />
        </div>
        
        <button type="submit" disabled={isScanning} className="w-full py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50">
          {reportType === 'found' ? 'Finalize Found Report' : 'Submit Lost Report'}
        </button>
      </form>
    </div>
  );
}