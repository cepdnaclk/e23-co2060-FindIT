import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '../config';

export default function SecretQuestion({ item, userEmail, onSuccess, onBack }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center">
          <p className="text-rose-400 font-bold text-lg mb-4">Error: Item details not found.</p>
          <button onClick={onBack} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition font-bold text-white shadow-lg">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send the guess to the FastAPI backend
      const apiUrl = `${getApiUrl()}/items/verify-claim`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          user_answer: answer,
          user_email: userEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Success! Pass the DECRYPTED phone number back to App.jsx
        onSuccess(data.phone_number);
      } else {
        const errData = await response.json();
        
        // 3. SAFETY CHECK: If FastAPI sends an array (422 error), handle it gracefully
        if (Array.isArray(errData.detail)) {
            setError("Validation error: Please ensure all fields are sent.");
        } else {
            // Otherwise, it's a normal string error (like your 403 Lockout error)
            setError(errData.detail || "Incorrect answer. Please try again.");
        }
        
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 animate-in zoom-in duration-300">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 relative">
        <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex flex-col items-center mb-6 mt-4">
          <div className="p-4 bg-indigo-500/20 rounded-full mb-4">
            <Lock size={32} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-white text-center">Verify Ownership</h2>
          <p className="text-slate-400 text-sm text-center mt-2">To view the details of this found item, please answer the secret question set by the finder.</p>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 mb-6 text-center">
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-1">Question</p>
          <p className="text-white text-lg font-medium">{item.secret_question}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setError(''); }}
              placeholder="Enter your answer..."
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-indigo-500 transition"
              required
            />
            {error && <p className="text-rose-400 text-sm mt-2 font-medium">{error}</p>}
          </div>
          <button disabled={loading} type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg">
            {loading ? 'Verifying...' : 'Verify & View Item'}
          </button>
        </form>
      </div>
    </div>
  );
}