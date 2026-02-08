import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Services page lists the services offered by the business.  It reads from
 * `/businesses/{businessId}/services`.  If no services are defined it displays
 * a placeholder message.  Business owners can extend this page to add or edit
 * services.
 */
export default function Services({ businessId }) {
  const [services, setServices] = useState([]);
  const [formState, setFormState] = useState({ name: '', price: '', durationMins: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    if (!businessId) return;
    const svcRef = collection(db, `businesses/${businessId}/services`);
    const q = query(svcRef, orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [businessId]);

  const resetForm = () => {
    setFormState({ name: '', price: '', durationMins: '', description: '' });
    setEditingId(null);
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!businessId) return;
    if (!formState.name.trim()) {
      setError('Service name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: formState.name.trim(),
      description: formState.description.trim() || null,
      price: formState.price ? Number(formState.price) : null,
      durationMins: formState.durationMins ? Number(formState.durationMins) : null,
      updatedAt: serverTimestamp(),
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, `businesses/${businessId}/services`, editingId), payload);
      } else {
        await addDoc(collection(db, `businesses/${businessId}/services`), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (svc) => {
    setEditingId(svc.id);
    setFormState({
      name: svc.name || '',
      price: svc.price ?? '',
      durationMins: svc.durationMins ?? '',
      description: svc.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (svcId) => {
    if (!businessId) return;
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteDoc(doc(db, `businesses/${businessId}/services`, svcId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete service.');
    }
  };

  if (!businessId) {
    return <div>Missing businessId.</div>;
  }
  return (
    <div>
      <h2>Services</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button
          className="button"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
        >
          Add service
        </button>
      </div>
      {services.length === 0 && <div>No services defined yet.</div>}
      {services.map((svc) => (
        <div key={svc.id} className="card">
          <div className="card-header">
            <strong>{svc.name}</strong>
            <span>{svc.price != null ? `$${Number(svc.price).toFixed(2)}` : '-'}</span>
          </div>
          {svc.durationMins ? (
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{svc.durationMins} mins</div>
          ) : null}
          {svc.description && <p style={{ marginTop: '0.5rem' }}>{svc.description}</p>}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button className="button" onClick={() => handleEdit(svc)}>Edit</button>
            <button className="button" style={{ background: '#dc3545' }} onClick={() => handleDelete(svc.id)}>Delete</button>
          </div>
        </div>
      ))}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit service' : 'Add a service'}</h3>
              <button className="modal-close" type="button" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="svc-name">Service name</label>
                <input
                  id="svc-name"
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="svc-price">Price (USD)</label>
                <input
                  id="svc-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price}
                  onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 75"
                />
              </div>
              <div className="form-group">
                <label htmlFor="svc-duration">Duration (minutes)</label>
                <input
                  id="svc-duration"
                  type="number"
                  min="0"
                  step="5"
                  value={formState.durationMins}
                  onChange={(e) => setFormState((prev) => ({ ...prev, durationMins: e.target.value }))}
                  placeholder="e.g. 60"
                />
              </div>
              <div className="form-group">
                <label htmlFor="svc-desc">Description</label>
                <textarea
                  id="svc-desc"
                  rows="3"
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional details about this service"
                />
              </div>
              {error && <div style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="button" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Update service' : 'Add service'}
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
