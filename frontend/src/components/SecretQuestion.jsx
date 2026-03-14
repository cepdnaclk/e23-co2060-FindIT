import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

export default function SecretQuestion({ item, onSuccess, onBack }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verify answer against the real data from the database (case insensitive for UX)
    if (answer.trim().toLowerCase() === item.secret_answer.toLowerCase()) {
      onSuccess();
    } else {
      setError("Incorrect answer. Please try again.");
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
          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg">
            Verify & View Item
          </button>
        </form>
      </div>
    </div>
  );
}