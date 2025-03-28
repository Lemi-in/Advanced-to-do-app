import React, { useState } from 'react';

export default function AddCollectionModal({ onClose, onCreate }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name);
    setName('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Create New Collection</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            placeholder="e.g. School, Work, Personal"
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-sm rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
