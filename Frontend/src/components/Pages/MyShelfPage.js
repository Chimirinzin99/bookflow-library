"use client";
import { useState, useEffect } from "react";
import { getMyBorrows } from "@/services/api";
import NotificationBell from "@/components/NotificationBell";
import { BookOpen } from "lucide-react";

export default function MyShelfPage({ onBookClick, user }) {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define the function first
  const loadBorrowedBooks = async () => {
    try {
      const response = await getMyBorrows();
      setBorrowedBooks(response.data);
    } catch (error) {
      console.error("Error loading borrowed books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Then use it in useEffect
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      loadBorrowedBooks();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Function to check if book is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    return dueDateObj < today;
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not issued";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get days status
  const getDaysStatus = (dueDate) => {
    if (!dueDate) return { text: "Pending approval", color: "text-yellow-600 bg-yellow-50" };
    
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: "text-red-600 bg-red-50" };
    } else if (diffDays === 0) {
      return { text: "Due today", color: "text-orange-600 bg-orange-50" };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: "text-yellow-600 bg-yellow-50" };
    } else {
      return { text: `${diffDays} days left`, color: "text-green-600 bg-green-50" };
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading your shelf...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Notification Bell */}
      <div className="flex justify-between items-center">
  <div className="flex items-center gap-2">
    <BookOpen size={24} className="text-teal-600 dark:text-gray-400" />
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Shelf</h2>
  </div>
  <NotificationBell user={user} />
</div>

      {borrowedBooks.length > 0 ? (
        <>
          {/* Borrowed Books Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <div className="col-span-3">Book</div>
              <div className="col-span-3">Title & Author</div>
              <div className="col-span-2">Issued Date</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Status</div>
            </div>

            <div className="divide-y divide-gray-100">
              {borrowedBooks.map((borrow) => {
                const overdue = isOverdue(borrow.due_date);
                const daysStatus = getDaysStatus(borrow.due_date);
                
                return (
                  <div
                    key={borrow.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onBookClick({
                      id: borrow.book_id,
                      title: borrow.title,
                      author: borrow.author,
                      img: borrow.img,
                      year: borrow.year
                    })}
                  >
                    <div className="col-span-3">
                      <div className="w-12 h-16 rounded-md overflow-hidden shadow-sm">
                        <img
                          src={borrow.img}
                          alt={borrow.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="col-span-3">
                      <p className="font-medium text-gray-800">{borrow.title}</p>
                      <p className="text-xs text-gray-500">{borrow.author}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{formatDate(borrow.issue_date)}</p>
                    </div>

                    <div className="col-span-2">
                      <p className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                        {formatDate(borrow.due_date)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${daysStatus.color}`}>
                        {overdue ? '⚠️' : '✅'} {daysStatus.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-teal-700">{borrowedBooks.length}</p>
              <p className="text-sm text-gray-500">Total Borrowed</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-red-600">
                {borrowedBooks.filter(b => isOverdue(b.due_date)).length}
              </p>
              <p className="text-sm text-gray-500">Overdue Books</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-green-600">
                {borrowedBooks.filter(b => !isOverdue(b.due_date)).length}
              </p>
              <p className="text-sm text-gray-500">Active Borrows</p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No borrowed books</h3>
          <p className="text-gray-500">Go to Home page and request books from the librarian</p>
        </div>
      )}
    </div>
  );
}