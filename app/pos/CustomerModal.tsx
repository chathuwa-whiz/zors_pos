"use client";

import { X, Search, UserPlus, Users, User, Phone, Mail, Calendar } from 'lucide-react';
import { Order } from '@/app/types/pos';
import { useState, useEffect } from 'react';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

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

      if (response.ok) {
        const customer = await response.json();
        setCustomers([...customers, customer]);
        setNewCustomer({ name: '', email: '', phone: '', birthDate: '' });
        setShowCreateForm(false);
        onUpdateActiveOrder({ customer });
        onClose();
      }
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchQuery)) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900">Select Customer</h2>
              <p className="text-green-600">Choose or create a customer for this order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="flex space-x-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
            <input
              type="text"
              placeholder="Search customers by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-green-300 rounded-xl text-lg focus:ring-4 focus:ring-lime-400 focus:border-lime-400 shadow-md"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-6 py-4 rounded-xl font-bold transition-all duration-200 active:scale-95 flex items-center space-x-2 ${
              showCreateForm 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-lime-400 text-green-900 hover:bg-lime-500'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span>{showCreateForm ? 'Cancel' : 'New'}</span>
          </button>
        </div>

        {/* Create Customer Form */}
        {showCreateForm && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Create New Customer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium text-green-900 mb-2">Name *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-lg focus:ring-4 focus:ring-lime-400 focus:border-lime-400"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-green-900 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-lg focus:ring-4 focus:ring-lime-400 focus:border-lime-400"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-green-900 mb-2">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-lg focus:ring-4 focus:ring-lime-400 focus:border-lime-400"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-green-900 mb-2">Birth Date</label>
                <input
                  type="date"
                  value={newCustomer.birthDate}
                  onChange={(e) => setNewCustomer({ ...newCustomer, birthDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-lg focus:ring-4 focus:ring-lime-400 focus:border-lime-400"
                />
              </div>
            </div>
            <button
              onClick={handleCreateCustomer}
              disabled={!newCustomer.name.trim()}
              className={`mt-4 w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 active:scale-95 ${
                newCustomer.name.trim()
                  ? 'bg-green-900 text-white hover:bg-green-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Customer
            </button>
          </div>
        )}

        {/* Customer List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-green-600 text-lg">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 text-lg">No customers found</p>
              <p className="text-green-500">Try adjusting your search or create a new customer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map(customer => (
                <div
                  key={customer._id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="bg-white border-2 border-green-200 rounded-xl p-4 hover:bg-green-50 hover:border-lime-400 cursor-pointer transition-all duration-200 active:scale-95"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900 text-lg">{customer.name}</h4>
                        <div className="flex items-center space-x-4 text-green-600">
                          {customer.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.birthDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(customer.birthDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-green-600 hover:text-lime-600">
                      <span className="text-lg font-semibold">Select</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No Customer Option */}
        <div className="mt-6 pt-6 border-t-2 border-green-200">
          <button
            onClick={() => {
              onUpdateActiveOrder({ customer: {} });
              onClose();
            }}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all duration-200 active:scale-95"
          >
            Continue Without Customer
          </button>
        </div>
      </div>
    </div>
  );
}