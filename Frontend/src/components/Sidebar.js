"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { showLogoutToast } from "@/components/CustomToast";
import { AlertCircle, Library } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/components/CustomToast";

import {
  LayoutDashboard,
  BookMarked,
  AlertOctagon,
  Users,
  Home,
  Search,
  BookOpen,
  Heart,
  UserCircle,
  LogIn,
  UserPlus,
  LogOut,
  Info,
  MessageCircle,
  ScrollText,
} from "lucide-react";

// IMPORTANT: Use your actual backend URL
const API_BASE_URL = 'https://bookflow-backend-drvt.onrender.com/api';

export default function Sidebar({ activePage, setActivePage, user, setShowLogin, setShowRegister, setUser }) {
  const [stats, setStats] = useState({
    issuedBooks: 0,
    dueToday: 0,
    overdue: 0,
    totalBooks: 0,
    totalStudents: 0
  });
  const { darkMode, toggleDarkMode } = useTheme();
  

  const handleLogout = () => {
    const userName = user?.name || "User";
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showLogoutToast(userName);
  };

  // Fetch REAL stats from database
  useEffect(() => {
    if (user?.role === "librarian") {
      fetchRealStats();
    }
  }, [user]);

  const fetchRealStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      console.log("Fetching stats...");
      
      // 1. Get total books count
      const booksRes = await fetch(`${API_BASE_URL}/books`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const books = await booksRes.json();
      const booksArray = Array.isArray(books) ? books : [];
      
      // 2. Get all users
      const usersRes = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await usersRes.json();
      const usersArray = Array.isArray(users) ? users : [];
      
      // 3. Get active borrows
      const borrowsRes = await fetch(`${API_BASE_URL}/borrow/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activeBorrows = await borrowsRes.json();
      const borrowsArray = Array.isArray(activeBorrows) ? activeBorrows : [];
      
      console.log("Active borrows:", borrowsArray);
      
      // Calculate stats
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Due today: deadline is exactly today
      const dueTodayCount = borrowsArray.filter(b => {
        if (!b.deadline) return false;
        const deadlineStr = new Date(b.deadline).toISOString().split('T')[0];
        return deadlineStr === todayStr;
      }).length;
      
      // Overdue: deadline is in the past
      const overdueCount = borrowsArray.filter(b => {
        if (!b.deadline) return false;
        const deadlineDate = new Date(b.deadline);
        return deadlineDate < today;
      }).length;
      
      const studentsCount = usersArray.filter(u => u.role === 'student').length;
      
      setStats({
        issuedBooks: borrowsArray.length,
        dueToday: dueTodayCount,
        overdue: overdueCount,
        totalBooks: booksArray.length,
        totalStudents: studentsCount
      });
      
      console.log("Stats updated:", {
        issuedBooks: borrowsArray.length,
        dueToday: dueTodayCount,
        overdue: overdueCount,
        totalBooks: booksArray.length,
        totalStudents: studentsCount
      });
      
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const isLibrarian = user?.role === "librarian";
  
  const studentMenuItems = [
    { id: "home",     label: "Home",     icon: <Home size={18} strokeWidth={1.8} /> },
    { id: "search",   label: "Search",   icon: <Search size={18} strokeWidth={1.8} /> },
    { id: "myshelf",  label: "My Shelf", icon: <BookOpen size={18} strokeWidth={1.8} /> },
    { id: "wishlist", label: "Wishlist", icon: <Heart size={18} strokeWidth={1.8} /> },
    { id: "profile",  label: "Profile",  icon: <UserCircle size={18} strokeWidth={1.8} /> },
  ];

  // Admin Sidebar Menu 
  const adminMenuItems = [
    { id: "dashboard", label: "Overview",    icon: <LayoutDashboard size={18} strokeWidth={1.8} /> },
    { id: "issued",    label: "Issued Books", icon: <BookMarked size={18} strokeWidth={1.8} /> },
    { id: "overdue",   label: "Overdue",      icon: <AlertOctagon size={18} strokeWidth={1.8} /> },
    { id: "users",     label: "Users",        icon: <Users size={18} strokeWidth={1.8} /> },
  ];

  const menuItems = isLibrarian ? adminMenuItems : studentMenuItems;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col justify-between fixed h-screen overflow-y-auto border-r border-gray-100 dark:border-gray-700">
      <div>
        {/* Logo */}
        <div className="flex flex-col items-center pt-7 pb-5 border-b border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-600 shadow-sm hover:scale-105 transition-transform duration-300">
            <img src="/logo.jpg" alt="BookFlow Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="mt-3 text-lg font-bold tracking-[3px] text-gray-800 dark:text-white">BOOKFLOW</h1>
          <p className="text-[10px] tracking-[3px] text-gray-500 dark:text-white uppercase mt-0.5">Your Library</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="mx-3 mt-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate leading-tight">
                  {user.name}
                </p>
                <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Admin Stats Cards */}
        {isLibrarian && (
          <div className="px-3 py-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">Overview</p>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.issuedBooks}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Issued Books</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-teal-900/30 flex items-center justify-center">
                  <BookOpen size={20} className="text-gray-600 dark:text-teal-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.overdue}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle size={20} className="text-gray-600 dark:text-red-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalBooks}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Books</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Library size={20} className="text-gray-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalStudents}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Users</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-green-900/30 flex items-center justify-center">
                  <Users size={20} className="text-gray-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu - Only for students */}
        {!isLibrarian && (
          <nav className="p-3 space-y-1 mt-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                  activePage === item.id
                    ? "bg-gray-800 text-white shadow-md hover:bg-gray-800"
                    : "text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Footer Links */}
        <div className="px-4 py-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors mb-3"
          >
            {darkMode ? <Sun size={15} strokeWidth={1.8} /> : <Moon size={15} strokeWidth={1.8} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
              <Info size={15} strokeWidth={1.8} className="flex-shrink-0" /> About
            </button>
            <button className="w-full flex items-center gap-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
              <MessageCircle size={15} strokeWidth={1.8} className="flex-shrink-0" /> Support
            </button>
            <button className="w-full flex items-center gap-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
              <ScrollText size={15} strokeWidth={1.8} className="flex-shrink-0" /> Terms & Condition
            </button>
          </div>
        </div>
      </div>

      {/* Auth Buttons */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        {!user ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowLogin(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-700 text-white py-2.5 rounded-lg hover:bg-teal-800 transition-all duration-300 font-medium text-sm"
            >
              <LogIn size={16} strokeWidth={1.8} /> Log in
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-teal-700 text-teal-700 dark:border-teal-500 dark:text-teal-400 py-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-300 font-medium text-sm"
            >
              <UserPlus size={16} strokeWidth={1.8} /> Sign up
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2
            bg-white dark:bg-gray-800/80
            text-gray-600 dark:text-gray-300
            border border-gray-200 dark:border-gray-600
            py-3 rounded-2xl
            hover:bg-red-50 dark:hover:bg-red-900/20
            hover:border-red-300 dark:hover:border-red-700
            hover:text-red-600 dark:hover:text-red-400
            transition-all duration-300
            font-medium text-sm shadow-sm hover:shadow-md group"
          >
            <LogOut
              size={16}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}