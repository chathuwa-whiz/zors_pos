"use client"

import React, { useEffect, useState } from 'react'
import { LogOut, Menu, X, Bell, ShoppingCart, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@/app/types/user';
import Image from 'next/image';

export default function Header() {

    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [lowStockCount, setLowStockCount] = useState(0);

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
                // Count products with low stock (assuming stock < 10 is low)
                const lowStock = data.filter((product: any) => product.stock < 10);
                setLowStockCount(lowStock.length);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const handleLogout = () => {
        // Implement logout logic
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const getRoleColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'text-red-600 bg-red-50';
            case 'manager':
                return 'text-blue-600 bg-blue-50';
            case 'employee':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="bg-white shadow-lg border-b border-gray-200 animate-pulse">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="h-10 bg-gray-200 rounded w-32"></div>
                        <div className="h-10 bg-gray-200 rounded w-48"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <header className="shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        {/* Logo Section */}
                        <motion.div
                            className="flex items-center space-x-3"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <div className="relative">
                                <motion.div
                                    className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shadow-lg"
                                    whileHover={{ rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Image src="/logo.png" alt="ZORS Logo" width={32} height={32} />
                                </motion.div>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold text-gray-900">
                                    <span className="text-green-900">ZORS</span>
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">Zorscode Retail System</p>
                            </div>
                        </motion.div>

                        {/* Center - Quick Actions (Desktop) */}
                        <div className="hidden lg:flex items-center space-x-4">
                            {lowStockCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"
                                >
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm text-amber-700 font-medium">
                                        {lowStockCount} low stock items
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Section - User Info & Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Notifications */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {lowStockCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                                    >
                                        {lowStockCount > 9 ? '9+' : lowStockCount}
                                    </motion.span>
                                )}
                            </motion.button>

                            {/* User Profile Section */}
                            <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200">
                                <div className="text-right">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {user?.username}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user?.role || '')}`}>
                                            {user?.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date().toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="relative"
                                >
                                    <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white font-bold text-sm">
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                </motion.div>

                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                                </motion.button>
                            </div>

                            {/* Mobile menu button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isMenuOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <X className="w-6 h-6" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Menu className="w-6 h-6" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="md:hidden overflow-hidden"
                            >
                                <div className="py-4 border-t border-gray-200 space-y-4">
                                    {/* Mobile User Info */}
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex items-center space-x-3"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">
                                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user?.username}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user?.role || '')}`}>
                                                {user?.role}
                                            </span>
                                        </div>
                                    </motion.div>

                                    {/* Mobile Low Stock Warning */}
                                    {lowStockCount > 0 && (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"
                                        >
                                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                                            <span className="text-sm text-amber-700 font-medium">
                                                {lowStockCount} items need restocking
                                            </span>
                                        </motion.div>
                                    )}

                                    {/* Mobile Actions */}
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center justify-between pt-2"
                                    >
                                        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors duration-200">
                                            <Bell className="w-4 h-4" />
                                            <span className="text-sm">Notifications</span>
                                            {lowStockCount > 0 && (
                                                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                    {lowStockCount}
                                                </span>
                                            )}
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleLogout}
                                            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">Logout</span>
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>
        </motion.div>
    )
}
