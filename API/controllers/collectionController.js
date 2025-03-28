const Collection = require('../models/Collection');

exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.userId });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching collections' });
  }
};

exports.createCollection = async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Collection name is required' });
  }

  try {
    const newCollection = await Collection.create({
      name,
      user: req.userId,
    });
    res.status(201).json(newCollection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating collection' });
  }
};


exports.deleteCollection = async (req, res) => {
  try {
    await Collection.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting collection' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.userId });
    if (!collection) return res.status(404).json({ message: 'Not found' });

    collection.favorite = !collection.favorite;
    await collection.save();
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Error updating collection' });
  }
};
