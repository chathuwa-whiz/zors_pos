"use client"

import React, { useEffect, useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react';
import { User } from '@/app/types/user';

export default function Header() {

    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);

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

    const handleLogout = () => {
        // Implement logout logic
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div>
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
        </div>
    )
}
