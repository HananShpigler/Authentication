const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// User model
const User = require("../models/User");

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Register Page
router.get("/register", (req, res) => res.render("register"));

// Handle register
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Checking required fields
  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please fill in all fields." });
  }

  // Checking if password match
  if (password !== password2) {
    errors.push({ message: "Passwords do not match." });
  }

  // Checking password length (atleast 6 chars)
  if (password.length < 6) {
    errors.push({ message: "Password must contain at least 6 characters." });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exists in database
        errors.push({ message: "Email is already registered." });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        // Password encryption
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            // Hashing user password
            newUser.password = hash;

            // Saving user in the database
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_message",
                  "You have successfully registered."
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Handle login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Handle logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_message", "You have successfully logged out.");
  res.redirect("/users/login");
});

module.exports = router;
