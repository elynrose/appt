import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';
import Login from './pages/Login.jsx';
import Calls from './pages/Calls.jsx';
import Schedule from './pages/Schedule.jsx';
import Services from './pages/Services.jsx';
import Settings from './pages/Settings.jsx';

/**
 * App is the top level component responsible for handling authentication state
 * and rendering either the login page or the main application shell.  It
 * listens to Firebase Auth changes and extracts the `businessId` custom claim
 * from the ID token result for scoping Firestore queries.
 */
export default function App() {
  const location = useLocation();
  const [initialising, setInitialising] = useState(true);
  const [user, setUser] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          setBusinessId(tokenResult.claims?.businessId || null);
        } catch (err) {
          console.error('Failed to fetch token claims', err);
          setBusinessId(null);
        }
      } else {
        setUser(null);
        setBusinessId(null);
      }
      setInitialising(false);
    });
    return () => unsub();
  }, []);

  if (initialising) {
    return <div className="container">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Routes>
        <Route path="/" element={<Calls businessId={businessId} />} />
        <Route path="/schedule" element={<Schedule businessId={businessId} />} />
        <Route path="/services" element={<Services businessId={businessId} />} />
        <Route path="/settings" element={<Settings businessId={businessId} user={user} />} />
      </Routes>
      <nav className="bottom-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Calls</Link>
        <Link to="/schedule" className={location.pathname === '/schedule' ? 'active' : ''}>Schedule</Link>
        <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>Services</Link>
        <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>Settings</Link>
      </nav>
    </div>
  );
}