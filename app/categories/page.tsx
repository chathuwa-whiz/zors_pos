"use client";
import React, { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ name: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      // Update
      const res = await fetch(`/api/categories/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setLoading(false);
      if (res.ok) {
        const updated = await res.json();
        setCategories(
          categories.map((cat) => (cat._id === editId ? updated.data : cat))
        );
        setShowModal(false);
        setForm({ name: "" });
        setEditId(null);
      } else {
        alert("Failed to update category");
      }
    } else {
      // Add
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setLoading(false);
      if (res.ok) {
        const newCategory = await res.json();
        setCategories([...categories, newCategory.data]);
        setShowModal(false);
        setForm({ name: "" });
      } else {
        alert("Failed to add category");
      }
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name });
    setEditId(cat._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories(categories.filter((cat) => cat._id !== id));
    } else {
      alert("Failed to delete category");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>Categories</h2>
      <button
        style={{
          marginBottom: "1rem",
          padding: "8px 16px",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() => {
          setShowModal(true);
          setEditId(null);
          setForm({ name: "" });
        }}
      >
        Add Category
      </button>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f4f4f4" }}>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>
              Category Name
            </th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {cat.name}
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                <button
                  style={{
                    marginRight: "8px",
                    padding: "4px 8px",
                    background: "#ffc107",
                    color: "#333",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleEdit(cat)}
                >
                  Edit
                </button>
                <button
                  style={{
                    padding: "4px 8px",
                    background: "#e00",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDelete(cat._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              borderRadius: "8px",
              minWidth: "320px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              position: "relative",
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
              onClick={() => {
                setShowModal(false);
                setEditId(null);
                setForm({ name: "" });
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>{editId ? "Edit Category" : "Add Category"}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Category Name:
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{
                      marginLeft: "1rem",
                      padding: "6px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      width: "70%",
                    }}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {loading
                  ? editId
                    ? "Updating..."
                    : "Adding..."
                  : editId
                  ? "Update Category"
                  : "Add Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}