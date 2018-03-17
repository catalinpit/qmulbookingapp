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
  var newUser = new User(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      telephone: req.body.telephone
    });

  if(req.body.adminCode === "adminGr24" && req.body.serviceProviderCode === "spGr24")
  {
    req.flash("error", "You can either be an admin or a service provider. Not both, so please enter either only the admin code or only the service provider code!");
    res.redirect("back");
  }

  if(req.body.adminCode === "adminGr24") {
    newUser.isAdmin = true;
    newUser.isServiceProvider = false;
    newUser.isCustomer = false;
  }

  if(req.body.serviceProviderCode === "spGr24") {
    newUser.isAdmin = false;
    newUser.isServiceProvider = true;
    newUser.isCustomer = false;
  }

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
