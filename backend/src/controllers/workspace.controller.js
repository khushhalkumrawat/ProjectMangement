const Workspace = require('../models/Workspace.model');
const User = require('../models/User.model');

/**
 * @desc    Get all workspaces for current user
 * @route   GET /api/workspaces
 * @access  Private
 */
exports.getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id
    })
    .populate('boards')
    .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: workspaces.length,
      data: {
        workspaces
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new workspace
 * @route   POST /api/workspaces
 * @access  Private
 */
exports.createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    // Add workspace to user's workspaces list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id }
    });

    res.status(201).json({
      status: 'success',
      data: {
        workspace
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single workspace
 * @route   GET /api/workspaces/:id
 * @access  Private
 */
exports.getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('boards');

    if (!workspace) {
      return res.status(404).json({
        status: 'error',
        message: 'Workspace not found'
      });
    }

    // Check if user is member
    const isMember = workspace.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have access to this workspace'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        workspace
      }
    });
  } catch (error) {
    next(error);
  }
};
