
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import ProfileDropdown from '../components/ProfileDropdown';


export default function CollectionTasks() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [parentId, setParentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDueDate, setEditingDueDate] = useState('');
  const [editingPriority, setEditingPriority] = useState('');
  const { theme, setTheme } = useContext(ThemeContext);
  const token = localStorage.getItem('token');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ completed: 0, total: 0 });
  const [newReminder, setNewReminder] = useState('');
  const [editingReminder, setEditingReminder] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [priorityFilters, setPriorityFilters] = useState({});
  const [completionFilter, setCompletionFilter] = useState('All');

 
  const isSameDate = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
      
    );

  };
  

  const fetchCollections = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/collections`, {
        headers: { Authorization: `Bearer ${token}` } ,
      });
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/collection/${id}`, {
        headers: { Authorization: `Bearer ${token}` } ,
      });
      const tasksData = res.data.tasks;
      setTasks(tasksData);
      const completed = tasksData.filter(t => t.completed).length;
      const total = tasksData.length;
      setStats({ completed, total });
      console.log('Fetched tasks:', tasksData); 

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

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/tasks`,
        {
          title: newTask,
          dueDate: newDueDate || null,
          priority: newPriority || null,
          reminderDate: newReminder || null, // 👈 Add this
          collectionId: id,
          parent: parentId || null,
        },
        { headers: { Authorization: `Bearer ${token}` }  }
      );
      setNewTask('');
      setNewDueDate('');
      setNewReminder('');
      setNewPriority('');
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
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` } ,
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleToggle = async (taskId) => {
    if (!token) {
      console.error('No token found — user likely logged out.');
      return;
    }
  
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}/toggle`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error('Toggle failed:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };
  
  

  const handleEditSubmit = async (taskId) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}`, {
        title: editingTitle,
        dueDate: editingDueDate || null,
        priority: editingPriority || null,
        reminderDate: editingReminder || null, // 👈 Add this
      }, {
        headers: { Authorization: `Bearer ${token}` } ,
      });
      setEditingTask(null);
      setEditingTitle('');
      setEditingDueDate('');
      setEditingPriority('');
      setEditingReminder('');

      fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDrop = async (draggedId, dropTargetId) => {
    if (draggedId === dropTargetId) return;
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${draggedId}`, {
        parent: dropTargetId,
      }, {
        headers: { Authorization: `Bearer ${token}` } ,
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  const toggleExpand = (taskId) => {
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const renderNestedTasks = (parent = null) => {
    const localFilter = priorityFilters[parent] || 'All';
  
    return tasks
      .filter((t) => t.parent === parent)
      .filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((t) => priorityFilter === 'All' || t.priority === priorityFilter) 
      .filter((t) => localFilter === 'All' || t.priority === localFilter)   
      .filter((t) =>
        completionFilter === 'All'
          ? true
          : completionFilter === 'Completed'
          ? t.completed
          : !t.completed
      )
      
      .map((task) => {
        const hasChildren = tasks.some((t) => t.parent === task._id);
        const isExpanded = expanded[task._id];
  
        return (
          <li key={task._id} className="ml-4">
           

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 border rounded bg-zinc-100 dark:bg-zinc-800">
              <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
                
                {hasChildren && (
                  <button
                    onClick={() => toggleExpand(task._id)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                )}
                
                {editingTask === task._id ? (
                  <>
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="Edit title"
                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    />
                    <input
                      type="date"
                      value={editingDueDate || ''}
                      onChange={(e) => setEditingDueDate(e.target.value)}
                      className="px-2 py-1 text-sm border rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    />
                    <input
                          type="date"
                          placeholder="Edit Reminder date"
                          value={editingReminder}
                          onChange={(e) => setEditingReminder(e.target.value)}
                          className="px-2 py-1 text-sm border rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                        />


                    <select
                      value={editingPriority}
                      onChange={(e) => setEditingPriority(e.target.value)}
                      className="px-2 py-1 text-sm border rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    >
                      <option value="">Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </>
                ) : (
                  <span
                    onClick={() => handleToggle(task._id)}
                    className={`cursor-pointer flex-1 ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}
                  >
                    {task.title}
                        {task.dueDate && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Due: {new Date(task.dueDate).toLocaleDateString()})
                          </span>
                        )}
                        {task.priority && (
                    <span
                    title={`Priority: ${task.priority}`}
                    className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-200 text-blue-700"
                  >
                    {task.priority}
                  </span>
                  
                       
                        )}
                     {task.reminderDate
                        && (() => {
                          const reminderDate = new Date(task.reminderDate
                        );
                          const today = new Date();

                          let badgeClass = 'bg-green-200 text-green-800'; // upcoming

                          if (isSameDate(reminderDate, today)) {
                            badgeClass = 'bg-yellow-200 text-yellow-800'; // today
                          } else if (reminderDate < today && !isSameDate(reminderDate, today)) {
                            badgeClass = 'bg-red-200 text-red-800'; // overdue
                          }

                          return (
                            <span
                            title={`Reminder: ${reminderDate.toLocaleDateString()}`}
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${badgeClass}`}
                          >
                            ⏰ {reminderDate.toLocaleDateString()}
                          </span>
                          
                          );
                        })()}


                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingTask === task._id ? (
                  <button onClick={() => handleEditSubmit(task._id)} className="text-xs text-green-600 hover:underline">Save</button>
                ) : (
                  <button onClick={() => {
                    setEditingTask(task._id);
                    setEditingTitle(task.title);
                    setEditingDueDate(task.dueDate || '');
                    setEditingReminder(task.reminderDate
 || '');
                    setEditingPriority(task.priority || '');
                  }} className="text-xs text-yellow-600 hover:underline">✏️</button>
                )}
                <button onClick={() => {
                  setParentId(task._id);
                  setShowModal(true);
                }} className="text-xs text-indigo-600 hover:underline">+ Subtask</button>
                <button onClick={() => handleDelete(task._id)} className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
              </div>
            </div>
            {isExpanded && (
  <div className="ml-6 mt-2">
    {/* Per-parent filter dropdown INSIDE the task */}
    {hasChildren && (
      <div className="mb-2">
        <label className="mr-2 text-xs font-medium">Filter by Priority:</label>
        <select
          value={priorityFilters[task._id] || 'All'}
          onChange={(e) =>
            setPriorityFilters((prev) => ({
              ...prev,
              [task._id]: e.target.value,
            }))
          }
          className="text-sm border rounded px-2 py-1"
        >
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
    )}

    {/* Render nested subtasks */}
    <ul>{renderNestedTasks(task._id)}</ul>
  </div>
)}

          </li>
          
        );
        
      });

    };

  useEffect(() => {
    fetchCollections();
    fetchTasks();
    console.log('Fetching tasks')
  }, [id]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} border-r border-zinc-300 dark:border-zinc-700 p-4 transition-all duration-300 bg-zinc-50 dark:bg-zinc-900`}>
        <div className="flex justify-between items-center mb-4">
          {sidebarOpen && <h2 className="text-lg font-semibold">Collections</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-sm px-2 py-1 border rounded">
            {sidebarOpen ? '⏴' : '⏵'}
          </button>
        </div>
        {sidebarOpen && (
          <ul className="space-y-2">
            {collections.map((col) => (
              <li key={col._id}>
                <button
                  onClick={() => navigate(`/collection/${col._id}`)}
                  className={`block w-full text-left px-3 py-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${col._id === id ? 'bg-zinc-200 dark:bg-zinc-800 font-semibold' : ''}`}
                >
                  {col.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="flex-1 px-6 py-8">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>
          <div className="mb-4">
        <label className="mr-2 text-sm font-semibold">Global Priority Filter:</label>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

      </div>

      <div className="mb-4">
        <label className="mr-2 text-sm font-semibold">Completion Filter:</label>
        <select
          value={completionFilter}
          onChange={(e) => setCompletionFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="All">All</option>
          <option value="Completed">Completed</option>
          <option value="Incomplete">Incomplete</option>
        </select>
      </div>

        <div className="flex justify-between mb-4 items-center">
          <h1 className="text-2xl font-bold">{collectionName} Tasks</h1>
                  <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">
          {stats.completed} / {stats.total} tasks completed
          <div className="w-full bg-gray-300 dark:bg-zinc-700 rounded h-2 mt-1">
            <div
              className="bg-green-500 h-2 rounded"
              style={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }}
            ></div>
          </div>
        </div>

        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-sm px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center gap-2"
          >
            {theme === 'dark' ? (
              <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#facc15">


                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </>
            ) : (
              <>

                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="#60a5fa" viewBox="0 0 24 24">

                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              </>
            )}
          </button>
          <ProfileDropdown />




        </div>

        <Link to="/" className="text-sm text-indigo-500 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

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
              <h2 className="text-xl font-semibold mb-4">{parentId ? 'Add Subtask' : 'Add Task'}</h2>
              <input
                type="text"
                value={newTask}
                placeholder="Task title"
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
              <input
                type="date"
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                className="w-full px-3 py-2 mb-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                placeholder="Reminder date"
              />

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 mb-4 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
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
