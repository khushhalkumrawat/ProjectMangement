const Board = require('../models/Board.model');
const Workspace = require('../models/Workspace.model');

/**
 * Check if user has access to a board
 */
const checkBoardAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const boardId = req.params.boardId || req.params.id || req.body.board;

      if (!boardId) {
        return res.status(400).json({
          status: 'error',
          message: 'Board ID is required'
        });
      }

      const board = await Board.findById(boardId);

      if (!board) {
        return res.status(404).json({
          status: 'error',
          message: 'Board not found'
        });
      }

      // Check if user is board owner
      if (board.owner.toString() === req.user._id.toString()) {
        req.board = board;
        req.userRole = 'admin';
        return next();
      }

      // Check if user is a board member
      const member = board.members.find(
        m => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have access to this board'
        });
      }

      // Check role permissions
      const roleHierarchy = { viewer: 1, member: 2, admin: 3 };
      const userRoleLevel = roleHierarchy[member.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          status: 'error',
          message: `You need ${requiredRole} role to perform this action`
        });
      }

      req.board = board;
      req.userRole = member.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has access to a workspace
 */
const checkWorkspaceAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.params.id || req.body.workspace;

      if (!workspaceId) {
        return res.status(400).json({
          status: 'error',
          message: 'Workspace ID is required'
        });
      }

      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          status: 'error',
          message: 'Workspace not found'
        });
      }

      // Check if user is workspace owner
      if (workspace.owner.toString() === req.user._id.toString()) {
        req.workspace = workspace;
        req.userRole = 'admin';
        return next();
      }

      // Check if user is a workspace member
      const member = workspace.members.find(
        m => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have access to this workspace'
        });
      }

      // Check role permissions
      const roleHierarchy = { viewer: 1, member: 2, admin: 3 };
      const userRoleLevel = roleHierarchy[member.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          status: 'error',
          message: `You need ${requiredRole} role to perform this action`
        });
      }

      req.workspace = workspace;
      req.userRole = member.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  checkBoardAccess,
  checkWorkspaceAccess
};
