"use client";
import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, Key, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/app/types/user';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (res.ok) {
        setMessage("Password changed successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to change password.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = oldPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-green-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-900/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => window.history.back()}
              className="absolute left-0 p-3 text-green-900 hover:text-lime-600 hover:bg-green-100 rounded-xl transition-all duration-200 active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="bg-gradient-to-br from-green-900 to-green-800 p-4 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-900 to-green-700 bg-clip-text text-transparent mb-2">
            Security Settings
          </h1>
          <p className="text-green-700 text-lg">Change your account password</p>
          {user && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-200">
              <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-green-900 font-medium">{user.username}</span>
              <span className="text-green-600 text-sm">• {user.role}</span>
            </div>
          )}
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-900 to-green-800 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10 flex items-center justify-center space-x-3">
              <Key className="w-6 h-6 text-lime-400" />
              <h2 className="text-xl font-bold text-white">Change Password</h2>
            </div>
            <p className="text-green-100 mt-2">Keep your account secure with a strong password</p>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {message && (
              <motion.div
                className={`mx-6 mt-6 p-4 rounded-xl border-2 ${message.includes("success")
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                  }`}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  {message.includes("success") ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <p className="font-medium">{message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Current Password *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-14 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-lime-400/30 focus:border-lime-400 transition-all duration-200 bg-white"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-green-600 transition-colors"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Key className="w-5 h-5 text-green-600" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-14 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-lime-400/30 focus:border-lime-400 transition-all duration-200 bg-white"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-green-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Password must be at least 6 characters long</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full pl-12 pr-14 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-lime-400/30 transition-all duration-200 bg-white ${confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-gray-200 focus:border-lime-400'
                    }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-green-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600 mt-2">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-200 flex items-center justify-center space-x-3 ${loading || !isFormValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white shadow-lg active:scale-95'
                  }`}
                whileHover={isFormValid ? { scale: 1.02 } : {}}
                whileTap={isFormValid ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6" />
                    <span>Change Password</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Security Tips */}
          <div className="bg-gradient-to-r from-lime-50 to-green-50 border-t border-green-100 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Tips
            </h3>
            <div className="space-y-2 text-sm text-green-700">
              <p>• Use a combination of letters, numbers, and symbols</p>
              <p>• Make it at least 8 characters long for better security</p>
              <p>• Don&apos;t share your password with anyone</p>
              <p>• Change your password regularly</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-green-700">
            Having trouble? Contact your system administrator for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}