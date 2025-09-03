"use client";
import React, { useEffect, useState } from 'react';

interface Supplier {
  _id: string;
  name: string;
  contactNumber: string;
  address: string;
  email: string;
}

export default function Page() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    address: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let res: Response, newSupplier: Supplier;
      if (editId) {
        res = await fetch(`/api/suppliers/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update supplier');
        newSupplier = await res.json() as Supplier;
        setSuppliers(prev => prev.map(s => s._id === editId ? newSupplier : s));
      } else {
        res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create supplier');
        newSupplier = await res.json() as Supplier;
        setSuppliers(prev => [...prev, newSupplier]);
      }
      setForm({ name: '', contactNumber: '', address: '', email: '' });
      setShowModal(false);
      setEditId(null);
    } catch {
      setError(editId ? 'Error updating supplier' : 'Error creating supplier');
    }
    setSubmitting(false);
  };

  const handleEdit = (supplier: Supplier) => {
    setForm({
      name: supplier.name,
      contactNumber: supplier.contactNumber,
      address: supplier.address,
      email: supplier.email,
    });
    setEditId(supplier._id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!showDeleteId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/suppliers/${showDeleteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete supplier');
      setSuppliers(prev => prev.filter(s => s._id !== showDeleteId));
      setShowDeleteId(null);
    } catch {
      setError('Error deleting supplier');
    }
    setSubmitting(false);
  };

  useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => {
        setSuppliers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#f9f9f9', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h1 style={{ textAlign: 'center', color: '#2d3748', marginBottom: 32 }}>Supplier Management</h1>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '12px 32px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 18, cursor: 'pointer', boxShadow: '0 1px 4px rgba(49,130,206,0.08)' }}
        >
          Add Supplier
        </button>
      </div>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 350, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', position: 'relative' }}>
            <button
              onClick={() => { setShowModal(false); setEditId(null); setForm({ name: '', contactNumber: '', address: '', email: '' }); }}
              style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', fontSize: 22, color: '#718096', cursor: 'pointer' }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 style={{ textAlign: 'center', color: '#2d3748', marginBottom: 24 }}>{editId ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: 4, fontWeight: 500 }}>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Supplier Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd5e0' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: 4, fontWeight: 500 }}>Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={form.contactNumber}
                  onChange={handleChange}
                  required
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd5e0' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: 4, fontWeight: 500 }}>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd5e0' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: 4, fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd5e0' }}
                />
              </div>
              <button type="submit" disabled={submitting} style={{ padding: '10px 24px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px rgba(49,130,206,0.08)' }}>
                {submitting ? (editId ? 'Updating...' : 'Adding...') : (editId ? 'Update Supplier' : 'Add Supplier')}
              </button>
              {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</p>}
            </form>
          </div>
        </div>
      )}

      {showDeleteId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 350, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', position: 'relative', textAlign: 'center' }}>
            <h2 style={{ color: '#e53e3e', marginBottom: 24 }}>Delete Supplier</h2>
            <p>Are you sure you want to delete this supplier?</p>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button onClick={handleDelete} disabled={submitting} style={{ padding: '10px 24px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setShowDeleteId(null)} style={{ padding: '10px 24px', background: '#a0aec0', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#718096' }}>Loading suppliers...</p>
      ) : suppliers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#718096' }}>No suppliers found. Add a new supplier above.</p>
      ) : (
        <table style={{
  width: '100%',
  borderCollapse: 'collapse',
  background: '#fff',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  border: '1px solid #e2e8f0'
}}>
  <thead style={{ background: '#3182ce', color: '#fff' }}>
    <tr>
      <th style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Name</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Contact Number</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Address</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Email</th>
      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {suppliers.map((supplier, idx) => (
      <tr key={supplier._id} style={{
        background: idx % 2 === 0 ? '#f7fafc' : '#edf2f7',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0' }}>{supplier.name}</td>
        <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0' }}>{supplier.contactNumber}</td>
        <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0' }}>{supplier.address}</td>
        <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0' }}>{supplier.email}</td>
        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
          <button onClick={() => handleEdit(supplier)} style={{ marginRight: 8, padding: '6px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}>Edit</button>
          <button onClick={() => setShowDeleteId(supplier._id)} style={{ padding: '6px 16px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
      )}
    </div>
  );
}
