const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  favorite: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Collection', CollectionSchema);
