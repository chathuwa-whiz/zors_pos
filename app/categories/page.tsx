"use client";

import { useState, useEffect } from "react";
import {
  Grid3X3,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Package,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  _id: string;
  name: string;
}

interface CategoryFormData {
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CategoryFormData>({ name: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(data.data || []);
      setFilteredCategories(data.data || []);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ name: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!form.name.trim()) {
        throw new Error("Category name is required");
      }

      // Check for duplicate names (case-insensitive)
      const isDuplicate = categories.some(
        (cat) =>
          cat.name.toLowerCase() === form.name.toLowerCase() && cat._id !== editId
      );

      if (isDuplicate) {
        throw new Error("A category with this name already exists");
      }

      let response;
      if (editId) {
        // Update category
        response = await fetch(`/api/categories/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        // Add new category
        response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to ${editId ? "update" : "create"} category`
        );
      }

      const result = await response.json();

      if (editId) {
        // Update category in list
        setCategories((prev) =>
          prev.map((cat) => (cat._id === editId ? result.data : cat))
        );
      } else {
        // Add new category to list
        setCategories((prev) => [...prev, result.data]);
      }

      setSuccess(true);

      // Close modal after showing success
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setForm({ name: category.name });
    setEditId(category._id);
    setShowModal(true);
    setError("");
    setSuccess(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      setShowDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ name: "" });
    setError("");
    setSuccess(false);
  };

  const getStats = () => {
    return {
      total: categories.length,
      filtered: filteredCategories.length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <motion.p
            className="text-gray-600 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading categories...
          </motion.p>
          <motion.p
            className="text-gray-500 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Please wait while we fetch your data
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-blue-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg">
                <Grid3X3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Product Categories
                </h1>
                <p className="text-gray-600 mt-1">
                  Organize your inventory with smart categorization
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              <motion.button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg transition-all duration-200 active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Categories
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Grid3X3 className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Filtered Results
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.filtered}
                </p>
              </div>
              <Search className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Organization</p>
                <p className="text-3xl font-bold text-purple-600">Active</p>
              </div>
              <Package className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            />
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {filteredCategories.length === 0 ? (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center max-w-md mx-auto">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Grid3X3 className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {searchQuery ? "No categories found" : "No categories yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Start by creating your first category to organize products"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Create Category
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Categories ({filteredCategories.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                <AnimatePresence>
                  {filteredCategories.map((category, index) => (
                    <motion.div
                      key={category._id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                          <Grid3X3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteId(category._id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h4>
                        <p className="text-gray-500 text-sm">Product Category</p>
                      </div>

                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>Active</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl">
                    <Grid3X3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editId ? "Edit Category" : "Add New Category"}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {editId
                        ? "Update category information"
                        : "Create a new product category"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success State */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="p-4 bg-green-50 border-b border-green-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">
                          {editId ? "Category Updated!" : "Category Created!"}
                        </h3>
                        <p className="text-green-700 text-sm">
                          The category has been{" "}
                          {editId ? "updated" : "created"} successfully.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter category name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-xl p-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
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
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{editId ? "Updating..." : "Creating..."}</span>
                      </div>
                    ) : success ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Success!</span>
                      </div>
                    ) : editId ? (
                      "Update Category"
                    ) : (
                      "Create Category"
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-2 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Delete Category
                  </h3>
                  <p className="text-gray-600 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this category? This will remove the
                category from all associated products.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteId(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteId)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}