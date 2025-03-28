// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// export default function Tasks() {
//   const [tasks, setTasks] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [title, setTitle] = useState('');
//   const [parentId, setParentId] = useState(null);
//   const [expanded, setExpanded] = useState({});
//   const token = localStorage.getItem('token');

//   const fetchTasks = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/tasks', {
//         headers: { Authorization: token },
//       });
//       setTasks(res.data);
//     } catch (err) {
//       alert('Unauthorized. Please login again.');
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//   };

//   const createTask = async () => {
//     if (!title.trim()) return;

//     await axios.post(
//       'http://localhost:5000/api/tasks',
//       { title, parent: parentId },
//       { headers: { Authorization: token } }
//     );

//     setTitle('');
//     setParentId(null);
//     setShowModal(false);
//     fetchTasks();
//   };

//   const handleDelete = async (taskId) => {
//     const confirm = window.confirm('Are you sure you want to delete this task and all its subtasks?');
//     if (!confirm) return;

//     try {
//       await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
//         headers: { Authorization: token },
//       });
//       fetchTasks();
//     } catch (err) {
//       console.error('❌ Failed to delete task:', err);
//     }
//   };

//   const toggleExpand = (taskId) => {
//     setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   };

//   const renderNestedTasks = (parent = null, level = 0) => {
//     return tasks
//       .filter((t) => t.parent === parent)
//       .map((task) => {
//         const hasChildren = tasks.some((t) => t.parent === task._id);
//         const isExpanded = expanded[task._id];

//         return (
//           <div key={task._id} className="ml-4 mt-2" style={{ marginLeft: level * 20 }}>
//             <div className="flex items-center gap-2">
//               {hasChildren && (
//                 <button
//                   onClick={() => toggleExpand(task._id)}
//                   className="text-xs text-gray-500 hover:underline"
//                 >
//                   {isExpanded ? '▼' : '▶'}
//                 </button>
//               )}
//               <span className="flex-1">• {task.title}</span>
//               <button
//                 onClick={() => {
//                   setParentId(task._id);
//                   setShowModal(true);
//                 }}
//                 className="text-xs text-indigo-600 hover:underline"
//               >
//                 + Subtask
//               </button>
//               <button
//                 onClick={() => handleDelete(task._id)}
//                 className="text-red-600 hover:text-red-800"
//                 title="Delete task"
//               >
//                 🗑️
//               </button>
//             </div>
//             {isExpanded && renderNestedTasks(task._id, level + 1)}
//           </div>
//         );
//       });
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   return (
//     <div className="max-w-2xl mx-auto py-10 px-6">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Task Dashboard</h2>
//         <button
//           onClick={logout}
//           className="text-sm font-medium text-red-600 hover:underline"
//         >
//           Logout
//         </button>
//       </div>

//       <div className="flex justify-end mb-4">
//         <button
//           onClick={() => {
//             setParentId(null);
//             setShowModal(true);
//           }}
//           className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-500"
//         >
//           + Add Task
//         </button>
//       </div>

//       <div className="bg-white p-4 rounded shadow">
//         {tasks.length === 0 ? (
//           <p className="text-gray-500 text-sm">No tasks yet.</p>
//         ) : (
//           renderNestedTasks()
//         )}
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
//           <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow w-full max-w-md">
//             <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
//               {parentId ? 'Add Subtask' : 'Add Task'}
//             </h2>
//             <input
//               type="text"
//               value={title}
//               placeholder="Task title"
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white mb-4"
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-sm rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={createTask}
//                 className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500"
//               >
//                 Create
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
