import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Services page lists the services offered by the business.  It reads from
 * `/businesses/{businessId}/services`.  If no services are defined it displays
 * a placeholder message.  Business owners can extend this page to add or edit
 * services.
 */
export default function Services({ businessId }) {
  const [services, setServices] = useState([]);
  useEffect(() => {
    if (!businessId) return;
    const svcRef = collection(db, `businesses/${businessId}/services`);
    const q = query(svcRef, orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [businessId]);

  if (!businessId) {
    return <div>Missing businessId.</div>;
  }
  return (
    <div>
      <h2>Services</h2>
      {services.length === 0 && <div>No services defined yet.</div>}
      {services.map((svc) => (
        <div key={svc.id} className="card">
          <div className="card-header">
            <strong>{svc.name}</strong>
            <span>${svc.price?.toFixed?.(2) || '-'}</span>
          </div>
          {svc.description && <p style={{ marginTop: '0.5rem' }}>{svc.description}</p>}
        </div>
      ))}
    </div>
  );
}