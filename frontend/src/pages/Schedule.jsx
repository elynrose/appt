import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
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
  const [services, setServices] = useState([]);
  const [businessTimezone, setBusinessTimezone] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    startTime: '',
    endTime: '',
    notes: '',
    status: 'pending_confirmation',
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    const apptRef = collection(db, `businesses/${businessId}/appointments`);
    const q = query(apptRef, orderBy('startTime', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    const svcRef = collection(db, `businesses/${businessId}/services`);
    const svcQuery = query(svcRef, orderBy('name', 'asc'));
    const unsub = onSnapshot(svcQuery, (snapshot) => {
      setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    const fetchBiz = async () => {
      try {
        const bizRef = doc(db, 'businesses', businessId);
        const snap = await getDoc(bizRef);
        if (snap.exists()) {
          setBusinessTimezone(snap.data().timezone || null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBiz();
  }, [businessId]);

  const resetForm = () => {
    setFormState({
      name: '',
      phone: '',
      email: '',
      service: '',
      startTime: '',
      endTime: '',
      notes: '',
      status: 'pending_confirmation',
    });
    setEditingId(null);
    setError(null);
  };

  const parseDateTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return Timestamp.fromDate(date);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!businessId) return;
    if (!formState.service || !formState.startTime || !formState.name) {
      setError('Name, service, and start time are required.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: formState.name.trim(),
      phone: formState.phone.trim() || null,
      email: formState.email.trim() || null,
      service: formState.service,
      startTime: parseDateTime(formState.startTime),
      endTime: parseDateTime(formState.endTime),
      notes: formState.notes.trim() || null,
      timezone: businessTimezone || null,
      status: formState.status || 'pending_confirmation',
      updatedAt: serverTimestamp(),
      source: 'manual',
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, `businesses/${businessId}/appointments`, editingId), payload);
      } else {
        await addDoc(collection(db, `businesses/${businessId}/appointments`), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save appointment.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (appt) => {
    const start = appt.startTime?.toDate?.() || null;
    const end = appt.endTime?.toDate?.() || null;
    setEditingId(appt.id);
    setFormState({
      name: appt.name || appt.customer?.name || '',
      phone: appt.phone || '',
      email: appt.email || '',
      service: appt.service || '',
      startTime: start ? new Date(start).toISOString().slice(0, 16) : '',
      endTime: end ? new Date(end).toISOString().slice(0, 16) : '',
      notes: appt.notes || '',
      status: appt.status || 'pending_confirmation',
    });
    setModalOpen(true);
  };

  const handleDelete = async (apptId) => {
    if (!businessId) return;
    if (!window.confirm('Cancel and delete this appointment?')) return;
    try {
      await deleteDoc(doc(db, `businesses/${businessId}/appointments`, apptId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete appointment.');
    }
  };

  if (!businessId) {
    return <div>Missing businessId.</div>;
  }
  return (
    <div>
      <h2>Schedule</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button
          className="button"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
        >
          Add appointment
        </button>
      </div>
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
            <p style={{ marginTop: '0.5rem' }}>{appt.name || appt.customer?.name || 'Unknown customer'}</p>
            {appt.notes && <p style={{ fontSize: '0.8rem', color: '#555' }}>{appt.notes}</p>}
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button className="button" onClick={() => handleEdit(appt)}>Edit</button>
              <button className="button" style={{ background: '#dc3545' }} onClick={() => handleDelete(appt.id)}>Delete</button>
            </div>
          </div>
        );
      })}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit appointment' : 'Add appointment'}</h3>
              <button className="modal-close" type="button" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="appt-name">Customer name</label>
                <input
                  id="appt-name"
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="appt-phone">Phone</label>
                <input
                  id="appt-phone"
                  value={formState.phone}
                  onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+15551234567"
                />
              </div>
              <div className="form-group">
                <label htmlFor="appt-email">Email</label>
                <input
                  id="appt-email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="appt-service">Service</label>
                <select
                  id="appt-service"
                  value={formState.service}
                  onChange={(e) => setFormState((prev) => ({ ...prev, service: e.target.value }))}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.name}>
                      {svc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="appt-start">Start time</label>
                <input
                  id="appt-start"
                  type="datetime-local"
                  value={formState.startTime}
                  onChange={(e) => setFormState((prev) => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="appt-end">End time</label>
                <input
                  id="appt-end"
                  type="datetime-local"
                  value={formState.endTime}
                  onChange={(e) => setFormState((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="appt-status">Status</label>
                <select
                  id="appt-status"
                  value={formState.status}
                  onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending_confirmation">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="appt-notes">Notes</label>
                <textarea
                  id="appt-notes"
                  rows="3"
                  value={formState.notes}
                  onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              {error && <div style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="button" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Update appointment' : 'Add appointment'}
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ background: '#6c757d' }}
                  onClick={() => {
                    resetForm();
                    setModalOpen(false);
                  }}
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
