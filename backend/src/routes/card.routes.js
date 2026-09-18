const express = require('express');
const router = express.Router();

const {
  getCards,
  createCard,
  updateCard,
  moveCard,
  deleteCard
} = require('../controllers/card.controller');
const { protect } = require('../middleware/auth');



router.use(protect);

router.route('/')
  .get(getCards)
  .post(createCard);

router.put('/:id/move', moveCard);

router.route('/:id')
  .put(updateCard)
  .delete(deleteCard);


module.exports = router;
