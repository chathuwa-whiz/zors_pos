"use client";

import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { Product } from '@/app/types/pos';

interface ProductStatsProps {
    products: Product[];
}

export default function ProductStats({ products }: ProductStatsProps) {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.sellingPrice * product.stock), 0);
    const lowStockItems = products.filter(product => product.stock < 10 && product.stock > 0).length;
    const outOfStockItems = products.filter(product => product.stock === 0).length;

    const stats = [
        {
            title: 'Total Products',
            value: totalProducts.toLocaleString(),
            icon: Package,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Inventory Value',
            value: `Rs.${totalValue.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: 'Low Stock Items',
            value: lowStockItems.toLocaleString(),
            icon: AlertTriangle,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Out of Stock',
            value: outOfStockItems.toLocaleString(),
            icon: TrendingUp,
            color: 'bg-red-500',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
                        </div>
                        <div className={`${stat.color} p-3 rounded-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}