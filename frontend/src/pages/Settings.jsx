import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  const [profileState, setProfileState] = useState({ name: '', timezone: 'America/New_York' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [twilioModalOpen, setTwilioModalOpen] = useState(false);

  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitState, setSubmitState] = useState({ loading: false, message: null, error: null, validated: false });

  useEffect(() => {
    async function fetchBusiness() {
      if (!businessId) return;
      try {
        const docRef = doc(db, 'businesses', businessId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setBusiness(data);
          setProfileState({
            name: data.name || data.businessName || '',
            timezone: data.timezone || 'America/New_York',
          });
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

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  ];

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!businessId) return;
    if (!profileState.name.trim()) {
      setProfileError('Business name is required.');
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        name: profileState.name.trim(),
        timezone: profileState.timezone,
        updatedAt: serverTimestamp(),
      });
      setProfileSaving(false);
    } catch (err) {
      console.error(err);
      setProfileError('Failed to update business profile.');
      setProfileSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ loading: true, message: null, error: null, validated: false });
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050';
      const res = await fetch(`${backendUrl}/integrations/twilio/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, accountSid, authToken, phoneNumber }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitState({ loading: false, message: data.message, error: null, validated: true });
        return true;
      } else {
        setSubmitState({ loading: false, message: null, error: data.error || 'Unknown error', validated: false });
        return false;
      }
    } catch (err) {
      console.error(err);
      setSubmitState({ loading: false, message: null, error: 'Request failed', validated: false });
      return false;
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
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Business profile</h3>
        <p style={{ marginTop: 0 }}>
          {profileState.name || 'Business name not set'}
        </p>
        <p style={{ color: '#666' }}>{profileState.timezone}</p>
        <button className="button" type="button" onClick={() => setProfileModalOpen(true)}>
          Edit profile
        </button>
      </div>
      {plan === 'basic' && (
        <div className="card">
          <p>You are on the <strong>Basic</strong> plan.  Calls to your assigned Twilio number will be routed using the shared bridge.  Upgrade to Premium to connect your own number and customise the agent.</p>
        </div>
      )}
      {plan === 'premium' && (
        <div className="card">
          <h3>Twilio Integration</h3>
          {!submitState.validated ? (
            <div>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Validate your Twilio credentials to connect a dedicated number.
              </p>
              <button className="button" type="button" onClick={() => setTwilioModalOpen(true)}>
                Enter credentials
              </button>
            </div>
          ) : (
            <div>
              <div style={{ color: 'green', marginBottom: '1rem', padding: '0.75rem', background: '#e6f7e6', borderRadius: '4px' }}>
                ✅ Credentials validated successfully!
              </div>
              <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <h4 style={{ marginTop: 0 }}>Next Steps:</h4>
                <ol style={{ paddingLeft: '1.5rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <strong>Add credentials to backend .env file:</strong>
                    <pre style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.9rem', overflow: 'auto' }}>
{`TWILIO_BUSINESS_${businessId}={"accountSid":"${accountSid}","authToken":"${authToken}","phoneNumber":"${phoneNumber}"}`}
                    </pre>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                      Or run: <code>cd backend && node add-twilio-credentials.js {businessId} {accountSid} {authToken} {phoneNumber}</code>
                    </p>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <strong>Configure Twilio webhook:</strong>
                    <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                      <li>Go to <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming" target="_blank" rel="noopener noreferrer">Twilio Console → Phone Numbers</a></li>
                      <li>Click on your phone number: <strong>{phoneNumber}</strong></li>
                      <li>Under "A CALL COMES IN", set webhook URL to:
                        <pre style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.9rem' }}>
{`https://your-ngrok-url.ngrok-free.dev/voice?businessId=${businessId}`}
                        </pre>
                      </li>
                      <li>Set HTTP method to <strong>POST</strong></li>
                      <li>Click <strong>Save</strong></li>
                    </ol>
                  </li>
                  <li>
                    <strong>Restart your backend server</strong> after adding credentials to .env
                  </li>
                </ol>
              </div>
              <button
                type="button"
                onClick={() => setSubmitState({ loading: false, message: null, error: null, validated: false })}
                className="button"
                style={{ background: '#6c757d' }}
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}

      {profileModalOpen && (
        <div className="modal-backdrop" onClick={() => setProfileModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit business profile</h3>
              <button className="modal-close" type="button" onClick={() => setProfileModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label htmlFor="business-name">Business name</label>
                <input
                  id="business-name"
                  value={profileState.name}
                  onChange={(e) => setProfileState((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="business-timezone">Timezone</label>
                <select
                  id="business-timezone"
                  value={profileState.timezone}
                  onChange={(e) => setProfileState((prev) => ({ ...prev, timezone: e.target.value }))}
                  required
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              {profileError && <div style={{ color: 'red', marginBottom: '0.75rem' }}>{profileError}</div>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="button" type="submit" disabled={profileSaving}>
                  {profileSaving ? 'Saving…' : 'Update profile'}
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ background: '#6c757d' }}
                  onClick={() => setProfileModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {twilioModalOpen && (
        <div className="modal-backdrop" onClick={() => setTwilioModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Validate Twilio credentials</h3>
              <button className="modal-close" type="button" onClick={() => setTwilioModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={async (e) => {
              const ok = await handleSubmit(e);
              if (ok) {
                setTwilioModalOpen(false);
              }
            }}>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Enter your Twilio credentials to validate them. After validation, you'll receive instructions to complete the setup.
              </p>
              <div className="form-group">
                <label htmlFor="accountSid">Account SID</label>
                <input id="accountSid" value={accountSid} onChange={(e) => setAccountSid(e.target.value)} placeholder="AC..." required />
              </div>
              <div className="form-group">
                <label htmlFor="authToken">Auth Token</label>
                <input id="authToken" type="password" value={authToken} onChange={(e) => setAuthToken(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number (E.164)</label>
                <input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+15551234567" required />
              </div>
              {submitState.error && <div style={{ color: 'red', marginBottom: '0.5rem', padding: '0.75rem', background: '#ffe6e6', borderRadius: '4px' }}>{submitState.error}</div>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="button" disabled={submitState.loading}>
                  {submitState.loading ? 'Validating…' : 'Validate Credentials'}
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ background: '#6c757d' }}
                  onClick={() => setTwilioModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
