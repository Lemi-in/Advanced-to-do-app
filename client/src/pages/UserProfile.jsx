import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [themePref, setThemePref] = useState('light');
  const [message, setMessage] = useState('');
  const [collections, setCollections] = useState([]);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const { setTheme } = useContext(ThemeContext);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` } ,
        });
        const userData = userRes.data;
        setUser(userData);
        setName(userData.name || '');
        setThemePref(userData.theme || 'light');
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };

    const fetchCollections = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/collections', {
          headers: { Authorization: `Bearer ${token}` } ,
        });
        setCollections(res.data);

        // Count tasks for progress
        const allTasks = res.data.flatMap(col => col.tasks || []);
        const completed = allTasks.filter(t => t.completed).length;
        setTaskStats({ completed, total: allTasks.length });
      } catch (err) {
        console.error('Failed to load collections:', err);
      }
    };

    fetchUserData();
    fetchCollections();
  }, []);

  const handleSave = async () => {
    try {
      await axios.patch('http://localhost:5000/api/auth/me', {
        name,
        theme: themePref,
      }, {
        headers: { Authorization: `Bearer ${token}` } ,
      });

      setMessage('Profile updated successfully!');
      setTheme(themePref); // update global theme context
    } catch (err) {
      console.error('Update failed:', err);
      setMessage('Failed to update profile');
    }
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  const firstCollectionId = collections.length > 0 ? collections[0]._id : null;
  const progress = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg w-full max-w-md text-center text-zinc-900 dark:text-white">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            {name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <p className="mt-2 text-sm text-gray-400">Email</p>
          <p className="font-semibold">{user.email}</p>
        </div>

        <div className="mb-4 text-left">
          <label className="block mb-1 text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          />
        </div>

        <div className="mb-6 text-left">
          <label className="block mb-1 text-sm font-medium">Theme</label>
          <select
            value={themePref}
            onChange={(e) => setThemePref(e.target.value)}
            className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
        >
          Save Changes
        </button>

        {message && <p className="mt-4 text-sm">{message}</p>}

        {taskStats.total > 0 && (
          <div className="mt-6 text-left">
            <p className="text-sm text-gray-400 mb-1">
              {taskStats.completed} / {taskStats.total} tasks completed
            </p>
            <div className="w-full h-2 bg-zinc-300 dark:bg-zinc-700 rounded">
              <div
                className="h-2 bg-green-500 rounded"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {firstCollectionId && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/collection/${firstCollectionId}`)}
              className="text-indigo-200 hover:underline text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
