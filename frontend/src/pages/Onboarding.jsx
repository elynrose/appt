import React, { useState } from 'react';
import { auth } from '../firebase.js';
import { getIdToken } from 'firebase/auth';

/**
 * Onboarding component for new users to set up their business.
 * Collects business information and creates the business document with businessId claim.
 */
export default function Onboarding({ onComplete }) {
  const [businessName, setBusinessName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [plan, setPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await getIdToken(user);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050';

      const response = await fetch(`${backendUrl}/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          businessName,
          timezone,
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create business');
      }

      setSuccess(true);
      
      // Wait a moment, then refresh the token and call onComplete
      setTimeout(async () => {
        // Force token refresh by getting a new ID token
        await user.getIdToken(true);
        if (onComplete) {
          onComplete();
        } else {
          // Reload the page to refresh the app state
          window.location.reload();
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ maxWidth: '500px', margin: '0 auto', paddingTop: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2>Business Created Successfully!</h2>
        <p>Setting up your account...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '0 auto', paddingTop: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome! Let's set up your business</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        We need a few details to get you started with appointment scheduling.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="businessName">Business Name *</label>
          <input
            id="businessName"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g., Acme Salon, John's Auto Repair"
            required
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Timezone *</label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Plan</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <label style={{ flex: 1, padding: '1rem', border: plan === 'basic' ? '2px solid #007bff' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="plan"
                value="basic"
                checked={plan === 'basic'}
                onChange={(e) => setPlan(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <div style={{ fontWeight: 'bold' }}>Basic</div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                Use shared phone number
              </div>
            </label>
            <label style={{ flex: 1, padding: '1rem', border: plan === 'premium' ? '2px solid #007bff' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="plan"
                value="premium"
                checked={plan === 'premium'}
                onChange={(e) => setPlan(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <div style={{ fontWeight: 'bold' }}>Premium</div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                Use your own Twilio number
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', padding: '0.75rem', background: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <button type="submit" className="button" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'Creating your business...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
}

