import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function Gatekeeper({ type, onBack, onSuccess }) { 
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [otp, setOtp] = useState(''); 
  const [step, setStep] = useState('email'); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

// 1. Send the OTP to the user's email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const allowedEmails = import.meta.env.VITE_ADMIN_EMAILS
        ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map(email => email.trim())
        : ["lilly.manu94@gmail.com"];
      const isAllowed = formData.email.endsWith("@eng.pdn.ac.lk") || allowedEmails.includes(formData.email);

      if (!isAllowed) {
      throw new Error("Access restricted: Please use your university email.");
  }

      const apiUrl = import.meta.env.VITE_API_URL;
      
      // DIAGNOSTIC LOG: This will print exactly where the app is sending the request
      const targetUrl = `${apiUrl}/send-otp`;
      console.log("🚀 ATTEMPTING TO SEND OTP TO:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, name: formData.name })
      });

      if (!response.ok) {
        // BULLETPROOF ERROR HANDLING: Read as raw text first
        const errorText = await response.text();
        console.error(`❌ RAW BACKEND RESPONSE (${response.status}):`, errorText);
        
        let errData = {};
        try {
            errData = JSON.parse(errorText); // Try to convert to JSON safely
        } catch (parseError) {
            throw new Error(`Server returned Error ${response.status}. Open F12 Console for details.`);
        }
        
        throw new Error(errData.detail || "Failed to send OTP.");
      }

      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Locate this logic in your Gatekeeper.jsx or login flow
const handleLogin = (userEmail) => {
    // Add your personal email to this whitelist
    const whitelist = import.meta.env.VITE_ADMIN_EMAILS
      ? ["e23382@eng.pdn.ac.lk", ...import.meta.env.VITE_ADMIN_EMAILS.split(',').map(email => email.trim())]
      : ["e23382@eng.pdn.ac.lk", "lilly.manu94@gmail.com"];
    
    if (userEmail.endsWith("@eng.pdn.ac.lk") || whitelist.includes(userEmail)) {
        // Proceed with login
        setAccessGranted(true);
    } else {
        // Show restriction message
        alert("Access restricted: Please use your university email.");
    }
};

  // 2. Verify the OTP the user entered
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const targetUrl = `${apiUrl}/verify-otp`;      
      console.log("🚀 ATTEMPTING TO VERIFY OTP AT:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otp }) 
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ RAW BACKEND RESPONSE (${response.status}):`, errorText);
        
        let errData = {};
        try {
            errData = JSON.parse(errorText);
        } catch (parseError) {
            throw new Error(`Server returned Error ${response.status}. Open F12 Console for details.`);
        }
        
        throw new Error(errData.detail || "Invalid or expired OTP.");
      }

      onSuccess(formData.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 animate-in fade-in zoom-in duration-500">
      <div className="max-w-md w-full bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 relative">
        
        {/* Back Button */}
        <button 
          onClick={step === 'email' ? onBack : () => setStep('email')} 
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition flex items-center gap-1 font-bold"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Dynamic Headers based on the current step */}
        <h2 className="text-3xl font-black text-white text-center mb-2 mt-4">
          {step === 'email' ? (type === 'signin' ? 'Create Account' : 'Welcome Back') : 'Enter OTP'}
        </h2>
        <p className="text-slate-400 text-center mb-8">
          {step === 'email' ? 'Enter your university email to continue' : `We sent a 6-digit code to ${formData.email}`}
        </p>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm font-bold text-center">{error}</div>}

        {/* Step 1: Email Form */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            {type === 'signin' && (
              <input 
                type="text" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" 
                required 
              />
            )}
            
            <input 
              type="email" 
              placeholder="University Email (@eng.pdn.ac.lk)" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" 
              required 
            />

            <button disabled={loading} type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

        ) : (
          
        /* Step 2: OTP Form */
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4">
            <input 
              type="text" 
              placeholder="6-Digit Code" 
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-center text-2xl tracking-widest font-mono" 
              maxLength={6}
              required 
            />

            <button disabled={loading} type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg">
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}