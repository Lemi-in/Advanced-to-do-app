// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // 👈 for nesting
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
