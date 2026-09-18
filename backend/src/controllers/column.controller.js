const Column = require('../models/Column.model');
const Board = require('../models/Board.model');

/**
 * @desc    Get all columns for a board
 * @route   GET /api/columns
 * @access  Private
 */
exports.getColumns = async (req, res, next) => {
  try {
    const { boardId } = req.query;

    if (!boardId) {
      return res.status(400).json({
        status: 'error',
        message: 'Board ID is required'
      });
    }

    const columns = await Column.find({ board: boardId }).sort('position');

    res.status(200).json({
      status: 'success',
      results: columns.length,
      data: {
        columns
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new column
 * @route   POST /api/columns
 * @access  Private
 */
exports.createColumn = async (req, res, next) => {
  try {
    const { title, boardId, position, color } = req.body;

    const column = await Column.create({
      title,
      board: boardId,
      position: position || 0,
      color
    });

    // Notify board members via socket
    const io = req.app.get('io');
    io.to(`board:${boardId}`).emit('column:created', { column });

    res.status(201).json({
      status: 'success',
      data: {
        column
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update column
 * @route   PUT /api/columns/:id
 * @access  Private
 */
exports.updateColumn = async (req, res, next) => {
  try {
    const column = await Column.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!column) {
      return res.status(404).json({
        status: 'error',
        message: 'Column not found'
      });
    }

    // Notify board members
    const io = req.app.get('io');
    io.to(`board:${column.board}`).emit('column:updated', { 
      columnId: column._id, 
      updates: req.body 
    });

    res.status(200).json({
      status: 'success',
      data: {
        column
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete column
 * @route   DELETE /api/columns/:id
 * @access  Private
 */
exports.deleteColumn = async (req, res, next) => {
  try {
    const column = await Column.findById(req.params.id);

    if (!column) {
      return res.status(404).json({
        status: 'error',
        message: 'Column not found'
      });
    }

    await column.deleteOne();

    // Notify board members
    const io = req.app.get('io');
    io.to(`board:${column.board}`).emit('column:deleted', { 
      columnId: column._id 
    });

    res.status(200).json({
      status: 'success',
      message: 'Column deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
