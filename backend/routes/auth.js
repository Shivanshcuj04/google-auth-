const express = require("express");
const passport = require("passport");
const ensureAuthenticated = require("../middleware/ensureAuth");

const router = express.Router();

// Step 1: Kick off Google OAuth flow (this is what the "Continue with Google" button hits)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back here after the user approves/denies login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    // Successful login -> send user back to the dashboard on the frontend
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Returns the currently logged-in user (used by frontend to check session on refresh)
router.get("/current-user", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ user: req.user });
  }
  return res.status(200).json({ user: null });
});

// Logout: destroys the session
router.get("/logout", ensureAuthenticated, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

module.exports = router;
