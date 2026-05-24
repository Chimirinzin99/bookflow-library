"use client";
import { useState, useEffect } from "react";
import { getBooks, addBook, getPendingRequests, approveRequest, deleteBook, getUsers, getActiveBorrows, returnBook, approveRequestWithDates, getCategories } from "@/services/api";
import ImageCropper from '@/components/ImageCropper';
import QuoteManager from '@/components/QuoteManager';
import { showSuccessToast, showErrorToast } from "@/components/CustomToast";

export default function AdminDashboard({ user, activeTab: propActiveTab }) {
  const [activeTab, setActiveTab] = useState(propActiveTab || "dashboard");
  const [books, setBooks] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [issuedSearchTerm, setIssuedSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Uncategorized');
  const [selectedSection, setSelectedSection] = useState('Uncategorized');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnBookData, setReturnBookData] = useState(null);
  const [isReturning, setIsReturning] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [customIssueDate, setCustomIssueDate] = useState("");
  const [customDueDate, setCustomDueDate] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [stats, setStats] = useState({
    issuedBooks: 0,
    dueToday: 0,
    overdue: 0,
    totalBooks: 0,
    totalStudents: 0,
    totalStaff: 0
  });
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    img: "",
    description: "",
    year: new Date().getFullYear()
  });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (studentSearchTerm) {
      const filtered = pendingRequests.filter(req =>
        req.user_name.toLowerCase().includes(studentSearchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(pendingRequests);
    }
  }, [studentSearchTerm, pendingRequests]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [booksRes, usersRes, activeBorrowsRes, requestsRes] = await Promise.all([
        getBooks().catch(() => ({ data: [] })),
        getUsers().catch(() => ({ data: [] })),
        getActiveBorrows().catch(() => ({ data: [] })),
        getPendingRequests().catch(() => ({ data: [] }))
      ]);
      
      setBooks(booksRes.data);
      setUsers(usersRes.data);
      setBorrowedBooks(activeBorrowsRes.data);
      setPendingRequests(requestsRes.data);
      
      const today = new Date().toISOString().split('T')[0];
      const borrowedData = activeBorrowsRes.data;
      const usersData = usersRes.data;
      
      const dueTodayCount = borrowedData.filter(b => b.due_date === today && b.status === 'active').length;
      const overdueCount = borrowedData.filter(b => b.due_date < today && b.status === 'active').length;
      const studentsCount = usersData.filter(u => u.role === 'student').length;
      const staffCount = usersData.filter(u => u.role === 'librarian').length;

      setStats({
        issuedBooks: borrowedData.filter(b => b.status === 'active').length,
        dueToday: dueTodayCount,
        overdue: overdueCount,
        totalBooks: booksRes.data.length,
        totalStudents: studentsCount,
        totalStaff: staffCount
      });

    } catch (error) {
      console.error("Error loading data:", error);
      showErrorToast("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    const today = new Date().toISOString().split('T')[0];
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    setCustomIssueDate(today);
    setCustomDueDate(defaultDue.toISOString().split('T')[0]);
    setShowApproveModal(true);
  };

  const handleApproveWithDates = async () => {
    if (!selectedRequest) return;
    
    setIsApproving(true);
    
    try {
      await approveRequestWithDates(selectedRequest.id, customIssueDate, customDueDate);
      setShowApproveModal(false);
      setSelectedRequest(null);
      showSuccessToast("✅ Book request approved successfully!");
      await loadAllData();
    } catch (error) {
      showErrorToast("❌ Failed to approve: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setIsApproving(false);
    }
  };

  const handleReturnBook = (borrow) => {
    setReturnBookData(borrow);
    setShowReturnModal(true);
  };

  const confirmReturnBook = async () => {
    if (!returnBookData) return;
    
    setIsReturning(true);
    
    try {
      const response = await returnBook(returnBookData.id);
      setShowReturnModal(false);
      setReturnBookData(null);
      showSuccessToast(response.data.message || "✅ Book returned successfully!");
      await loadAllData();
      
      if (window.refreshSidebarStats) {
        await window.refreshSidebarStats();
      }
    } catch (error) {
      console.error("Return error:", error);
      showErrorToast("❌ Failed to return book: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setIsReturning(false);
    }
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showErrorToast("Please upload an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setTempImage(previewUrl);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedImage) => {
    setNewBook({ ...newBook, img: croppedImage });
    setImagePreview(croppedImage);
    setShowCropper(false);
    if (tempImage) {
      URL.revokeObjectURL(tempImage);
    }
    setTempImage(null);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.img) {
      showErrorToast("Please upload an image");
      return;
    }
    try {
      await addBook({ ...newBook, section: selectedSection });
      showSuccessToast("✅ Book added successfully!");
      setNewBook({ title: "", author: "", img: "", description: "", year: new Date().getFullYear() });
      setImagePreview("");
      setSelectedCategory('Uncategorized');
      loadAllData();
      setActiveTab("books");
    } catch (error) {
      showErrorToast("❌ Failed to add book: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([{ name: 'Fiction' }, { name: 'Non-Fiction' }, { name: 'Science' }, { name: 'History' }, { name: 'Children' }]);
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (confirm(`Delete "${bookTitle}"? This action cannot be undone.`)) {
      try {
        await deleteBook(bookId);
        showSuccessToast("✅ Book deleted successfully!");
        loadAllData();
      } catch (error) {
        showErrorToast("❌ Failed to delete book: " + (error.response?.data?.error || "Unknown error"));
      }
    }
  };

  if (user?.role !== "librarian") {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">⛔</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h3>
        <p className="text-gray-500">Only librarians can access the Admin Dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 font-bold mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-black-400 font-bold">{new Date().toLocaleDateString()}</p>
          <button onClick={loadAllData} className="text-xs text-teal-600 hover:text-teal-700 mt-1">
             Refresh
          </button>
        </div>
      </div>

      {/* Admin Tabs - No Icons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap gap-1 p-3 bg-gray-50 border-b border-gray-200">
          <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "dashboard" ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-200"}`}> Overview</button>
          <button onClick={() => setActiveTab("issued")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "issued" ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-200"}`}> Issued Books</button>
          <button onClick={() => setActiveTab("requests")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "requests" ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-200"}`}> Requests ({pendingRequests.length})</button>
          <button onClick={() => setActiveTab("books")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "books" ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-200"}`}> Books ({books.length})</button>
          <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "users" ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-200"}`}> Users ({users.length})</button>
          <button onClick={() => setActiveTab("add")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "add" ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-200"}`}>➕ Add Book</button>
          <button onClick={() => setActiveTab("quotes")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "quotes" ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-gray-200"}`}>Manage Quotes</button>
        </div>

        {/* Overview Tab */}
        {activeTab === "dashboard" && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Borrowing Activity</h3>
            {borrowedBooks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No active borrows</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Student ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Student Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Book Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Issued Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Deadline</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {borrowedBooks.slice(0, 10).map((borrow) => {
                      const today = new Date().toISOString().split('T')[0];
                      const isOverdue = borrow.deadline < today;
                      return (
                        <tr key={borrow.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{borrow.student_id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{borrow.student_name}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{borrow.book_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{borrow.issued_date}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{borrow.deadline}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: isOverdue ? '#dc2626' : '#16a34a' }}>
                              {isOverdue ? "Overdue" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Issued Books Tab */}
       {/* Issued Books Tab */}
{activeTab === "issued" && (
  <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4"> All Issued Books</h3>
      <div className="relative">
        <input
          type="text"
          placeholder=" Search by student name or book title..."
          value={issuedSearchTerm}
          onChange={(e) => setIssuedSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
    
    {(() => {
      const filteredBorrowed = borrowedBooks.filter(borrow => {
        if (!issuedSearchTerm) return true;
        const searchLower = issuedSearchTerm.toLowerCase();
        return (
          (borrow.student_name || "").toLowerCase().includes(searchLower) ||
          (borrow.book_name || "").toLowerCase().includes(searchLower) ||
          (borrow.student_id || "").toString().includes(searchLower)
        );
      });
      
      if (filteredBorrowed.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400 text-center py-8">No issued books found</p>;
      }
      
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Book Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Issued Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBorrowed.map((borrow) => {
                const today = new Date();
                const deadlineDate = borrow.deadline ? new Date(borrow.deadline) : null;
                const isOverdue = deadlineDate && deadlineDate < today;
                const daysOverdue = isOverdue ? Math.ceil((today - deadlineDate) / (1000 * 60 * 60 * 24)) : 0;
                
                return (
                  <tr key={borrow.id} className={`${isOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''} hover:bg-gray-50/50 dark:hover:bg-gray-800/30`}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{borrow.student_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{borrow.student_name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{borrow.book_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{borrow.issued_date || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{borrow.deadline || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#ef4444' }}>
                          ⚠️ Overdue ({daysOverdue} days)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#22c55e' }}>
                          ✅ Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleReturnBook(borrow)} 
                        disabled={isReturning}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white ${isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                      >
                        {isReturning ? "⏳ Processing..." : "Return Book"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    })()}
  </div>
)}
        {/* Pending Requests Tab */}
        {activeTab === "requests" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white"> Pending Borrow Requests</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by student name..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {filteredRequests.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                    <div className="flex items-center gap-4">
                      <img src={req.img} alt={req.book_title} className="w-12 h-16 rounded object-cover" onError={(e) => { e.target.src = 'https://placehold.co/300x400?text=No+Cover'; }} />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{req.book_title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Requested by: <span className="font-medium text-teal-700 dark:text-teal-400">{req.user_name}</span></p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(req.request_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => openApproveModal(req)} 
                      className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition-colors"
                    >
                      ✅ Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Books Tab */}
        {activeTab === "books" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white"> Library Inventory</h3>
              <button onClick={() => setActiveTab("add")} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-800">➕ Add New Book</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {books.map((book) => (
                <div key={book.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-lg transition relative group">
                  <button onClick={() => handleDeleteBook(book.id, book.title)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                  <img src={book.img} className="w-full h-32 object-cover rounded-md mb-2" />
                  <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{book.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{book.author}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">{book.year}</p>
                  <p className={`text-xs mt-1 ${book.status === 'available' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{book.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4"> Registered Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-300">Registered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{u.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${u.role === "librarian" ? "bg-teal-700 dark:bg-teal-900/50" : "bg-blue-700 dark:bg-blue-900/50"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{new Date(u.joined).toLocaleDateString()} </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Book Tab */}
        {activeTab === "add" && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">➕ Add New Book</h3>
            <form onSubmit={handleAddBook} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Book Cover Image</label>
                <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-teal-400"}`}>
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto shadow-md" />
                      <p className="text-sm text-gray-500">Image cropped to 300x300 square</p>
                      <button type="button" onClick={() => { setImagePreview(""); setNewBook({...newBook, img: ""}); }} className="text-red-500 text-sm hover:text-red-700">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-5xl">📸</div>
                      <p className="text-gray-600">Drag & drop an image here</p>
                      <p className="text-sm text-gray-400">or</p>
                      <label className="inline-block bg-teal-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-teal-800">
                        Browse Files
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                      </label>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input type="text" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author *</label>
                  <input type="text" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea rows="3" value={newBook.description} onChange={(e) => setNewBook({...newBook, description: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
                  <input type="number" value={newBook.year} onChange={(e) => setNewBook({...newBook, year: parseInt(e.target.value)})} className="w-32 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section *</label>
                  <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" required>
                    <option value="Fiction">📚 Fiction</option>
                    <option value="Non-Fiction">📖 Non-Fiction</option>
                    <option value="Science">🔬 Science</option>
                    <option value="History">📜 History</option>
                    <option value="Children">👶 Children</option>
                    <option value="Fantasy">✨ Fantasy</option>
                    <option value="Mystery">🕵️ Mystery</option>
                    <option value="Biography">👤 Biography</option>
                    <option value="Romance">💕 Romance</option>
                    <option value="Thriller">🔪 Thriller</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="bg-teal-700 text-white px-6 py-2 rounded-lg hover:bg-teal-800 transition">➕ Add Book</button>
            </form>
          </div>
        )}

        {/* Manage Quotes Tab */}
        {activeTab === "quotes" && (
          <div className="p-6">
            <QuoteManager />
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            if (tempImage) URL.revokeObjectURL(tempImage);
            setTempImage(null);
          }}
        />
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowApproveModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Approve Book Request</h3>
                <button onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500"> Book</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.book_title}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500"> Student</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.user_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"> Issue Date</label>
                  <input type="date" value={customIssueDate} onChange={(e) => setCustomIssueDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"> Return Deadline</label>
                  <input type="date" value={customDueDate} onChange={(e) => setCustomDueDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <p className="text-xs text-gray-400 mt-1">Student must return by this date</p>
                </div>
                {customIssueDate && customDueDate && (
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <p className="text-sm text-teal-700"> Borrowing period: <strong>{Math.ceil((new Date(customDueDate) - new Date(customIssueDate)) / (1000 * 60 * 60 * 24))}</strong> days</p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleApproveWithDates} 
                    disabled={isApproving}
                    className="flex-1 bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition disabled:opacity-50"
                  >
                    {isApproving ? "⏳ Processing..." : "✅ Confirm Approval"}
                  </button>
                  <button onClick={() => setShowApproveModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {showReturnModal && returnBookData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReturnModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Confirm Book Return</h3>
                <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img src={returnBookData.img} alt={returnBookData.book_name} className="w-24 h-32 rounded-lg object-cover shadow-md" onError={(e) => { e.target.src = 'https://placehold.co/300x400?text=No+Cover'; }} />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500"> Book Title</p>
                  <p className="font-semibold text-gray-800">{returnBookData.book_name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500"> Student Name</p>
                  <p className="font-semibold text-gray-800">{returnBookData.student_name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500"> Student ID</p>
                  <p className="font-semibold text-gray-800">{returnBookData.student_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500"> Issued Date</p>
                    <p className="font-semibold text-gray-800">{returnBookData.issued_date || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500"> Due Date</p>
                    <p className={`font-semibold ${new Date(returnBookData.deadline) < new Date() ? 'text-red-600' : 'text-gray-800'}`}>{returnBookData.deadline || 'N/A'}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${new Date(returnBookData.deadline) < new Date() ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className="text-sm text-gray-500"> Status</p>
                  <p className={`font-semibold ${new Date(returnBookData.deadline) < new Date() ? 'text-red-600' : 'text-green-600'}`}>{new Date(returnBookData.deadline) < new Date() ? '⚠️ Overdue' : '✅ Active'}</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={confirmReturnBook} 
                    disabled={isReturning}
                    className="flex-1 bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition disabled:opacity-50"
                  >
                    {isReturning ? "⏳ Processing..." : "✅ Confirm Return"}
                  </button>
                  <button onClick={() => setShowReturnModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}