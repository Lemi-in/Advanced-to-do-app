// components/ProfileDropdown.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1"
      >
        👤 <span className="hidden sm:inline">Account</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded shadow-md z-10">
          <button
            onClick={() => {
              navigate('/profile');
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            View Profile
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
