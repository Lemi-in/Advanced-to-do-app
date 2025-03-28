import React from 'react';

export default function CollectionCard({ name, onClick, done = 0, total = 0 }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 shadow hover:scale-[1.02] transition w-full min-h-[120px]"
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{name}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{done}/{total} tasks done</p>
    </div>
  );
}
