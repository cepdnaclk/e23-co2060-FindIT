import { useState, useEffect } from 'react';
import './index.css';
import Gatekeeper from './components/Gatekeeper';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Selection from './components/Selection';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import SecretQuestion from './components/SecretQuestion';
import { compressAndUploadImage } from './uploadLogic';
import RevealedItemDetails from './components/RevealedItemDetails';
import AdminDashboard from './components/AdminDashboard';
import { getApiUrl } from './config';

const CATEGORIES = ["Electronics", "IDs/Documents", "Keys", "Wallets/Bags", "Books/Stationary", "Other"];
const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS
  ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map(email => email.trim())
  : ['lilly.manu94@gmail.com'];

export default function App() {
  const [view, setView] = useState(localStorage.getItem('userEmail') ? 'dashboard' : 'landing');
  const [reportType, setReportType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); 
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  
  // State to track admin status (dynamically computed on mount as well to prevent lockout on deployed site)
  const [isAdmin, setIsAdmin] = useState(() => {
    const email = localStorage.getItem('userEmail') || '';
    return localStorage.getItem('isAdmin') === 'true' || ADMIN_EMAILS.includes(email);
  });

  const [formData, setFormData] = useState({
    category: '', title: '', date: '', time: '', location: '', description: '', secretQ: '', secretA: '', phone: ''
  });

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // NEW: Check for URL messages from email redirects for the 7-day extension
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('message') === 'extended') {
      setView('extended_success');
      // Clean up the URL so it looks nice and clean again
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('message') === 'expired') {
      setView('expired_error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (userEmail && view !== 'landing' && view !== 'signin' && view !== 'login') {
      const fetchNotifications = async () => {
        try {
          const baseUrl = `${getApiUrl()}/items`;
          const response = await fetch(`${baseUrl}/notifications/${userEmail}`);
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
          }
        } catch (error) {
          console.error("Failed to fetch real notifications:", error);
        }
      };
      
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 30000);
      return () => clearInterval(intervalId);
    }
  }, [userEmail, view]);

  // Updated Logic to handle Admin Check during login
  const handleAuthSuccess = (email) => {
    if (email) {
      setUserEmail(email);
      localStorage.setItem('userEmail', email);

      // Check if user is an admin
      const checkAdmin = ADMIN_EMAILS.includes(email);
      setIsAdmin(checkAdmin);
      localStorage.setItem('isAdmin', checkAdmin);
    }
    setView('dashboard');
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); 
      
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
        alert("Session expired. Please log in again.");
        setView('landing');
        return;
    }

    const finalImageUrl = imageFile ? await compressAndUploadImage(imageFile) : formData.image_url;
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      item_type: reportType === 'lost' ? 'Lost' : 'Found',
      date: formData.date,
      time: formData.time,
      image_url: finalImageUrl,
      secret_question: formData.secretQ,
      secret_answer: formData.secretA,
      contact_number: formData.phone,
      owner_email: userEmail 
    };

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Report submitted successfully!");
        setFormData({ category: '', title: '', date: '', time: '', location: '', description: '', secretQ: '', secretA: '', phone: '' });
        setSelectedImage(null);
        setImageFile(null); 
        setView('dashboard');
      } else {
        const err = await response.json();
        alert("Failed to save: " + JSON.stringify(err));
      }
    } catch (error) {
      alert("Failed to connect to backend server. Make sure it is running!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    setUserEmail('');
    setIsAdmin(false);
    setNotifications([]); 
    setFormData({ category: '', title: '', date: '', time: '', location: '', description: '', secretQ: '', secretA: '', phone: '' });
    setSelectedImage(null); 
    setImageFile(null);      
    setView('landing');
  };

  const handleNotificationClick = (notif) => {
    setSelectedNotification(notif);
    // If it's an admin override, skip the secret question screen
    if (notif.message && notif.message.toLowerCase().includes("admin override")) {
        setView('revealed_item');
    } else {
        // Standard flow: go to verification
        setView('secret_question');
    }
  }; 

  if (view === 'signin' || view === 'login') {
    return <Gatekeeper type={view} onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Navbar 
        view={view} 
        setView={setView} 
        handleLogout={handleLogout} 
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        currentUser={{ email: userEmail, isAdmin: isAdmin }}
      />

      {view === 'landing' && (
        <>
          <Landing setView={setView} />
          <Dashboard currentUser={userEmail} />
        </>
      )}

      {view === 'dashboard' && (
        <div className="flex flex-col">
          <Selection setReportType={setReportType} setView={setView} setSelectedImage={setSelectedImage} />
          <div className="px-6 md:px-10"><hr className="border-slate-800 my-2"/></div>
          <Dashboard currentUser={userEmail} />
        </div>
      )}

      {view === 'report' && (
        <ReportForm 
          reportType={reportType} setView={setView} selectedImage={selectedImage}
          setSelectedImage={setSelectedImage} handleImageChange={handleImageChange}
          formData={formData} 
          setFormData={setFormData} handleInputChange={handleInputChange} handleSubmit={handleSubmit}
          CATEGORIES={CATEGORIES}
        />
      )}

      {view === 'admin' && <AdminDashboard />}

      {view === 'secret_question' && selectedNotification && (
        <SecretQuestion 
          item={selectedNotification.item} 
          userEmail={userEmail}
          onSuccess={(decryptedPhone) => {
            const baseUrl = `${getApiUrl()}/items`;
            fetch(`${baseUrl}/notifications/${selectedNotification.id}/read`, { method: "PATCH" })
              .catch(err => console.error("Failed to mark notification as read:", err));

            setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));

            setSelectedNotification({
              ...selectedNotification,
              item: {
                ...selectedNotification.item,
                contact_number: decryptedPhone
              }
            });
            setView('revealed_item');
          }}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'revealed_item' && selectedNotification && (
        <RevealedItemDetails 
          item={selectedNotification.item}
          onBack={() => {
            setSelectedNotification(null);
            setView('dashboard');
          }}
        />
      )}

      {/* NEW: SUCCESS SCREEN */}
      {view === 'extended_success' && (
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
          <div className="bg-slate-800 p-8 md:p-10 rounded-3xl max-w-md w-full border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
            <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Report Extended!</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              We've successfully updated your report. It will remain active in our system for another 7 days while we keep searching for a match.
            </p>
            <button 
              onClick={() => setView('dashboard')} 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* NEW: EXPIRED/ERROR SCREEN */}
      {view === 'expired_error' && (
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
          <div className="bg-slate-800 p-8 md:p-10 rounded-3xl max-w-md w-full border border-rose-500/30 shadow-2xl shadow-rose-500/10">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Link Expired</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              It looks like this report was already deleted from our system. If you haven't found your item yet, please submit a new report.
            </p>
            <button 
              onClick={() => setView('dashboard')} 
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}