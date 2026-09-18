const express = require('express');
const router = express.Router();

const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard
} = require('../controllers/board.controller');
const { protect } = require('../middleware/auth');
const { checkBoardAccess } = require('../middleware/authorization');



router.use(protect);

router.route('/')
  .get(getBoards)
  .post(createBoard);

router.route('/:id')
  .get(checkBoardAccess('viewer'), getBoard)
  .put(checkBoardAccess('admin'), updateBoard)
  .delete(checkBoardAccess('admin'), deleteBoard);


module.exports = router;
