import { useState } from 'react';
import { ArrowLeft, ShieldCheck, Loader2, Sparkles, Mail, LockKeyhole } from 'lucide-react';
import { Button, Card, Badge, Input } from './ui';

export default function Gatekeeper({ type, onBack, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Send the OTP to the user's email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const allowedEmails = import.meta.env.VITE_ADMIN_EMAILS
        ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map((email) => email.trim())
        : ['lilly.manu94@gmail.com'];
      const isAllowed = formData.email.endsWith('@eng.pdn.ac.lk') || allowedEmails.includes(formData.email);

      if (!isAllowed) {
        throw new Error('Access restricted: Please use your university email.');
      }

      const apiUrl = import.meta.env.VITE_API_URL;

      // DIAGNOSTIC LOG: This will print exactly where the app is sending the request
      const targetUrl = `${apiUrl}/send-otp`;
      console.log('🚀 ATTEMPTING TO SEND OTP TO:', targetUrl);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name }),
      });

      if (!response.ok) {
        // BULLETPROOF ERROR HANDLING: Read as raw text first
        const errorText = await response.text();
        console.error(`❌ RAW BACKEND RESPONSE (${response.status}):`, errorText);

        let errData = {};
        try {
          errData = JSON.parse(errorText); // Try to convert to JSON safely
        } catch {
          throw new Error(`Server returned Error ${response.status}. Open F12 Console for details.`);
        }

        throw new Error(errData.detail || 'Failed to send OTP.');
      }

      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify the OTP the user entered
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const targetUrl = `${apiUrl}/verify-otp`;
      console.log('🚀 ATTEMPTING TO VERIFY OTP AT:', targetUrl);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ RAW BACKEND RESPONSE (${response.status}):`, errorText);

        let errData = {};
        try {
          errData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server returned Error ${response.status}. Open F12 Console for details.`);
        }

        throw new Error(errData.detail || 'Invalid or expired OTP.');
      }

      onSuccess(formData.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <Card className="relative w-full max-w-md overflow-hidden border-slate-800/80 bg-slate-900/80 p-0 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_30%)]" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <Button
            onClick={step === 'email' ? onBack : () => setStep('email')}
            variant="ghost"
            size="sm"
            className="rounded-full px-3 py-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Button>

          <div className="mt-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
              <ShieldCheck size={22} />
            </div>
            <Badge variant="verified" className="mb-4 px-3 py-1.5 text-[11px]">
              Secure access
            </Badge>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {step === 'email' ? (type === 'signin' ? 'Create Account' : 'Welcome Back') : 'Verify Identity'}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400 sm:text-base">
              {step === 'email'
                ? 'Enter your university email to begin the protected verification flow.'
                : `We sent a 6-digit code to ${formData.email}`}
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Badge variant={step === 'email' ? 'pending' : 'verified'} className="px-3.5 py-1.5 text-[11px]">
              {step === 'email' ? 'Step 1 of 2' : 'Step 2 of 2'}
            </Badge>
          </div>

          {error && (
            <Card className="mt-6 border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-rose-500/20 p-1.5">
                  <ShieldCheck size={14} />
                </div>
                <p className="text-sm font-medium leading-6">{error}</p>
              </div>
            </Card>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
              {type === 'signin' && (
                <Input
                  label="Full name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm text-white transition focus:border-indigo-500"
                  required
                />
              )}

              <Input
                label="University email"
                type="email"
                placeholder="University Email (@eng.pdn.ac.lk)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm text-white transition focus:border-indigo-500"
                required
              />

              <Button disabled={loading} type="submit" className="w-full justify-center py-4 text-base shadow-lg shadow-indigo-900/20">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Send OTP
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5 animate-in slide-in-from-right-4">
              <Card className="border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-500/20 p-1.5">
                    <LockKeyhole size={14} />
                  </div>
                  <p className="leading-6">Enter the verification code we just sent to your inbox.</p>
                </div>
              </Card>

              <Input
                label="Verification code"
                type="text"
                placeholder="6-Digit Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border-slate-700 bg-slate-950/70 px-4 py-3.5 text-center text-2xl font-mono tracking-[0.35em] text-white transition focus:border-emerald-500"
                maxLength={6}
                required
              />

              <Button disabled={loading} type="submit" className="w-full justify-center py-4 text-base shadow-lg shadow-emerald-900/20">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Verify & Enter
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}