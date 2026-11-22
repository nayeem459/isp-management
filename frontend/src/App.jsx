import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TechDashboard from './pages/TechDashboard';

function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ispUser');
    if (savedUser) {
      setAuth(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ispUser');
    setAuth(null);
  };

  if (!auth) {
    return <Login setAuth={setAuth} />;
  }

  if (auth.role === 'admin') {
    return <AdminDashboard user={auth} logout={handleLogout} />;
  }

  if (auth.role === 'technician') {
    return <TechDashboard user={auth} logout={handleLogout} />;
  }

  return <UserDashboard user={auth} logout={handleLogout} />;
}

export default App;