import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Calls page shows a list of recent calls for the current business.  Users can
 * filter by status and sort by newest or oldest first.  The Firestore query is
 * kept simple for readability; production apps should handle pagination and
 * unsubscribing from listeners as the component unmounts.
 *
 * @param {object} props
 * @param {string|null} props.businessId
 */
export default function Calls({ businessId }) {
  const [calls, setCalls] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (!businessId) return;
    // Build the query based on selected filters
    const callsRef = collection(db, `businesses/${businessId}/calls`);
    let q = query(callsRef, orderBy('startedAt', sortOrder));
    if (statusFilter !== 'all') {
      q = query(callsRef, where('status', '==', statusFilter), orderBy('startedAt', sortOrder));
    }
    // Listen for realtime updates
    const unsub = onSnapshot(q, (snapshot) => {
      setCalls(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
    return () => unsub();
  }, [businessId, statusFilter, sortOrder]);

  if (!businessId) {
    return <div>Missing businessId.  Contact your administrator.</div>;
  }

  return (
    <div>
      <h2>Calls</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="booked">Booked</option>
          <option value="needs_follow_up">Needs follow up</option>
          <option value="missed">Missed</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>
      {calls.length === 0 && <div>No calls found.</div>}
      {calls.map((call) => {
        const ts = call.startedAt?.toDate?.() || null;
        const dateStr = ts ? ts.toLocaleString() : '';
        return (
          <div key={call.id} className="card">
            <div className="card-header">
              <div>
                <strong>{call.from || 'Unknown'}</strong>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>{dateStr}</div>
              </div>
              <span className={`badge ${call.status}`}>{call.status?.replace('_', ' ')}</span>
            </div>
            {call.summary && <p style={{ marginTop: '0.5rem' }}>{call.summary}</p>}
          </div>
        );
      })}
    </div>
  );
}