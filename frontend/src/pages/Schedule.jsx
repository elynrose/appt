import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Schedule page lists upcoming appointments for the current business.  It
 * subscribes to the `appointments` subcollection and orders by startTime.
 *
 * @param {object} props
 * @param {string|null} props.businessId
 */
export default function Schedule({ businessId }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!businessId) return;
    const apptRef = collection(db, `businesses/${businessId}/appointments`);
    const q = query(apptRef, orderBy('startTime', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [businessId]);

  if (!businessId) {
    return <div>Missing businessId.</div>;
  }
  return (
    <div>
      <h2>Schedule</h2>
      {appointments.length === 0 && <div>No appointments scheduled.</div>}
      {appointments.map((appt) => {
        const start = appt.startTime?.toDate?.() || null;
        const end = appt.endTime?.toDate?.() || null;
        const timeStr = start ? start.toLocaleString() : appt.startTime;
        return (
          <div key={appt.id} className="card">
            <div className="card-header">
              <div>
                <strong>{appt.service}</strong>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>{timeStr}</div>
              </div>
              <span className="badge booked">{appt.status || 'pending'}</span>
            </div>
            <p style={{ marginTop: '0.5rem' }}>{appt.customer?.name || 'Unknown customer'}</p>
            {appt.notes && <p style={{ fontSize: '0.8rem', color: '#555' }}>{appt.notes}</p>}
          </div>
        );
      })}
    </div>
  );
}