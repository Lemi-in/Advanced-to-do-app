import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import CollectionCard from '../components/CollectionCard';
import AddCollectionModal from '../components/AddCollectionModal';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import ProfileDropdown from '../components/ProfileDropdown';


export default function Dashboard() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchCollections = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/collections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCollections(res.data); 
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };
  
  
  

  const handleEdit = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/collections/${id}`, {
        name: editingName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingId(null);
      setEditingName('');
      fetchCollections();
    } catch (err) {
      console.error('Failed to update collection name:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/collections/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCollections(); 
    } catch (err) {
      console.error('Failed to delete collection:', err);
      alert('Failed to delete collection');
    }
  };
  

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
         
            <div className="w-8 h-8 flex items-center justify-center rounded bg-yellow-200 text-yellow-800 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4h10M7 8h10M7 12h4m-6 4h6m4 0h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h2"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold">My Workspace</h1>
          </div>

          <div className="flex items-center gap-4">
          <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-sm px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center gap-2"
            >
              {theme === 'dark' ? (
                <>
                  {/* <span>Light</span> */}
                  {/* 🌞 Sun icon for switching to light */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#facc15">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                </>
              ) : (
                <>
                  {/* <span>Dark</span> */}
                  {/* 🌚 Moon icon for switching to dark */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="#60a5fa" viewBox="0 0 24 24">

                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                </>
              )}
            </button>

            <ProfileDropdown />

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div key={col._id} className="relative group border rounded-lg p-4 bg-zinc-100 dark:bg-zinc-800">
              {editingId === col._id ? (
                <div>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit(col._id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-full px-2 py-1 rounded text-sm dark:bg-zinc-700 text-zinc-900 dark:text-white"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => handleEdit(col._id)} className="text-sm text-green-600 hover:underline">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:underline">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div onClick={() => navigate(`/collection/${col._id}`)}>
                  <CollectionCard name={col.name} done={col.completedTasks} total={col.totalTasks} />

                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => {
                      setEditingId(col._id);
                      setEditingName(col.name);
                    }} className="text-xs text-yellow-600 hover:underline">✏️</button>
                    <button onClick={() => handleDelete(col._id)} className="text-xs text-red-600 hover:underline">🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}

            <div
              onClick={() => setShowModal(true)}
              className="cursor-pointer border-2 border-dashed border-zinc-400 rounded-xl p-4 flex items-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
            >
              <div className="text-indigo-500">
                {/* Notebook Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v13m0 0a5 5 0 00-5-5H5a2 2 0 00-2 2v3m9-3a5 5 0 015 5h2a2 2 0 002-2v-3m0-10V5a2 2 0 00-2-2h-3a5 5 0 00-5 5m10 0h-3a5 5 0 00-5-5" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold">+ Add new</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Click to create a new collection</p>
              </div>
            </div>


          {showModal && (
            <AddCollectionModal
              onClose={() => setShowModal(false)}
              onCreate={async (name) => {
                try {
                  await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/collections`,
                    { name },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  fetchCollections();
                  setShowModal(false);
                } catch (err) {
                  console.error('Failed to create collection:', err);
                  alert('Failed to create collection');
                }
              }}
              
            />
          )}
        </div>
      </div>
    </div>
  );
}
