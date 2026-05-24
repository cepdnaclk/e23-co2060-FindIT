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
// 1. Import the component
import AdminDashboard from './components/AdminDashboard';

const CATEGORIES = ["Electronics", "IDs/Documents", "Keys", "Wallets/Bags", "Books/Stationary", "Other"];

export default function App() {
  const [view, setView] = useState(localStorage.getItem('userEmail') ? 'dashboard' : 'landing');
  const [reportType, setReportType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); 
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  
  // NEW: State to track admin status
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  const [formData, setFormData] = useState({
    category: '', title: '', date: '', time: '', location: '', description: '', secretQ: '', secretA: '', phone: ''
  });

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (userEmail && view !== 'landing' && view !== 'signin' && view !== 'login') {
      const fetchNotifications = async () => {
        try {
          const baseUrl = import.meta.env?.VITE_API_URL 
            ? `${import.meta.env.VITE_API_URL}/items` 
            : "http://localhost:8000/items";
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

  // 3. Updated Logic to handle Admin Check during login
  const handleAuthSuccess = (email) => {
    if (email) {
      setUserEmail(email);
      localStorage.setItem('userEmail', email);

      // Check if user is an admin
      const adminEmails = ['admin@eng.pdn.ac.lk']; // Add your admin emails here
      const checkAdmin = adminEmails.includes(email);
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
      const apiUrl = import.meta.env?.VITE_API_URL || "http://localhost:8000";
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
    const baseUrl = import.meta.env?.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/items`
      : "http://localhost:8000/items";
    fetch(`${baseUrl}/notifications/${notif.id}/read`, { method: "PATCH" })
      .catch(err => console.error("Failed to mark notification as read:", err));

    setNotifications(prev => prev.filter(n => n.id !== notif.id));
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
        currentUser={{ email: userEmail, isAdmin: isAdmin }} // Pass admin status to Navbar
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

      {/* 2. Admin View Rendering */}
      {view === 'admin' && <AdminDashboard />}

      {view === 'secret_question' && selectedNotification && (
        <SecretQuestion 
          item={selectedNotification.item} 
          onSuccess={(decryptedPhone) => {
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
    </div>
  );
}