const Card = require('../models/Card.model');
const Column = require('../models/Column.model');
const Activity = require('../models/Activity.model');

/**
 * @desc    Get all cards for a board
 * @route   GET /api/cards
 * @access  Private
 */
exports.getCards = async (req, res, next) => {
  try {
    const { boardId } = req.query;

    if (!boardId) {
      return res.status(400).json({
        status: 'error',
        message: 'Board ID is required'
      });
    }

    const cards = await Card.find({ board: boardId })
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar')
      .sort('position');

    res.status(200).json({
      status: 'success',
      results: cards.length,
      data: {
        cards
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new card
 * @route   POST /api/cards
 * @access  Private
 */
exports.createCard = async (req, res, next) => {
  try {
    const { title, columnId, boardId, description, priority, assignees } = req.body;

    // Get highest position in column
    const highestCard = await Card.findOne({ column: columnId }).sort('-position');
    const position = highestCard ? highestCard.position + 1000 : 1000;

    const card = await Card.create({
      title,
      description,
      column: columnId,
      board: boardId,
      position,
      priority: priority || 'medium',
      assignedTo: assignees || [],
      createdBy: req.user._id
    });

    // Create activity
    await Activity.create({
      type: 'card_created',
      entity: { type: 'Card', id: card._id, name: card.title },
      user: req.user._id,
      board: boardId,
      details: { columnId }
    });

    // Notify board members
    const io = req.app.get('io');
    io.to(`board:${boardId}`).emit('card:created', { card });

    res.status(201).json({
      status: 'success',
      data: {
        card
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update card
 * @route   PUT /api/cards/:id
 * @access  Private
 */
exports.updateCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignees', 'name avatar');

    if (!card) {
      return res.status(404).json({
        status: 'error',
        message: 'Card not found'
      });
    }

    // Notify board members
    const io = req.app.get('io');
    io.to(`board:${card.board}`).emit('card:updated', { 
      cardId: card._id, 
      updates: req.body 
    });

    res.status(200).json({
      status: 'success',
      data: {
        card
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Move card (drag and drop)
 * @route   PUT /api/cards/:id/move
 * @access  Private
 */
exports.moveCard = async (req, res, next) => {
  try {
    const { columnId, position } = req.body;
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({
        status: 'error',
        message: 'Card not found'
      });
    }

    const oldColumnId = card.column;
    
    card.column = columnId;
    card.position = position;
    await card.save();

    // Create activity
    await Activity.create({
      type: 'card_moved',
      entity: { type: 'Card', id: card._id, name: card.title },
      user: req.user._id,
      board: card.board,
      details: { fromColumn: oldColumnId, toColumn: columnId }
    });

    // Notify board members
    const io = req.app.get('io');
    io.to(`board:${card.board}`).emit('card:moved', { 
      cardId, 
      columnId, 
      position,
      oldColumnId
    });

    res.status(200).json({
      status: 'success',
      data: {
        card
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete card
 * @route   DELETE /api/cards/:id
 * @access  Private
 */
exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        status: 'error',
        message: 'Card not found'
      });
    }

    await card.deleteOne();

    // Notify board members
    const io = req.app.get('io');
    io.to(`board:${card.board}`).emit('card:deleted', { 
      cardId: card._id 
    });

    res.status(200).json({
      status: 'success',
      message: 'Card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
