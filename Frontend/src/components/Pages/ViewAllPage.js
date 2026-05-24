"use client";
import { useState } from "react";

export default function ViewAllPage({ books = [], onBookClick, loading, setActivePage }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBooks = books.filter((book) =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setActivePage("home")}
          className="text-gray-600 hover:text-purple-700 flex items-center gap-1 font-medium"
        >
          ← Back to Home
        </button>
        <h1 className="text-2xl font-bold text-gray-800 hover:text-purple-700 dark:text-white">

           All Books
        </h1>
        <p className="text-sm text-gray-500">{filteredBooks.length} books</p>
      </div>

      {/* Search */}
      <div className="flex justify-center">
  <div className="relative max-w-md w-full">
    <input
  type="text"
  placeholder="Search by title or author..."
  value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="w-full px-4 py-2.5 pl-10 border rounded-xl focus:outline-none focus:ring-2 
focus:ring-teal-300 bg-white dark:bg-gray-900 
border-gray-300 dark:border-gray-700 
text-black dark:text-white
placeholder-gray-400 dark:placeholder-gray-500
text-sm"
style={{ color: '#000000' }}
/>

    <svg
      className="absolute left-3 top-3 w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  </div>
</div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3"></p>
          <p className="text-lg">No books found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
              onClick={() => onBookClick(book)}
            >
              <img
                src={book.img}
                alt={book.title}
                className="rounded-md mb-2 group-hover:scale-105 transition-transform duration-200 w-full h-[140px] object-cover"
              />
              <p className="text-sm font-medium truncate mt-2 text-gray-800 dark:text-white">{book.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">{book.year}</p>
              <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-medium shadow-sm ${
                book.status === "available" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}>
                {book.status === "available" ? "Available" : "Taken"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}