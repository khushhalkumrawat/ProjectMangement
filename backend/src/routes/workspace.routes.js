const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspace.controller');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(workspaceController.getWorkspaces)
  .post(workspaceController.createWorkspace);

router
  .route('/:id')
  .get(workspaceController.getWorkspace);

module.exports = router;
