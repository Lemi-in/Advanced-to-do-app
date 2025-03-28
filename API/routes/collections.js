const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/collectionController');


router.use(auth);

router.get('/', controller.getCollections);
router.post('/', controller.createCollection);
router.delete('/:id', controller.deleteCollection);
router.patch('/:id/favorite', controller.toggleFavorite);

module.exports = router;
