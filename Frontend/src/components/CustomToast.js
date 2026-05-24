"use client";
import toast from "react-hot-toast";

export const showWelcomeToast = (name, role) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto 
        flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="BookFlow Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Welcome back, <span className="font-bold text-purple-700">{name}</span>!
            </p>
            <p className="mt-1 text-sm font-bold text-gray-700">
              {role === 'librarian' 
                ? '👑 You have librarian access. Manage books and requests.' 
                : ' Explore, borrow, and enjoy reading!'}
            </p>
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                {role === 'librarian' ? 'Admin Access' : 'Student Access'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 
          flex items-center justify-center text-sm font-bold font-medium text-purple-700 hover:text-purple-500 
          hover:bg-purple-50 focus:outline-none transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-right',
  });
};

export const showLogoutToast = (name) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto 
        flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-purple-500 flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="BookFlow Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Goodbye, <span className="font-bold text-purple-700">{name}</span>!
            </p>
            <p className="mt-1 text-sm font-bold text-gray-700">
              You have been successfully logged out.
            </p>
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                See you soon!
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 
          flex items-center justify-center text-sm font-bold font-medium text-purple-700 hover:text-purple-500 
          hover:bg-purple-50 focus:outline-none transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-right',
  });
};

export const showSuccessToast = (message, icon = "✅") => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto 
        flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="BookFlow Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-purple-900">
              {message}
            </p>
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                Success
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 
          flex items-center justify-center text-sm font-bold font-medium text-purple-700 hover:text-purple-500 
          hover:bg-purple-50 focus:outline-none transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-right',
  });
};

export const showErrorToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto 
        flex ring-1 ring-red-200 ring-opacity-50 overflow-hidden border-l-4 border-red-500`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-lg">❌</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 
          flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        >
          ✕
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-right',
  });
};

export const showInfoToast = (message, icon = "ℹ️") => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-blue-200 ring-opacity-50 overflow-hidden border-l-4 border-blue-500`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg">{icon}</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex 
          items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 hover:bg-blue-50"
        >
          ✕
        </button>
      </div>
    </div>
  ), {
    duration: 3000,
    position: 'top-right',
  });
};