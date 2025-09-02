"use client";
import React, { useEffect, useState } from "react";

interface Staff {
  _id: string;
  name: string;
  category: string;
  contactNumber: string;
  address: string;
  email: string;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    contactNumber: "",
    address: "",
    email: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => setStaffList(data.data || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      // Update staff
      const res = await fetch(`/api/staff/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setLoading(false);
      if (res.ok) {
        const updated = await res.json();
        setStaffList(staffList.map(s => s._id === editId ? updated.data : s));
        setShowModal(false);
        setForm({ name: "", category: "", contactNumber: "", address: "", email: "" });
        setEditId(null);
      } else {
        alert("Failed to update staff");
      }
    } else {
      // Add staff
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setLoading(false);
      if (res.ok) {
        const newStaff = await res.json();
        setStaffList([...staffList, newStaff.data]);
        setShowModal(false);
        setForm({ name: "", category: "", contactNumber: "", address: "", email: "" });
      } else {
        alert("Failed to add staff");
      }
    }
  };

  const handleEdit = (staff: Staff) => {
    setForm({
      name: staff.name,
      category: staff.category,
      contactNumber: staff.contactNumber,
      address: staff.address,
      email: staff.email,
    });
    setEditId(staff._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStaffList(staffList.filter(s => s._id !== id));
    } else {
      alert("Failed to delete staff");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "2rem auto" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>Staff Management</h2>
      <button
        style={{
          marginBottom: "1.5rem",
          padding: "10px 24px",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          fontWeight: 500,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
        onClick={() => { setShowModal(true); setEditId(null); setForm({ name: "", category: "", contactNumber: "", address: "", email: "" }); }}
      >
        Add Staff
      </button>
      <div style={{
        overflowX: "auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid #e2e8f0",
      }}>
        <table style={{
          width: "100%",
          minWidth: "900px",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}>
          <thead style={{ background: "#3182ce", color: "#fff" }}>
            <tr>
              <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "1rem", textAlign: "left" }}>Name</th>
              <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "1rem", textAlign: "left" }}>Staff Category</th>
              <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "1rem", textAlign: "left" }}>Contact Number</th>
              <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "1rem", textAlign: "left" }}>Address</th>
              <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "1rem", textAlign: "left" }}>Email</th>
              <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "1rem", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff, idx) => (
              <tr key={staff._id} style={{
                background: idx % 2 === 0 ? "#f7fafc" : "#e6f0fa",
                borderBottom: "1px solid #e2e8f0"
              }}>
                <td style={{ padding: "14px 12px", fontSize: "1rem" }}>{staff.name}</td>
                <td style={{ padding: "14px 12px", fontSize: "1rem" }}>{staff.category}</td>
                <td style={{ padding: "14px 12px", fontSize: "1rem" }}>{staff.contactNumber}</td>
                <td style={{ padding: "14px 12px", fontSize: "1rem" }}>{staff.address}</td>
                <td style={{ padding: "14px 12px", fontSize: "1rem" }}>{staff.email}</td>
                <td style={{ padding: "14px 12px", textAlign: "center" }}>
                  <button
                    style={{
                      marginRight: 8,
                      padding: "6px 18px",
                      background: "#ffc107",
                      color: "#333",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                    }}
                    onClick={() => handleEdit(staff)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      padding: "6px 18px",
                      background: "#e53e3e",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                    }}
                    onClick={() => handleDelete(staff._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#888" }}>
                  No staff found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "12px",
              minWidth: "340px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              position: "relative",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
              onClick={() => { setShowModal(false); setEditId(null); setForm({ name: "", category: "", contactNumber: "", address: "", email: "" }); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 style={{ marginBottom: "1.5rem", textAlign: "center" }}>{editId ? "Edit Staff" : "Add Staff"}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{ marginLeft: "1rem", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "70%" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Staff Category:
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    style={{ marginLeft: "1rem", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "70%" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Contact Number:
                  <input
                    type="text"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    required
                    style={{ marginLeft: "1rem", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "70%" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Address:
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    style={{ marginLeft: "1rem", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "70%" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{ marginLeft: "1rem", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "70%" }}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 24px",
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 500,
                  marginTop: "1rem",
                  width: "100%",
                }}
              >
                {loading ? (editId ? "Updating..." : "Adding...") : (editId ? "Update Staff" : "Add Staff")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}