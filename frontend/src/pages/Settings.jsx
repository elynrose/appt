import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Settings page allows business owners to view plan details and configure
 * integrations.  Premium customers can submit their Twilio credentials for
 * validation.  Basic customers are shown their assigned number(s) and offered
 * an upgrade path.  In a production app you would secure these operations
 * server‑side and hide sensitive information appropriately.
 */
export default function Settings({ businessId, user }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitState, setSubmitState] = useState({ loading: false, message: null, error: null });

  useEffect(() => {
    async function fetchBusiness() {
      if (!businessId) return;
      try {
        const docRef = doc(db, 'businesses', businessId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setBusiness(snap.data());
        } else {
          setBusiness(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [businessId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ loading: true, message: null, error: null });
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/integrations/twilio/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, accountSid, authToken, phoneNumber }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitState({ loading: false, message: data.message, error: null });
      } else {
        setSubmitState({ loading: false, message: null, error: data.error || 'Unknown error' });
      }
    } catch (err) {
      console.error(err);
      setSubmitState({ loading: false, message: null, error: 'Request failed' });
    }
  };

  if (loading) {
    return <div>Loading…</div>;
  }
  if (!business) {
    return <div>No business record found.</div>;
  }
  const plan = business.plan || 'basic';
  return (
    <div>
      <h2>Settings</h2>
      <p>Signed in as <strong>{user.email}</strong></p>
      <p>Business plan: <strong>{plan}</strong></p>
      {plan === 'basic' && (
        <div className="card">
          <p>You are on the <strong>Basic</strong> plan.  Calls to your assigned Twilio number will be routed using the shared bridge.  Upgrade to Premium to connect your own number and customise the agent.</p>
        </div>
      )}
      {plan === 'premium' && (
        <div className="card">
          <h3>Twilio Integration</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="accountSid">Account SID</label>
              <input id="accountSid" value={accountSid} onChange={(e) => setAccountSid(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="authToken">Auth Token</label>
              <input id="authToken" type="password" value={authToken} onChange={(e) => setAuthToken(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number (E.164)</label>
              <input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+15551234567" required />
            </div>
            {submitState.error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{submitState.error}</div>}
            {submitState.message && <div style={{ color: 'green', marginBottom: '0.5rem' }}>{submitState.message}</div>}
            <button type="submit" className="button" disabled={submitState.loading}>
              {submitState.loading ? 'Validating…' : 'Validate'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}