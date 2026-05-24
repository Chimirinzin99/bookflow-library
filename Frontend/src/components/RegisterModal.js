"use client";
import { useState } from "react";
import { register } from "@/services/api";

import { Eye, EyeOff } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/components/CustomToast";

export default function RegisterModal({ onClose, setUser, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });

  // Track which requirements are met (one by one)
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Check password requirements one by one
  const checkRequirements = (pass) => {
    setRequirements({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    });
  };

  // Password strength checker
  const checkPasswordStrength = (pass) => {
    let score = 0;
    let message = '';
    let color = '';
    
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    
    if (score <= 2) {
      message = 'Weak password';
      color = 'text-red-500';
    } else if (score <= 4) {
      message = 'Medium password';
      color = 'text-yellow-500';
    } else {
      message = 'Strong password';
      color = 'text-green-500';
    }
    
    setPasswordStrength({ score, message, color });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkRequirements(newPassword);
    checkPasswordStrength(newPassword);
  };

  // Check if all password requirements are met
  const allRequirementsMet = 
    requirements.length &&
    requirements.uppercase &&
    requirements.lowercase &&
    requirements.number &&
    requirements.special;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (name.trim().length < 2) {
      showErrorToast("Please enter your full name (at least 2 characters)");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorToast("Please enter a valid email address!");
      return;
    }
    
    // Validate email confirmation
    if (email !== confirmEmail) {
      showErrorToast("Emails do not match!");
      return;
    }
    
    // Check for fake/disposable email domains
    const fakeDomains = ['tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com', '10minutemail.com', 'throwawaymail.com', 'yopmail.com', 'sharklasers.com', 'test.com', 'example.com', 'fake.com', 'fakeemail.com'];
    const domain = email.split('@')[1];
    if (fakeDomains.includes(domain)) {
      showErrorToast("Please use a real email address. Temporary/disposable emails are not allowed.");
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      showErrorToast("Passwords do not match!");
      return;
    }
    
    // Strong password validation - show only first missing requirement
    if (!requirements.length) {
      showErrorToast("Password must be at least 8 characters long!");
      return;
    }
    
    if (!requirements.uppercase) {
      showErrorToast("Password must contain at least one uppercase letter!");
      return;
    }
    
    if (!requirements.lowercase) {
      showErrorToast("Password must contain at least one lowercase letter!");
      return;
    }
    
    if (!requirements.number) {
      showErrorToast("Password must contain at least one number!");
      return;
    }
    
    if (!requirements.special) {
      showErrorToast("Password must contain at least one special character (!@#$%^&*)!");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await register(name, email, password, 'student');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);

      // Using the same welcome toast as login (with logo)
      showSuccessToast(`You have successfully registered, ${name}!`, '🎉');
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error;
      if (error.response?.data?.details) {
        showErrorToast(error.response.data.details.join("\n"));
      } else if (errorMsg === "Email already exists") {
        showErrorToast("This email is already registered. Please login instead.");
      } else {
        showErrorToast("Registration failed: " + (errorMsg || "Please try again"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
      
        {/* Header */}
        <div className="text-center mt-6 px-6">
          <h2 className="text-2xl font-bold text-gray-800">Registration</h2>
          <p className="text-gray-500 text-sm mt-1">Create your student account</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Use a valid email address (no temporary emails)</p>
          </div>
          
          {/* Confirm Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Email</label>
            <input
              type="email"
              placeholder="Confirm your email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
            {confirmEmail && email !== confirmEmail && (
              <p className="text-xs text-red-500 mt-1">❌ Emails do not match</p>
            )}
            {confirmEmail && email === confirmEmail && email.length > 0 && (
              <p className="text-xs text-green-500 mt-1">✓ Emails match</p>
            )}
          </div>
          
          {/* Password with Eye Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500 w-1/3' :
                        passwordStrength.score <= 4 ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.message}
                  </span>
                </div>
              </div>
            )}
            
            {/* Password Requirements - Show one by one */}
            {(isPasswordFocused || (password && !allRequirementsMet)) && (
              <div className="mt-2 space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Password requirements:</p>
                
                <div className="flex items-center gap-2">
                  {requirements.length ? (
                    <span className="text-green-500 text-xs">✓</span>
                  ) : (
                    <span className="text-gray-400 text-xs">○</span>
                  )}
                  <span className={`text-xs ${requirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                    At least 8 characters
                  </span>
                </div>
                
                {requirements.length && (
                  <div className="flex items-center gap-2">
                    {requirements.uppercase ? (
                      <span className="text-green-500 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-400 text-xs">○</span>
                    )}
                    <span className={`text-xs ${requirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      At least one uppercase letter (A-Z)
                    </span>
                  </div>
                )}
                
                {requirements.uppercase && (
                  <div className="flex items-center gap-2">
                    {requirements.lowercase ? (
                      <span className="text-green-500 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-400 text-xs">○</span>
                    )}
                    <span className={`text-xs ${requirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      At least one lowercase letter (a-z)
                    </span>
                  </div>
                )}
                
                {requirements.lowercase && (
                  <div className="flex items-center gap-2">
                    {requirements.number ? (
                      <span className="text-green-500 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-400 text-xs">○</span>
                    )}
                    <span className={`text-xs ${requirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                      At least one number (0-9)
                    </span>
                  </div>
                )}
                
                {requirements.number && (
                  <div className="flex items-center gap-2">
                    {requirements.special ? (
                      <span className="text-green-500 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-400 text-xs">○</span>
                    )}
                    <span className={`text-xs ${requirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                      At least one special character (!@#$%^&*)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Confirm Password with Eye Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">❌ Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && password.length > 0 && allRequirementsMet && (
              <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
            )}
          </div>
          
          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 rounded-full hover:bg-teal-800 transition-all duration-300 font-semibold text-lg mt-4 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        
        {/* Switch to Login */}
        <div className="text-center pb-6">
          <p className="text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-teal-700 font-semibold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}