"use client";
import { useState } from "react";
import { login } from "@/services/api";
import { showWelcomeToast, showErrorToast } from "@/components/CustomToast";

export default function LoginModal({ onClose, setUser, onSwitchToRegister, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      onClose();
      showWelcomeToast(response.data.user.name, response.data.user.role);
    } catch (error) {
      showErrorToast(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-6 flex justify-center">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
            <img 
              src="/logo.jpg" 
              alt="BookFlow Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mt-6 px-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-500 text-sm mt-1">Login to your account</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
            <input
              type="email"
              placeholder="username@institute.edu.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="●●●●●●●"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="text-right mt-1">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-teal-600 hover:text-teal-700"
            >
              Forgot Password?
            </button>
          </div>
          
          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 rounded-full hover:bg-teal-800 transition-all duration-300 font-semibold text-lg mt-4 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        
        {/* Switch to Register */}
        <div className="text-center pb-6">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-teal-700 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}