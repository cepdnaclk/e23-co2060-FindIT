import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

export default function Gatekeeper({ type, onBack }) {
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP Logic
  const [otpInput, setOtpInput] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]); 

  // --- CHANGED: CONNECTED TO BACKEND ---
  const API_URL = "http://127.0.0.1:8000";

  const handleProcess = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Validation checks
      if (!formData.email.endsWith("@eng.pdn.ac.lk")) {
        throw new Error("Only @eng.pdn.ac.lk emails are permitted.");
      }

      // 2. Call Backend to Send OTP
      const response = await fetch(`${API_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send OTP");
      }

      // 3. Success! Move to next step
      setStep('otp');
      
    } catch (err) {
      console.error("Backend Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const enteredCode = otpInput.join("");
    if (enteredCode.length !== 6) {
      alert("Please enter the full 6-digit code.");
      return;
    }

    try {
      // 3. Call Backend to Verify OTP
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email,
          otp: enteredCode 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid OTP");
      }

      // 4. Success!
      const data = await response.json();
      console.log("Login Token:", data.token); // In a real app, save this token
      
      alert("Login Successful!");
      onBack(); // Return to main app

    } catch (err) {
      alert(err.message);
      setOtpInput(new Array(6).fill("")); // Clear inputs
      inputRefs.current[0].focus(); 
    }
  };

  // --- UI HELPERS (No changes needed here) ---
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otpInput];
    newOtp[index] = element.value;
    setOtpInput(newOtp);
    if (element.value && index < 5) {
        inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
        <button onClick={onBack} className="text-slate-500 hover:text-white mb-6 text-sm">← Back</button>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {step === 'form' ? (type === 'signin' ? 'Create Account' : 'User Login') : 'Verify Identity'}
        </h2>
        <p className="text-slate-400 text-sm mb-8 font-medium">Gatekeeper Security Layer</p>

        {step === 'form' ? (
          <form onSubmit={handleProcess} className="space-y-4">
            {/* Show Name field only for Sign In */}
            {type === 'signin' && (
              <input 
                placeholder="Full Name" 
                required
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            )}
            
            <input 
              type="email" 
              placeholder="eXXXXX@eng.pdn.ac.lk" 
              required
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            
            {error && <p className="text-red-400 text-xs font-bold animate-pulse">{error}</p>}
            
            <button 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30 active:scale-95'}`}
            >
              {loading ? 'Connecting to Server...' : (type === 'signin' ? 'Register Account' : 'Access Terminal')}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-slate-400 text-sm">A 6-digit code was sent to <br/><span className="text-indigo-400 font-bold">{formData.email}</span></p>
            
            <div className="flex justify-between gap-2">
              {otpInput.map((data, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={e => handleOtpChange(e.target, index)}
                  onFocus={e => e.target.select()}
                  className="w-10 h-12 bg-slate-900 border border-slate-700 rounded-lg text-center text-white text-xl font-bold focus:border-indigo-500 outline-none transition"
                />
              ))}
            </div>
            
            <button onClick={verifyOTP} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition shadow-lg shadow-emerald-500/20 active:scale-95">
              Verify OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Gatekeeper.propTypes = {
  type: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};