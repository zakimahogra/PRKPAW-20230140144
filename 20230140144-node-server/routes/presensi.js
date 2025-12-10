const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const presensiController = require("../controllers/presensiController");
const permission = require("../middleware/permissionMiddleware");

// Middleware validasi tanggal
const validatePresensiUpdate = [
  body("checkIn")
    .optional()
    .isISO8601()
    .withMessage("checkIn harus berupa format tanggal yang valid (ISO8601)"),
  body("checkOut")
    .optional()
    .isISO8601()
    .withMessage("checkOut harus berupa format tanggal yang valid (ISO8601)"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validasi gagal", errors: errors.array() });
    }
    next();
  },
];

// Route check-in dengan upload foto
router.post(
  "/check-in", 
  permission.authenticateToken, 
  presensiController.upload.single('image'), 
  presensiController.CheckIn
);

router.post("/check-out", permission.authenticateToken, presensiController.CheckOut);

router.put("/:id", permission.authenticateToken, permission.isAdmin, validatePresensiUpdate, presensiController.updatePresensi);
router.delete("/:id", permission.authenticateToken, permission.isAdmin, presensiController.deletePresensi);

module.exports = router;