const Board = require('../models/Board.model');
const Workspace = require('../models/Workspace.model');

/**
 * @desc    Get all boards for current user (across all workspaces)
 * @route   GET /api/boards
 * @access  Private
 */
exports.getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({
      'members.user': req.user._id,
      archived: false
    })
    .populate('workspace', 'name')
    .sort('-updatedAt');

    res.status(200).json({
      status: 'success',
      results: boards.length,
      data: {
        boards
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single board
 * @route   GET /api/boards/:id
 * @access  Private
 */
exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('workspace', 'name')
      .populate('members.user', 'name email avatar');

    if (!board) {
      return res.status(404).json({
        status: 'error',
        message: 'Board not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        board
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new board
 * @route   POST /api/boards
 * @access  Private
 */
exports.createBoard = async (req, res, next) => {
  try {
    const { title, workspaceId, background, visibility } = req.body;

    // Check if workspace exists and user is a member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        status: 'error',
        message: 'Workspace not found'
      });
    }

    const isMember = workspace.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isMember && workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this workspace'
      });
    }

    const board = await Board.create({
      title,
      workspace: workspaceId,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      background,
      settings: {
        visibility: visibility || 'workspace'
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        board
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update board
 * @route   PUT /api/boards/:id
 * @access  Private
 */
exports.updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        board
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete board
 * @route   DELETE /api/boards/:id
 * @access  Private
 */
exports.deleteBoard = async (req, res, next) => {
  try {
    await Board.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Board deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
