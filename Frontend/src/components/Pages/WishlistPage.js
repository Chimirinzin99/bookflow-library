"use client";
import { useState, useEffect } from "react";
import { getWishlist, removeFromWishlist, clearWishlist } from "@/services/api";
import NotificationBell from "@/components/NotificationBell";

export default function WishlistPage({ onBookClick, user }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const response = await getWishlist();
      setWishlist(response.data);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId, e) => {
    e.stopPropagation();
    try {
      await removeFromWishlist(bookId);
      setWishlist(wishlist.filter(book => book.book_id !== bookId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      try {
        await clearWishlist();
        setWishlist([]);
      } catch (error) {
        console.error("Error clearing wishlist:", error);
      }
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">❤️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Please Login</h3>
        <p className="text-gray-500">Login to view your wishlist</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20">Loading wishlist...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">❤️ Wishlist</h2>
          <p className="text-gray-500 mt-1">
            {wishlist.length} book{wishlist.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <NotificationBell user={user} />
      </div>

      {wishlist.length > 0 ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={handleClearAll}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 relative"
                onClick={() => onBookClick({
                  id: item.book_id,
                  title: item.title,
                  author: item.author,
                  img: item.img,
                  year: item.year,
                  description: item.description
                })}
              >
                <button
                  onClick={(e) => handleRemove(item.book_id, e)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
                <img
                  src={item.img}
                  alt={item.title}
                  className="rounded-md mb-2 group-hover:scale-105 transition-transform duration-200 w-full h-[140px] object-cover"
                />
                <p className="text-sm font-medium truncate mt-2 text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 truncate">{item.author}</p>
                <p className="text-xs text-teal-600 mt-1">{item.year}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-4">Add books from the Home or Search page</p>
        </div>
      )}
    </div>
  );
}