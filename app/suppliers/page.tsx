"use client";
import React, { useEffect, useState } from 'react';
import { Truck, Plus, Edit2, Trash2, X, Phone, Mail, MapPin, Building2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: '', contactNumber: '', address: '', email: '' });
    setEditId(null);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setSuccess(false);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
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
      setSuccess(true);
      resetForm();
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
      }, 2000);
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

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contactNumber.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-green-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-900/20 border-t-green-900 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-lime-400/30 border-b-lime-400 rounded-full animate-spin mx-auto mt-2 ml-2" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-green-900 font-semibold text-lg">Loading suppliers...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-green-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-900/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-green-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-green-700 to-green-800 p-3 rounded-2xl shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Supplier Management
                </h1>
                <p className="text-green-600 font-medium">Manage your suppliers and vendor information</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.button
                onClick={openModal}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                <span>Add Supplier</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
            <input
              type="text"
              placeholder="Search suppliers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-lime-400/30 focus:border-lime-400 transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-md"
            />
          </div>
        </motion.div>

        {/* Suppliers Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier, index) => (
                <motion.div
                  key={supplier._id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-lime-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-green-700" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-900">{supplier.name}</h3>
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-100 to-lime-100 text-green-800 text-sm font-medium rounded-full">
                          Supplier
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{supplier.contactNumber}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-start space-x-3 text-gray-600">
                      <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={() => handleEdit(supplier)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 active:scale-95"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setShowDeleteId(supplier._id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 active:scale-95"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full bg-white rounded-2xl shadow-lg border border-gray-100 p-16"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-center max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-green-100 to-lime-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Truck className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No matching suppliers' : 'No suppliers found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery
                      ? 'Try adjusting your search criteria or add a new supplier.'
                      : 'Get started by adding your first supplier to the system.'
                    }
                  </p>
                  <motion.button
                    onClick={openModal}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add First Supplier</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add/Edit Supplier Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-700 to-green-800 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-xl">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {editId ? "Edit Supplier" : "Add New Supplier"}
                      </h2>
                      <p className="text-green-100 text-sm">
                        {editId
                          ? "Update supplier information"
                          : "Create a new supplier entry"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Success State */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="p-6 bg-green-50 border-b border-green-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">
                          {editId ? "Supplier Updated!" : "Supplier Added!"}
                        </h3>
                        <p className="text-green-700 text-sm">
                          The supplier has been {editId ? "updated" : "created"} successfully.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-lime-400/30 focus:border-lime-400 transition-all duration-200"
                      placeholder="Enter supplier name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={form.contactNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-lime-400/30 focus:border-lime-400 transition-all duration-200"
                      placeholder="+94 70 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-lime-400/30 focus:border-lime-400 transition-all duration-200"
                      placeholder="supplier@company.com"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-lime-400/30 focus:border-lime-400 transition-all duration-200 resize-none"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting || success}
                    className="flex-1 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{editId ? 'Updating...' : 'Adding...'}</span>
                      </div>
                    ) : (
                      <span>{editId ? 'Update Supplier' : 'Add Supplier'}</span>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteId && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Delete Supplier</h2>
                <p className="text-red-100">This action cannot be undone</p>
              </div>

              <div className="p-6">
                <p className="text-gray-700 text-center mb-6">
                  Are you sure you want to delete this supplier? This will permanently remove all supplier information.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteId(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      'Delete'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
