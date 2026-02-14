import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import emailjs from '@emailjs/browser';

export default function Gatekeeper({ type, onBack }) {
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP Logic
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpInput, setOtpInput] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]); // Refs to manage focus flow

  // YOUR EMAILJS KEYS (Updated)
  const SERVICE_ID = "service_9wk0kxl";
  const TEMPLATE_ID = "template_p4p0h5z";
  const PUBLIC_KEY = "piMmjXAB4VJL04hXp";

  // Initialize EmailJS once on mount (optional but good practice)
  useEffect(() => {
    emailjs.init(PUBLIC_KEY);
  }, []);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleProcess = (e) => {
    e.preventDefault();

    // 1. Validation: University Email Only
    if (!formData.email.endsWith("@eng.pdn.ac.lk")) {
      setError("Only @eng.pdn.ac.lk emails are permitted.");
      return;
    }

    // 2. Validation: Check if account exists (Sign In Only)
    // Note: In a real app, you'd check a backend database here.
    if (type === 'signin' && localStorage.getItem(formData.email)) {
      setError("This email already has an account. Please Log In.");
      return;
    }

    // 3. Send OTP
    setError("");
    setLoading(true);

    const currentOTP = generateOTP();
    setGeneratedOtp(currentOTP);

    const emailParams = {
      to_email: formData.email,
      otp: currentOTP,
      time: new Date().toLocaleTimeString(),
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams)
      .then((response) => {
        console.log('OTP SENT SUCCESS!', response.status, response.text);
        setLoading(false);
        setStep('otp'); 
      }, (err) => {
        console.log('OTP FAILED...', err);
        setError("Failed to send code. Check console for details.");
        setLoading(false);
      });
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otpInput];
    newOtp[index] = element.value;
    setOtpInput(newOtp);

    // Auto-focus next input box if user typed a number
    if (element.value && index < 5) {
        inputRefs.current[index + 1].focus();
    }
  };

  const verifyOTP = () => {
    const enteredCode = otpInput.join("");
    
    if (enteredCode === generatedOtp) {
      if (type === 'signin') {
        // Save user data to simulate "creating account"
        localStorage.setItem(formData.email, JSON.stringify(formData));
      }
      alert(type === 'signin' ? "Account Verified & Created!" : "Welcome Back!");
      onBack(); // Return to main app
    } else {
      alert("Invalid OTP. Please try again.");
      setOtpInput(new Array(6).fill("")); // Clear inputs on failure
      inputRefs.current[0].focus(); // Reset focus to first box
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
            <input 
              placeholder="Full Name" 
              required
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            
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
              {loading ? 'Sending Code...' : (type === 'signin' ? 'Register Account' : 'Access Terminal')}
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