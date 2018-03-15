var express   = require("express"),
    router    = express.Router(),
    passport  = require("passport"),
    User      = require("../models/user");

router.get("/", function(req, res) {
  res.render("landing");
})

// register form
router.get("/register", function(req, res) {
  res.render("register");
});

// handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user) {
    if(err) {
      req.flash("error", err.message);
      console.log(err);
      return res.redirect("register");
    }
    passport.authenticate("local")(req, res, function(){
      req.flash("success", "Successfully registered, " + user.username);
      res.redirect("/services");
    });
  });
});

// login form
router.get("/login", function(req, res) {
  res.render("login");
});

// handle login logic
router.post("/login", passport.authenticate("local",
{
  successRedirect: "services",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res) {
});

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/services");
});

module.exports = router;
