import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, X, Lock, Loader2, AlertCircle } from 'lucide-react';
import { compressAndUploadImage } from '../uploadLogic'; // Ensure path is correct
import { getApiUrl } from '../config';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

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
      }
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="mx-auto my-10 max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-950/40">
        <div className="border-b border-slate-800 bg-slate-900/70 px-6 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <Button onClick={() => setView('dashboard')} variant="ghost" size="sm" className="px-0 text-slate-400 hover:text-white">
                <ArrowLeft size={18} /> Back
              </Button>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-indigo-400 sm:text-3xl">
                  Report {reportType} Item
                </h2>
                <Badge variant={reportType === 'found' ? 'found' : 'lost'}>
                  {reportType === 'found' ? 'Found Report' : 'Lost Report'}
                </Badge>
                {reportType === 'found' && (
                  <Badge variant="verified">AI Assisted</Badge>
                )}
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Share the essential details to help the community identify and return the item quickly.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            {/* --- AI SCANNER ZONE (Only for Found Items)[cite: 1] --- */}
            {reportType === 'found' && !selectedImage && (
              <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 p-6 sm:p-8">
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-emerald-400">
                    <Loader2 className="mb-4 animate-spin" size={48} />
                    <span className="text-xl font-bold">Gemini AI is scanning...</span>
                    <p className="mt-2 text-sm text-slate-400">Identifying item and generating security questions</p>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-500/40 bg-slate-950/70 px-6 py-10 text-center transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500/10">
                    <div className="mb-4 rounded-full bg-emerald-500/10 p-6">
                      <Camera size={44} className="text-emerald-500" />
                    </div>
                    <span className="block text-2xl font-black text-white">SNAP A PHOTO</span>
                    <p className="mt-2 max-w-md text-sm text-slate-400">Let our AI fill the report for you instantly</p>
                    <div className="mt-6">
                      <Button type="button" variant="secondary" size="md" className="pointer-events-none">
                        Choose image
                      </Button>
                    </div>
                    <input type="file" accept="image/*" onChange={handleAutoAIUpload} className="hidden" />
                  </label>
                )}
              </Card>
            )}

            {scanError && (
              <Card className="border-rose-500/30 bg-rose-500/10 p-4">
                <div className="flex items-start gap-3 text-sm font-medium text-rose-300">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{scanError}</span>
                </div>
              </Card>
            )}

            {/* --- MANUAL FORM (Visible after image select or for Lost reports) --- */}
            <form onSubmit={handleSubmit} className={`space-y-6 ${(reportType === 'found' && !selectedImage && !isScanning) ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              {/* Progress label for Found items[cite: 1] */}
              {reportType === 'found' && selectedImage && (
                <div className="flex items-center gap-3">
                  <div className="h-px flex-grow bg-slate-700"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">Verify AI Details</span>
                  <div className="h-px flex-grow bg-slate-700"></div>
                </div>
              )}

              <Card className="overflow-hidden border-slate-800/80 p-0">
                <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Image Upload / AI Scan</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">Item Image</h3>
                    </div>
                    <Badge variant={reportType === 'found' ? 'found' : 'pending'}>
                      {reportType === 'found' ? 'Smart Scan' : 'Manual Upload'}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="relative flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 transition-all duration-200 hover:border-indigo-500">
                    {selectedImage ? (
                      <>
                        <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
                        <Button type="button" onClick={() => setSelectedImage(null)} variant="danger" size="sm" className="absolute right-4 top-4 rounded-full p-2 shadow-lg">
                          <X size={16} />
                        </Button>
                      </>
                    ) : (
                      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center px-6 py-10 text-center text-slate-400 transition-colors hover:text-indigo-400">
                        <Camera size={40} className="mb-3" />
                        <span className="text-base font-semibold text-slate-200">Add Photo Manually</span>
                        <p className="mt-2 text-sm text-slate-500">Upload an image to attach with your report</p>
                        <div className="mt-5">
                          <Button type="button" variant="secondary" size="md" className="pointer-events-none">
                            Browse files
                          </Button>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => {
                           // For manual mode, use the standard handler
                           handleImageChange(e); 
                        }} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-400">
                      <Camera size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Basic Information</p>
                      <h3 className="text-lg font-semibold text-white">Item details</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Item Name" className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-white outline-none transition focus:border-indigo-500" required />

                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-slate-300 outline-none transition focus:border-indigo-500" required>
                      <option value="" disabled>Select Category</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-white outline-none transition focus:border-indigo-500" required />
                      <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-white outline-none transition focus:border-indigo-500" required />
                    </div>

                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (e.g. Canteen)" className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-white outline-none transition focus:border-indigo-500" required />
                  </div>
                </Card>

                <Card className="p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-400">
                      <Lock size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Contact Information</p>
                      <h3 className="text-lg font-semibold text-white">How to reach you</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Identifying marks..." className="min-h-[140px] w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-white outline-none transition focus:border-indigo-500" required></textarea>

                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Contact Number" className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-4 text-white outline-none transition focus:border-indigo-500" required />
                  </div>
                </Card>
              </div>

              <Card className="p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-400">
                    <Lock size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Security Verification</p>
                    <h3 className="text-lg font-semibold text-white">Protect the report</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <input type="text" name="secretQ" value={formData.secretQ} onChange={handleInputChange} placeholder="Secret Question" className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-3 text-white outline-none transition focus:border-indigo-500" required />
                  <input type="text" name="secretA" value={formData.secretA} onChange={handleInputChange} placeholder="Secret Answer" className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-3 text-white outline-none transition focus:border-indigo-500" required />
                </div>
              </Card>

              <Button type="submit" disabled={isScanning} className="w-full py-4 text-lg shadow-lg shadow-indigo-900/30 hover:scale-[1.01]">
                {reportType === 'found' ? 'Finalize Found Report' : 'Submit Lost Report'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}