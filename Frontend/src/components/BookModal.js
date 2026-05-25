"use client";
import { useState, useEffect } from "react";
import { requestBorrow, addToWishlist, removeFromWishlist, getWishlist, checkRequestStatus } from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/components/CustomToast";

export default function BookModal({ book, onClose, user, setShowLogin }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false); // NEW: Loading state for request

  // Check if book is in wishlist
  useEffect(() => {
    if (book && user) {
      checkWishlistStatus();
      checkRequestStatusForBook();
    }
  }, [book, user]);

  const checkWishlistStatus = async () => {
    try {
      const response = await getWishlist();
      setIsInWishlist(response.data.some(item => item.book_id === book.id));
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const checkRequestStatusForBook = async () => {
    try {
      const response = await checkRequestStatus(book.id);
      setRequestStatus(response.data.status);
    } catch (error) {
      console.error("Error checking request status:", error);
    }
  };

  // Add to wishlist
  const handleWishlist = async () => {
    if (!user) {
      setShowLogin(true);
      onClose();
      return;
    }
    
    try {
      if (isInWishlist) {
        await removeFromWishlist(book.id);
        setIsInWishlist(false);
        showSuccessToast("❌ Removed from wishlist");
      } else {
        await addToWishlist(book.id);
        setIsInWishlist(true);
        showSuccessToast("❤️ Added to wishlist!");
      }
    } catch (error) {
      showErrorToast("Error: " + error.response?.data?.error);
    }
  };

  // UPDATED: Handle request with loading state
  const handleRequest = async () => {
    if (!user) {
      setShowLogin(true);
      onClose();
      return;
    }
    
    // Prevent double clicking
    if (isRequesting) return;
    
    setIsRequesting(true); // Show "Requesting..." state
    
    try {
      await requestBorrow(book.id);
      setRequestStatus('pending');
      showSuccessToast("✅ Borrow request sent to librarian!");
      setTimeout(() => onClose(), 1500); // Close modal after success
    } catch (error) {
      const errorMsg = error.response?.data?.error;
      if (errorMsg?.includes('already requested')) {
        setRequestStatus('pending');
        showErrorToast(" You already requested this book! Please wait for admin approval.");
      } else if (errorMsg?.includes('already borrowing')) {
        setRequestStatus('active');
        showErrorToast(" You are already borrowing this book! Return it first to request again.");
      } else if (errorMsg?.includes('Not available')) {
        showErrorToast("❌ This book is currently borrowed by someone else.");
      } else {
        showErrorToast("Request failed: " + (errorMsg || "Unknown error"));
      }
    } finally {
      setIsRequesting(false); // Reset button state
    }
  };

  if (!book) return null;

  const getRequestButton = () => {
    // Show loading state first
    if (isRequesting) {
      return {
        text: " Requesting...",
        className: "bg-teal-400 text-white cursor-wait",
        disabled: true
      };
    }
    
    if (requestStatus === 'pending') {
      return {
        text: " Requested - Pending",
        className: "bg-yellow-500 text-white cursor-not-allowed opacity-70",
        disabled: true
      };
    } else if (requestStatus === 'active') {
      return {
        text: " Already Borrowed",
        className: "bg-gray-400 text-white cursor-not-allowed opacity-70",
        disabled: true
      };
    } else if (book.status !== 'available') {
      return {
        text: "❌ Not Available",
        className: "bg-gray-400 text-white cursor-not-allowed opacity-70",
        disabled: true
      };
    } else {
      return {
        text: "📚 Request to Borrow",
        className: "bg-teal-700 text-white hover:bg-teal-800",
        disabled: false
      };
    }
  };

  const requestButton = getRequestButton();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="relative p-6">
          <button onClick={onClose} className="absolute top-4 right-4 bg-white hover:bg-gray-200 rounded-full p-2 shadow-md z-10 transition-colors">
            ✕
          </button>

          <div className="flex gap-6">
            {/* Left Side - Image */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg bg-gray-50">
                <img src={book.img} alt={book.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-brown-900 mb-1">{book.title}</h2>
              <p className="text-teal-600 text-sm mb-3">by {book.author}</p>

              <div className="mb-4">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs"> {book.year}</span>
              </div>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed">{book.description}</p>

              <div className="flex gap-3">
                <button 
                  onClick={handleRequest} 
                  disabled={requestButton.disabled}
                  className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${requestButton.className}`}
                >
                  {requestButton.text}
                </button>
                <button 
                  onClick={handleWishlist} 
                  className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isInWishlist ? "bg-red-50 text-red-600 border-2 border-red-300" : "border-2 border-teal-700 text-teal-700 hover:bg-teal-50"
                  }`}
                >
                  {isInWishlist ? "❤️ In Wishlist" : "🤍 Wishlist"}
                </button>
              </div>
              
              {requestStatus === 'pending' && (
                <p className="text-xs text-yellow-600 mt-3 text-center">
                   Your request is pending. Wait for admin approval.
                </p>
              )}
              {requestStatus === 'active' && (
                <p className="text-xs text-green-600 mt-3 text-center">
                   You are currently borrowing this book.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}