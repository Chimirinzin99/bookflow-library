"use client";
import { useState, useEffect } from "react";
import { getMyBorrows, getWishlist, updateProfile, deleteAccount } from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/components/CustomToast";
import NotificationBell from "@/components/NotificationBell";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Eye, EyeOff } from "lucide-react";

export default function ProfilePage({ user, setUser }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalRead: 0,
    currentlyReading: 0,
    wishlistCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
      setEditName(user.name);
      setProfilePicture(user.profile_picture || "");
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const borrowResponse = await getMyBorrows();
      const activeBorrows = borrowResponse.data.filter(b => b.status === 'active');
      const wishlistResponse = await getWishlist();
      
      setStats({
        totalRead: borrowResponse.data.length,
        currentlyReading: activeBorrows.length,
        wishlistCount: wishlistResponse.data.length
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showErrorToast("Please upload an image file");
      return;
    }
    
    setUploading(true);
    
    const resizedImage = await resizeImage(file, 150, 150);
    setProfilePicture(resizedImage);
    
    try {
      await updateProfile({ profile_picture: resizedImage });
      const updatedUser = { ...user, profile_picture: resizedImage };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showSuccessToast("Profile picture updated!", "📸");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      showErrorToast("Failed to update profile picture");
    } finally {
      setUploading(false);
    }
  };

  // Resize image function
  const resizeImage = (file, width, height) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          
          ctx.drawImage(img, startX, startY, size, size, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(resizedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Update profile name
  const handleUpdateName = async () => {
    if (!editName.trim()) {
      showErrorToast("Name cannot be empty");
      return;
    }
    
    try {
      await updateProfile({ name: editName });
      const updatedUser = { ...user, name: editName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      showSuccessToast("Name updated successfully!", "✏️");
    } catch (error) {
      console.error("Error updating name:", error);
      showErrorToast("Failed to update name");
    }
  };

  // Delete account with password verification
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showErrorToast("Please enter your password");
      return;
    }
    
    try {
      await deleteAccount(deletePassword);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showSuccessToast("Account deleted successfully", "🗑️");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.response?.data?.error === "Incorrect password") {
        showErrorToast("Incorrect password. Please try again.");
        setDeletePassword("");
      } else {
        showErrorToast(error.response?.data?.error || "Failed to delete account. Please return all books first.");
      }
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
        <div className="text-6xl mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Please Login</h3>
        <p className="text-gray-500 dark:text-gray-400">Login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white"> My Profile</h2>
        <div className="flex items-center gap-4">
          <button
  onClick={toggleDarkMode}
  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
>
  {darkMode ? (
    <Sun size={20} className="text-yellow-500" />
  ) : (
    <Moon size={20} className="text-white" />
  )}
</button>
          <NotificationBell user={user} />
        </div>
      </div>
      
      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-teal-100 dark:bg-teal-900 border-4 border-teal-200 dark:border-teal-700 shadow-md">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-teal-700 transition shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleProfilePictureUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploading && <p className="text-xs text-gray-500 dark:text-gray-400">Uploading...</p>}
              <p className="text-xs text-gray-400 dark:text-gray-500">Click camera to change photo</p>
            </div>
            
            {/* User Info Section */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateName}
                      className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(user.name);
                      }}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-teal-600 hover:text-teal-700 text-sm"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 capitalize">Role: {user.role}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">Member since: {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 px-6 pb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{stats.totalRead}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Books Borrowed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{stats.currentlyReading}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Currently Reading</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{stats.wishlistCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Wishlist</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reading Goal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4"> Reading Stats</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Reading Goal (2026)</span>
              <span>{Math.min(stats.totalRead, 20)}/20 books</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((stats.totalRead / 20) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Danger Zone - Delete Account with Password Verification */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
        <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">⚠️ Danger Zone</h3>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">Once you delete your account, all your data will be permanently removed.</p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete My Account
          </button>
        ) : !showPasswordConfirm ? (
          <div className="space-y-3">
            <p className="text-sm text-red-700 dark:text-red-700 font-medium">Are you absolutely sure?</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordConfirm(true)}
                className="bg-red-700 text-white  font-semibold  px-4 py-2 rounded-lg hover:bg-red-800 transition"
              >
                Yes, Continue
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="border border-gray-300 dark:border-gray-600 font-semibold 
                text-gray-800 dark:text-white px-4 py-2 
                rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">Enter your password to confirm deletion:</p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
              >
                Permanently Delete Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowPasswordConfirm(false);
                  setDeletePassword("");
                }}
                className="border border-gray-300 dark:border-gray-600 font-semibold 
  text-gray-800 dark:text-white px-4 py-2 
  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}