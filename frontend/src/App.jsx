import { useState } from 'react';
import './index.css';
import Gatekeeper from './components/Gatekeeper';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Selection from './components/Selection';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';

const CATEGORIES = ["Electronics", "IDs/Documents", "Keys", "Wallets/Bags", "Books/Stationary", "Other"];

function App() {
  // View is 'landing' by default, which we will configure to show items
  const [view, setView] = useState('landing'); 
  const [reportType, setReportType] = useState('');
  
  // Set to true so items are visible to everyone on load
  const [showMatches, setShowMatches] = useState(true); 
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [formData, setFormData] = useState({
    category: '', title: '', date: '', time: '', location: '', description: '', secretQ: '', secretA: '', phone: ''
  });

  const handleAuthSuccess = (email) => {
    if (email) {
      setUserEmail(email);
      localStorage.setItem('userEmail', email);
    }
    setView('selection');
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleLogout = () => {
    setView('landing');
    setShowMatches(true); 
    setSelectedImage(null);
    setUserEmail('');
    localStorage.removeItem('userEmail');
    setFormData({ category: '', title: '', date: '', time: '', location: '', description: '', secretQ: '', secretA: '', phone: ''});
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      alert("Please log in to report an item.");
      setView('login');
      return;
    }
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      date: formData.date,
      time: formData.time,
      item_type: reportType.toUpperCase(),
      owner_email: userEmail,
      image_url: null,
      secret_question: formData.secretQ,
      secret_answer: formData.secretA,
      contact_number: formData.phone
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowMatches(true);
        setView('dashboard');
      } else {
        const err = await response.json();
        alert("Failed to save: " + JSON.stringify(err));
      }
    } catch (error) {
      alert("Failed to connect to backend server.");
    }
  };

  if (view === 'signin' || view === 'login') {
    return <Gatekeeper type={view} onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Navbar view={view} setView={setView} handleLogout={handleLogout} />

      {/* When the user first opens the site (view === 'landing'), 
          we show the Title AND the list of items immediately.
      */}
      {view === 'landing' && (
        <>
          <Landing setView={setView} />
          <Dashboard showMatches={showMatches} />
        </>
      )}

      {view === 'selection' && (
        <Selection setReportType={setReportType} setView={setView} setSelectedImage={setSelectedImage} />
      )}

      {view === 'report' && (
        <ReportForm 
          reportType={reportType} setView={setView} selectedImage={selectedImage}
          setSelectedImage={setSelectedImage} handleImageChange={handleImageChange}
          formData={formData} handleInputChange={handleInputChange}
          handleSubmit={handleSubmit} CATEGORIES={CATEGORIES}
        />
      )}

      {view === 'dashboard' && <Dashboard showMatches={showMatches} />}
    </div>
  );
}

export default App;