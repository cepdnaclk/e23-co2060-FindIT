import React, { useState } from 'react';
import { Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { getApiUrl } from '../config';
import { Button, Card, Badge, Input } from './ui';

export default function SecretQuestion({ item, userEmail, onSuccess, onBack }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  if (!item) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-rose-500/20 bg-slate-950/80 p-8 text-center shadow-2xl shadow-slate-950/40">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
            <Lock size={24} />
          </div>
          <p className="text-lg font-semibold text-white">Unable to load verification details.</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The item information could not be found. Please return to the dashboard and try again.
          </p>
          <Button onClick={onBack} variant="secondary" className="mt-6 w-full">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </Card>
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
        const errorMessage = errData.detail || "Incorrect answer. Please try again.";

        // 3. SAFETY CHECK: If FastAPI sends an array (422 error), handle it gracefully
        if (Array.isArray(errData.detail)) {
          setError("Validation error: Please ensure all fields are sent.");
        } else {
          // Otherwise, it's a normal string error (like your 403 Lockout error)
          setError(errorMessage);
          if (response.status === 403 && errorMessage.toLowerCase().includes("locked")) {
            setIsLocked(true);
          }
        }
      }
    } catch  {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6 lg:px-8 animate-in zoom-in duration-300">
      <Card className="relative w-full max-w-2xl overflow-hidden border-slate-800/80 bg-slate-950/80 p-0 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-900/80 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                <Lock size={24} />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight text-white">Verify Ownership</h2>
                  <Badge variant="verified">Secure Verification</Badge>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  To view the details of this found item, please answer the secret question set by the finder.
                </p>
              </div>
            </div>

            <Button onClick={onBack} variant="ghost" size="sm" className="shrink-0 px-0 text-slate-400 hover:text-white">
              <ArrowLeft size={18} />
              Back
            </Button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <Card className="mb-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-900 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="pending">Question</Badge>
            </div>
            <p className="text-lg font-semibold text-white">{item.secret_question}</p>
          </Card>

          {error && (
            <Card className="mb-6 border-rose-500/20 bg-rose-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-300" />
                <div>
                  <p className="text-sm font-semibold text-rose-300">Verification issue</p>
                  <p className="mt-1 text-sm text-rose-100/90">{error}</p>
                </div>
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Your answer"
              type="text"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setError(''); }}
              placeholder={isLocked ? "Verification locked" : "Enter your answer..."}
              className={error ? 'border-rose-500/60' : ''}
              disabled={isLocked || loading}
              required
            />

            <Button disabled={isLocked || loading} type="submit" className="w-full py-4 text-base shadow-lg shadow-indigo-900/30">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </span>
              ) : isLocked ? 'Access Locked' : 'Verify & View Item'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}