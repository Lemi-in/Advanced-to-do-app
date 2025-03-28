const Task = require('../models/Task');
const Collection = require('../models/Collection');

exports.getTasksByCollection = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.userId,
      collectionId: req.params.id,
    }).sort({ createdAt: -1 });

    const collection = await Collection.findById(req.params.id);
    res.json({
      tasks,
      collectionName: collection?.name || 'Untitled',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

exports.toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('Error toggling task:', err);
    res.status(500).json({ message: 'Failed to toggle task completion' });
  }
};

// exports.deleteTask = async (req, res) => {
//   try {
//     const result = await Task.deleteOne({
//       _id: req.params.id,
//       user: req.userId,
//     });
//     console.log('🔥 Deleting task ID:', req.params.id, 'User:', req.userId);

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: 'Task not found or not authorized' });
//     }

//     res.json({ message: 'Task deleted' });
//   } catch (err) {
//     console.error('❌ Error deleting task:', err);
//     res.status(500).json({ message: 'Failed to delete task' });
//   }
// };




// Fetch all tasks for user
exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
};

// Create task
exports.createTask = async (req, res) => {
  const { title, collectionId , parent} = req.body;

  if (!title || !collectionId) {
    return res.status(400).json({ message: 'Title and collectionId are required' });
  }

  try {
    const newTask = await Task.create({
      title,
      user: req.userId,         // ✅ should be set via auth middleware
      collectionId: collectionId,
      parent: parent || null // 👈 for nesting
    });

    res.status(201).json(newTask);
  } catch (err) {
    console.error('❌ Error creating task:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};


// Update task
exports.updateTask = async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};

// Recursive delete for task and subtasks
async function deleteTaskAndChildren(id, userId) {
  const children = await Task.find({ parent: id, user: userId });
  for (const child of children) {
    await deleteTaskAndChildren(child._id, userId);
  }
  await Task.deleteOne({ _id: id, user: userId });
}

exports.deleteTask = async (req, res) => {
  try {
    await deleteTaskAndChildren(req.params.id, req.userId);
    res.json({ message: 'Task and subtasks deleted' });
  } catch (err) {
    console.error('❌ Error deleting task and subtasks:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};
