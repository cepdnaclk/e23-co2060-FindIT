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

const CATEGORIES = ["Electronics", "IDs/Documents", "Keys", "Wallets/Bags", "Books/Stationary", "Other"];

export default function App() {
  const [view, setView] = useState(localStorage.getItem('userEmail') ? 'dashboard' : 'landing');  const [reportType, setReportType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // NEW: Holds the real file for Cloudinary
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [formData, setFormData] = useState({
    category: '', title: '', date: '', time: '', location: '', description: '', secretQ: '', secretA: '', phone: ''
  });

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (userEmail && view !== 'landing' && view !== 'signin' && view !== 'login') {
      const fetchNotifications = async () => {
        try {
          const response = await fetch(`http://localhost:8000/items/notifications/${userEmail}`);
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

  const handleAuthSuccess = (email) => {
    if (email) {
      setUserEmail(email);
      localStorage.setItem('userEmail', email);
    }
    setView('dashboard');
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // NEW: Save the physical file!
      
      // Keep your teammate's preview logic intact:
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

    // We wait for the image to upload and get the URL BEFORE talking to FastAPI
    // CHANGE THIS:
    const finalImageUrl = imageFile ? await compressAndUploadImage(imageFile) : null;
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      item_type: reportType === 'lost' ? 'Lost' : 'Found',
      date: formData.date,
      time: formData.time,
      image_url: finalImageUrl, // <--- The bridge is complete!
      secret_question: formData.secretQ,
      secret_answer: formData.secretA,
      contact_number: formData.phone,
      owner_email: userEmail 
    };

    try {
      // Allows using VITE_API_URL for Render deployment, or localhost for local testing
      const apiUrl = import.meta.env?.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/items/` : "http://localhost:8000/items/";
      
      const response = await fetch(apiUrl, {
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
    setUserEmail('');
    setNotifications([]); 
    setFormData({ category: '', title: '', date: '', time: '', location: '', description: '', secretQ: '', secretA: '', phone: '' });
    setSelectedImage(null); 
    setImageFile(null);     
    setView('landing');
  };

  const handleNotificationClick = (notif) => {
    setSelectedNotification(notif);
    setView('secret_question');
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
      />

      {view === 'landing' && (
        <>
          <Landing setView={setView} />
          <Dashboard />
        </>
      )}

      {view === 'dashboard' && (
        <div className="flex flex-col">
          <Selection setReportType={setReportType} setView={setView} setSelectedImage={setSelectedImage} />
          <div className="px-6 md:px-10"><hr className="border-slate-800 my-2"/></div>
          <Dashboard />
        </div>
      )}

      {view === 'report' && (
        <ReportForm 
          reportType={reportType} setView={setView} selectedImage={selectedImage}
          setSelectedImage={setSelectedImage} handleImageChange={handleImageChange}
          formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit}
          CATEGORIES={CATEGORIES}
        />
      )}

      {view === 'secret_question' && selectedNotification && (
        <SecretQuestion 
          item={selectedNotification.item} 
          onSuccess={() => setView('revealed_item')}
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
    </div>
  );
}