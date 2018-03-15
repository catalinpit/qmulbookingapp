var express        = require("express"),
    bodyParser     = require("body-parser"),
    app            = express(),
    flash          = require("connect-flash"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    Service        = require("./models/service"),
    User           = require("./models/user"),
    Review         = require("./models/review");

var serviceRoutes = require("./routes/reviews"),
    reviewRoutes  = require("./routes/services"),
    authRoutes    = require("./routes/auth");

mongoose.connect("mongodb://bookingappadmin:admi2018@ds261088.mlab.com:61088/bookingapp");
mongoose.Promise = global.Promise;
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

// Passport configuration
app.use(require("express-session")({
  secret: "pit",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// available to all routes
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  // move to the next code
  next();
})

// set the routes
app.use(authRoutes);
app.use(serviceRoutes);
app.use(reviewRoutes);

app.listen(3000, function() {
  console.log('Server started on port 3000...');
});
