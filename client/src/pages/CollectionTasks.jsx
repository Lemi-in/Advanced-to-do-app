import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

export default function CollectionTasks() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [parentId, setParentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState({});
  const { theme, setTheme } = useContext(ThemeContext);
  const token = localStorage.getItem('token');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/collection/${id}`, {
        headers: { Authorization: token },
      });
      const tasksData = res.data.tasks;
      setTasks(tasksData);
      const expandedMap = {};
      tasksData.forEach((task) => {
        const hasChildren = tasksData.some((t) => t.parent === task._id);
        if (hasChildren) expandedMap[task._id] = true;
      });
      setExpanded(expandedMap);
      setCollectionName(res.data.collectionName);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/collections', {
        headers: { Authorization: token },
      });
      setCollections(res.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      await axios.post(
        'http://localhost:5000/api/tasks',
        { title: newTask, collectionId: id, parent: parentId || null },
        { headers: { Authorization: token } }
      );
      setNewTask('');
      setParentId(null);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task and all its subtasks?')) return;
    try {
      await axios.delete('http://localhost:5000/api/tasks/' + taskId, {
        headers: { Authorization: token },
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/toggle`, null, {
        headers: { Authorization: token },
      });
      fetchTasks();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const toggleExpand = (taskId) => {
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const renderNestedTasks = (parent = null) =>
    tasks
      .filter((t) => t.parent === parent)
      .map((task) => {
        const hasChildren = tasks.some((t) => t.parent === task._id);
        const isExpanded = expanded[task._id];

        return (
          <li key={task._id} className="ml-4">
            <div className="flex justify-between items-center gap-2 p-2 border rounded bg-zinc-100 dark:bg-zinc-800">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(task._id)}
                  className="text-xs text-gray-500 hover:underline"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span
                onClick={() => handleToggle(task._id)}
                className={`cursor-pointer flex-1 ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}
              >
                {task.title}
              </span>
              <button
                onClick={() => {
                  setParentId(task._id);
                  setShowModal(true);
                }}
                className="text-xs text-indigo-600 hover:underline"
              >
                + Subtask
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="text-red-400 hover:text-red-600 text-sm"
                title="Delete task"
              >
                🗑️
              </button>
            </div>
            {isExpanded && <ul>{renderNestedTasks(task._id)}</ul>}
          </li>
        );
      });

  useEffect(() => {
    fetchTasks();
    fetchCollections();
  }, [id]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex">
      {/* Sidebar */}
      <aside className="w-60 bg-zinc-100 dark:bg-zinc-800 p-4 border-r border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-4">Collections</h2>
        <ul className="space-y-2">
          {collections.map((col) => (
            <li key={col._id}>
              <button
                onClick={() => navigate(`/collection/${col._id}`)}
                className={`w-full text-left px-3 py-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${col._id === id ? 'bg-indigo-100 dark:bg-indigo-600 text-indigo-800 dark:text-white' : ''}`}
              >
                {col.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Link
          to="/"
          className="text-sm text-indigo-500 hover:underline inline-block mb-2"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex justify-between mb-4 items-center">
          <h1 className="text-2xl font-bold">{collectionName} Tasks</h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-sm px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setParentId(null);
              setShowModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
          >
            + Add Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">No tasks in this collection yet.</p>
        ) : (
          <ul className="space-y-2">{renderNestedTasks()}</ul>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {parentId ? 'Add Subtask' : 'Add Task'}
              </h2>
              <input
                type="text"
                value={newTask}
                placeholder="Task title"
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-sm rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}