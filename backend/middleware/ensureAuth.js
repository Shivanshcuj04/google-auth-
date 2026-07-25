// Middleware that blocks access to protected API routes if the user
// is not authenticated (i.e. not logged in via Google).
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

module.exports = ensureAuthenticated;
