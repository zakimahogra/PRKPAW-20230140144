const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const permission = require('../middleware/permissionMiddleware');

router.get(
  '/daily',
  permission.authenticateToken,
  permission.isAdmin,
  reportController.getDailyReport
);

module.exports = router;