const express = require('express');
const router = express.Router();

const {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn
} = require('../controllers/column.controller');
const { protect } = require('../middleware/auth');



router.use(protect);

router.route('/')
  .get(getColumns)
  .post(createColumn);

router.route('/:id')
  .put(updateColumn)
  .delete(deleteColumn);


module.exports = router;
