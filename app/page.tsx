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
  Percent,
  UserCheck,
  RotateCcw,
  TrendingUp,
  Clock,
  Star,
  Activity
} from 'lucide-react';
import { User } from '@/app/types/user';
import LowStockWarning from './components/LowStockWarning';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  href: string;
  adminOnly: boolean;
  priority?: 'high' | 'medium' | 'low';
  badge?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // getting user from localStorage or API
    const user: User = JSON.parse(localStorage.getItem('user') || 'null');

    setUser(user);
    setLoading(false);

    // Fetch products for low stock warning
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const modules: DashboardModule[] = [
    {
      id: 'pos',
      title: 'Make a Bill',
      description: 'Streamlined checkout experience with real-time inventory tracking and payment processing.',
      icon: <ShoppingCart className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-green-900 via-green-800 to-green-900',
      textColor: 'text-white',
      href: '/pos',
      adminOnly: false,
      priority: 'high',
      badge: 'Essential'
    },
    {
      id: 'products',
      title: 'Inventory Management',
      description: 'Adding product with real-time stock monitoring.',
      icon: <Package className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-red-600 via-red-500 to-red-600',
      textColor: 'text-white',
      href: '/products',
      adminOnly: true,
      priority: 'high',
      badge: 'Core'
    },
    {
      id: 'categories',
      title: 'Product Categories',
      description: 'Organize inventory with smart categorization for enhanced product discovery.',
      icon: <Grid3X3 className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-blue-700 via-blue-600 to-blue-700',
      textColor: 'text-white',
      href: '/categories',
      adminOnly: true,
      priority: 'medium'
    },
    {
      id: 'suppliers',
      title: 'Suppliers',
      description: 'Manage vendor relationships and streamline procurement processes.',
      icon: <Truck className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600',
      textColor: 'text-white',
      href: '/suppliers',
      adminOnly: true,
      priority: 'medium'
    },
    
    
    {
      id: 'returns',
      title: 'Returns & Exchanges',
      description: 'Handle customer returns and supplier exchanges with automated stock adjustments.',
      icon: <RotateCcw className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600',
      textColor: 'text-white',
      href: '/returns',
      adminOnly: false,
      priority: 'high'
    },
    
    
    
    {
      id: 'customers',
      title: 'Customers Details',
      description: 'Build lasting relationships with comprehensive customer profile management.',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600',
      textColor: 'text-white',
      href: '/customers',
      adminOnly: true,
      priority: 'medium'
    },
    {
      id: 'reports',
      title: 'Reports Analysis',
      description: 'Data-driven insights to optimize operations and boost profitability.',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-600',
      textColor: 'text-white',
      href: '/reports',
      adminOnly: true,
      priority: 'high',
      badge: 'Insights'
    },
    
    {
      id: 'stocktransitions',
      title: 'Stock Transitions',
      description: 'Monitor inventory movements and optimize stock level strategies.',
      icon: <Activity className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-teal-600 via-teal-500 to-teal-600',
      textColor: 'text-white',
      href: '/stock-transitions',
      adminOnly: true,
      priority: 'high'
    },
    {
      id: 'discounts',
      title: 'Promotions Hub',
      description: 'Create compelling offers and manage promotional campaigns effectively.',
      icon: <Percent className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-pink-600 via-pink-500 to-pink-600',
      textColor: 'text-white',
      href: '/discounts',
      adminOnly: true,
      priority: 'medium'
    },
    {
      id: 'staff',
      title: 'Team Management',
      description: 'Coordinate staff schedules and track team performance metrics.',
      icon: <UserCheck className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-rose-600 via-rose-500 to-rose-600',
      textColor: 'text-white',
      href: '/staff',
      adminOnly: true,
      priority: 'low'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure system preferences and maintain operational parameters.',
      icon: <Settings className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700',
      textColor: 'text-white',
      href: '/settings',
      adminOnly: true,
      priority: 'low'
    },
  ];

  const filteredModules = user?.role === 'admin'
    ? modules
    : modules.filter(module => !module.adminOnly);

  const categories = ['all', 'high', 'medium', 'low'];

  const getFilteredModules = () => {
    return filteredModules.filter(module => {
      const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || module.priority === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
          <motion.p
            className="text-green-900 font-semibold text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Loading Your Dashboard...
          </motion.p>
          <motion.p
            className="text-green-700 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Preparing your workspace
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">Authentication Required</h2>
            <p className="text-red-700 mb-6">Please sign in to access your dashboard.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-green-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-900/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-900/3 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-900 to-green-800 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-green-900 mb-2">
                Welcome back, {user?.username || 'User'}!
              </h1>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.role === 'admin'
                    ? 'bg-green-900 text-white'
                    : 'bg-lime-400 text-green-900'
                  }`}>
                  {user?.role?.toUpperCase()}
                </span>
                <span className="text-green-700 text-sm">•</span>
                <span className="text-green-700 text-sm font-medium">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <motion.p
            className="text-xl text-green-800 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {user?.role === 'admin'
              ? 'Take control of your business operations with comprehensive management tools and real-time insights.'
              : 'Process transactions efficiently with our streamlined Point of Sale system designed for speed and accuracy.'
            }
          </motion.p>
        </motion.div>

        {/* Low Stock Warning */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LowStockWarning products={products} />
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 transition-all duration-200 bg-white/70"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-900 font-medium text-sm">Priority:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory === category
                      ? 'bg-green-900 text-white shadow-lg'
                      : 'bg-white/70 text-green-900 hover:bg-green-100'
                    }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available Modules</p>
                <p className="text-3xl font-bold">{getFilteredModules().length}</p>
              </div>
              <Grid3X3 className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl p-6 text-green-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 text-sm font-medium">Your Role</p>
                <p className="text-3xl font-bold capitalize">{user?.role}</p>
              </div>
              <Star className="w-8 h-8 text-green-800" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 text-sm font-medium">Last Access</p>
                <p className="text-2xl font-bold text-green-900">Today</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <AnimatePresence>
          <motion.div
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            layout
          >
            {getFilteredModules().map((module, index) => (
              <motion.div
                key={module.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = module.href}
                className={`relative ${module.color} ${module.textColor} rounded-2xl p-6 cursor-pointer group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20"></div>
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-white/10"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                      {module.icon}
                    </div>
                    {(module.badge || module.priority) && (
                      <div className="flex flex-col space-y-1">
                        {module.badge && (
                          <span className="px-2 py-1 bg-lime-400 text-green-900 text-xs font-bold rounded-full">
                            {module.badge}
                          </span>
                        )}
                        {module.priority && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(module.priority)}`}>
                            {module.priority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300">
                    {module.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm opacity-90 leading-relaxed line-clamp-3">
                    {module.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs opacity-70 font-medium">Click to open</span>
                    <motion.div
                      className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <TrendingUp className="w-3 h-3" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {getFilteredModules().length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">No modules found</h3>
            <p className="text-green-700">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}

        {/* Role-specific message for cashiers */}
        {user?.role === 'cashier' && (
          <motion.div
            className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-200 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-900 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-green-900">Quick Start Guide</h4>
                <p className="text-green-800 mt-1">
                  As a cashier, you have access to the Point of Sale system and Returns module.
                  Start processing transactions efficiently with our streamlined interface.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}