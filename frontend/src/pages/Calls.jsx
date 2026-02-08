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
  const [selectedCall, setSelectedCall] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

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

  useEffect(() => {
    if (!businessId) return;
    if (!selectedCall?.from) {
      setAppointments([]);
      setAppointmentsLoading(false);
      return;
    }

    setAppointmentsLoading(true);
    const apptRef = collection(db, `businesses/${businessId}/appointments`);
    const apptQuery = query(
      apptRef,
      where('phone', '==', selectedCall.from),
      orderBy('startTime', 'desc'),
    );
    const unsub = onSnapshot(apptQuery, (snapshot) => {
      setAppointments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setAppointmentsLoading(false);
    });
    return () => unsub();
  }, [businessId, selectedCall]);

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
        const isSelected = selectedCall?.id === call.id;
        return (
          <div
            key={call.id}
            className="card"
            onClick={() => setSelectedCall(call)}
            style={{
              cursor: 'pointer',
              border: isSelected ? '2px solid #1a73e8' : undefined,
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedCall(call);
              }
            }}
          >
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

      {selectedCall && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Appointments for {selectedCall.from || 'Unknown number'}</h3>
          {!selectedCall.from && (
            <div>This call does not include a caller phone number.</div>
          )}
          {selectedCall.from && appointmentsLoading && <div>Loading appointments...</div>}
          {selectedCall.from && !appointmentsLoading && appointments.length === 0 && (
            <div>No appointments found for this number.</div>
          )}
          {selectedCall.from &&
            appointments.map((appt) => {
              const start = appt.startTime?.toDate?.() || null;
              const end = appt.endTime?.toDate?.() || null;
              const timeStr = start ? start.toLocaleString() : appt.startTime;
              const endStr = end ? end.toLocaleString() : appt.endTime;
              return (
                <div key={appt.id} className="card">
                  <div className="card-header">
                    <div>
                      <strong>{appt.service || 'Service'}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#555' }}>
                        {timeStr}
                        {endStr ? ` – ${endStr}` : ''}
                      </div>
                    </div>
                    <span className="badge booked">{appt.status || 'pending'}</span>
                  </div>
                  <p style={{ marginTop: '0.5rem' }}>{appt.name || 'Unknown customer'}</p>
                  {appt.notes && <p style={{ fontSize: '0.8rem', color: '#555' }}>{appt.notes}</p>}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
