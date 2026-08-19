const express = require("express");
const router = express.Router();
const emailService = require("../services/emailService");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");

// All email utility endpoints are admin-only
router.use(authMiddleware, requireAdmin);

// Test email configuration
router.post("/test", async (req, res) => {
  try {
    const result = await emailService.testEmailConfig();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Email service is configured correctly"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Email service configuration error",
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error testing email configuration",
      error: error.message
    });
  }
});

// Send test email
router.post("/send-test", async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, subject, message"
      });
    }

    const result = await emailService.sendMessageNotification(
      to,
      "Test User",
      "Via Italia Admin",
      message
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending test email",
      error: error.message
    });
  }
});

module.exports = router;
