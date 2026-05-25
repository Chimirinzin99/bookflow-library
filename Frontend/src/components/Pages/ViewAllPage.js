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
          className="text-gray-600 hover:text-teal-700 flex items-center gap-1 font-medium"
        >
          ← Back to Home
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
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
            focus:ring-teal-500 bg-white dark:bg-gray-900 
            border-gray-300 dark:border-gray-700 
            text-black dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            text-sm"
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

      {/* Books Grid - FIXED: Using CSS Grid instead of flex-wrap */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-lg">No books found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-fr">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative flex flex-col h-full"
              onClick={() => onBookClick(book)}
            >
              {/* Fixed height image container */}
              <div className="h-48 overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-700">
                <img
                  src={book.img}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Content area - flex column to push status to bottom */}
              <div className="p-3 flex flex-col flex-grow">
                {/* Title - fixed min height with line clamp */}
                <h3 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2 min-h-[2.5rem]">
                  {book.title}
                </h3>
                
                {/* Author - fixed min height */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 min-h-[1.5rem]">
                  {book.author}
                </p>
                
                {/* Year */}
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                  {book.year}
                </p>
                
                {/* Spacer to push status to bottom */}
                <div className="flex-grow"></div>
                
                {/* Status badge - now always at bottom */}
                <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm w-fit ${
                  book.status === "available" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}>
                  {book.status === "available" ? "Available" : "Taken"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}