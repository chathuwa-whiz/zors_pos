"use client";

import { X, Search, UserPlus, Users } from 'lucide-react';
import { Order } from '@/app/types/pos';
import { useState, useEffect } from 'react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

interface CustomerModalProps {
  activeOrder: Order;
  onClose: () => void;
  onUpdateActiveOrder: (updates: Partial<Order>) => void;
}

export default function CustomerModal({
  activeOrder,
  onClose,
  onUpdateActiveOrder
}: CustomerModalProps) {
  const [mode, setMode] = useState<'select' | 'add'>('select');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: ''
  });

  // Fetch customers when modal opens
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    onUpdateActiveOrder({
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        birthDate: customer.birthDate
      }
    });
    onClose();
  };

  // Handle new customer creation
  const handleCreateCustomer = async () => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) throw new Error('Failed to create customer');

      const createdCustomer = await response.json();

      // Add to order
      onUpdateActiveOrder({
        customer: {
          _id: createdCustomer._id,
          name: createdCustomer.name,
          email: createdCustomer.email,
          phone: createdCustomer.phone,
          birthDate: createdCustomer.birthDate
        }
      });

      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    }
  };

  // Handle manual customer input (without saving to database)
  const handleManualCustomer = () => {
    onUpdateActiveOrder({
      customer: {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        birthDate: newCustomer.birthDate
      }
    });
    onClose();
  };

  const handleNewCustomerChange = (field: string, value: string) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Customer Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setMode('select')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${mode === 'select'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Select Customer</span>
          </button>
          <button
            onClick={() => setMode('add')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${mode === 'add'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {mode === 'select' ? (
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Customer List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading customers...</p>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {searchQuery ? 'No customers match your search' : 'No customers found'}
                    </p>
                    <button
                      onClick={() => setMode('add')}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Add a new customer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-600">{customer.phone}</div>
                        )}
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => handleNewCustomerChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => handleNewCustomerChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+94 (71) 1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => handleNewCustomerChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                <input
                  type="date"
                  value={newCustomer.birthDate}
                  onChange={(e) => handleNewCustomerChange('birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          {mode === 'add' && (
            <>
              <button
                onClick={handleManualCustomer}
                disabled={!newCustomer.name.trim()}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Use for Order
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.name.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save & Select
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}