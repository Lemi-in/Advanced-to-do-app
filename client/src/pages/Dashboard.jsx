import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import CollectionCard from '../components/CollectionCard';
import AddCollectionModal from '../components/AddCollectionModal';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

export default function Dashboard() {
  const { theme, setTheme } = useContext(ThemeContext); // ✅ corrected
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchCollections = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/collections', {
        headers: { Authorization: token },
      });
      setCollections(res.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/collections/${id}`, {
        headers: { Authorization: token },
      });
      fetchCollections();
    } catch (err) {
      alert('Could not delete');
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Task Collections</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-sm px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="text-sm text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div key={col._id} className="relative group">
              <CollectionCard
                name={col.name}
                done={0}
                total={0}
                onClick={() => navigate(`/collection/${col._id}`)}
              />
            </div>
          ))}
  
          <div
            onClick={() => setShowModal(true)}
            className="cursor-pointer border-2 border-dashed border-zinc-400 rounded-xl p-4 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            + Add New
          </div>
  
          {showModal && (
            <AddCollectionModal
              onClose={() => setShowModal(false)}
              onCreate={async (name) => {
                try {
                  await axios.post('http://localhost:5000/api/collections', { name }, {
                    headers: { Authorization: token },
                  });
                  fetchCollections();
                  setShowModal(false);
                } catch (err) {
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
