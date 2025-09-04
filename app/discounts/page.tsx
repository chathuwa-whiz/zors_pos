"use client";

import { useState, useEffect } from 'react';
import { User } from '@/app/types/user';

interface Discount {
  _id: string;
  name: string;
  percentage: number;
  isGlobal: boolean;
  createdAt: string;
}

export default function Discounts() {
  const [user, setUser] = useState<User | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPercentage, setEditPercentage] = useState('');
  const [editIsGlobal, setEditIsGlobal] = useState(false);

  useEffect(() => {
    // Check user authentication
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Only fetch discounts if user is admin
      if (userData.role === 'admin') {
        fetchDiscounts();
      }
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/discounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discounts');
      }

      const data = await response.json();
      setDiscounts(data);
    } catch (err) {
      setError('Failed to load discounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !percentage) {
      setError('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          percentage: parseFloat(percentage),
          isGlobal
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create discount');
      }

      const newDiscount = await response.json();
      setDiscounts([...discounts, newDiscount]);
      
      // Reset form
      setName('');
      setPercentage('');
      setIsGlobal(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discount');
    }
  };

  const startEditing = (discount: Discount) => {
    setEditingId(discount._id);
    setEditName(discount.name);
    setEditPercentage(discount.percentage.toString());
    setEditIsGlobal(discount.isGlobal);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditPercentage('');
    setEditIsGlobal(false);
  };

  const handleUpdate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/discounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id,
          name: editName,
          percentage: parseFloat(editPercentage),
          isGlobal: editIsGlobal
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update discount');
      }

      const updatedDiscount = await response.json();
      setDiscounts(discounts.map(d => d._id === id ? updatedDiscount : d));
      setEditingId(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update discount');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/discounts?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete discount');
      }

      setDiscounts(discounts.filter(d => d._id !== id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete discount');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to access this page</p>
        </div>
      </div>
    );
  }

  // If user is not admin, show access denied message
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can manage discounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage discount percentages and global discounts
            </p>
          </div>
          
          <div className="p-6">
            {/* Add Discount Form */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Discount</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Discount Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Weekend Special"
                  />
                </div>
                
                <div>
                  <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">
                    Percentage (%)
                  </label>
                  <input
                    type="number"
                    id="percentage"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., 10"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="is-global"
                    name="is-global"
                    type="checkbox"
                    checked={isGlobal}
                    onChange={(e) => setIsGlobal(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is-global" className="ml-2 block text-sm text-gray-900">
                    Global Discount
                  </label>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Discount
                  </button>
                </div>
              </form>
              
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
            
            {/* Discounts List */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Existing Discounts</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : discounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No discounts found</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Percentage
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Global
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {discounts.map((discount) => (
                        <tr key={discount._id}>
                          {editingId === discount._id ? (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="border border-gray-300 rounded-md px-2 py-1 w-full"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <input
                                  type="number"
                                  value={editPercentage}
                                  onChange={(e) => setEditPercentage(e.target.value)}
                                  min="0"
                                  max="100"
                                  className="border border-gray-300 rounded-md px-2 py-1 w-20"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <input
                                  type="checkbox"
                                  checked={editIsGlobal}
                                  onChange={(e) => setEditIsGlobal(e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  onClick={() => handleUpdate(discount._id)}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {discount.name}
                                {discount.isGlobal && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Global
                                  </span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {discount.percentage}%
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {discount.isGlobal ? 'Yes' : 'No'}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  onClick={() => startEditing(discount)}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(discount._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}