"use client"

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Grid3X3, 
  Package, 
  Truck, 
  Users, 
  BarChart3, 
  Settings, 
  Ruler, 
  FileText, 
  Percent, 
  Building, 
  UserCheck,
  LogOut,
  Menu,
  X,
  RotateCcw
} from 'lucide-react';
import { User } from '@/app/types/user';

interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  href: string;
  adminOnly: boolean;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // getting user from localStorage or API
    const user: User = JSON.parse(localStorage.getItem('user') || 'null');

    setUser(user);
    setLoading(false);
  }, []);

  const modules: DashboardModule[] = [
    {
      id: 'pos',
      title: 'POS',
      description: 'Simplify sales with an intuitive interface for quick billing and payment processing.',
      icon: <ShoppingCart className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-white',
      href: '/pos',
      adminOnly: false
    },
    {
      id: 'returns',
      title: 'RETURNS',
      description: 'Process customer returns and supplier returns with stock adjustments.',
      icon: <RotateCcw className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      textColor: 'text-white',
      href: '/returns',
      adminOnly: false // Available to both roles, but restricted in the returns page
    },
    {
      id: 'categories',
      title: 'CATEGORIES',
      description: 'Group products into categories for better organization and easy navigation.',
      icon: <Grid3X3 className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-blue-700 to-blue-800',
      textColor: 'text-white',
      href: '/categories',
      adminOnly: true
    },
    {
      id: 'products',
      title: 'PRODUCTS',
      description: 'Add, update, and manage product details, including pricing and stock levels.',
      icon: <Package className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-white',
      href: '/products',
      adminOnly: true
    },
    {
      id: 'suppliers',
      title: 'SUPPLIERS',
      description: 'Manage supplier information, purchase orders, and inventory updates seamlessly.',
      icon: <Truck className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-amber-600 to-amber-700',
      textColor: 'text-white',
      href: '/suppliers',
      adminOnly: true
    },
    {
      id: 'customers',
      title: 'CUSTOMERS',
      description: 'Maintain customer profiles, track purchases, and enhance loyalty programs effectively.',
      icon: <Users className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
      href: '/customers',
      adminOnly: true
    },
    {
      id: 'reports',
      title: 'REPORTS',
      description: 'Generate insights on sales, inventory, and performance to aid decision-making.',
      icon: <BarChart3 className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      textColor: 'text-white',
      href: '/reports',
      adminOnly: true
    },
    {
      id: 'settings',
      title: 'SETTINGS',
      description: 'Designed to offer convenience, quality, and a taste of local culture for every user.',
      icon: <Settings className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-gray-600 to-gray-700',
      textColor: 'text-white',
      href: '/settings',
      adminOnly: true
    },
    {
      id: 'sizes',
      title: 'SIZES',
      description: 'Organize and update product sizes to streamline inventory tracking and simplify the sales process.',
      icon: <Ruler className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
      textColor: 'text-white',
      href: '/sizes',
      adminOnly: true
    },
    {
      id: 'inventory',
      title: 'INVENTORY',
      description: 'Track stock levels, manage warehouse operations, and optimize inventory turnover.',
      icon: <FileText className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
      textColor: 'text-white',
      href: '/inventory',
      adminOnly: true
    },
    {
      id: 'discounts',
      title: 'DISCOUNTS',
      description: 'Create and manage promotional offers, seasonal sales, and customer-specific discounts.',
      icon: <Percent className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      textColor: 'text-white',
      href: '/discounts',
      adminOnly: true
    },
    {
      id: 'branches',
      title: 'BRANCHES',
      description: 'Manage multiple store locations, track performance, and coordinate operations across branches.',
      icon: <Building className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-teal-600 to-teal-700',
      textColor: 'text-white',
      href: '/branches',
      adminOnly: true
    },
    {
      id: 'staff',
      title: 'STAFF',
      description: 'Manage employee information, track working hours, and coordinate team schedules effectively.',
      icon: <UserCheck className="w-12 h-12" />,
      color: 'bg-gradient-to-br from-rose-500 to-rose-600',
      textColor: 'text-white',
      href: '/staff',
      adminOnly: true
    }
  ];

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const filteredModules = user?.role === 'admin' 
    ? modules 
    : modules.filter(module => !module.adminOnly);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Authentication Error:</strong> No user found. Please login.
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
                ZORS
              </div>
              <span className="ml-2 text-gray-600 font-medium">Network</span>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-600">
                  Account Type: <span className="font-semibold text-gray-900 capitalize">{user?.role}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Logged As: <span className="font-semibold text-gray-900">{user?.username}</span>
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile user info */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Account Type: <span className="font-semibold text-gray-900 capitalize">{user?.role}</span>
              </p>
              <p className="text-sm text-gray-600">
                Logged As: <span className="font-semibold text-gray-900">{user?.username}</span>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Manage your business operations with full administrative access.'
              : 'Access the Point of Sale system to process transactions efficiently.'
            }
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className={`grid gap-6 ${
          filteredModules.length === 1 
            ? 'grid-cols-1 max-w-md mx-auto'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {filteredModules.map((module) => (
            <div
              key={module.id}
              onClick={() => window.location.href = module.href}
              className={`relative ${module.color} ${module.textColor} rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group overflow-hidden`}
            >
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className=" bg-opacity-20 rounded-full p-4 group-hover:bg-opacity-30 transition-all duration-300">
                  {module.icon}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">
                    {module.title}
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Role-specific message for cashiers */}
        {user?.role === 'cashier' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  As a cashier, you have access to the Point of Sale system. 
                  Click on the POS module above to start processing transactions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats for Admin */}
        {user?.role === 'admin' && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$12,345</div>
                <div className="text-sm text-gray-600">Today&apos;s Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1,234</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">567</div>
                <div className="text-sm text-gray-600">Active Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">89</div>
                <div className="text-sm text-gray-600">Low Stock Items</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};