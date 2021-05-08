module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_message", "You must be logged in to view this page.");
    res.redirect("/users/login");
  },
};
